var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var loggedOutLinks = document.querySelectorAll('.logged_out');
var loggedInLinks = document.querySelectorAll('.logged_in');
var isUserLoggedIn; 
var userEmail;
var alwaysShow = document.querySelectorAll('.always_show');
var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick_image');
var signUpError = document.querySelector('#signUpError');
var loginError = document.querySelector('#loginError');
var picture;


var userPromise = new Promise(function(resolve, reject){
  auth.onAuthStateChanged(function(user){
  if(user){
    setupUI(user);
    isUserLoggedIn = true;
    userEmail = user.email;
    console.log('User logged in', user);
  } else {
    console.log('User logged out');
    isUserLoggedIn = false;
    setupUI();
  }
  resolve(userEmail);
  reject(Error('It broke'));
  
})

})

//hide navigation links depending on if user is logged in or not
const setupUI = (user) => {
  if(user){
    alwaysShow.forEach(item => item.style.display = 'block');
    loggedInLinks.forEach(item => item.style.display = 'block');
    loggedOutLinks.forEach(item => item.style.display = 'none');
  } else {
    alwaysShow.forEach(item => item.style.display = 'block');
    loggedInLinks.forEach(item => item.style.display = 'none');
    loggedOutLinks.forEach(item => item.style.display = 'block');
  }
}



//about 
var aboutNav = document.querySelectorAll('.aboutNav');
var aboutSection = document.querySelector('#aboutSection');
aboutNav.forEach(function(btn){
  btn.addEventListener('click', openAboutPage);
})
var callBtn = document.querySelector('#callBtn');
var contactEmail = document.querySelector('#contactEmail');


function openAboutPage() {
  aboutSection.style.display = 'block';
   setTimeout(function(){
    aboutSection.style.transform = 'translateY(0)';
  }, 1);
  
}

callBtn.addEventListener('click', function(event){
    contactEmail.style.display ='block';
})

//Sign up
var signUpNavButton = document.querySelectorAll('.sign_up_button');
var signUpArea = document.querySelector('#sign-up');
var closeSignUpModalButton = document.querySelector('#close-sign-up-modal-btn');
var signUpButton = document.querySelector('#signup_btn');
var signUpForm = document.querySelector('#signup_form');
var signUpProgressBar = document.querySelector('#signUpProgressBar');
signUpNavButton.forEach(function(btn){
  btn.addEventListener('click', openSignUpForm);
})
closeSignUpModalButton.addEventListener('click', closeSignUpModal);

function todaysDate(){
var today = new Date();
var dd = today.getDate();
var mm = today.getMonth()+1; //January is 0!
var yyyy = today.getFullYear();

if(dd<10) {
    dd = '0'+dd
} 
if(mm<10) {
    mm = '0'+mm
} 
today = dd + '-' + mm + '-' + yyyy;
return today;
}

var mainImage = document.querySelectorAll('.main-image');
mainImage.forEach(function(img){
  img.addEventListener('click', function(event){
    window.location.reload(true);
  })
})

function openSignUpForm(){
  console.log(todaysDate());
  signUpArea.style.display = 'block';
   setTimeout(function(){
    signUpArea.style.transform = 'translateY(0)';
  }, 1);
  logInArea.style.display = 'none';
  aboutSection.style.display = 'none';
};

function closeSignUpModal() {
  //signUpArea.style.display = 'none';
  signUpArea.style.transform = 'translateY(100vh)';
};

signUpForm.addEventListener('submit', function(event){
  event.preventDefault();
  signUpButton.style.display = 'none';
  signUpProgressBar.style.display = 'block';

  var signUpEmail = signUpForm['signUpEmail'].value;
  var signUpPassword = signUpForm['signUpPassword'].value;
  //var signUpUsername = signUpForm['signUpUsername'].value;
  auth.createUserWithEmailAndPassword(signUpEmail, signUpPassword).then(function(cred){
      fetch('https://studentscams-8639d.firebaseio.com/users.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          uid: cred.user.uid,
          email: signUpEmail,
          username: 'dummyData'
        })
      })
        .then(function(res){
           closeSignUpModal();
            signUpForm.reset();
        })
     
      
  })
  .catch(function(err){
    signUpError.innerHTML = err.message;
    signUpButton.style.display = 'block';
    signUpProgressBar.style.display = 'none';
    signUpError.style.display = 'block';
    console.log(err.message);
  })
});


//Logout function

var logout = document.querySelectorAll('.logout_button');   
    logout.forEach(function(btn){
     btn.addEventListener('click', function(event){
      event.preventDefault();
      auth.signOut()
      .then(function(){
        window.location.reload(true);
      });
     });
})

