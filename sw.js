// Met tout en cache à la première visite : le carnet et la chasse marchent ensuite sans réseau.
const CACHE = 'boucle-du-nord-v5';
const FILES = ['./', './index.html', './chasse.html', './carnet.webmanifest', './chasse.webmanifest',
  './fonts/fonts.css', './fonts/fraunces.woff2', './fonts/fraunces-italic.woff2', './fonts/manrope.woff2',
  './icons/carnet-180.png', './icons/carnet-192.png', './icons/carnet-512.png',
  './icons/chasse-180.png', './icons/chasse-192.png', './icons/chasse-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Réseau d'abord (pour recevoir les corrections), cache si pas de réseau.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // Réseau faible en montagne : au-delà de 3 s, on sert la copie en cache.
  const fromCache = () => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'));
  const net = fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; });
  const slow = new Promise((_, rej) => setTimeout(rej, 3000));
  e.respondWith(Promise.race([net, slow]).catch(() => fromCache().then(r => r || net)));
});
