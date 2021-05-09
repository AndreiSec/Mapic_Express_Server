const vision = require("@google-cloud/vision");
const fs = require('fs');
var PImage = require('pureimage');
var {Readable} = require('stream')

const client = new vision.ImageAnnotatorClient({
    keyFilename: "./server/helpers/google_keys/google_vision_api_key.json"
  });

async function getAnonymousImage(base64_img, fileName) {
    console.log("Processing faces from image.");
    const imgBuffer = Buffer.from(base64_img, 'base64')
    const request = {"image": {"content": imgBuffer} };
    const [result] = await client.faceDetection(request);
    let faces = result.faceAnnotations; 

    await fs.writeFileSync(fileName, imgBuffer);

    // const stream = new Readable({
    //     read(size) {
    //         console.log("In the readable method")
    //     }
    // });
    
    // stream.push(imgBuffer) 
    // console.log("After push")
    // stream.push(null) 
    
    // console.log(stream)
 
    img = await PImage.decodeJPEGFromStream(fs.createReadStream(fileName));

    // console.log("after first pimage")
    const context = img.getContext('2d');
    context.drawImage(img, 0, 0, img.width, img.height, 0, 0);
    context.fillStyle = 'rgba(0,0,0,1)';

    await fs.unlinkSync(fileName);

    faces.forEach((face, i) => {
        var vertices = face.boundingPoly.vertices
        context.fillRect(vertices[0].x,vertices[0].y,vertices[3].x,vertices[3].y);
    });

    await PImage.encodeJPEGToStream(img, fs.createWriteStream(fileName), 50);
    var return_buffer = base64_encode(fileName);
    await fs.unlinkSync(fileName);
    return return_buffer;
};

function base64_to_buffer(base64_string) {
    return Buffer.from(base64_string, "base64");
}

function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return bitmap.toString('base64');
}

module.exports = {getAnonymousImage}