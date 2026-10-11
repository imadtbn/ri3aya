(function () {
    'use strict';
    document.addEventListener('DOMContentLoaded', () => {
        const button = document.querySelector('.analyze-btn');
        const result = document.getElementById('analysisResult');
        if (!button || !result) return;
        button.addEventListener('click', () => {
            const selected = Array.from(document.querySelectorAll('.symptom-options input:checked'))
                .map(input => document.querySelector(`label[for="${input.id}"]`)?.textContent.trim() || input.value);
            const summary = document.createElement('p');
            summary.textContent = selected.length ? `الملاحظات: ${selected.join('، ')}.` : 'اختاري الملاحظات التي ترينها، أو راجعي دليل البكاء أدناه.';
            const note = document.createElement('p');
            note.textContent = 'هذه الملاحظات لا تحدد سبب البكاء ولا تستبعد المرض. عند بكاء غير معتاد أو رفض الرضاعة أو علامات مرض، تواصلي مع الطبيب.';
            const link = document.createElement('a');
            link.href = '#crying-red-flags';
            link.textContent = 'متى نطلب المساعدة؟';
            result.replaceChildren(summary, note, link);
            result.style.display = 'block';
        });
    });
})();
