const CACHE_NAME = 'habit-tracker-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // 你需要把你的图标文件也放到根目录下的 `/icons/` 文件夹中
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // 生产环境还会包含你的 React 应用编译后的JS和CSS文件，例如：
  // '/static/js/main.<hash>.js',
  // '/static/css/main.<hash>.css',
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Activates the new service worker immediately
  );
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating');
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Takes control of current clients
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
            // Optional: Return a fallback page for offline if needed
            // if (event.request.mode === 'navigate') {
            //     return caches.match('/offline.html');
            // }
            throw new Error('Network request failed and no cache match.');
        });
      })
  );
});