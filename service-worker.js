/* One complete release per cache; activation of updates requires an explicit action. */
importScripts('./pwa/config.js');
const ROOT = new URL('./', self.location.href);
const CACHE_NAME = 'ri3aya-pwa-' + self.RI3AYA_PWA.revision;
const FILES = new Set(self.RI3AYA_PWA.files.map(path => new URL(path, ROOT).href));
const OFFLINE = new URL('offline.html', ROOT).href;
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll([...FILES].map(url => new Request(url, { cache: 'reload' })))));
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
            catch (_) { return request.mode === 'navigate' ? Response.redirect(OFFLINE) : new Response('Offline resource unavailable', { status: 503, headers: { 'Content-Type': 'text/plain;charset=utf-8' } }); }
        }));
    } else if (request.mode === 'navigate') {
        event.respondWith(fetch(request).catch(() => Response.redirect(OFFLINE)));
    }
});
