// MY STOCK 서비스워커 (Chrome PWA 설치 조건 충족용)
const CACHE = 'mystock-v1';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request).then(r =>
        r || fetch(e.request).then(f => {
          try { c.put(e.request, f.clone()); } catch (_) {}
          return f;
        }).catch(() => r)
      )
    )
  );
});
