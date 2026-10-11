(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const buttons = [...document.querySelectorAll('.library-filter')];
        const cards = [...document.querySelectorAll('.library-card')];
        const count = document.getElementById('library-count');
        if (!count || !buttons.length) return;
        buttons.forEach(button => button.addEventListener('click', () => {
            buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
            let visible = 0;
            cards.forEach(card => {
                card.hidden = button.dataset.category !== 'all' && card.dataset.category !== button.dataset.category;
                if (!card.hidden) visible++;
            });
            count.textContent = visible ? `${visible} مقالات` : 'لا توجد مقالات منشورة في هذا الموضوع بعد.';
        }));
    });
})();