//Log In
var logInNavButton = document.querySelectorAll('.log_in_button');
var logInArea = document.querySelector('#log_in');
var closeLogInModalButton = document.querySelector('#close-log-in-modal-btn');
var logInButton = document.querySelector('#login-btn');
var loginProgressBar = document.querySelector('#loginProgressBar');
var login_msg = document.querySelector('#login_msg');
var navbarLinks = document.querySelectorAll('.nav_bar_show');

logInNavButton.forEach(function(btn){
  
  btn.addEventListener('click', openLogInForm);
})

closeLogInModalButton.addEventListener('click', closeLogInModal);

function openLogInForm(){
   setTimeout(function(){
    logInArea.style.transform = 'translateY(0)';
  }, 1);
  logInArea.style.display = 'block';
  signUpArea.style.display = 'none';
  aboutSection.style.display = 'none';
}

function closeLogInModal() {
  //logInArea.style.display = 'none';
  logInArea.style.transform = 'translateY(100vh)';
  login_msg.style.display = 'none';
}

//Log in users

var loginForm = document.querySelector('#login_form');

loginForm.addEventListener('submit', function(event){
    event.preventDefault();
    login_msg.style.display ='none';
    logInButton.style.display = 'none';
    loginProgressBar.style.display = 'block';
    var email = loginForm['logInEmail'].value;
    var password = loginForm['logInPassword'].value;
    auth.signInWithEmailAndPassword(email, password)
      .then(function(cred){
          console.log(cred);
          closeLogInModal();
          loginForm.reset();
      })
      .catch(function(err){
    loginError.innerHTML = err.message;
    logInButton.style.display = 'block';
    loginProgressBar.style.display = 'none';
    loginError.style.display = 'block';
    console.log(err.message);
  })
})

var cameraSwitch = document.querySelector('#camera-switch');
cameraSwitch.addEventListener('click', initializeMedia);

var cameraSwitch2 = document.querySelector('#camera-switch2');
cameraSwitch2.addEventListener('click', UserFacingCamera);

function UserFacingCamera(){
  console.log('user facing');
  cameraSwitch.style.display ='block';
  cameraSwitch2.style.display ='none';
  if(!('mediaDevices' in navigator)){
    navigator.mediaDevices={};
  }
  if(!('getUserMedia' in navigator.mediaDevices)){
    navigator.mediaDevices.getUserMedia = function(constraints){
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if(!getUserMedia){
        return Promise.reject(new Error('getUserMedia is not implemented') )
      }
      return new Promise(function(resolve, reject){
        getUserMedia.call(navigator, constraints,resolve, reject);
      });
    }
  }
  navigator.mediaDevices.getUserMedia({video: true})
    .then(function(stream){
        videoPlayer.srcObject = stream;
        videoPlayer.style.display = 'block';
    })
    .catch(function(err){
      cameraSwitch2.style.display ='none';
      cameraSwitch.style.display ='none';
      captureButton.style.display ='none';
      imagePickerArea.style.display = 'block';
    })
}

function initializeMedia(){
  console.log('camera switch');
  cameraSwitch.style.display ='none';
  cameraSwitch2.style.display ='block';
   if(videoPlayer.srcObject){
    videoPlayer.srcObject.getVideoTracks().forEach(function(track){
      track.stop();
    })
  }
  if(!('mediaDevices' in navigator)){
    navigator.mediaDevices={};
  }
  if(!('getUserMedia' in navigator.mediaDevices)){
    navigator.mediaDevices.getUserMedia = function(constraints){
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if(!getUserMedia){
        return Promise.reject(new Error('getUserMedia is not implemented') )
      }
      return new Promise(function(resolve, reject){
        getUserMedia.call(navigator, constraints,resolve, reject);
      });
    }
  }
  navigator.mediaDevices.getUserMedia({video:{facingMode:{exact:"environment"}}})
    .then(function(stream){
        videoPlayer.srcObject = stream;
        videoPlayer.style.display = 'block';
    })
    .catch(function(err){
      imagePickerArea.style.display = 'block';
    })
}

//Taking a picture
captureButton.addEventListener('click', function(event){
  canvasElement.style.display ='block';
  videoPlayer.style.display = 'none';
  captureButton.style.display ='none';
  var context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width))
  videoPlayer.srcObject.getVideoTracks().forEach(function(track){
        track.stop();
    })
  //converted using function in our db file
  picture = dataURItoBlob(canvasElement.toDataURL());
})

imagePicker.addEventListener('change', function(event){
  picture = event.target.files[0];
  console.log(picture);
});

