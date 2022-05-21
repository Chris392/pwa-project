var cacheName = "v3";
var filesToCache = ["/offline.html"]
let SWPort;

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

this.addEventListener('fetch', evt => {
    console.log("SW - fetch")
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
                  return caches.delete(key);
                }
              }));
        })
    )
})

self.addEventListener("message", evt => {
    if(evt.data && evt.data.type === 'INIT_PORT'){
        SWPort = evt.ports[0];
        console.log("Message from Window received => Initialize Port")
    }
})



