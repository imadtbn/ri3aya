(function () {
    'use strict';

    const byId = (id) => document.getElementById(id);
    let chart = null;
    let activeIndicator = 'weightForAge';
    let activeSex = 'male';
    let chartRevision = 0;

    const indicators = {
        weight: { key: 'weightForAge', label: 'الوزن بالنسبة للعمر', unit: 'كجم', axis: 'العمر (شهر)' },
        height: { key: 'lengthForAge', label: 'الطول بالنسبة للعمر', unit: 'سم', axis: 'العمر (شهر)' },
        head: { key: 'headCircumferenceForAge', label: 'محيط الرأس بالنسبة للعمر', unit: 'سم', axis: 'العمر (شهر)' }
    };

    function announce(message, type = 'info') {
        window.Ri3aya?.announce?.(message, type);
    }

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>'"]/g, (character) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[character]));
    }

    function renderLoading() {
        const result = byId('growth-results');
        if (result) result.innerHTML = '<div class="alert alert-info" role="status">جاري تحميل مرجع WHO الرسمي...</div>';
    }

    function renderError(error) {
        const result = byId('growth-results');
        if (!result) return;
        const detail = String(error?.message || '');
        const message = /24 شهرًا/.test(detail)
            ? 'هذه الأداة تدعم عمر 0–24 شهرًا فقط.'
            : /قياسًا واحدًا/.test(detail)
                ? 'أدخلي الوزن أو الطول أو محيط الرأس أولًا.'
                : /غير صالحة|أرقامًا موجبة|العمر|القياسات/.test(detail)
                    ? 'راجعي العمر والقياسات؛ استخدمي أرقامًا صحيحة ومناسبة للحقول.'
                    : 'تعذر تحميل بيانات النمو المرجعية. تحققي من الاتصال واضغطي حساب مجددًا.';
        result.innerHTML = `<div class="alert alert-warning" role="alert">${escapeHtml(message)}</div>`;
    }

    function renderResults(assessment) {
        const result = byId('growth-results');
        if (!result) return;
        const cards = assessment.results.map((item) => {
            const z = item.z === null ? 'غير متاح' : item.z.toFixed(2);
            const p = item.percentile === null ? 'غير متاح' : `${item.percentile.toFixed(1)}%`;
            return `<article class="result-card ${escapeHtml(item.interpretation.tone)}">
                <h3>${escapeHtml(item.label)}</h3>
                <p class="result-value">${escapeHtml(item.value)} ${escapeHtml(item.unit)}</p>
                <p><strong>درجة Z:</strong> ${z} · <strong>النسبة المئوية:</strong> ${p}</p>
                <p class="result-status">${escapeHtml(item.interpretation.label)}</p>
                <p>${escapeHtml(item.interpretation.note)}</p>
            </article>`;
        }).join('');
        result.innerHTML = `<div class="results-container" role="region" aria-live="polite">
            <div class="results-header"><h3><i class="fas fa-chart-pie"></i> مؤشر تثقيفي للنمو</h3><span>العمر: ${assessment.ageMonths.toFixed(1)} شهر</span></div>
            <div class="results-grid">${cards || '<p>أدخلي قياسًا واحدًا على الأقل.</p>'}</div>
            <div class="results-summary"><h4><i class="fas fa-circle-info"></i> مهم</h4><p>هذه النتائج مبنية على مرجع WHO LMS ولا تشخّص حالة صحية. قارني القياسات عبر الزمن وراجعي طبيب الأطفال عند القلق أو وجود تغير سريع.</p><p class="source-note">المصدر: WHO Child Growth Standards / CDC WHO LMS data files — الإصدار ${escapeHtml(assessment.manifest.version)}.</p></div>
            <button type="button" class="btn btn-primary" id="growth-to-tracker">نقل القياس إلى نموذج السجل</button>
        </div>`;
        byId('growth-to-tracker').addEventListener('click', () => {
            const values = { 'track-age': assessment.ageMonths, 'track-sex': assessment.sex,
                'track-weight': assessment.results.find(r => r.key === 'weightForAge')?.value ?? '',
                'track-height': assessment.results.find(r => r.key === 'lengthForAge')?.value ?? '',
                'track-head': assessment.results.find(r => r.key === 'headCircumferenceForAge')?.value ?? '' };
            for (const [id, value] of Object.entries(values)) if (byId(id)) byId(id).value = value;
            byId('track-age')?.focus();
            announce('نُقل القياس إلى النموذج. راجعي التاريخ والملاحظات ثم احفظيه.', 'info');
        });
    }

    async function calculate() {
        const button = byId('calculate-growth');
        if (button?.disabled) return;
        const years = Number(byId('child-years')?.value || 0);
        const months = Number(byId('child-months')?.value || 0);
        const ageMonths = years * 12 + months;
        const weight = Number(byId('child-weight')?.value || 0);
        const length = Number(byId('child-height')?.value || 0);
        const head = Number(byId('child-head')?.value || 0);
        const sex = byId('child-gender')?.value || 'male';
        if (!Number.isInteger(years) || !Number.isInteger(months) || years < 0 || months < 0 || months > 11 || ageMonths > 24) {
            renderError(new Error('المرجع الحالي يدعم من الولادة حتى 24 شهرًا فقط، ولا يمدد النتائج تلقائيًا.'));
            return;
        }
        if (![weight, length, head].some((value) => value > 0)) {
            renderError(new Error('أدخلي قياسًا واحدًا على الأقل.'));
            return;
        }
        if (button) { button.disabled = true; button.setAttribute('aria-busy', 'true'); }
        renderLoading();
        try {
            const assessment = await window.Ri3ayaGrowth.assess({ sex, ageMonths, weight, length, head });
            activeSex = sex;
            renderResults(assessment);
            await updateChart();
        } catch (error) {
            renderError(error);
        } finally { if (button) { button.disabled = false; button.removeAttribute('aria-busy'); } }
    }

    async function updateChart() {
        const canvas = byId('growth-chart');
        if (!canvas || !window.Ri3ayaGrowth) return;
        let status = byId('growth-chart-status');
        if (!status) { status = document.createElement('p'); status.id = 'growth-chart-status'; status.setAttribute('role', 'status'); canvas.before(status); }
        if (!window.Chart) { status.textContent = 'الرسم غير متاح حاليًا؛ يمكنك استخدام النتائج الرقمية والسجل المحلي.'; return; }
        const revision = ++chartRevision;
        const indicator = activeIndicator, sex = activeSex;
        status.textContent = 'جارٍ تحميل الرسم…';
        let data;
        try { data = await window.Ri3ayaGrowth.chartData(indicator, sex); }
        catch (error) { if (revision === chartRevision) status.textContent = `تعذر تحميل الرسم. أعيدي اختيار المؤشر للمحاولة: ${error.message}`; return; }
        if (revision !== chartRevision) return;
        status.textContent = '';

        if (chart) chart.destroy();
        const meta = Object.values(indicators).find((item) => item.key === indicator) || indicators.weight;
        chart = new Chart(canvas.getContext('2d'), {
            type: 'line',
            data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: { legend: { display: true, position: 'bottom' }, title: { display: true, text: `${meta.label} — مرجع WHO (0–24 شهر)` } },
                scales: { x: { title: { display: true, text: meta.axis } }, y: { title: { display: true, text: meta.unit }, beginAtZero: false } }
            }
        });
    }

    function summarizeResults(results) {
        return results.map((item) => ({
            key: item.key,
            label: item.label,
            z: item.z,
            percentile: item.percentile,
            value: item.value,
            unit: item.unit,
            interpretation: item.interpretation?.label || ''
        }));
    }

    function resultSummary(item) {
        if (!Array.isArray(item.results) || !item.results.length) return { indicator: 'قديم/غير محسوب', z: '—', percentile: '—' };
        const labels = item.results.map((result) => result.label).join('، ');
        const z = item.results.map((result) => `${result.label}: ${result.z === null ? '—' : Number(result.z).toFixed(2)}`).join(' · ');
        const percentile = item.results.map((result) => `${result.label}: ${result.percentile === null ? '—' : `${Number(result.percentile).toFixed(1)}%`}`).join(' · ');
        return { indicator: labels, z, percentile };
    }

    function renderTracker() {
        const body = byId('tracker-body');
        if (!body) return;
        const snapshot = window.Ri3ayaLocal.read('ri3aya-growth-tracker');
        if (!snapshot.ok) { body.innerHTML = `<tr><td colspan="11">${escapeHtml(snapshot.error)}</td></tr>`; return; }
        const data = snapshot.records.sort((a, b) => new Date(b.date) - new Date(a.date));
        body.innerHTML = data.length ? data.map((item, index) => {
            const summary = resultSummary(item);
            return `<tr>
                <td>${escapeHtml(item.date)}</td>
                <td>${escapeHtml(item.age)} شهر</td><td>${item.sex === "male" ? "ذكر" : item.sex === "female" ? "أنثى" : "غير مسجل"}</td>
                <td>${escapeHtml(item.weight || '—')}</td>
                <td>${escapeHtml(item.height || '—')}</td>
                <td>${escapeHtml(item.head || '—')}</td>
                <td>${escapeHtml(summary.indicator)}</td>
                <td>${escapeHtml(summary.z)}</td>
                <td>${escapeHtml(summary.percentile)}</td>
                <td>${escapeHtml(item.notes || '—')}</td>
                <td><button type="button" class="tracker-delete" data-record="${index}" aria-label="حذف قياس ${escapeHtml(item.date)}">حذف</button></td>
            </tr>`;
        }).join('') : '<tr><td colspan="11" class="empty-tracker">لا توجد قياسات مسجلة بعد.</td></tr>';
        body.querySelectorAll('.tracker-delete').forEach(button => button.addEventListener('click', () => {
            if (!confirm('حذف هذا القياس من المتصفح؟')) return;
            const result = window.Ri3ayaLocal.removeRecord('ri3aya-growth-tracker', data[Number(button.dataset.record)]);
            const message = result.ok ? 'تم حذف القياس.' : result.error;
            window.Ri3ayaLocal.notify(message); announce(message, result.ok ? 'info' : 'error');
        }));
    }

    async function saveMeasurement() {
        const item = {
            date: byId('track-date')?.value || (() => {
                const now = new Date();
                return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
            })(),
            age: Number(byId('track-age')?.value || 0),
            sex: byId('track-sex')?.value || byId('child-gender')?.value || 'male',
            weight: Number(byId('track-weight')?.value || 0) || '',
            height: Number(byId('track-height')?.value || 0) || '',
            head: Number(byId('track-head')?.value || 0) || '',
            notes: byId('track-notes')?.value.trim() || ''
        };
        if (!byId('track-age')?.value || !Number.isFinite(item.age) || item.age < 0 || item.age > 24 || ![item.weight, item.height, item.head].some(Boolean) || [item.weight, item.height, item.head].some(v => v !== '' && (!Number.isFinite(v) || v < 0)) || item.notes.length > 1000 || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || Number.isNaN(Date.parse(item.date)) || item.date > (() => {
            const now = new Date();
            return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
        })()) {
            announce('راجعي تاريخ القياس (ليس في المستقبل)، والعمر 0–24 شهرًا، وأدخلي قياسًا موجبًا واحدًا على الأقل.', 'error');
            return;
        }
        const button = byId('add-measurement');
        if (button.disabled) return;
        button.disabled = true;
        try {
            const assessment = await window.Ri3ayaGrowth.assess({ sex: item.sex, ageMonths: item.age, weight: item.weight, length: item.height, head: item.head });
            item.results = summarizeResults(assessment.results);
            item.reference = { source: assessment.manifest.source, version: assessment.manifest.version, reviewed: assessment.manifest.lastReviewed };
            const saved = window.Ri3ayaLocal.add('ri3aya-growth-tracker', item);
            if (!saved.ok) { window.Ri3ayaLocal.notify(saved.error); announce(saved.error, 'error'); return; }
            announce('تم حساب المؤشرات المرجعية وحفظ القياس محليًا على هذا الجهاز.', 'success');
        } catch (error) {
            announce(`تعذر حساب القياس: ${error.message}`, 'error');
        } finally { button.disabled = false; }
    }

    function initTracker() {
        renderTracker();
        window.addEventListener('ri3aya-data-change', event => { if (!event.detail.key || event.detail.key === 'ri3aya-growth-tracker') renderTracker(); });
        byId('add-measurement')?.addEventListener('click', saveMeasurement);
        byId('clear-tracker')?.addEventListener('click', () => {
            if (!confirm('هل تريدين حذف سجل القياسات المحفوظ على هذا الجهاز؟')) return;
            const result = window.Ri3ayaLocal.clear('ri3aya-growth-tracker');
            const message = result.ok ? 'تم حذف السجل المحلي.' : result.error;
            window.Ri3ayaLocal.notify(message); announce(message, result.ok ? 'info' : 'error');
        });
        byId('print-tracker')?.addEventListener('click', () => window.print());
    }

    function initFaq() {
        document.querySelectorAll('.faq-question').forEach((question) => {
            const answer = question.nextElementSibling;
            if (!answer) return;
            question.setAttribute('aria-expanded', 'false');
            question.addEventListener('click', () => {
                const open = answer.classList.toggle('active');
                question.setAttribute('aria-expanded', String(open));
            });
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        const years = byId('child-years');
        if (years) years.max = '2';
        const months = byId('child-months');
        if (months) months.max = '11';
        const calculateButton = byId('calculate-growth');
        calculateButton?.addEventListener('click', calculate);
        document.querySelectorAll('.chart-tab-btn').forEach((button) => button.addEventListener('click', async () => {
            document.querySelectorAll('.chart-tab-btn').forEach((item) => {
                item.classList.remove('active');
                item.setAttribute('aria-selected', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-selected', 'true');
            activeIndicator = indicators[button.dataset.chart]?.key || 'weightForAge';
            await updateChart();
        }));
        byId('child-gender')?.addEventListener('change', async (event) => { activeSex = event.target.value; await updateChart(); });
        initTracker();
        initFaq();
        renderLoading();
        try {
            await window.Ri3ayaGrowth.load();
            await updateChart();
            await calculate();
        } catch (error) {
            renderError(error);
        }
    });
})();
