// Tombstone service worker.
//
// The old IT-Tools site that lived at this origin registered a PWA service worker
// (also named sw.js). Returning visitors have it cached and it keeps serving the
// stale IT-Tools app offline-first, ignoring that the server now serves a different
// site. Deleting files on the server cannot reach a worker already installed in a
// visitor's browser — so this file, served at the same /sw.js path, takes over and
// dismantles it: wipe every cache, unregister, then reload into the fresh site.
//
// Safe to remove once traffic has cycled through (weeks). Harmless to keep.

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: 'window' });
      for (const client of clients) {
        client.navigate(client.url);
      }
    })()
  );
});
