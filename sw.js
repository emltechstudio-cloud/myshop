const CACHE = 'myshop-v1';
const STATIC = [
  '/',
  '/app',
  '/install',
  '/index.html',
  '/app.html',
  '/install.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Never cache API calls
  if (url.hostname.includes('hf.space')) return;

  // Network first for navigation, cache fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache first for static assets
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
