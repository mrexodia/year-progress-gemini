const CACHE_NAME = 'year-progress-v5';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.v3.css',
    '/app.v3.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/apple-touch-icon.png',
    'https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap'
];

// Install: Open cache and add core assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

// Fetch: Stale-while-revalidate for cached assets
self.addEventListener('fetch', event => {
    // For navigation requests, use network first
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => caches.match('/'))
        );
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(response => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
                // Return from cache if available, but fetch new version in background
                return response || fetchPromise;
            });
        })
    );
});
