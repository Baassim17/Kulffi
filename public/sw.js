/* eslint-disable */

var CACHE = "pwabuilder-page";
var offlineFallbackPage = "offline.html";

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE).then(function(cache) {
            if (offlineFallbackPage === "ToDo-replace-this-name.html") {
                return cache.add(new Response("TODO: Update the value of the offlineFallbackPage constant in the serviceworker."));
            }
            return cache.add(offlineFallbackPage);
        })
    );
});

self.addEventListener("fetch", function(event) {
    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request).catch(function() {
            if (
                event.request.destination !== "document" ||
                event.request.mode !== "navigate"
            ) {
                return new Response("", { status: 408, statusText: "Network error" });
            }
            return caches.open(CACHE).then(function(cache) {
                return cache.match(offlineFallbackPage);
            });
        })
    );
});

self.addEventListener("refreshOffline", function() {
    var offlinePageRequest = new Request(offlineFallbackPage);
    return fetch(offlineFallbackPage).then(function(response) {
        return caches.open(CACHE).then(function(cache) {
            return cache.put(offlinePageRequest, response);
        });
    });
});