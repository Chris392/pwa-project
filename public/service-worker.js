var cacheName = "v9";
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

console.log("ONINE",navigator.onLine)

this.addEventListener('fetch', evt => {
    if(SWPort != undefined){
        SWPort.postMessage({payload: "Fetch Data"})
    }

    if(evt.request.url.slice(0,19) === "https://opentdb.com"){
        evt.waitUntil(
            caches
                .open(cacheName)
                .then(function(cache) {
                    if(navigator.onLine) {
                        cache.add(evt.request);
                    } else {
                        return cache.add(evt.request);
                    }
                })
        )
    }

    evt.respondWith(
        caches.match(evt.request).then(function(response) {
            console.log("response",response)
            return response || fetch(evt.request);
        }).catch(function() {
            console.log("2")
            return caches.match("/offline.html")
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

// Generic Mathod for push Messages
self.addEventListener("push", evt => {
    let data;
    if(evt.data) {
        data = evt.data.json();
    } else {
        data = {title: 'Generic Message'}
    }
    self.registration.showNotification(data.title, {
        body: data.body
    })
})





