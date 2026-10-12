/* Local follow-up records. Legacy keys are preserved; never clear the origin. */
(function (scope) {
    'use strict';
    const text = (v, max = 10000) => typeof v === 'string' && v.length <= max;
    const nonEmptyText = (v, max = 10000) => text(v, max) && v.trim().length > 0;
    const date = v => text(v, 10) && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().slice(0, 10) === v;
    const number = v => typeof v === 'number' && Number.isFinite(v);
    const measurement = v => v === '' || (number(v) && v >= 0);
    const registry = {
        'ri3aya-growth-tracker': { label: 'قياسات النمو', file: 'growth', page: 'growth.html', valid: r => date(r.date) && number(r.age) && r.age >= 0 && r.age <= 24 && [r.weight, r.height, r.head].every(measurement) && (r.sex == null || ['male', 'female'].includes(r.sex)) && (r.notes == null || text(r.notes)) && (r.results == null || Array.isArray(r.results) && r.results.every(x => x && text(x.label) && text(x.unit) && number(x.value) && (x.z === null || number(x.z)) && (x.percentile === null || number(x.percentile)))) },
        foodRecords: { label: 'سجل الطعام', file: 'food', page: 'nutrition.html', valid: r => nonEmptyText(r.food) && date(r.date) && ['like', 'dislike', 'neutral'].includes(r.reaction) },
        symptomRecords: { label: 'ملاحظات الأعراض', file: 'symptoms', page: 'digestive.html', valid: r => date(r.date) && text(r.duration) && ['colic', 'gas', 'reflux', 'constipation', 'diarrhea'].includes(r.disorder) && ['mild', 'moderate', 'severe'].includes(r.severity) },
        saved_routines: { label: 'الروتينات المحفوظة', file: 'routines', page: 'tools/routine.html', valid: r => nonEmptyText(r.name) && nonEmptyText(r.title) && text(r.savedAt) && !Number.isNaN(Date.parse(r.savedAt)) && r.config && text(r.config.age) && Array.isArray(r.schedule) && r.schedule.length <= 100 && r.schedule.every(s => s && ['time', 'activity', 'duration', 'icon'].every(k => text(s[k]))) && Array.isArray(r.tips) && r.tips.length <= 100 && r.tips.every(t => text(t)) && text(r.totalSleep) && text(r.totalFeeds) }
    };
    Object.values(registry).forEach(Object.freeze); Object.freeze(registry);
    const messages = {
        blocked: 'تعذر الوصول إلى السجلات المحلية لأن المتصفح يمنع التخزين. لم تتغير بياناتك؛ تحققي من إعدادات الخصوصية ثم حاولي مجددًا.',
        corrupt: 'السجلات المحفوظة غير قابلة للقراءة. لم تُحذف؛ حمّلي نسخة خام قبل محاولة حذفها.',
        full: 'تعذر الحفظ: التخزين ممتلئ أو غير متاح. صدّري نسخة ثم احذفي سجلات لا تحتاجينها.',
        limit: 'بلغ السجل حد الأداة (1000 سجل أو 2 ميجابايت). صدّريه قبل حذف سجلات قديمة؛ لا نحذفها تلقائيًا.',
        invalid: 'راجعي القيم المدخلة؛ لم يتم حفظ السجل.',
        missing: 'هذا السجل غير موجود حاليًا. حدّثي القائمة وحاولي مجددًا.'
    };
    const fail = code => ({ ok: false, code, error: messages[code], records: [] });
    const valid = (key, records) => Array.isArray(records) && records.every(r => r && typeof r === 'object' && !Array.isArray(r) && registry[key].valid(r));
    function read(key) {
        if (!Object.hasOwn(registry, key)) return fail('invalid');
        let raw;
        try { raw = scope.localStorage.getItem(key); } catch (_) { return fail('blocked'); }
        if (raw === null) return { ok: true, records: [], raw: null, bytes: 0 };
        try {
            const records = JSON.parse(raw);
            if (!valid(key, records)) throw new Error('shape');
            return { ok: true, records, raw, bytes: new Blob([raw]).size };
        } catch (_) { return { ...fail('corrupt'), raw, bytes: new Blob([raw]).size }; }
    }
    function changed(key) { scope.dispatchEvent(new CustomEvent('ri3aya-data-change', { detail: { key } })); }
    function write(key, records) {
        if (!Object.hasOwn(registry, key) || !valid(key, records)) return fail('invalid');
        // A failed read must never be treated as an empty record set.
        const before = read(key); if (!before.ok) return before;
        const raw = JSON.stringify(records);
        const bytes = new Blob([raw]).size;
        if ((records.length > 1000 || bytes > 2 * 1024 * 1024) && !(records.length < before.records.length && bytes < before.bytes)) return fail('limit');
        try { scope.localStorage.setItem(key, raw); } catch (_) { return fail('full'); }
        changed(key); return { ok: true, records };
    }
    function add(key, record) {
        const current = read(key); if (!current.ok) return current;
        return write(key, [record, ...current.records]);
    }
    function removeRecord(key, record) {
        const current = read(key); if (!current.ok) return current;
        const index = current.records.findIndex(r => JSON.stringify(r) === JSON.stringify(record));
        if (index < 0) return fail('missing');
        current.records.splice(index, 1); return write(key, current.records);
    }
    function clear(key) {
        if (!Object.hasOwn(registry, key)) return fail('invalid');
        try { scope.localStorage.removeItem(key); } catch (_) { return fail('blocked'); }
        changed(key); return { ok: true };
    }
    // CSV cells are quoted and formula-like input remains literal in spreadsheets.
    function csvCell(value) {
        let s = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value ?? '');
        if (/^[\s\uFEFF]*[=+\-@]/.test(s) || /^[\t\r\n]/.test(s)) s = "'" + s;
        return '"' + s.replace(/"/g, '""') + '"';
    }
    function exportData(keys, format = 'json') {
        if (!Array.isArray(keys) || !keys.length || keys.some(k => !Object.hasOwn(registry, k))) return fail('invalid');
        const sets = keys.map(key => ({ key, ...read(key) }));
        if (sets.some(s => s.code === 'blocked')) return fail('blocked');
        const stamp = new Date().toISOString(), name = keys.length === 1 ? registry[keys[0]].file : 'follow-up';
        if (format === 'raw') return { ok: true, name: `ri3aya-${name}-raw-${stamp.slice(0, 10)}.json`, mime: 'application/json;charset=utf-8', content: JSON.stringify({ format: 'ri3aya-local-raw', version: 1, exported_at: stamp, raw: Object.fromEntries(sets.map(s => [s.key, s.raw])) }, null, 2) };
        const bad = sets.find(s => !s.ok); if (bad) return bad;
        if (format === 'csv') {
            const headers = [...new Set(sets.flatMap(s => s.records.flatMap(r => Object.keys(r))))];
            const rows = [['السجل', ...headers], ...sets.flatMap(s => s.records.map(r => [registry[s.key].label, ...headers.map(h => r[h])]))];
            return { ok: true, name: `ri3aya-${name}-${stamp.slice(0, 10)}.csv`, mime: 'text/csv;charset=utf-8', content: '\uFEFF' + rows.map(row => row.map(csvCell).join(',')).join('\r\n') };
        }
        if (format !== 'json') return fail('invalid');
        return { ok: true, name: `ri3aya-${name}-${stamp.slice(0, 10)}.json`, mime: 'application/json;charset=utf-8', content: JSON.stringify({ format: 'ri3aya-local-follow-up', version: 1, exported_at: stamp, records: Object.fromEntries(sets.map(s => [s.key, s.records])) }, null, 2) };
    }
    function download(result) {
        if (!result.ok) return result;
        try {
            const focused = document.activeElement;
            const url = URL.createObjectURL(new Blob([result.content], { type: result.mime }));
            const link = document.createElement('a'); link.href = url; link.download = result.name;
            document.body.append(link); link.click(); link.remove();
            if (focused?.isConnected && typeof focused.focus === 'function') focused.focus({ preventScroll: true });
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            return { ok: true };
        } catch (_) { return { ok: false, error: 'تعذر بدء التنزيل. جرّبي متصفحًا يسمح بتنزيل الملفات.' }; }
    }
    function notify(message) {
        const node = document.getElementById('local-data-message');
        if (node) node.textContent = message;
    }
    scope.Ri3ayaLocal = Object.freeze({ registry, read, add, removeRecord, clear, exportData, download, notify });
    scope.addEventListener('storage', event => { if (event.key === null || Object.hasOwn(registry, event.key)) changed(event.key); });
    document.addEventListener('DOMContentLoaded', () => {
        const panel = document.getElementById('local-data-panel'); if (!panel) return;
        const keys = panel.dataset.scope === 'all' ? Object.keys(registry) : [panel.dataset.scope];
        const list = document.getElementById('local-data-list');
        function refresh() {
            list.replaceChildren(); let total = 0;
            for (const key of keys) {
                const snapshot = read(key); total += snapshot.bytes || 0;
                const card = document.createElement('article'); card.className = 'local-data-card';
                const title = document.createElement('h3'); title.textContent = registry[key].label;
                const status = document.createElement('p'); status.className = 'local-data-status';
                status.textContent = snapshot.ok ? `${snapshot.records.length} سجل · ${((snapshot.bytes || 0) / 1024).toFixed(1)} كيلوبايت` : snapshot.error;
                const actions = document.createElement('div'); actions.className = 'local-data-actions';
                for (const [label, format] of [['تصدير JSON', 'json'], ['تصدير CSV', 'csv'], ['نسخة خام', 'raw']]) {
                    if (format === 'raw' && snapshot.code !== 'corrupt') continue;
                    const button = document.createElement('button'); button.type = 'button'; button.className = 'btn btn-secondary'; button.textContent = label;
                    button.disabled = format === 'raw' ? snapshot.code !== 'corrupt' : !snapshot.ok || !snapshot.records.length;
                    button.addEventListener('click', () => { const r = download(exportData([key], format)); notify(r.ok ? 'تم طلب تنزيل الملف؛ تحققي من التنزيلات في متصفحك.' : r.error); });
                    actions.append(button);
                }
                const del = document.createElement('button'); del.type = 'button'; del.className = 'btn local-delete'; del.textContent = 'حذف جميع بيانات ' + registry[key].label;
                del.disabled = snapshot.ok && !snapshot.records.length || snapshot.code === 'blocked';
                del.addEventListener('click', () => { if (!confirm(`حذف جميع بيانات «${registry[key].label}» من هذا المتصفح؟ صدّري نسخة أولًا إذا احتجتها. لا يمكن التراجع.`)) return; const r = clear(key); notify(r.ok ? 'تم حذف بيانات الأداة من هذا المتصفح.' : r.error); });
                actions.append(del); card.append(title, status, actions); list.append(card);
            }
            document.getElementById('local-data-size').textContent = `حجم سجلات المتابعة المعروضة تقريبًا: ${(total / 1024).toFixed(1)} كيلوبايت. لا يشمل ملفات الموقع المؤقتة أو بقية بيانات المتصفح.`;
            const allExport = document.getElementById('local-export-all'); const allDelete = document.getElementById('local-delete-all');
            if (allExport) allExport.disabled = keys.some(k => !read(k).ok) || !keys.some(k => read(k).records.length);
            if (allDelete) allDelete.disabled = !keys.some(k => read(k).raw != null) || keys.every(k => read(k).code === 'blocked');
        }
        document.getElementById('local-refresh')?.addEventListener('click', refresh);
        document.getElementById('local-export-all')?.addEventListener('click', () => { const r = download(exportData(keys)); notify(r.ok ? 'تم طلب تنزيل نسخة السجلات؛ تحققي من التنزيلات في متصفحك.' : r.error); });
        document.getElementById('local-delete-all')?.addEventListener('click', () => {
            if (!confirm('حذف سجلات النمو والطعام والأعراض والروتينات من هذا المتصفح؟ لا يمكن التراجع. بقية تفضيلات الموقع لا تدخل هذا الحذف.')) return;
            const failures = keys.map(key => ({ key, ...clear(key) })).filter(r => !r.ok);
            notify(failures.length
                ? `حُذفت المجموعات التي أمكن حذفها، وتعذر حذف: ${failures.map(r => registry[r.key].label).join('، ')}. أعيدي المحاولة بعد مراجعة إعدادات التخزين.`
                : 'حُذفت سجلات المتابعة الأربعة من هذا المتصفح. لا تتأثر بيانات المواقع الأخرى.');
        });
        scope.addEventListener('ri3aya-data-change', refresh); refresh();
    });
})(window);
