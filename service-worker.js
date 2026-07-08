const CACHE_VERSION = 'v8';
const CACHE_NAME = `agenda-todo-pwa-${CACHE_VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './agenda-todo-pwa.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './badge-icon.png',
  './screenshot-mobile.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting(); // il nuovo SW entra in activate subito[web:103][web:102]
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      ),
      // prende controllo di tutte le pagine sotto scope
      self.clients.claim()
    ])
  );
});

// permetti alla pagina di dire al SW di saltare la waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation =
    event.request.mode === 'navigate' ||
    event.request.destination === 'document';

  if (isNavigation) {
    // Network-first per l'HTML: un refresh normale vede sempre l'ultima
    // versione pubblicata. Si cade sulla cache SOLO se sei offline.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
        )
    );
    return;
  }

  // Cache-first per asset statici (icone, manifest, ecc.): cambiano
  // raramente, ha senso servirli istantaneamente dalla cache.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(event.request, clone)
            );
            return response;
          })
          .catch(() => caches.match('./index.html'))
      );
    })
  );
});

self.addEventListener('push', (event) => {
  const data = event.data
    ? event.data.json()
    : {
        title: 'Agenda Todo',
        body: 'Nuovo promemoria disponibile.',
        url: './index.html'
      };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Agenda Todo', {
      body: data.body || 'Nuovo promemoria disponibile.',
      icon: './icon-192.png',
      badge: './badge-icon.png',
      data: { url: data.url || './index.html' },
      tag: data.tag || 'agenda-todo-push'
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (clients.openWindow) {
          return clients.openWindow(
            event.notification.data?.url || './index.html'
          );
        }
      })
  );
});
