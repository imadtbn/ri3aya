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
            const day = document.getElementById('birth-day');
            const month = document.getElementById('birth-month');
            const year = document.getElementById('birth-year');
            for (let n = 1; n <= 31; n++) day.add(new Option(String(n), String(n)));
            for (let n = 1; n <= 12; n++) month.add(new Option(String(n).padStart(2, '0'), String(n)));
            for (let n = new Date().getFullYear(); n >= 1900; n--) year.add(new Option(String(n), String(n)));

            calculateButton.addEventListener('click', () => {
                birthDateInput.value = day.value && month.value && year.value ? [year.value, month.value.padStart(2, '0'), day.value.padStart(2, '0')].join('-') : '';
                if (!birthDateInput.value) {
                    result.innerHTML = '<div class="alert alert-warning" role="alert">أدخلي تاريخ الميلاد أولًا، ثم خذي دفتر التلقيح إلى المركز الصحي للتحقق من الموعد التالي.</div>';
                    return;
                }
                const isoDate = birthDateInput.value;
                const pieces = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
                const birthDate = pieces
                    ? new Date(Number(pieces[1]), Number(pieces[2]) - 1, Number(pieces[3]), 12)
                    : new Date(NaN);
                const today = new Date();
                const sameDate = pieces && birthDate.getFullYear() === Number(pieces[1]) &&
                    birthDate.getMonth() + 1 === Number(pieces[2]) &&
                    birthDate.getDate() === Number(pieces[3]);
                const localToday = [today.getFullYear(),
                    String(today.getMonth() + 1).padStart(2, '0'),
                    String(today.getDate()).padStart(2, '0')].join('-');
                if (!sameDate || isoDate > localToday || birthDate.getFullYear() < 1900) {
                    result.innerHTML = '<div class="alert alert-warning" role="alert">اختاري تاريخ ميلاد صحيحًا، من اليوم أو قبله.</div>';
                    return;
                }
                // Count full calendar months; do not approximate months using 30.4375 days.
                const ageMonths = Math.max(0,
                    (today.getFullYear() - birthDate.getFullYear()) * 12 +
                    (today.getMonth() - birthDate.getMonth()) -
                    (today.getDate() < birthDate.getDate() ? 1 : 0));
                result.innerHTML = `<div class="alert alert-info" role="status"><h4><i class="fas fa-calendar-check"></i> العمر بالشهور المكتملة: ${ageMonths} شهرًا</h4><p>هذا الحساب تقريبي للتذكير فقط، ولا يحدد اللقاح أو الجرعة. تحققي من دفتر التلقيح ومن المركز الصحي أو الطبيب المتابع لطفلك لمعرفة الموعد الصحيح.</p></div>`;
            });
        }
    });
})();
