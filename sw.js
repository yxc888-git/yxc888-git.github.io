/* 极简 Service Worker：加速二次打开，支持添加到主屏幕 */
/* 2026-10-13 修复：旧版把每个导航页的响应都写到固定的 '/' 缓存键上，
   缓存键混乱后用户会看到"只有页脚"的错乱半页。新版导航只走网络，
   失败才回退预缓存的主页；缓存名升 v2，激活时自动清掉 v1 旧缓存。 */
const CACHE = 'zhixing-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/logo-192.png',
  '/logo-512.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/og-image.jpg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // 页面导航：只走网络（保证永远最新）；断网才回退到预缓存的主页
  if (e.request.destination === 'document' || e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }
  // 静态资源：缓存优先，没有才网络并回填
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      }
      return res;
    }).catch(() => hit))
  );
});
