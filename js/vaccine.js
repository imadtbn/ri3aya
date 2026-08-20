(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.faq-question').forEach((question) => {
            const answer = question.nextElementSibling;
            if (!answer) return;
            const id = answer.id || `faq-answer-${Math.random().toString(36).slice(2)}`;
            answer.id = id;
            question.setAttribute('aria-controls', id);
            question.setAttribute('aria-expanded', 'false');

            question.addEventListener('click', () => {
                const open = question.getAttribute('aria-expanded') === 'true';
                document.querySelectorAll('.faq-question[aria-expanded="true"]').forEach((other) => {
                    if (other !== question) {
                        other.setAttribute('aria-expanded', 'false');
                        other.classList.remove('active');
                        other.nextElementSibling?.classList.remove('open');
                    }
                });
                question.setAttribute('aria-expanded', String(!open));
                question.classList.toggle('active', !open);
                answer.classList.toggle('open', !open);
            });
        });

        const calculateButton = document.getElementById('calculate-vaccines');
        const birthDateInput = document.getElementById('birth-date');
        const result = document.getElementById('vaccine-result');
        if (calculateButton && birthDateInput && result) {
            calculateButton.addEventListener('click', () => {
                if (!birthDateInput.value) {
                    result.innerHTML = '<div class="alert alert-warning" role="alert">أدخلي تاريخ الميلاد أولًا، ثم خذي دفتر التلقيح إلى المركز الصحي للتحقق من الموعد التالي.</div>';
                    return;
                }
                const birthDate = new Date(`${birthDateInput.value}T00:00:00`);
                if (Number.isNaN(birthDate.getTime()) || birthDate > new Date()) {
                    result.innerHTML = '<div class="alert alert-warning" role="alert">تحققي من أن التاريخ صحيح وليس في المستقبل.</div>';
                    return;
                }
                const ageDays = Math.floor((Date.now() - birthDate.getTime()) / 86400000);
                const ageMonths = Math.max(0, Math.floor(ageDays / 30.4375));
                result.innerHTML = `<div class="alert alert-info" role="status"><h4><i class="fas fa-calendar-check"></i> عمر تقريبي: ${ageMonths} شهرًا</h4><p>هذا الحساب تقريبي للتذكير فقط، ولا يحدد اللقاح أو الجرعة. تحققي من دفتر التلقيح ومن المركز الصحي أو الطبيب المتابع لطفلك لمعرفة الموعد الصحيح.</p></div>`;
            });
        }
    });
})();
