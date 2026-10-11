(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const engine = window.Ri3ayaSearch;
        const form = document.getElementById('library-controls');
        const data = document.getElementById('library-data');
        if (!engine || !form || !data) return;
        const items = JSON.parse(data.textContent);
        const cards = [...document.querySelectorAll('.library-card')];
        const buttons = [...document.querySelectorAll('.library-filter')];
        const q = document.getElementById('library-query'), age = document.getElementById('library-age');
        const count = document.getElementById('library-count');
        const empty = document.getElementById('library-empty');
        const full = document.getElementById('library-full-search');
        let state, timer;
        function render(push = false) {
            const matches = new Set(engine.filter(items, { ...state, type: 'article' }).map(item => item.url));
            cards.forEach(card => { card.hidden = !matches.has(card.dataset.url); });
            buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.category === state.topic)));
            count.textContent = `${matches.size} مقالات من ${items.length}`;
            empty.hidden = matches.size > 0;
            const topic = state.topic === 'safety' ? 'sleep' : state.topic;
            full.href = 'search.html?' + engine.paramsFor({ ...state, topic, type: 'all' }).toString();
            const query = engine.paramsFor({ ...state, type: 'all' }).toString();
            const url = location.pathname + (query ? '?' + query : '') + location.hash;
            if (push) { if (url !== location.pathname + location.search + location.hash) history.pushState(null, '', url); }
            else history.replaceState(null, '', url);
        }
        function restore() {
            state = engine.parseState(location.search, ['safety', 'nutrition', 'care']);
            state.type = 'all'; q.value = state.q; age.value = state.age; render();
        }
        function read() {
            if (!form.reportValidity()) return false;
            state.q = q.value.trim().slice(0, 160); state.age = age.value; return true;
        }
        q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { if (read()) render(); }, 220); });
        age.addEventListener('change', () => { clearTimeout(timer); if (read()) render(true); });
        form.addEventListener('submit', event => { event.preventDefault(); clearTimeout(timer); if (read()) render(true); });
        buttons.forEach(button => button.addEventListener('click', () => { clearTimeout(timer); if (read()) { state.topic = button.dataset.category; render(true); } }));
        document.getElementById('library-reset').addEventListener('click', () => { clearTimeout(timer); state = { q: '', age: '', topic: 'all', type: 'all' }; q.value = ''; age.value = ''; render(true); });
        window.addEventListener('popstate', () => { clearTimeout(timer); restore(); });
        restore();
    });
})();
