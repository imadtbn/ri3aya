/*
 * Ri3aya unified tags loader
 *
 * تم تفعيل GTM وGA4 وAdSense؛ يظل Clarity غير مهيأ.
 * حاوية GTM الحالية لا تحتوي Google tag لـGA4، لذلك يُستخدم مسار GA4 المباشر
 * مؤقتًا من هذا الملف. بعد إعداد GA4 داخل GTM، غيّر ga4ManagedByGtm إلى true
 * لمنع أي page_view مكرر. لا يُحمّل Clarity مباشرة؛ يُدار عبر GTM عند الجاهزية.
 */
(function () {
    'use strict';

    const CONFIG = Object.freeze({
        gtmId: 'GTM-NPLKWQRN',
        ga4Id: 'G-GK64YX2FPB',
        clarityId: 'xxxxxxxxx',
        ga4ManagedByGtm: false,
        adsenseClient: 'ca-pub-5656416032906373',
        adSlots: Object.freeze({
            display: '3143411927',
            inFeed: '7867079394',
            inArticle: '3143411927'
        })
    });

    const state = window.__ri3ayaSiteTags = window.__ri3ayaSiteTags || {
        gtmLoaded: false,
        ga4Loaded: false,
        adsLoaded: false,
        adsQueued: false
    };

    function isPlaceholder(value) {
        if (!value || typeof value !== 'string') return true;
        const normalized = value.trim().replace(/[\s_-]/g, '').toLowerCase();
        return !normalized || /^x+$/.test(normalized) || /^(your|replace|todo)/.test(normalized);
    }

    function hasScriptSource(fragment) {
        return Array.from(document.scripts).some((script) => script.src && script.src.includes(fragment));
    }

    function appendScript(src, attributes) {
        if (hasScriptSource(src)) return null;
        const script = document.createElement('script');
        script.src = src;
        Object.entries(attributes || {}).forEach(([key, value]) => {
            if (value === true) script.setAttribute(key, '');
            else if (value !== false && value != null) script.setAttribute(key, value);
        });
        (document.head || document.documentElement).appendChild(script);
        return script;
    }

    function initGtm() {
        if (isPlaceholder(CONFIG.gtmId) || state.gtmLoaded || hasScriptSource('googletagmanager.com/gtm.js')) return;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
        appendScript('https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(CONFIG.gtmId), { async: true });
        state.gtmLoaded = true;
    }

    function initGa4Direct() {
        if (CONFIG.ga4ManagedByGtm || isPlaceholder(CONFIG.ga4Id) || state.ga4Loaded || hasScriptSource('googletagmanager.com/gtag/js')) return;
        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('config', CONFIG.ga4Id, { send_page_view: true });
        appendScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CONFIG.ga4Id), { async: true });
        state.ga4Loaded = true;
    }

    function validAdClient(value) {
        return typeof value === 'string' && /^ca-pub-\d{10,20}$/.test(value.trim());
    }

    function validAdSlot(value) {
        return typeof value === 'string' && /^\d{6,20}$/.test(value.trim());
    }

    function resolveSlot(unit) {
        const key = unit.dataset.siteAdKey || 'display';
        return unit.dataset.adSlot || CONFIG.adSlots[key] || CONFIG.adSlots.display;
    }

    function initAds() {
        const units = Array.from(document.querySelectorAll('ins.adsbygoogle[data-site-ad]'));
        if (!units.length || !validAdClient(CONFIG.adsenseClient)) return;

        const allowed = units.filter(unit =>
            validAdSlot(resolveSlot(unit)) &&
            unit.closest('[data-site-ad-shell]') &&
            !unit.closest('[hidden]')
        );
        if (!allowed.length) return;

        function ensureLoader() {
            if (state.adsLoaded) return;
            state.adsLoaded = true;
            if (!hasScriptSource('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
                appendScript(
                    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' +
                    encodeURIComponent(CONFIG.adsenseClient),
                    { async: true, crossorigin: 'anonymous' }
                );
            }
        }

        function loadUnit(unit) {
            if (unit.dataset.siteAdQueued === 'true' || unit.hasAttribute('data-adsbygoogle-status')) return true;
            // AdSense In-feed requires at least 250px of usable width.
            // Never push into hidden/narrow units (avoids No slot size errors).
            const width = unit.getBoundingClientRect().width;
            if (!unit.getClientRects().length || width < 250) return false;
            unit.dataset.adClient = CONFIG.adsenseClient;
            unit.dataset.adSlot = resolveSlot(unit);
            ensureLoader();
            window.adsbygoogle = window.adsbygoogle || [];
            try {
                window.adsbygoogle.push({});
                unit.dataset.siteAdQueued = 'true';
                return true;
            } catch (error) {
                // Do not retry the same failed slot automatically.
                unit.dataset.siteAdQueued = 'true';
                console.warn('تعذر تهيئة موضع إعلان رعاية الرضع', error);
                return false;
            }
        }

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    if (loadUnit(entry.target)) observer.unobserve(entry.target);
                });
            }, { rootMargin: '600px 0px' });
            allowed.forEach(unit => observer.observe(unit));
        } else {
            // Older browsers keep normal ad delivery without an observer.
            allowed.forEach(loadUnit);
        }
    }

    function init() {
        initGtm();
        initGa4Direct();
        initAds();
    }

    window.Ri3ayaSiteTags = Object.freeze({
        config: CONFIG,
        init: init
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
    else init();
})();
