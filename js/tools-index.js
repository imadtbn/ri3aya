(function () {
    'use strict';
    const matches = (tool, state, normalize) => {
        if (state.age !== null && (!Number.isInteger(state.age) || state.age < 0 || state.age > 36)) return false;
        const words = normalize(state.query || '').split(' ').filter(Boolean);
        return (state.goal === 'all' || tool.goal === state.goal)
            && (state.age === null || tool.maxAge === null || state.age <= tool.maxAge)
            && words.every(word => normalize(tool.text).includes(word));
    };
    window.Ri3ayaTools = Object.freeze({ matches });
    document.addEventListener('DOMContentLoaded', () => {
        const chooser = document.getElementById('tool-chooser');
        if (!chooser) return;
        const query = document.getElementById('tool-query');
        const goal = document.getElementById('tool-goal');
        const age = document.getElementById('tool-age');
        const cards = [...document.querySelectorAll('.tool-index-card')].map(el => ({ el,
            goal: el.dataset.goal, maxAge: el.hasAttribute('data-max-age') ? Number(el.dataset.maxAge) : null,
            text: el.textContent }));
        for (const card of cards) {
            const note = document.createElement('small'); note.className = 'tool-capability';
            note.textContent = card.maxAge === null ? 'دليل ومتابعة عامة؛ اختاري المحتوى المناسب للعمر' : `الأداة تدعم من 0 إلى ${card.maxAge} شهرًا`;
            card.el.querySelector('h2').after(note);
        }
        function update() {
            const ageIsValid = age.validity.valid && (age.value === '' ||
                (/^\d+$/.test(age.value) && Number(age.value) >= 0 && Number(age.value) <= 36));
            age.setAttribute('aria-invalid', String(!ageIsValid));
            if (!ageIsValid) {
                for (const card of cards) card.el.hidden = true;
                document.getElementById('tool-no-match').hidden = true;
                document.getElementById('tool-match-count').textContent =
                    'العمر غير صحيح. أدخلي عددًا صحيحًا من 0 إلى 36 شهرًا، أو امسحي الحقل لعرض الأدوات.';
                return;
            }
            const state = { query: query.value.trim(), goal: goal.value, age: age.value === '' ? null : Number(age.value) };
            let count = 0;
            for (const card of cards) { const show = matches(card, state, window.Ri3ayaSearch.normalize); card.el.hidden = !show; if (show) count++; }
            document.getElementById('tool-match-count').textContent = `${count} أدوات مناسبة للخيارات` + (state.age > 24 ? '؛ حاسبة النمو ومولد الروتين يدعمان حتى 24 شهرًا فقط.' : '؛ الاختيار تنظيمي ولا يقيم حالة الطفل الصحية.');
            document.getElementById('tool-no-match').hidden = count > 0;
        }
        for (const field of [query, goal, age]) field.addEventListener('input', update);
        document.getElementById('tool-reset').addEventListener('click', () => { query.value = ''; goal.value = 'all'; age.value = ''; update(); query.focus(); });
        chooser.hidden = false; update();
    });
})();
