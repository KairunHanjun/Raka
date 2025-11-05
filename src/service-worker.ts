import { build, files, version } from '$service-worker';

/// <reference lib="WebWorker" />

const CACHE_NAME = `cache-${version}`;
const ASSETS = [...build, ...files];

declare var self: ServiceWorkerGlobalScope; 


self.addEventListener('install', (event: { waitUntil: (arg0: Promise<void>) => void; }) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event: { waitUntil: (arg0: Promise<void>) => void; }) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE_NAME) await caches.delete(key);
      }
    })
  );
});

self.addEventListener('fetch', (event: { respondWith?: any; request?: any; }) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request).catch(() => caches.match('/offline'));
    })
  );
});