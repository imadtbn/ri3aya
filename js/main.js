(function () {
    'use strict';

    const rootPath = window.location.pathname.includes('/pages/') ? '../' : '';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const byId = (id) => document.getElementById(id);
    const one = (selector, scope = document) => scope.querySelector(selector);
    const all = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    function announce(message, type = 'info') {
        let liveRegion = byId('site-live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'site-live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = message;

        let notification = one('.site-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'site-notification';
            notification.setAttribute('role', 'status');
            document.body.appendChild(notification);
        }
        notification.dataset.type = type;
        notification.textContent = message;
        window.clearTimeout(notification._hideTimer);
        notification.classList.add('is-visible');
        notification._hideTimer = window.setTimeout(() => notification.classList.remove('is-visible'), 5000);
    }

    function initDate() {
        const dateElement = byId('current-date');
        if (!dateElement) return;
        dateElement.textContent = new Intl.DateTimeFormat('ar-DZ', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }).format(new Date());
    }

    function setMenuState(menu, button, open) {
        menu.classList.toggle('active', open);
        button.setAttribute('aria-expanded', String(open));
        document.body.classList.toggle('menu-open', open);
        const icon = one('i', button);
        if (icon) icon.classList.toggle('fa-times', open), icon.classList.toggle('fa-bars', !open);
    }

    function initMobileMenu() {
        const button = one('.mobile-menu-btn');
        const menu = one('.nav-menu');
        if (!button || !menu) return;

        button.setAttribute('aria-controls', 'primary-navigation');
        menu.id = menu.id || 'primary-navigation';
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            setMenuState(menu, button, !menu.classList.contains('active'));
        });

        all('.nav-menu a').forEach((link) => link.addEventListener('click', () => {
            if (window.innerWidth <= 768) setMenuState(menu, button, false);
        }));

        document.addEventListener('click', (event) => {
            if (!menu.contains(event.target) && !button.contains(event.target)) setMenuState(menu, button, false);
        });
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') setMenuState(menu, button, false);
        });
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) setMenuState(menu, button, false);
        }, { passive: true });
    }

    function initDropdowns() {
        all('.dropdown > a').forEach((trigger) => {
            const dropdown = trigger.closest('.dropdown');
            const menu = one('.dropdown-menu', dropdown);
            if (!dropdown || !menu) return;
            trigger.setAttribute('aria-haspopup', 'true');
            trigger.setAttribute('aria-expanded', 'false');
            menu.setAttribute('role', 'menu');

            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                const open = !dropdown.classList.contains('open');
                all('.dropdown.open').forEach((item) => {
                    item.classList.remove('open');
                    const itemTrigger = one(':scope > a', item);
                    if (itemTrigger) itemTrigger.setAttribute('aria-expanded', 'false');
                });
                dropdown.classList.toggle('open', open);
                trigger.setAttribute('aria-expanded', String(open));
            });
        });
    }

    function initBackToTop() {
        const button = one('.back-to-top') || byId('scrollTopBtn');
        if (!button) return;
        button.setAttribute('type', 'button');
        const update = () => button.classList.toggle('visible', window.scrollY > 320);
        window.addEventListener('scroll', update, { passive: true });
        button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' }));
        update();
    }

    function initQuickTools() {
        const routes = {
            vaccine: `${rootPath}pages/vaccine.html`,
            growth: `${rootPath}pages/growth.html`,
            cry: `${rootPath}pages/crying.html`,
            routine: `${rootPath}pages/sleep.html`
        };
        all('.btn-tool[data-tool]').forEach((button) => {
            button.addEventListener('click', () => {
                const destination = routes[button.dataset.tool];
                if (destination) window.location.assign(destination);
            });
        });
    }

    function initDailyTips() {
        const text = byId('daily-tip-text');
        const next = byId('next-tip');
        if (!text || !next) return;
        const tips = [
            'ضعي الرضيع على ظهره لكل فترات النوم، على سطح ثابت ومستوٍ وخالٍ من الأشياء اللينة.',
            'اغسلي يديك قبل إطعام الطفل أو تغيير حفاضه أو إعطائه أي دواء.',
            'لا تتركي الرضيع دون مراقبة على سطح مرتفع أو قرب الماء.',
            'ابدئي التغذية التكميلية عادةً عند نحو 6 أشهر مع الاستمرار في الحليب، وراجعي الطبيب عند وجود مشكلة نمو أو حساسية.',
            'اختبري ماء الاستحمام بوسيلة آمنة وتحققي من حرارته قبل وضع الطفل، مع بقائك بجانبه طوال الوقت.'
        ];
        const today = new Date().toISOString().slice(0, 10);
        const saved = JSON.parse(localStorage.getItem('ri3aya-daily-tip') || 'null');
        let index = saved && saved.date === today ? saved.index % tips.length : Math.floor(Date.now() / 86400000) % tips.length;
        const render = () => { text.textContent = tips[index]; };
        next.addEventListener('click', () => {
            index = (index + 1) % tips.length;
            localStorage.setItem('ri3aya-daily-tip', JSON.stringify({ date: today, index }));
            render();
        });
        render();
    }

    function initNewsletter() {
        all('.newsletter-form').forEach((form) => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const input = one('input[type="email"]', form);
                if (!input || !input.validity.valid) {
                    input?.focus();
                    announce('يرجى إدخال بريد إلكتروني صحيح.', 'error');
                    return;
                }
                announce('تم التحقق من البريد محليًا. سيتم تفعيل الإرسال عند ربط خدمة النشرة.', 'info');
                form.reset();
            });
        });
    }

    function initSearch() {
        all('.search-container').forEach((container) => {
            const input = one('.search-input', container);
            const button = one('.search-btn', container);
            if (!input) return;
            const performSearch = () => {
                const query = input.value.trim().toLocaleLowerCase('ar');
                if (!query) return;
                const candidates = all('main h2, main h3, main p, main li, .section-card, .article-card, .blog-card');
                let firstMatch = null;
                let count = 0;
                candidates.forEach((item) => {
                    const match = item.textContent.toLocaleLowerCase('ar').includes(query);
                    item.toggleAttribute('hidden', !match);
                    if (match) { count += 1; firstMatch ||= item; }
                });
                announce(count ? `تم العثور على ${count} نتيجة داخل الصفحة.` : 'لم نجد نتائج مطابقة في هذه الصفحة.', count ? 'success' : 'info');
                firstMatch?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
            };
            button?.addEventListener('click', performSearch);
            input.addEventListener('keydown', (event) => { if (event.key === 'Enter') performSearch(); });
        });
    }

    function initSmoothAnchors() {
        all('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (event) => {
                const id = anchor.getAttribute('href');
                if (!id || id === '#') return;
                const target = document.querySelector(id);
                if (!target) return;
                event.preventDefault();
                target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
                history.replaceState(null, '', id);
            });
        });
    }

    function initImageSafety() {
        all('img').forEach((img) => {
            if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
            img.addEventListener('error', () => {
                img.classList.add('image-error');
                img.setAttribute('aria-label', 'تعذر تحميل الصورة');
            }, { once: true });
        });
    }

    function registerPWA() {
        if (!('serviceWorker' in navigator) || window.location.protocol === 'file:') return;
        window.addEventListener('load', () => navigator.serviceWorker.register(`${rootPath}service-worker.js`).catch(() => {}));
    }

    document.addEventListener('DOMContentLoaded', () => {
        initDate();
        initMobileMenu();
        initDropdowns();
        initBackToTop();
        initQuickTools();
        initDailyTips();
        initNewsletter();
        initSearch();
        initSmoothAnchors();
        initImageSafety();
        registerPWA();
        document.body.classList.add('is-ready');
    });

    window.Ri3aya = Object.freeze({ announce });
})();
