const CACHE_NAME = 'ch-bau-v3.5.6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './elektro.html',
  './hlsk.html',
  './statik.html',
  './brandschutz.html',
  './arbeitsschutz.html',
  './baurecht.html',
  './geg.html',
  './pv.html',
  './schallschutz.html',
  './knx.html',
  './tiefbau.html',
  './impressum.html',
  './css/style.css',
  './js/app.js',
  './js/berechnungen.js',
  './js/hlsk.js',
  './js/quiz.js',
  './pages/berechnungen.html',
  './pages/erweitert.html',
  './pages/praxis.html',
  './pages/sicherungen.html',
  './pages/wissen.html',
  './pages/lernen.html',
  './pages/fehlersuche.html',
  './manifest.json',
  './icons/icon.svg'
];

// Installation - Cache alle wichtigen Dateien
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('[SW] Cache failed:', err))
  );
});

// Aktivierung - Alte Caches löschen
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Cache-First Strategie für Offline-Support
self.addEventListener('fetch', event => {
  // Nur GET-Requests cachen
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Aus Cache liefern, aber im Hintergrund aktualisieren
          event.waitUntil(updateCache(event.request));
          return cachedResponse;
        }
        
        // Nicht im Cache - aus Netzwerk holen und cachen
        return fetch(event.request)
          .then(response => {
            // Nur gültige Responses cachen
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            
            return response;
          })
          .catch(() => {
            // Offline und nicht im Cache - Fallback
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});

// Hintergrund-Update
async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response);
    }
  } catch (err) {
    // Offline - ignorieren
  }
}

// Push-Nachrichten (optional für Updates)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
