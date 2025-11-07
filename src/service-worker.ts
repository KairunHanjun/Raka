/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />
import { build, files, version } from '$service-worker';

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = `cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener('install', (event) => {
  async function addFilesToCache() {
		const cache = await caches.open(CACHE_NAME);
		await cache.addAll(ASSETS);
	}
	event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
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

self.addEventListener('fetch', function(event){
   event.respondWith(async function () {
      try{
        var cache = await caches.open('cache');
      var cachedResponsePromise = await cache.match(event.request);
      var networkResponsePromise = fetch(event.request);
      event.waitUntil(async function () {
         var networkResponse = await networkResponsePromise;
         await cache.put(event.request, networkResponse.clone());
      }());
      return cachedResponsePromise || networkResponsePromise;
      }catch(error){
        const cachedResponse = await caches.match('/offline');
        return cachedResponse || new Response('<h1>Offline</h1>', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({'Content-Type': 'text/html'})
          });
      }
    }());
});