//CREATE POST

var create_post_form = document.querySelector('#create_post_form');
var title_input = document.querySelector('#title');
var content_input = document.querySelector('#content');
var location_input = document.querySelector('#location');
//opens the Create a post
function openCreatePostModal() {
  
  if(isUserLoggedIn){


  createPostArea.style.display = 'block';
  setTimeout(function(){
    createPostArea.style.transform = 'translateY(0)';
  }, 1);
  UserFacingCamera();
  //initializeMedia();
  
} else {
  login_msg.innerHTML = 'You need to be logged in before you can create a post!';
  login_msg.style.display = 'block';
  openLogInForm();
}
  //If threshold is met then prompt for app install
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
}

function closeCreatePostModal() {
  
  createPostArea.style.transform = 'translateY(100vh)';
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  if(videoPlayer.srcObject){
    videoPlayer.srcObject.getVideoTracks().forEach(function(track){
      track.stop();
    })
  }

  //createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

//if browser doesn't support SyncManager then send data straight to backend
function backSyncFallback(){
  var id = new Date().toISOString();
  console.log('Picture is: ' + picture)
    var postData = new FormData();
            postData.append('id', id);
            postData.append('title', title_input.value);
            postData.append('content', content_input.value);
            postData.append('location', location_input.value);
            postData.append('userid', firebase.auth().currentUser.uid);
            postData.append('userEmail', firebase.auth().currentUser.email);
            postData.append('file', picture, id + '.png');
            postData.append('postDate', todaysDate());
  //Points to our deployed firebase function REST endpoint
  fetch('https://us-central1-studentscams-8639d.cloudfunctions.net/storePostData', {
    method: 'POST',
    body: postData
  })
  .then(function(res){
      console.log('sent data', res);

      updateUI();
  })
}


function convertDefaultImage(src, fileName, mimeType){
    return (fetch(src)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], fileName, {type:mimeType});})
    );
}

//Submit Post event listner
create_post_form.addEventListener('submit', function(event){
  event.preventDefault();
  if(title_input.value.trim() === "" ||  content_input.value.trim() === "" ||  location_input.value.trim() === ""){
    alert('please enter valid data');
    return;
  }
  if(typeof picture === "undefined"){
    convertDefaultImage('/src/images/fallback_img.png', 'new.png', 'image/png')
      .then(function(file){
        picture = file;
        closeCreatePostModal();

    //browser support for syncmanager is very low, only chrome and android support it
    if('serviceWorker' in navigator && 'SyncManager' in window){
        navigator.serviceWorker.ready
          .then(function(sw){
            var post = {
              id: new Date().toISOString(),
              title: title_input.value,
              content: content_input.value,
              location: location_input.value,
              userid: firebase.auth().currentUser.uid,
              userEmail: firebase.auth().currentUser.email,
              picture: picture,
              postDate: todaysDate()
            };
            writeData('background-sync-posts', post)
              .then(function(){
                //Post the posts stored in IndexedDB using background sync
                sw.sync.register('sync-scam-post');
              })
              .then(function(){
                var snackbarContainer = document.querySelector('#confirmation-toast');
                var data = {message: 'Your post has been submitted!'};
                snackbarContainer.MaterialSnackbar.showSnackbar(data);
              }).catch(function(err){
                console.log(err);
              })
          
            
          })
    }
    else {
        //Post the post straight to the database (No IndexedDB)
        backSyncFallback();

    }
        })
    //picture = '/src/images/fallback_img.png';
    } else {

    closeCreatePostModal();

  //browser support for syncmanager is very low, only chrome and andriod support it
    if('serviceWorker' in navigator && 'SyncManager' in window){
        navigator.serviceWorker.ready
          .then(function(sw){
            var post = {
              id: new Date().toISOString(),
              title: title_input.value,
              content: content_input.value,
              location: location_input.value,
              userid: firebase.auth().currentUser.uid,
              userEmail: firebase.auth().currentUser.email,
              picture: picture,
              postDate: todaysDate()
            };
            writeData('background-sync-posts', post)
              .then(function(){
                sw.sync.register('sync-scam-post');
              })
              .then(function(){
                var snackbarContainer = document.querySelector('#confirmation-toast');
                var data = {message: 'Your post has been submitted!'};
                snackbarContainer.MaterialSnackbar.showSnackbar(data);
              }).catch(function(err){
                console.log(err);
              })
              //sync-posts
              //syn new posts
            
          })
    }
    else {
        backSyncFallback();

    }
  }
})

function clearCards(){

  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);

  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--16dp';
  var cardTitle = document.createElement('div');
  
