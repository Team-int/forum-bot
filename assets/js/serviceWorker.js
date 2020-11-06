const name = 'cache-v1';
const cacheFiles = [
    '/static/html/offline.html'
]
self.addEventListener('install', evt => {
    self.skipWaiting();
    evt.waitUntil(
        caches.open(name).then(cache => {
            return cache.addAll(cacheFiles);
        })
    );
});
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName != name) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).then(res => {
            return res;
        }).catch(() => {
            return caches.open(name).then(async cache => {
                return await cache.match('/static/html/offline.html');
            })
        })
    );
});
