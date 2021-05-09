const Keyword_Object = require('../models/Keyword_Object')


// Imports the Google Cloud client library
const vision = require("@google-cloud/vision");


// FOR MAIN RUN: "./server/helpers/vision_key/google_vision_api_key.json"

// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: "./server/helpers/google_keys/google_vision_api_key.json"
});

async function keyword_generator(url, post_id) {

  return new Promise(async (resolve, reject) => {
      let resultString = "";

      console.log("\nProcessing image: " + url + "\n");

      // Performs label detection on the image file
      const [result] = await client.labelDetection(url);

      const labels = result.labelAnnotations;

      for (let label of labels) {
        if (label.score > .5) {
          resultString += label.description + ":" + label.score + ",";
          keyword_object_creator(label.description, post_id);
        }
      }
      // labels.forEach(
        
      //   label => (
      //     if ( label.score > .50){resultString += label.description + ":" + label.score + ","}
      //     )
      // );
      
      resultString = resultString.slice(0, -1);
      resolve(resultString);

  });
}


function keyword_object_creator(keyword, post_id) {

  // First it must check if the keyword exists. If it exists, must append the post id to keyword object post_array
  // If keyword object isn't found, create new one and append the keyword object to its post_array


  Keyword_Object.findOne({'keyword':keyword.toLowerCase()}, 'any', function(err, keyword_result){
    if(keyword_result == null){
      // Not found
      const newKeywordObj = new Keyword_Object();

      newKeywordObj.keyword = keyword.toLowerCase();
      newKeywordObj.post_array.push(post_id);

      newKeywordObj.save((err, user)=>{
        if(err){
            console.log("Error creating new keyword object: " + err)
            
        }
    else{console.log("Creation of new keyword object successful")}
        
       
    
     });
    } else {
      // Found
      console.log("Keyword Found: " + keyword)

      let update = {
        // $set: {name: req.body.name},
        $push: {post_array: post_id}
    }

    let options = {upsert: true};

      Keyword_Object.findOneAndUpdate({'keyword':keyword.toLowerCase()}, update, options, function(err, data){
        if(err){
          console.log("Error: " + err)
        }
        else{
          // console.log("Successful Update")
        }
        
      })

      // keyword_result.post_array.push(post_id);
      // keyword_result.save(done)

      // Keyword_Object.findOneAndUpdate(
      //   {keyword: keyword},
      //   { $push:{post_array: post_id}},
      //   // done
      // );
      
    }

  })


}


module.exports = {keyword_generator}

// console.log(keyword_generator(
//   "https://storage.googleapis.com/mapic_bucket/COr9FxcQXytB.jpg"
// ));
