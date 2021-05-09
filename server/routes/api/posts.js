const { uploadToStorage } = require("../../helpers/upload");
const post_obj = require("../../models/Post");
const { keyword_generator } = require("../../helpers/keywords");
const random = require("random-string-generator");
const Keyword_Object = require("../../models/Keyword_Object");
const Post_Object = require("../../models/Post");
const { post_array_sort } = require("../../helpers/posts_sorter");

module.exports = async app => {

    /*
   *Find the right posts in the database
   */
  app.post("/api/posts/search_post", async (req, res, next) => {
    console.log("Searching for posts.");
    console.log(req.body)
    const { body } = req;

    const { 
        keyword, 
        longitude, 
        latitude, 
        maxPosts } = body;

    if (!keyword) {
      return res.send({
        success: false,
        message: "Error: Keyword cannot be blank"
      });
    }
    if (!longitude || !latitude) {
      return res.send({
        success: false,
        message: "Error: Location cannot be blank"
      });
    }

    if (!maxPosts) {
      return res.send({
        success: false,
        message: "Error: maxPosts cannot be blank"
      });
    }

    Keyword_Object.findOne({ keyword: keyword.toLowerCase() }, {}, async function(
        err, keyword_result
      
    ) {
      // Search for keyword_object
      if(err) console.log("Error" + err);

      if (keyword_result == null) {
        // Not found
        return res.send({
          success: false,
          message: "No posts were found.",
          posts: []
        });
      } else {
        // Found
        // console.log("Keyword Result: " + keyword_result)
        let posts_array = keyword_result['post_array']; // Post IDs array
        // console.log("Posts array: ");
        // console.log(posts_array);

        let sorted_posts_array = await post_array_sort(
          posts_array,
          keyword,
          latitude,
          longitude
        );



        // console.log("Sorted post array in posts.js: " )

        let return_array = []
        let cur_index = 0
        for(let element of sorted_posts_array){
            if(cur_index > maxPosts){
                break;
            }
            cur_index += 1;
            console.log("Post: " + element['post'] + "Weight: " + element['weight'])
            let post = element['post'];
            return_array.push({"title": post.title, 'user_name':post.user_name, "url": post.image_url, "latitude" : post.latitude, 'longitude':post.longitude})
        }

        return res.send({
          success: true,
          message: "Successful search query.",
          posts: return_array
        });
      }
    });
  });

  /*
   *Create a new post object in the database
   */
  app.post("/api/posts/create_post", async (req, res, next) => {
    console.log("Attempting to create a new post");
       console.log(req.body);
    const { body } = req;

    const {
      user_name,
      image_blob,
      title,
      //    location,
      latitude,
      longitude
    } = body;

    if (!latitude) {
      return res.send({
        success: false,
        message: "Error: latitude is empty"
      });
    }

    if (!title) {
      return res.send({
        success: false,
        message: "Error: title is empty"
      });
    }

    if (!longitude) {
      return res.send({
        success: false,
        message: "Error: longitude is empty"
      });
    }

    if (!user_name) {
      return res.send({
        success: false,
        message: "Error: user_name cannot be blank"
      });
    }
    if (!image_blob) {
      return res.send({
        success: false,
        message: "Error: image_blob cannot be blank"
      });
    }

    const newPost = new post_obj();

    newPost.post_ID = random(20);

    newPost.user_name = user_name;

    newPost.image_url = await uploadToStorage(image_blob); // Base 64 image string

    let keywordString = await keyword_generator(
      newPost.image_url,
      newPost.post_ID
    );

    newPost.title = title;

    newPost.keywordListString = keywordString;

    newPost.latitude = latitude;

    newPost.longitude = longitude;

    // newPost.location = location

    newPost.save((err, user) => {
      if (err) {
        console.log("Error creating post: " + err);
        return res.send({
          success: false,
          message: "Error: Server error"
        });
      }

      console.log("Creation of post successful");
      return res.send({
        success: true,
        message: "Post created"
      });
    });
  });


    /*
   *Return all posts in database for map
   */
   app.post("/api/posts/query_all_posts", async (req, res, next) => {
    console.log("Querying and returing all posts.");

    // const { body } = req;

    // const { 
    //     keyword, 
    //     longitude, 
    //     latitude, 
    //     maxPosts } = body;

    // if (!keyword) {
    //   return res.send({
    //     success: false,
    //     message: "Error: Keyword cannot be blank"
    //   });
    // }
    // if (!longitude || !latitude) {
    //   return res.send({
    //     success: false,
    //     message: "Error: Location cannot be blank"
    //   });
    // }

    // if (!maxPosts) {
    //   return res.send({
    //     success: false,
    //     message: "Error: maxPosts cannot be blank"
    //   });
    // }

    Post_Object.find({}, {}, async function(err, resulting_array){

        console.log("Resulting array length: "+ resulting_array.length)

            // console.log("Sorted post array in posts.js: " )

        let return_array = []
    
        for(let element of resulting_array){
            
            console.log("Element: " + element)
            // console.log("Post: " + element['post'] + "Weight: " + element['weight'])
            // let post = element['post'];
            return_array.push({"title": element.title, 'user_name':element.user_name, "url": element.image_url, "latitude" : element.latitude, 'longitude':element.longitude})
        }

        return res.send({
                  success: true,
                  message: "Successful search query.",
                  posts: return_array
                });


    });

    // Keyword_Object.findOne({}, {}, async function(
    //     err, keyword_result
      
    // ) 
    // {
    //   // Search for keyword_object
    //   if(err) console.log("Error" + err);

    //   if (keyword_result == null) {
    //     // Not found
    //     return res.send({
    //       success: false,
    //       message: "No posts were found.",
    //       posts: []
    //     });
    //   } else {
    //     // Found
    //     // console.log("Keyword Result: " + keyword_result)
    //     let posts_array = keyword_result['post_array']; // Post IDs array
    //     // console.log("Posts array: ");
    //     // console.log(posts_array);

    //     let sorted_posts_array = await post_array_sort(
    //       posts_array,
    //       null,
    //       0,
    //       0
    //     );



    //     // console.log("Sorted post array in posts.js: " )

    //     let return_array = []
    
    //     for(let element of sorted_posts_array){
            
         
    //         console.log("Post: " + element['post'] + "Weight: " + element['weight'])
    //         let post = element['post'];
    //         return_array.push({"title": post.title, 'user_name':post.user_name, "url": post.image_url, "latitude" : post.latitude, 'longitude':post.longitude})
    //     }

    //     return res.send({
    //       success: true,
    //       message: "Successful search query.",
    //       posts: return_array
    //     });
    //   }
    // });
  });

};
