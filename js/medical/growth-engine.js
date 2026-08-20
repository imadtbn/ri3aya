(function (global) {
    'use strict';

    const ROOT = '../';
    const manifestUrl = `${ROOT}content/medical/growth/manifest.json`;
    const DATA_ROOT = `${ROOT}content/medical/growth/`;
    const cache = new Map();

    const erf = (x) => {
        const sign = x < 0 ? -1 : 1;
        const ax = Math.abs(x);
        const t = 1 / (1 + 0.3275911 * ax);
        const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);
        return sign * y;
    };

    const normalCdf = (z) => 0.5 * (1 + erf(z / Math.sqrt(2)));

    function parseCsv(csv) {
        const lines = csv.replace(/^\uFEFF/, '').trim().split(/\r?\n/).filter(Boolean);
        if (lines.length < 2) return [];
        const headers = lines[0].split(',').map((item) => item.trim());
        return lines.slice(1).map((line) => {
            const values = line.split(',');
            return headers.reduce((row, header, index) => {
                const value = (values[index] || '').trim();
                row[header] = value === '' ? null : Number.isFinite(Number(value)) ? Number(value) : value;
                return row;
            }, {});
        });
    }

    function numericKey(row, preferred) {
        return Object.keys(row).find((key) => key.toLowerCase() === preferred.toLowerCase()) || preferred;
    }

    function interpolate(rows, axisKey, axisValue) {
        if (!rows.length) return null;
        const sorted = [...rows].sort((a, b) => a[axisKey] - b[axisKey]);
        if (axisValue < sorted[0][axisKey] || axisValue > sorted[sorted.length - 1][axisKey]) return null;
        let lower = sorted[0];
        let upper = sorted[sorted.length - 1];
        for (let index = 0; index < sorted.length; index += 1) {
            if (sorted[index][axisKey] <= axisValue) lower = sorted[index];
            if (sorted[index][axisKey] >= axisValue) {
                upper = sorted[index];
                break;
            }
        }
        if (lower[axisKey] === upper[axisKey]) return lower;
        const fraction = (axisValue - lower[axisKey]) / (upper[axisKey] - lower[axisKey]);
        const result = {};
        new Set([...Object.keys(lower), ...Object.keys(upper)]).forEach((key) => {
            const a = lower[key];
            const b = upper[key];
            result[key] = typeof a === 'number' && typeof b === 'number' ? a + (b - a) * fraction : a;
        });
        return result;
    }

    function zScore(value, row) {
        if (!(value > 0) || !row || !(row.M > 0) || !(row.S > 0)) return null;
        if (Math.abs(row.L) < 1e-7) return Math.log(value / row.M) / row.S;
        return (Math.pow(value / row.M, row.L) - 1) / (row.L * row.S);
    }

    function percentile(z) {
        if (z === null || !Number.isFinite(z)) return null;
        return Math.max(0.01, Math.min(99.99, normalCdf(z) * 100));
    }

    function interpretation(z) {
        if (z === null) return { label: 'غير متاح', tone: 'neutral', note: 'لا توجد بيانات مرجعية مناسبة لهذه القراءة.' };
        if (z < -2) return { label: 'خارج النطاق المرجعي المنخفض', tone: 'caution', note: 'هذه إشارة تثقيفية تستلزم مراجعة طبيب الأطفال، ولا تمثل تشخيصًا.' };
        if (z > 2) return { label: 'خارج النطاق المرجعي المرتفع', tone: 'caution', note: 'هذه إشارة تثقيفية تستلزم مراجعة طبيب الأطفال، ولا تمثل تشخيصًا.' };
        return { label: 'ضمن نطاق المرجع', tone: 'neutral', note: 'فسّري القراءة مع اتجاه النمو عبر الزمن والتقييم السريري.' };
    }

    async function load() {
        if (cache.has('ready')) return cache.get('ready');
        const ready = fetch(manifestUrl).then((response) => {
            if (!response.ok) throw new Error('تعذر تحميل manifest بيانات النمو');
            return response.json();
        }).then(async (manifest) => {
            const datasets = {};
            for (const [indicator, definition] of Object.entries(manifest.indicators)) {
                datasets[indicator] = {};
                for (const sex of manifest.sexValues) {
                    const response = await fetch(DATA_ROOT + definition.files[sex]);
                    if (!response.ok) throw new Error(`تعذر تحميل بيانات ${indicator}`);
                    datasets[indicator][sex] = parseCsv(await response.text());
                }
            }
            return { manifest, datasets };
        });
        cache.set('ready', ready);
        return ready;
    }

    function readIndicator(datasets, indicator, sex, axisValue) {
        const rows = datasets[indicator]?.[sex];
        if (!rows) return null;
        const axisKey = Object.keys(rows[0] || {})[0];
        return interpolate(rows, axisKey, axisValue);
    }

    async function assess({ sex, ageMonths, weight, length, head }) {
        const { manifest, datasets } = await load();
        if (!['male', 'female'].includes(sex)) throw new Error('اختيار الجنس غير صالح');
        if (!Number.isFinite(ageMonths) || ageMonths < 0 || ageMonths > manifest.ageRangeMonths[1]) {
            throw new Error(`يدعم المرجع الحالي الأعمار من 0 إلى ${manifest.ageRangeMonths[1]} شهرًا فقط`);
        }
        const results = [];
        const add = (key, value, label, unit) => {
            if (!(value > 0)) return;
            const row = readIndicator(datasets, key, sex, ageMonths);
            const z = zScore(value, row);
            results.push({ key, label, value, unit, z, percentile: percentile(z), interpretation: interpretation(z) });
        };
        add('weightForAge', weight, 'الوزن بالنسبة للعمر', 'كجم');
        add('lengthForAge', length, 'الطول بالنسبة للعمر', 'سم');
        add('headCircumferenceForAge', head, 'محيط الرأس بالنسبة للعمر', 'سم');
        if (weight > 0 && length > 0) {
            const row = readIndicator(datasets, 'weightForLength', sex, length);
            const z = zScore(weight, row);
            results.push({ key: 'weightForLength', label: 'الوزن بالنسبة للطول', value: weight, unit: 'كجم', z, percentile: percentile(z), interpretation: interpretation(z) });
        }
        return { manifest, ageMonths, results };
    }

    async function chartData(indicator, sex) {
        const { datasets } = await load();
        const rows = datasets[indicator]?.[sex] || [];
        const axisKey = Object.keys(rows[0] || {})[0];
        const percentileKeys = Object.keys(rows[0] || {}).filter((key) => /^(2nd|5th|50th|95th|98th)/i.test(key));
        return {
            labels: rows.map((row) => row[axisKey]),
            datasets: percentileKeys.map((key) => ({
                label: key,
                data: rows.map((row) => row[key]),
                borderColor: key.startsWith('50') ? '#146c94' : '#86b9cc',
                borderWidth: key.startsWith('50') ? 3 : 1.5,
                pointRadius: 0,
                fill: false,
                tension: 0.18
            }))
        };
    }

    global.Ri3ayaGrowth = Object.freeze({ load, assess, chartData, zScore, percentile });
})(window);
