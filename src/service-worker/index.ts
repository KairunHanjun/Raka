/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const OFFLINE_URL = '/offline.html';
const CACHE_NAME = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event: { waitUntil: (arg0: Promise<void>) => void; }) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event: { waitUntil: (arg0: Promise<void>) => void; }) => {
  event.waitUntil(
    (async () => {
      caches.keys().then(async (keys) => {
        for (const key of keys) {
          if (key !== CACHE_NAME) await caches.delete(key);
        }
      });
      if ("navigationPreload" in self.registration) {
        await self.registration.navigationPreload.enable();
      }
    })()
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  async function respond() {
        const url = new URL(event.request.url);
        const cache = await caches.open(CACHE_NAME);

        // `build`/`files` can always be served from the cache
        if (ASSETS.includes(url.pathname)) {
            const response = await cache.match(url.pathname);

            if (response) {
                return response;
            }
        }

        // for everything else, try the network first, but
        // fall back to the cache if we're offline
        try {
          // First, try to use the navigation preload response if it's
          // supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
            const response = await fetch(event.request);

            // if we're offline, fetch can return a value that is not a Response
            // instead of throwing - and we can't pass this non-Response to respondWith
            if (!(response instanceof Response)) {
                throw new Error('invalid response from fetch');
            }

            if (response.status === 200) {
                cache.put(event.request, response.clone());
            }

            return response;
        } catch (err) {
            const response = await cache.match('offline.html');

            if (response) {
                console.log(`Returning from Cache`, event.request.url);
                return response;
            }

            // if there's no cache, then just error out
            // as there is nothing we can do to respond to this request
            throw err;
        }
    }


  event.respondWith(respond().catch(() => {
    console.log('Offline Mode Activated');
    return caches.match(OFFLINE_URL);
  }));
});