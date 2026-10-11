(function () {
    'use strict';
    const rootPath = location.pathname.includes('/pages/tools/') ? '../../' : location.pathname.includes('/pages/') ? '../' : '';
    let indexPromise;
    const normalize = (value) => String(value || '').toLocaleLowerCase('ar')
        .replace(/[\u064B-\u065F\u0670ـ]/g, '').replace(/[إأآ]/g, 'ا')
        .replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/\s+/g, ' ').trim();
    function loadIndex() {
        if (!indexPromise) {
            indexPromise = fetch(`${rootPath}search/index.json`, { credentials: 'same-origin' })
                .then((response) => { if (!response.ok) throw new Error('index'); return response.json(); })
                .catch((error) => { indexPromise = null; throw error; });
        }
        return indexPromise;
    }
    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.search-container').forEach((container, index) => {
            const input = container.querySelector('.search-input');
            const button = container.querySelector('.search-btn');
            if (!input || !button) return;
            const results = document.createElement('div');
            results.className = 'site-search-results';
            results.id = index ? `site-search-results-${index}` : 'site-search-results';
            results.hidden = true;
            results.setAttribute('role', 'region');
            results.setAttribute('aria-label', 'نتائج البحث في الموقع');
            input.setAttribute('aria-controls', results.id);
            container.appendChild(results);
            let revision = 0, timer;
            const close = () => { revision++; clearTimeout(timer); results.hidden = true; };
            const status = (message) => {
                const p = document.createElement('p');
                p.className = 'search-count';
                p.setAttribute('role', 'status');
                p.textContent = message;
                results.replaceChildren(p);
                results.hidden = false;
            };
            async function run() {
                clearTimeout(timer);
                const request = ++revision;
                const query = normalize(input.value);
                if (!query) { results.hidden = true; results.replaceChildren(); return; }
                status('جارٍ البحث…');
                try {
                    const data = await loadIndex();
                    if (request !== revision) return;
                    const words = query.split(' ');
                    const matches = data.items.map((item) => ({ item, title: normalize(item.title),
                        text: normalize(`${item.title} ${item.keywords} ${item.section}`) }))
                        .filter(({ text }) => words.every((word) => text.includes(word)))
                        .sort((a, b) => Number(b.title.includes(query)) - Number(a.title.includes(query)));
                    status(matches.length ? `${matches.length} نتيجة${matches.length > 12 ? ' — نعرض أول 12 نتيجة' : ''}` : 'لم نجد نتائج. جربي كلمات مثل نوم أو تغذية.');
                    matches.slice(0, 12).forEach(({ item }) => {
                        const a = document.createElement('a');
                        a.className = 'site-search-result';
                        a.href = rootPath + item.url;
                        const title = document.createElement('strong'); title.textContent = item.title;
                        const section = document.createElement('span'); section.textContent = item.section;
                        a.append(title, section); results.appendChild(a);
                    });
                } catch (_) {
                    if (request === revision) status('تعذر تحميل البحث. اضغطي بحث للمحاولة مجددًا.');
                }
            }
            input.addEventListener('input', () => { revision++; clearTimeout(timer); timer = setTimeout(run, 220); });
            button.addEventListener('click', run);
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') { event.preventDefault(); run(); }
                if (event.key === 'ArrowDown' && !results.hidden) { event.preventDefault(); results.querySelector('a')?.focus(); }
            });
            container.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') { close(); input.focus(); }
                const links = [...results.querySelectorAll('a')];
                const position = links.indexOf(document.activeElement);
                if (position >= 0 && ['ArrowDown', 'ArrowUp'].includes(event.key)) {
                    event.preventDefault();
                    if (event.key === 'ArrowUp' && position === 0) input.focus();
                    else links[(position + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus();
                }
            });
            document.addEventListener('click', (event) => { if (!container.contains(event.target)) close(); });
            container.addEventListener('focusout', (event) => { if (!container.contains(event.relatedTarget)) close(); });
        });
    });
})();
