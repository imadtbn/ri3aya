document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    const phone = document.getElementById('phone');

    if (form && successMessage && errorMessage) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            if (!form.reportValidity()) return;

            successMessage.style.display = 'block';
            errorMessage.style.display = 'none';
            successMessage.focus?.();
            form.reset();

            window.setTimeout(() => {
                successMessage.style.display = 'none';
            }, 7000);
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
