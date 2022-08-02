var functions = require("firebase-functions");
var admin = require("firebase-admin");
var cors = require("cors")({ origin: true });
var webpush = require("web-push");
var fs = require("fs");
var UUID = require("uuid-v4");
var os = require("os");
var Busboy = require("busboy");
var path = require('path');


var serviceAccount = require("./studentscams-fb-key.json");

const {Storage} = require('@google-cloud/storage');
 
const gcs = new Storage({
    projectId: "studentscams-8639d",
    keyFilename: "studentscams-fb-key.json"
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://studentscams-8639d.firebaseio.com/"
});

exports.storePostData = functions.https.onRequest(function(request, response) {
  cors(request, response, function() {
    var uuid = UUID();

    const busboy = new Busboy({ headers: request.headers });
    let upload;
    const fields = {};
    var fileUploaded = false;

    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      console.log(
        `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
      );
      const filepath = path.join(os.tmpdir(), filename);
      upload = { file: filepath, type: mimetype };
      file.pipe(fs.createWriteStream(filepath));
      fileUploaded = true;
    });

    busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype) {
      fields[fieldname] = val;
    });

    // callback will be run after uploaded files are saved
    busboy.on("finish", () => {
      var bucket = gcs.bucket("studentscams-8639d.appspot.com");
      bucket.upload(
        upload.file,
        {
          uploadType: "media",
          metadata: {
            metadata: {
              contentType: upload.type,
              firebaseStorageDownloadTokens: uuid
            }
          }
        },
        function(err, uploadedFile) {
          if (!err) {
            admin.database().ref("posts").push({
                id: fields.id,
                title: fields.title,
                content: fields.content,
                location: fields.location,
                userid: fields.userid,
                userEmail: fields.userEmail,
                image:
                  "https://firebasestorage.googleapis.com/v0/b/" +
                  bucket.name +
                  "/o/" +
                  encodeURIComponent(uploadedFile.name) +
                  "?alt=media&token=" +
                  uuid,
                postDate: fields.postDate
              })
              .then(function() {
                webpush.setGCMAPIKey('dummyValue');
                webpush.setVapidDetails(
                  "mailto:russellneame@hotmail.co.uk",
                  "dummyValue",
                  "dummyValue"
                );
                return admin.database().ref("subscriptions").once("value");
              })
              .then(function(subscriptions) {
                subscriptions.forEach(function(sub) {
                  var pushConfig = {
                    endpoint: sub.val().endpoint,
                    keys: {
                      auth: sub.val().keys.auth,
                      p256dh: sub.val().keys.p256dh
                    }
                  };

                  webpush
                    .sendNotification(
                      pushConfig,
                      JSON.stringify({
                        title: "New Scam Post!",
                        content: "A new scam post has been added by someone!",
                        clickUrl: '/'
                      })
                    )
                    .catch(function(err) {
                      console.log(err);
                    });
                });
                response
                  .status(201)
                  .json({ message: "Data stored", id: fields.id });
              })
              .catch(function(err) {
                response.status(500).json({ error: err });
              });
          } else {
            console.log(err);
          }
        }
      );
    });

    busboy.end(request.rawBody);
  
  });
});
