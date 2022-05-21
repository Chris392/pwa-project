var cacheName = "v4";
var filesToCache = ["/offline.html"]
let SWPort;
let SWactivated = false;
let SWinstalled = false;

self.addEventListener("message", evt => {
    if(evt.data && evt.data.type === 'INIT_PORT'){
        SWPort = evt.ports[0];

        if(SWinstalled){
            SWPort.postMessage({payload: "Service Worker Installed"})
        }
        if(SWactivated){
            SWPort.postMessage({payload: "Service Worker Activated"})
        }
        SWPort.postMessage({payload: "Initialize Port"})
        console.log("Message from Window received => Initialize Port")
    }
})


self.addEventListener("install", fetchEvent => {
    SWinstalled = true;

    fetchEvent.waitUntil(
        caches
            .open(cacheName)
            .then(function(cache) {
                return cache.addAll(filesToCache);
            })
    )
})

this.addEventListener('fetch', evt => {
    if(SWPort != undefined){
        SWPort.postMessage({payload: "Fetch Data"})
    }

    evt.respondWith(
        caches.match(evt.request).then(function(response) {
            return response || fetch(evt.request);
        }).catch(function() {
            return caches.match("/index.html")
        })
    )
});

self.addEventListener("activate", evt => {
    SWactivated = true;

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





