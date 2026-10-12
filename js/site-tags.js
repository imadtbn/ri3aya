/*
 * Ri3aya unified tags loader
 *
 * تم تفعيل GTM وGA4؛ يبقى AdSense وClarity معطلين حتى إدخال معرفاتهما.
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
        adsenseClient: 'xxxxxxxxx',
        adSlots: Object.freeze({
            display: 'xxxxxxxxx',
            inFeed: 'xxxxxxxxx',
            inArticle: 'xxxxxxxxx'
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

    function hideAdShell(shell) {
        if (!shell) return;
        shell.hidden = true;
        shell.setAttribute('aria-hidden', 'true');
    }

    function resolveSlot(unit) {
        const key = unit.getAttribute('data-site-ad-key') || 'display';
        return unit.getAttribute('data-ad-slot') && !isPlaceholder(unit.getAttribute('data-ad-slot'))
            ? unit.getAttribute('data-ad-slot')
            : CONFIG.adSlots[key] || CONFIG.adSlots.display;
    }

    function validAdClient(value) {
        return typeof value === 'string' && /^ca-pub-\d{10,20}$/.test(value.trim());
    }

    function validAdSlot(value) {
        return typeof value === 'string' && /^\d{6,20}$/.test(value.trim());
    }

    function queueAds(units) {
        if (!units.length || !window.adsbygoogle) return;
        units.forEach(unit => {
            if (unit.dataset.siteAdQueued === 'true') return;
            // Do not push a responsive ad into an invisible or narrow slot.
            const shell = unit.closest('[data-site-ad-shell]');
            if (unit.getBoundingClientRect().width < 250) {
                hideAdShell(shell);
                return;
            }
            unit.dataset.adClient = CONFIG.adsenseClient;
            unit.dataset.adSlot = resolveSlot(unit);
            unit.dataset.siteAdQueued = 'true';
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (_) {
                delete unit.dataset.siteAdQueued;
                hideAdShell(shell);
            }
        });
        state.adsQueued = units.some(unit => unit.dataset.siteAdQueued === 'true');
    }

    function initAds() {
        const units = Array.from(document.querySelectorAll('ins.adsbygoogle[data-site-ad]'));
        if (!units.length) return;
        const ready = units.filter(unit => {
            const shell = unit.closest('[data-site-ad-shell]');
            if (!validAdClient(CONFIG.adsenseClient) || !validAdSlot(resolveSlot(unit))) {
                hideAdShell(shell);
                return false;
            }
            // All ad shells start hidden; reveal only real configured units.
            if (shell) {
                shell.hidden = false;
                shell.removeAttribute('aria-hidden');
            }
            unit.style.display = 'block';
            unit.style.width = '100%';
            const parentWidth = unit.parentElement?.getBoundingClientRect().width || 0;
            if (parentWidth < 250) {
                hideAdShell(shell);
                return false;
            }
            return true;
        });
        if (!ready.length) return;
        if (!state.adsLoaded && !hasScriptSource('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js')) {
            const script = appendScript('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(CONFIG.adsenseClient), { async: true, crossorigin: 'anonymous' });
            if (script) script.addEventListener('load', () => queueAds(ready), { once: true });
        }
        state.adsLoaded = true;
        if (window.adsbygoogle) queueAds(ready);
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
