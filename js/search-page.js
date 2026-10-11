(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const engine = window.Ri3ayaSearch, form = document.getElementById('discovery-form');
        if (!engine || !form) return;
        const byId = id => document.getElementById(id);
        const q = byId('discovery-query'), age = byId('discovery-age'), topic = byId('discovery-topic'), type = byId('discovery-type');
        const results = byId('discovery-results'), count = byId('discovery-count'), empty = byId('discovery-empty'), error = byId('discovery-error'), more = byId('discovery-more');
        const labels = { article: 'مقال مستقل', guide: 'دليل عام', tool: 'أداة', page: 'صفحة من الموقع' };
        const reviewLabels = { not_reviewed: 'لم يُراجع طبيًا بعد', pending: 'بانتظار مراجعة طبية', reviewed: 'مراجعة طبية موثقة' };
        let state, data, matches = [], visible = 8, revision = 0, timer;
        function syncURL(push) {
            const query = engine.paramsFor(state).toString();
            const url = location.pathname + (query ? '?' + query : '') + location.hash;
            if (push) { if (url !== location.pathname + location.search + location.hash) history.pushState(null, '', url); }
            else history.replaceState(null, '', url);
            byId('discovery-share-status').textContent = '';
            byId('discovery-copy-fallback').hidden = true;
        }
        function restore() {
            state = engine.parseState(location.search);
            // The public menu uses concrete topics; old library safety URLs resolve to sleep.
            if (state.topic === 'safety') state.topic = 'sleep';
            q.value = state.q; age.value = state.age; topic.value = state.topic; type.value = state.type;
            syncURL(false); refresh();
        }
        function read(push) {
            if (!form.reportValidity()) return;
            state = { q: q.value.trim().slice(0, 160), age: age.value, topic: topic.value, type: type.value };
            syncURL(push); refresh();
        }
        function render() {
            const fragment = document.createDocumentFragment();
            matches.slice(0, visible).forEach(item => {
                const card = document.createElement('article'); card.className = 'search-result-card';
                const category = document.createElement('p'); category.className = 'search-result-type'; category.textContent = `${labels[item.type]} · ${item.section}`;
                const title = document.createElement('h2'), link = document.createElement('a'); link.href = engine.rootPath() + item.url; link.textContent = item.title; title.appendChild(link);
                const description = document.createElement('p'); description.textContent = item.summary;
                const ages = document.createElement('p'); ages.className = 'search-note'; ages.textContent = item.age_label;
                card.append(category, title, description, ages);
                if (item.type === 'article') { const badge = document.createElement('span'); badge.className = 'review-badge'; badge.textContent = reviewLabels[item.medical_review_status] || 'حالة المراجعة غير محددة'; card.appendChild(badge); }
                fragment.appendChild(card);
            });
            results.replaceChildren(fragment);
            count.textContent = `${matches.length} نتيجة — المعروض ${Math.min(visible, matches.length)}`;
            empty.hidden = matches.length > 0; more.hidden = matches.length <= visible;
            more.textContent = `عرض ${Math.max(0, Math.min(8, matches.length - visible))} نتائج أخرى`;
            results.setAttribute('aria-busy', 'false');
        }
        async function refresh() {
            const request = ++revision;
            visible = 8; error.hidden = true; empty.hidden = true; more.hidden = true;
            results.replaceChildren(); results.setAttribute('aria-busy', 'true'); count.textContent = 'جارٍ البحث…';
            try {
                data = await engine.loadIndex();
                if (request !== revision) return;
                matches = engine.filter(data.items, state); render();
            } catch (_) {
                if (request !== revision) return;
                count.textContent = 'البحث غير متاح الآن.'; error.hidden = false;
                results.setAttribute('aria-busy', 'false');
            }
        }
        q.addEventListener('input', () => { revision++; clearTimeout(timer); timer = setTimeout(() => read(false), 220); });
        [age, topic, type].forEach(control => control.addEventListener('change', () => { clearTimeout(timer); read(true); }));
        form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); read(true); });
        byId('discovery-reset').addEventListener('click', () => { clearTimeout(timer); q.value = ''; age.value = ''; topic.value = 'all'; type.value = 'all'; read(true); });
        byId('discovery-retry').addEventListener('click', () => { clearTimeout(timer); read(false); });
        more.addEventListener('click', () => { visible += 8; render(); });
        byId('discovery-copy').addEventListener('click', async () => {
            clearTimeout(timer);
            if (!form.reportValidity()) return;
            // Include typed values even if the debounce has not elapsed.
            read(false);
            const url = location.href;
            try {
                await navigator.clipboard.writeText(url);
                byId('discovery-share-status').textContent = 'تم نسخ رابط البحث والفلاتر.';
            } catch (_) {
                byId('discovery-copy-fallback').hidden = false;
                const input = byId('discovery-share-link'); input.value = url; input.focus(); input.select();
                byId('discovery-share-status').textContent = 'انسخي الرابط من الحقل الظاهر.';
            }
        });
        window.addEventListener('popstate', () => { clearTimeout(timer); restore(); });
        restore();
    });
})();
