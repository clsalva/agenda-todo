/* Agenda Todo PWA - Service Worker hardened
   Fix: no duplicate message handler, safer cache writes, cache size limits,
   no caching of error responses, robust push payload handling. */

const CACHE_VERSION = 'v12';
const CACHE_NAME = `agenda-todo-pwa-${CACHE_VERSION}`;
const MAX_RUNTIME_ITEMS = 60;

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './badge-icon.png',
  './screenshot-mobile.png'
];

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxItems) return;
  await cache.delete(keys[0]);
  return trimCache(cacheName, maxItems);
}

async function safeCachePut(request, response) {
  if (!response || !response.ok) return;
  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
  await trimCache(CACHE_NAME, MAX_RUNTIME_ITEMS);
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
      await self.skipWaiting();
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      ),
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const isNavigation =
    event.request.mode === 'navigate' || event.request.destination === 'document';

  if (isNavigation) {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          await safeCachePut(event.request, response);
          return response;
        })
        .catch(async () => {
          return (await caches.match(event.request)) ||
                 (await caches.match('./index.html')) ||
                 Response.error();
        })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then(async (response) => {
          await safeCachePut(event.request, response);
          return response;
        })
        .catch(() => Response.error());
    })
  );
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'Agenda Todo',
    body: 'Nuovo promemoria disponibile.',
    url: './index.html',
    tag: 'agenda-todo-push'
  };

  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    if (event.data) data.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Agenda Todo', {
      body: data.body || 'Nuovo promemoria disponibile.',
      icon: './icon-192.png',
      badge: './badge-icon.png',
      tag: data.tag || 'agenda-todo-push',
      data: { url: data.url || './index.html' },
      requireInteraction: false
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const targetUrl = event.notification.data?.url || './index.html';
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
