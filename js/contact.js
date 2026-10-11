document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const phone = document.getElementById('phone');

    if (form && successMessage && errorMessage) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;
            const value = id => document.getElementById(id)?.value.trim() || '';
            const draft = `ملاحظة حول موقع رعاية\nالاسم: ${value('name')}\nالبريد: ${value('email')}\nالهاتف: ${value('phone')}\nالموضوع: ${value('subject')}\n\n${value('message')}`;
            successMessage.style.display = 'none';
            errorMessage.style.display = 'none';
            document.getElementById('contact-draft')?.parentElement.remove();
            try {
                if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
                await navigator.clipboard.writeText(draft);
                successMessage.style.display = 'block';
            } catch (_) {
                errorMessage.style.display = 'block';
                const label = document.createElement('label');
                label.htmlFor = 'contact-draft';
                label.textContent = 'المسودة للنسخ اليدوي — لم تُرسل';
                const output = document.createElement('textarea');
                output.id = 'contact-draft';
                output.readOnly = true;
                output.value = draft;
                output.rows = 8;
                output.setAttribute('aria-label', label.textContent);
                label.append(output);
                form.append(label);
                output.focus();
                output.select();
            }
        });
    }

    if (phone) {
        phone.addEventListener('input', () => {
            const value = phone.value.trim();
            const valid = !value || /^(0[5-7]\d{8}|\+213[5-7]\d{8})$/.test(value);
            phone.setCustomValidity(valid ? '' : 'أدخلي رقمًا جزائريًا بصيغة 05xxxxxxxx أو +213xxxxxxxxx.');
        });
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animatedElements = document.querySelectorAll('.animate');
    if (reduceMotion || !('IntersectionObserver' in window)) {
        animatedElements.forEach((element) => {
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
    } else {
        const observer = new IntersectionObserver((entries, instance) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                instance.unobserve(entry.target);
            });
        }, { threshold: 0.1 });
        animatedElements.forEach((element) => observer.observe(element));
    }
});
