/*
 * Retirement worker for older versions served from this origin.
 * The check-in queue lives in localStorage; this worker deliberately does not
 * intercept requests or cache survey answers, API responses, or app bundles.
 */
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.registration.unregister());
});
