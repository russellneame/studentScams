
importScripts('/src/js/indexedDB.js');
importScripts('/src/js/db.js')

var CACHE_STATIC_NAME = 'static-v20';
var CACHE_DYNAMIC_NAME = 'dynamic-v1';
var STATIC_FILES = [
          '/',
          '/index.html',
          '/offline.html',
          '/src/js/app.js',
          '/src/js/db.js',
          '/src/js/feed.js',
          '/src/js/indexedDB.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/logo.png',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.blue-red.min.css'
];



self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll([
          '/',
          '/index.html',
          '/offline.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/logo.png',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.blue-red.min.css'
        ]);
      })
  )
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function(keyList) {
        return Promise.all(keyList.map(function(key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME).then(function(cache){
//                 return cache.match('/offline.html');
//               });
//             });
//         }
//       })
//   );
// });

function inArray(string,array){
  for(var i=0; i< array.length; i++){
    if(array[i] === string){
      return true;
    }
  }
  return false;
}

self.addEventListener('fetch', function(event) {
  var url = 'https://studentscams-8639d.firebaseio.com/posts';

  if(event.request.url.indexOf(url) > -1){
  event.respondWith(fetch(event.request)
        .then(function(res){
                var clonedRes = res.clone();
                clearAllData('posts').then(function(){
                  return clonedRes.json();
                })
                .then(function(data){
                  //places dynamic data into indexedDB database
                    for(var dataKey in data){
                      writeData('posts', data[dataKey]);
                  }
                });
                return res;
              })
        );
  
  //this regexp basically checks whether the request contains any of the static files,
  // because if it does it will use the cache only method as this is probably the most efficient way 
} else if(inArray(event.request.url, STATIC_FILES))
  //new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url))
{
//check adv caching assignment for alternative function
  event.respondWith(
    caches.match(event.request)
      );

}
else {

  event.respondWith(
      caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function(res) {
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function(cache) {
                  cache.put(event.request.url, res.clone());
                  return res;
                })
            })
            .catch(function(err) {
              return caches.open(CACHE_STATIC_NAME).then(function(cache){
                //if(event.request.url.indexOf('/help')){
                if(event.request.headers.get('accept').includes('text/html')) {
                  return cache.match('/offline.html');
                }
                });
            });
        }
      })
      )

}
})



//get resources from network first, then get from cache if network fails 
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request).then(function(res){
//       return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                   })
//                 }
//               ) .catch(function(err){
//                   console.log(err);
//                      return caches.match(event.request);
//                         }) 
//                       );
//                     });


//network only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       )
// });


//cache only
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       )
// });


self.addEventListener('sync', function(event){
  console.log('[Service Worker] - Background syncing', event);
  if(event.tag === 'sync-scam-post'){
    console.log('[Service Worker] Syncing new Posts');
    event.waitUntil(
      readAllData('background-sync-posts')
        .then(function(data){
          for(var dt of data){
            var postData = new FormData();
            postData.append('id', dt.id);
            postData.append('title', dt.title);
            postData.append('content', dt.content);
            postData.append('location', dt.location);
            postData.append('userid', dt.userid);
            postData.append('userEmail', dt.userEmail);
            postData.append('file', dt.picture, dt.id + '.png');
            postData.append('postDate', dt.postDate);

               fetch('https://us-central1-studentscams-8639d.cloudfunctions.net/storePostData', {
    method: 'POST',
    body: postData
  })
  .then(function(res){
      console.log('sent data', res);
      if(res.ok){
        res.json()
          .then(function(resData){
              deleteSingleItem('background-sync-posts', resData.id);
          })
         
      }
  })
    .catch(function(err){
      console.log(err);
    })
          }
       
        })
      );
  }
})


self.addEventListener('notificationclick', function(event){
  var notification = event.notification;
  var action = event.action;

  if(action === 'confirm'){
      console.log('notification was confirmed');
      notification.close();
  } else {
    console.log(action);
    event.waitUntil(
      //clients refers to all windows related to sw
      clients.matchAll()
        .then(function(clis){
          var client = clis.find(function(element){
            return element.visibilityState ==='visible';
          });

          if(client !== undefined){
            client.navigate(notification.data.url);
            client.focus();
          } else {
            clients.openWindow(notification.data.url);
          }
          notification.close();
        })
      );
    
  }
});

self.addEventListener('notificationclose', function(event){
    console.log('Notification was closed', event);
});

self.addEventListener('push', function(event){
  console.log('push notification recieved', event);
  var data = {title: 'New Scam Post added', content: 'something new happened', clickUrl: '/'};

  if(event.data){
    data = JSON.parse(event.data.text());
  }

  var options = {
    body: data.content,
    icon: '/src/images/icons/app_icon_96x96.png',
    badge: '/src/images/icons/app_icon_96x96.png',
    data: {
      url: data.clickUrl
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
    );
});



