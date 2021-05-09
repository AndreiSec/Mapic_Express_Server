const {Storage} = require('@google-cloud/storage');
const random = require('random-string-generator');
const {getAnonymousImage} = require('./anonymity');
const fs = require("fs");

const storage = new Storage({
    keyFilename: './server/helpers/google_keys/googleCloudKey.json',
    projectId: 'mapic-313117'
}); // Google Cloud storage

const bucketName = "mapic_bucket"; // Cloud storage bucket name

async function uploadToStorage(base64_img) {

    return new Promise(async (resolve, reject) => {

        var fileName = random('alphanumeric') + ".jpg";

        var buffer = base64_to_buffer(base64_img);
        // var data = await getAnonymousImage(base64_img, fileName);
        // buffer = base64_to_buffer(data)
    

        const bucket = storage.bucket(bucketName);
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
            resumable: false
        });

        var publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`; // Generate public url
        blobStream.on('finish', () => {
            console.log("Uploaded the image successfully.");
            resolve(publicUrl);
        })
        .on('error', (err) => {
            console.log("Unable to upload image, something went wrong", err);
            reject(err);
        })
        .end(buffer)

        // return publicUrl
    });
}

function base64_to_buffer(base64_string) {
    return Buffer.from(base64_string, "base64");
}


module.exports = {uploadToStorage, base64_to_buffer}