userPromise.then(function(email){
   if(data.userEmail === email){
      var deletePost = document.createElement('div');
      deletePost.className ='deletePost'
      deletePost.textContent = 'X';
      deletePost.style.color ='white';
      cardSubtitle.appendChild(deletePost);
      deletePost.addEventListener('click', function(event){
      var alertBox = confirm('Are you sure you want to delete this?');
      if(alertBox){
          var ref = database.ref('posts/' + data.objId);
      ref.remove();
      console.log('deleted');
      window.location.reload(true);
      } else {
        console.log('not deleted');
      }
      
})
  }
})

  var cardSubtitle = document.createElement('div');
  cardSubtitle.className = 'mdl-card__actions';
  //cardSubtitle.style.height = '100px';

  var cardSubtitleText = document.createElement('h6');
  cardSubtitleText.style.color ='#fff';
  cardSubtitleText.textContent =  data.userEmail;
  cardSubtitleText.style.margin ='auto';
  // var accIcon = document.createElement('div');
  // accIcon.className ='accIcon';
  // accIcon.style.display ='inline-block';
  // accIcon.style.fontSize = '12px';
  // accIcon.innerHTML= '<i class="material-icons">account_circle</i>';
  // accIcon.style.position ='relative';
  // accIcon.style.top ='5px';
  // accIcon.style.left ='5px';
  //cardSubtitleText.appendChild(accIcon);
  //accIcon.appendChild(cardSubtitleText);

  var cardSubtitleText2 = document.createElement('h6');
  cardSubtitleText2.style.color ='#fff';
  cardSubtitleText2.textContent = 'Date posted: ' + data.postDate;
  cardSubtitleText2.style.margin ='auto';
  //cardSubtitle.style.backgroundColor = '#DCDCDC';
  cardSubtitle.style.height = '60px';
  //cardSubtitle.style.margin ='10px';
  cardSubtitle.style.backgroundColor ='#0095fb';
  cardSubtitle.appendChild(cardSubtitleText);
  cardSubtitle.appendChild(cardSubtitleText2);
  cardWrapper.appendChild(cardSubtitle);
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image +')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.border = "2px solid black";
  cardTitle.style.height = '240px';
  var imgPopup = document.querySelector('.bg-modal');
  var imgPopupContent = document.querySelector('.modal-content');
  var elem = document.createElement("img");
  cardTitle.addEventListener('click', function(event){
    console.log('you clicked the image');  
  elem.setAttribute("src", data.image);
  elem.setAttribute("height", '100%');
  elem.setAttribute("width", '100%');
  imgPopupContent.appendChild(elem);

    //imgPopupContent.src = data.image;
    imgPopup.style.display = 'flex';
  })

  var closeImgBtn = document.querySelector('.close');
  closeImgBtn.addEventListener('click', function(event){
  elem.setAttribute('src', '');
  elem.setAttribute("height", '');
  elem.setAttribute("width", '');
    imgPopup.style.display = 'none';
  })

  cardWrapper.appendChild(cardTitle);

var cardSupportingText3 = document.createElement('h6');
  //cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText3.textContent =  "Location: " + data.location;
  cardSupportingText3.style.textAlign = 'center';
 var cardSupportingText2 = document.createElement('div');
  cardSupportingText2.className = 'mdl-card__supporting-text';
  cardSupportingText2.textContent =  data.content;
  cardSupportingText2.style.textAlign = 'center';
  var cardSupportingText = document.createElement('h5');
  //cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent =  data.title;
  cardSupportingText.style.textAlign = 'center';
  cardSupportingText.appendChild(cardSupportingText3);
  cardSupportingText.appendChild(cardSupportingText2);
  cardSubtitle.appendChild(cardSupportingText);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);

  //append everything 
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data){
  clearCards();
  for(var i=0;i < data.length; i++){
    createCard(data[i]);
  }
}

var url = 'https://studentscams-8639d.firebaseio.com/posts.json';
var networkdDataReceived = false;

fetch(url)
  .then(function(res) {
    //console.log(res.json());
    return res.json();

  })
  .then(function(data) {
    console.log('from web')
    networkdDataReceived = true;
    //convert data to array 
    var dataArray = [];
    for(var dataKey in data){
      var obj = data[dataKey];
      obj.objId = dataKey;
      dataArray.push(obj);
    }
    
    dataArray.reverse();
    updateUI(dataArray);
    
  });

  if('indexedDB' in window){
    readAllData('posts')
      .then(function(data){
          if(!networkdDataReceived){
            console.log('from cache', data);
            updateUI(data);
          }
      });
  }




