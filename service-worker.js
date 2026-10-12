/* Stage-04 validated tools and search release 2026-10-12; activation remains user-controlled. */
importScripts('./pwa/config.js');
const ROOT = new URL('./', self.location.href);
const CACHE_NAME = 'ri3aya-pwa-' + self.RI3AYA_PWA.revision;
const FILES = new Set(self.RI3AYA_PWA.files.map(path => new URL(path, ROOT).href));
const OFFLINE = new URL('offline.html', ROOT).href;
// Guarantee a usable offline shell; a single optional asset must not abort an update.
// Keep articles, scripts, styles and medical reference data reliably offline.
const CORE_URLS = [...FILES].filter(url => /\.(?:html|css|js|json|csv)$/i.test(new URL(url).pathname));
self.addEventListener('install', event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        // Missing shell resources are a real installation failure.
        await cache.addAll(CORE_URLS.map(url => new Request(url, { cache: 'reload' })));
        const optional = [...FILES].filter(url => !CORE_URLS.includes(url));
        // Limit concurrent fetches on phones / unstable connections.
        let cursor = 0;
        const workers = Array.from({ length: Math.min(5, optional.length) }, async () => {
            while (cursor < optional.length) {
                const url = optional[cursor++];
                try { await cache.add(new Request(url, { cache: 'reload' })); }
                catch (_) { /* The uncached resource remains network-only until the next release. */ }
            }
        });
        await Promise.all(workers);
    })());
});
self.addEventListener('message', event => { if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('ri3aya-pwa-') || /^ri3aya-v\d+-/.test(key)) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
    const request = event.request, url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== ROOT.origin || !url.pathname.startsWith(ROOT.pathname)) return;
    // Search parameters remain in the browser URL, but share the same static HTML snapshot.
    if (url.pathname === ROOT.pathname) url.pathname += 'index.html';
    url.search = ''; url.hash = '';
    if (FILES.has(url.href)) {
        event.respondWith(caches.open(CACHE_NAME).then(async cache => {
            const cached = await cache.match(url.href);
            if (cached) return cached;
            try { return await fetch(request); }
            catch (_) { return request.mode === 'navigate' ? Response.redirect(OFFLINE) : new Response('المورد غير متاح دون اتصال', { status: 503, headers: { 'Content-Type': 'text/plain;charset=utf-8' } }); }
        }));
    } else if (request.mode === 'navigate') {
        event.respondWith(fetch(request).catch(() => Response.redirect(OFFLINE)));
    }
});
