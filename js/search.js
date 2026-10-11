(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const engine = window.Ri3ayaSearch;
        if (!engine) return;
        const root = engine.rootPath();
        document.querySelectorAll('.search-container').forEach((container, index) => {
            const input = container.querySelector('.search-input');
            if (!input) return;
            const results = document.createElement('div');
            results.className = 'site-search-results';
            results.id = index ? `site-search-results-${index}` : 'site-search-results';
            results.hidden = true;
            results.setAttribute('role', 'region');
            results.setAttribute('aria-label', 'اقتراحات البحث في الموقع');
            input.setAttribute('aria-controls', results.id);
            container.appendChild(results);
            let revision = 0, timer;
            const close = () => { revision++; clearTimeout(timer); results.hidden = true; };
            const status = message => {
                const p = document.createElement('p'); p.className = 'search-count';
                p.setAttribute('role', 'status'); p.textContent = message;
                results.replaceChildren(p); results.hidden = false;
            };
            async function run() {
                clearTimeout(timer);
                const request = ++revision;
                const q = input.value.trim().slice(0, 160);
                if (!q) { results.hidden = true; results.replaceChildren(); return; }
                status('جارٍ البحث…');
                try {
                    const data = await engine.loadIndex();
                    if (request !== revision) return;
                    const matches = engine.filter(data.items, { q, age: '', topic: 'all', type: 'all' });
                    status(matches.length ? `${matches.length} نتيجة${matches.length > 8 ? ' — أول 8 اقتراحات' : ''}` : 'لم نجد نتائج. جربي كلمات مثل نوم أو تغذية.');
                    matches.slice(0, 8).forEach(item => {
                        const a = document.createElement('a'); a.className = 'site-search-result'; a.href = root + item.url;
                        const title = document.createElement('strong'); title.textContent = item.title;
                        const section = document.createElement('span'); section.textContent = item.section;
                        a.append(title, section); results.appendChild(a);
                    });
                    const all = document.createElement('a'); all.className = 'site-search-all';
                    all.href = root + 'pages/search.html?' + engine.paramsFor({ q }).toString();
                    all.textContent = 'عرض البحث والفلترة بالعمر والموضوع'; results.appendChild(all);
                } catch (_) {
                    if (request === revision) status('تعذر تحميل الاقتراحات. افتحي البحث والفلترة للمحاولة مجددًا.');
                }
            }
            input.addEventListener('input', () => { revision++; clearTimeout(timer); timer = setTimeout(run, 220); });
            input.addEventListener('keydown', event => {
                if (event.key === 'ArrowDown' && !results.hidden) { event.preventDefault(); results.querySelector('a')?.focus(); }
            });
            container.addEventListener('submit', close);
            container.addEventListener('keydown', event => {
                if (event.key === 'Escape') { close(); input.focus(); }
                const links = [...results.querySelectorAll('a')];
                const position = links.indexOf(document.activeElement);
                if (position >= 0 && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
                    event.preventDefault();
                    if (event.key === 'ArrowUp' && position === 0) input.focus();
                    else links[(position + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus();
                }
            });
            document.addEventListener('click', event => { if (!container.contains(event.target)) close(); });
            container.addEventListener('focusout', event => { if (!container.contains(event.relatedTarget)) close(); });
        });
    });
})();
