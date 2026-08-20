const CACHE_NAME = 'ri3aya-static-v2';
const APP_SHELL = [
    './',
    './index.html',
    './manifest.json',
    './css/main.css',
    './css/responsive.css',
    './css/accessibility.css',
    './js/main.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                return response;
            }).catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
        );
        return;
    }

    event.respondWith(
        caches.match(request).then((cached) => cached || fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
        }))
    );
});
