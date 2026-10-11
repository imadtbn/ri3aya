/* Optional FAQ API. Page scripts own click handling to avoid duplicate listeners. */
(function () {
    'use strict';
    function setOpen(question, open) {
        const answer = question?.nextElementSibling;
        if (!answer) return;
        question.setAttribute('aria-expanded', String(open));
        question.classList.toggle('active', open);
        answer.classList.toggle('active', open);
        answer.classList.toggle('open', open);
    }
    window.FAQ = Object.freeze({
        openFaqById(id) {
            const element = document.getElementById(id);
            const question = element?.matches('.faq-question') ? element : element?.querySelector('.faq-question');
            if (question) setOpen(question, true);
        },
        toggleAll() {
            const questions = Array.from(document.querySelectorAll('.faq-question'));
            const open = questions.some(question => question.getAttribute('aria-expanded') !== 'true');
            questions.forEach(question => setOpen(question, open));
        },
        search(query) {
            const normalized = String(query || '').trim();
            document.querySelectorAll('.faq-item').forEach(item => { item.hidden = !item.textContent.includes(normalized); });
        }
    });
})();
