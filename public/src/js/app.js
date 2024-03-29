
var deferredPrompt;
var enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

var link = document.querySelectorAll('.close_drawer');

link.forEach(function(link){
  link.addEventListener('click', closeDrawer);
});

function closeDrawer() {
  console.log('clicked');
  var d = document.querySelector('.mdl-layout');
  d.MaterialLayout.toggleDrawer();
}

//If browser does not support promises, then we need to use the polyfill (promise.js)
if (!window.Promise) {
  window.Promise = Promise;
}

//Check if serviceworker is supported by current browser
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    //use Promise because register event can take some time to complete
    .then(function () {
      console.log('Service worker registered!');
      console.log('test');
    })
    .catch(function(err) {
      console.log(err);
    });
}

//Triggered by browser right before the install banner event
window.addEventListener('beforeinstallprompt', function(event) {
  event.preventDefault(); //Don't show banner
  deferredPrompt = event;
  return false;
});


//Notifications 

//Function used to build the action of confirming a notification
function displayConfirmNotification(){
  if('serviceWorker' in navigator){
    //not every device supports these different options but good to have incase they do work 
    var options = {
    body: 'You successfully subscribed to studentScams!',
    icon: '/src/images/icons/app_icon_96x96.png',
    image: '/src/images/logo.png',
    dir: 'ltr',
    lang: 'en-US',
    vibrate: [100, 50, 200],
    badge: '/src/images/icons/app_icon_96x96.png',
    actions: [
      {action: 'confirm', title: 'Okay', icon: '/src/images/icons/app_icon_96x96.png' },
      {action: 'cancel', title: 'Close', icon: '/src/images/icons/app_icon_96x96.png' }
    ]
  };
    navigator.serviceWorker.ready
      .then(function(swreg){
          swreg.showNotification('Successfully subscribed', options)
      })
  }
}

function pushSubscription(){
  navigator.serviceWorker.ready
    .then(function(swreg){
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    //Use another promise to start another process that can take time
    .then(function(sub){
        if(sub === null){
          //create a new subscription
          //key was geneated using web-push
          //We generate key to make sure sender of notification is us (prevents others spamming)
          var vapidPublicKey = 'BMdfv8bb_SalzwEAxzQ8yhhMawESwiE1pXPxTO2fz8_CaC-M6RzTVUo4o6jZQsV36AVqTuW4o34B8r2CNsUl9L8';
          var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
          return reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedVapidPublicKey
          });
        } else {
          alert('You have already subscribed to push notifications');
          //already have a subscription
        }
    })
      .then(function(newSubscription){
        return fetch('https://studentscams-8639d.firebaseio.com/subscriptions.json', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(newSubscription)
        })
      })
      .then(function(res){
          if(res.ok){
            displayConfirmNotification();
          }
          
      })
      .catch(function(err){
        console.log(err);
      })
};

function askForNotificationPermission(){
    Notification.requestPermission(function(result){
        console.log('user choice:', result);
        if(result !== 'granted'){
          console.log('No permission granted');
        } else {
          pushSubscription();
        }
    })
}

if('Notification' in window && 'serviceWorker' in navigator){
  enableNotificationsButtons.forEach(function(item){
    item.style.display = 'inline-block';
    item.addEventListener('click', askForNotificationPermission);
  })
  
}
