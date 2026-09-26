const CACHE_NAME = 'edutech-v10';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './js/app.js',
    './js/main.js',
    './js/data/diagrams.js',
    './js/data/cheatsheets.js',
    './js/data/resources.js',
    './js/data/apostilas.js',
    './js/views/dashboard.js',
    './js/views/converters.js',
    './js/views/diagrams.js',
    './js/views/resources.js',
    './js/views/apostilas.js',
    './js/views/cheatsheets.js',
    './js/views/extras.js',
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
    'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
];

// Install: Cache essential assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('SW: Pre-caching assets');
            return cache.addAll(ASSETS);
        })
    );
});

// Activate: Clean up old caches
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('SW: Removing old cache', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );
});

// Fetch: Stale-While-Revalidate Strategy
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedRes) => {
            // Return cached response if found, but also fetch from network
            const fetchPromise = fetch(e.request).then((networkRes) => {
                // Update cache with the new response
                if (networkRes && networkRes.status === 200) {
                    const resClone = networkRes.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, resClone);
                    });
                }
                return networkRes;
            }).catch(() => {
                // Return cached response if fetch fails
                return cachedRes;
            });

            return cachedRes || fetchPromise;
        })
    );
});

// Skip Waiting listener
self.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
