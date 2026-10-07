// Offline support: keeps the app shell, city data and tones on the device.
// Bump VERSION whenever files change so visitors get the new ones.
const VERSION = 'nudiya-v5';
const FILES = [
  './', 'index.html', 'manifest.webmanifest',
  'img/icon-180.png', 'img/icon-192.png', 'img/icon-512.png',
  'app/', 'app/index.html', 'app/l10n.js', 'app/adhan.min.js', 'app/cities.json',
  'app/sounds/tone_hijaz.wav', 'app/sounds/tone_rast.wav', 'app/sounds/tone_soft.wav',
  'app/sounds/tone_rise.wav', 'app/sounds/tone_digital.wav',
  'mosque/', 'mosque/index.html', 'mosque/qrcode.js', 'notice.js',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
// Network first (fresh times and files), cache as fallback when offline.
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.endsWith('notice.json')) return; // always fresh from the network
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
