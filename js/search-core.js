/* Shared, literal Arabic search and age filtering. No diagnostic inference. */
(function (scope) {
    'use strict';
    const normalize = value => String(value || '').toLocaleLowerCase('ar')
        .replace(/[\u064B-\u065F\u0670ـ]/g, '').replace(/[إأآ]/g, 'ا')
        .replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
    const words = value => normalize(value).split(' ').filter(Boolean).map(word => word.startsWith('ال') && word.length > 3 ? word.slice(2) : word);
    const synonyms = [['نوم', 'نائم'], ['تلقيح', 'تطعيم', 'لقاح', 'لقاحات', 'تطعيمات'], ['حفاض', 'حفاضات', 'حفاضه', 'حفاظات'], ['غذاء', 'تغذيه'], ['حمام', 'استحمام'], ['بكاء', 'يبكي']];
    const aliases = new Map(synonyms.flatMap(group => group.map(word => [word, group])));
    const topicIDs = ['sleep', 'nutrition', 'care', 'crying', 'growth', 'vaccine', 'bath', 'diapers', 'digestive', 'diseases', 'tips', 'safety'];
    function rootPath() {
        const segments = location.pathname.split('/pages/');
        return segments.length > 1 ? '../'.repeat(segments[1].split('/').length) : '';
    }
    function parseState(search, topics = topicIDs) {
        const params = new URLSearchParams(search);
        const age = params.get('age') || '';
        return { q: (params.get('q') || '').trim().slice(0, 160),
            age: /^\d{1,2}$/.test(age) && Number(age) <= 36 ? String(Number(age)) : '',
            topic: topics.includes(params.get('topic')) ? params.get('topic') : 'all',
            type: ['article', 'guide', 'tool', 'page'].includes(params.get('type')) ? params.get('type') : 'all' };
    }
    function paramsFor(state) {
        const params = new URLSearchParams();
        if (state.q) params.set('q', state.q.trim().slice(0, 160));
        if (state.age !== '' && state.age != null) params.set('age', state.age);
        if (state.topic && state.topic !== 'all') params.set('topic', state.topic);
        if (state.type && state.type !== 'all') params.set('type', state.type);
        return params;
    }
    function ageMatches(item, age) {
        if (age === '' || age == null) return true;
        return item.age_scope === 'range' && Number(age) >= item.age_min_months && Number(age) <= item.age_max_months;
    }
    function prepare(item) {
        const title = words(item.title).join(' ');
        return { item, title, text: words(`${item.title} ${item.keywords || ''} ${item.section || ''}`).join(' ') };
    }
    function filter(items, state) {
        const groups = words(state.q).map(word => aliases.get(word) || [word]);
        if (String(state.q || '').trim() && !groups.length) return [];
        const prepared = items.map(prepare);
        return prepared.filter(({ item, text }) =>
            ageMatches(item, state.age) && (state.topic === 'all' || !state.topic || item.topics?.includes(state.topic)) &&
            (state.type === 'all' || !state.type || item.type === state.type) &&
            (groups.length || state.type !== 'all' || item.type !== 'page') &&
            groups.every(group => group.some(word => text.includes(word))))
            .map(entry => ({ ...entry, score: groups.reduce((score, group) => score + (group.some(word => entry.title.includes(word)) ? 20 : 0), 0) + (entry.item.type === 'article' ? 3 : 0) }))
            .sort((a, b) => b.score - a.score).map(entry => entry.item);
    }
    let indexPromise;
    function loadIndex() {
        if (!indexPromise) indexPromise = fetch(`${rootPath()}search/index.json`, { credentials: 'same-origin' })
            .then(response => { if (!response.ok) throw new Error('index'); return response.json(); })
            .then(data => { if (data.schema_version !== 4 || !Array.isArray(data.items)) throw new Error('index'); return data; })
            .catch(error => { indexPromise = null; throw error; });
        return indexPromise;
    }
    scope.Ri3ayaSearch = Object.freeze({ normalize, filter, ageMatches, parseState, paramsFor, rootPath, loadIndex });
})(window);
