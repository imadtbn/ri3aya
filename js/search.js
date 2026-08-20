(function () {
    'use strict';
    const pathName = window.location.pathname;
    const rootPath = pathName.includes('/pages/tools/') ? '../../' : pathName.includes('/pages/') ? '../' : '';
    let indexPromise;

    function normalize(value) {
        return String(value || '')
            .toLocaleLowerCase('ar')
            .replace(/[إأآا]/g, 'ا')
            .replace(/ى/g, 'ي')
            .replace(/ة/g, 'ه')
            .replace(/ـ/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function loadIndex() {
        indexPromise ||= fetch(`${rootPath}search/index.json`, { credentials: 'same-origin' }).then((response) => {
            if (!response.ok) throw new Error('تعذر تحميل فهرس البحث');
            return response.json();
        });
        return indexPromise;
    }

    function resultUrl(url) {
        return `${rootPath}${url}`.replace(/\/index\.html$/, '/');
    }

    function renderResults(container, items, query) {
        container.innerHTML = '';
        if (!items.length) {
            container.innerHTML = '<p class="search-empty" role="status">لم نجد نتائج مطابقة في الموقع.</p>';
            return;
        }
        const fragment = document.createDocumentFragment();
        items.slice(0, 12).forEach((item) => {
            const link = document.createElement('a');
            link.className = 'site-search-result';
            link.href = resultUrl(item.url);
            link.innerHTML = `<strong></strong><span></span><small></small>`;
            link.querySelector('strong').textContent = item.title;
            link.querySelector('span').textContent = item.section;
            link.querySelector('small').textContent = item.type === 'article' ? 'مقال ومحتوى توعوي' : 'صفحة من الموقع';
            fragment.appendChild(link);
        });
        container.appendChild(fragment);
        container.dataset.query = query;
    }

    async function search(query, container) {
        const normalized = normalize(query);
        if (!normalized) {
            container.hidden = true;
            container.innerHTML = '';
            return;
        }
        try {
            const data = await loadIndex();
            const items = data.items.map((item) => ({ ...item, haystack: normalize(`${item.title} ${item.keywords} ${item.section}`) }))
                .filter((item) => item.haystack.includes(normalized));
            renderResults(container, items, normalized);
            container.hidden = false;
            window.Ri3aya?.announce?.(`تم العثور على ${items.length} نتيجة في الموقع.`, items.length ? 'success' : 'info');
        } catch (_) {
            container.hidden = false;
            container.innerHTML = '<p class="search-empty" role="status">تعذر تحميل البحث الآن. حاولي مرة أخرى.</p>';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.search-container').forEach((container) => {
            const input = container.querySelector('.search-input');
            const button = container.querySelector('.search-btn');
            if (!input || !button) return;
            let results = container.querySelector('.site-search-results');
            if (!results) {
                results = document.createElement('div');
                results.className = 'site-search-results';
                results.hidden = true;
                results.setAttribute('role', 'listbox');
                container.appendChild(results);
            }
            const run = () => search(input.value, results);
            button.addEventListener('click', run);
            input.addEventListener('keydown', (event) => { if (event.key === 'Enter') run(); });
            document.addEventListener('click', (event) => {
                if (!container.contains(event.target)) results.hidden = true;
            });
        });
    });
})();
