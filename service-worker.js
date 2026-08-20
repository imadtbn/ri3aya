const CACHE_VERSION = 'ri3aya-v5-footer-20260820';
const APP_SHELL = [
    './',
    './index.html',
    './offline.html',
    './manifest.json',
    './css/main.css',
    './css/responsive.css',
    './css/accessibility.css',
    './css/site-polish.css',
    './js/main.js',
    './js/search.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_VERSION);
            await cache.put(request, response.clone());
        }
        return response;
    } catch (_) {
        return caches.match(request).then((cached) => cached || caches.match('./offline.html') || caches.match('./index.html'));
    }
}

async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);
    const update = fetch(request).then(async (response) => {
        if (response.ok) {
            const cache = await caches.open(CACHE_VERSION);
            await cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cached);
    return cached || update;
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) {
        const cache = await caches.open(CACHE_VERSION);
        await cache.put(request, response.clone());
    }
    return response;
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    if (request.mode === 'navigate' || request.destination === 'document') {
        event.respondWith(networkFirst(request));
        return;
    }
    if (['style', 'script'].includes(request.destination) || url.pathname.endsWith('.json')) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }
    if (['image', 'font'].includes(request.destination)) {
        event.respondWith(cacheFirst(request));
    }
});
