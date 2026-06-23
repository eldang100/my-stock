// MY STOCK 서비스워커 (Chrome PWA 설치 조건 충족용)
const CACHE = 'mystock-v2';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  // GET 요청만 처리
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(c =>
      c.match(e.request).then(r =>
        r || fetch(e.request).then(f => {
          try { c.put(e.request, f.clone()); } catch (_) {}
          return f;
        }).catch(() => r || caches.match('/my-stock/index.html'))
      )
    )
  );
});

