// MY STOCK 서비스워커 (Chrome PWA 설치 조건 충족용)
const CACHE = 'mystock-v3';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const req = e.request;

  // GET 외(POST 등)는 그냥 통과 → 서비스워커가 건드리지 않음
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ── API 요청은 절대 캐시하지 않고 항상 네트워크로 ──────────────
  // 다른 도메인(API 서버, 번역 API 등)으로 나가는 요청은 전부 우회
  if (url.origin !== self.location.origin) {
    return; // 브라우저 기본 동작에 맡김 = 항상 실시간
  }

  // ── 같은 출처의 앱 파일만 캐시 (HTML/아이콘 등) ────────────────
  e.respondWith(
    fetch(req).then(f => {
      // 네트워크 성공 시 최신본을 캐시에 갱신
      const copy = f.clone();
      caches.open(CACHE).then(c => { try { c.put(req, copy); } catch (_) {} });
      return f;
    }).catch(() =>
      // 오프라인일 때만 캐시 폴백
      caches.match(req).then(r => r || caches.match('/my-stock/index.html'))
    )
  );
});
