// 棒球記錄 - Service Worker
// Cache-first: 每次有新版本就換一個新的快取名稱（CACHE_VERSION），
// 瀏覽器會自動下載新版並在下次啟動時換上，不用使用者手動清快取。
const CACHE_VERSION = 'baseball-scorer-v1';
const APP_SHELL = [
  './baseball.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_VERSION)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      // 有快取先用快取（開啟速度快、離線也能開），背景同時更新快取
      return cached || network;
    })
  );
});
