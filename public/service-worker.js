var cacheName = "v2";
var filesToCache = ["/offline.html"]

self.addEventListener("install", fetchEvent => {
    console.log("SW - Install")
    fetchEvent.waitUntil(
        caches
            .open(cacheName)
            .then(function(cache) {
                console.log("installed");
                return cache.addAll(filesToCache);
            })
    )
})

this.addEventListener('fetch', function (evt) {
    console.log("SW - fetch")
    console.log(evt.request)
    evt.respondWith(
        caches.match(evt.request).then(function(response) {
            return response || fetch(evt.request);
        }).catch(function() {
            return caches.match("/index.html")
        })
    )
});

self.addEventListener("activate", evt => {
    console.log("SW - Activate")
    evt.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                  console.log('[SW - Remove old cache', key);
                  return caches.delete(key);
                }
              }));
        })
    )
})

