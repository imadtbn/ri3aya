(function () {
    'use strict';
    const root = new URL('../', document.currentScript.src);
    let installEvent, registration, reloadRequested = false, controllerChanged = false;
    window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installEvent = event; });
    document.addEventListener('DOMContentLoaded', () => {
        const byId = id => document.getElementById(id), status = byId('pwa-status');
        if (!status) return;
        let controlled = Boolean(navigator.serviceWorker?.controller);
        const update = byId('pwa-update'), install = byId('pwa-install'), help = byId('pwa-help');
        const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
        const installed = () => { install.hidden = standalone(); };
        function showUpdate() { update.hidden = false; status.textContent = 'نسخة جديدة جاهزة. احفظي مدخلاتك قبل تحديث الصفحة.'; }
        async function showStatus() {
            if (registration?.waiting || controllerChanged) { showUpdate(); return; }
            if (!navigator.onLine) { status.textContent = 'بدون اتصال — تُعرض النسخة المحفوظة إن كانت جاهزة.'; return; }
            if (navigator.serviceWorker?.controller) status.textContent = 'نسخة الأدلة والأدوات محفوظة للعمل دون اتصال. الاتصال متاح.';
            else status.textContent = registration ? 'جارٍ حفظ نسخة الأدلة والأدوات…' : 'العمل دون اتصال غير جاهز في هذا المتصفح.';
        }
        installed(); window.addEventListener('appinstalled', () => { installEvent = null; install.hidden = true; status.textContent = 'تم تثبيت الموقع.'; });
        install.addEventListener('click', async () => {
            if (!installEvent) { help.showModal(); return; }
            const event = installEvent; installEvent = null;
            try { await event.prompt(); const choice = await event.userChoice; status.textContent = choice.outcome === 'accepted' ? 'تم قبول طلب التثبيت؛ اتبعي تعليمات المتصفح.' : 'يمكنك تثبيت الموقع لاحقًا.'; } catch (_) { help.showModal(); }
        });
        byId('pwa-help-close').addEventListener('click', () => help.close());
        window.addEventListener('online', showStatus); window.addEventListener('offline', showStatus);
        update.addEventListener('click', () => {
            if (!confirm('تحديث الصفحة الآن؟ احفظي مدخلات الأدوات غير المحفوظة أولًا. السجلات المحفوظة لن تُحذف.')) return;
            if (registration?.waiting) { reloadRequested = true; registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' }); }
            else location.reload();
        });
        byId('pwa-check').addEventListener('click', async () => {
            if (!registration || !navigator.onLine) { status.textContent = 'فحص التحديث يحتاج اتصالًا ومتصفحًا يدعم العمل دون اتصال.'; return; }
            try { await registration.update(); if (!registration.installing && !registration.waiting) { await showStatus(); status.textContent += ' اكتمل فحص التحديث.'; } }
            catch (_) { status.textContent = 'تعذر فحص التحديث. حاولي مجددًا عند استقرار الاتصال.'; }
        });
        if (!('serviceWorker' in navigator) || !window.isSecureContext) { byId('pwa-check').disabled = true; showStatus(); return; }
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (reloadRequested) location.reload();
            else if (controlled) { controllerChanged = true; showUpdate(); }
            else { controlled = true; showStatus(); }
        });
        const register = async () => {
            try {
                const existing = await navigator.serviceWorker.getRegistration(root.href);
                registration = !navigator.onLine && existing ? existing : await navigator.serviceWorker.register(new URL('service-worker.js', root), { scope: root.pathname, updateViaCache: 'none' });
                if (registration.waiting) showUpdate();
                registration.addEventListener('updatefound', () => {
                    const worker = registration.installing;
                    worker?.addEventListener('statechange', () => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showUpdate(); if (worker.state === 'redundant') status.textContent = 'تعذر تجهيز النسخة الجديدة. أعيدي فحص التحديث لاحقًا.'; });
                });
                navigator.serviceWorker.ready.then(showStatus); showStatus();
            } catch (_) { status.textContent = 'تعذر تجهيز العمل دون اتصال. يبقى الموقع متاحًا عبر الإنترنت.'; }
        };
        if (document.readyState === 'complete') register(); else window.addEventListener('load', register, { once: true });
    });
})();
