
const Post_Object = require('../models/Post');
const geolib = require('geolib');
var arraySort = require('array-sort');

// Takes in an array of post ID strings and returns a new array of them sorted by the relevance of the keyword
async function post_array_sort(posts_array, keyword, userLat, userLong){
    let post_object_list_with_weights = [];

    // console.log("Posts array length: " + posts_array.length);
    // console.log(posts_array);
    
    for (let post_id of posts_array) {
        // console.log('Post id to search:' + post_id)
        let post_with_weight = await getPost(post_id, keyword, userLat, userLong);
        post_object_list_with_weights.push(post_with_weight);
        // Post_Object.findOne({'post_ID': post_id}, {}).then(function(err, postObj){
        //     console.log("Pushing to list with object: " + postObj);
        //     let weight = calculate_weight(postObj, keyword, userLat, userLong);
        //     console.log("After calculate weight")
            // post_object_list_with_weights.push({'post': postObj, 'weight': weight});
        // } );
    }
    // console.log("Unsorted array length: " + String(post_object_list_with_weights.length))
    // for(let element of post_object_list_with_weights){
    //     console.log(element['post'] + element['weight'])
    // }

    let sorted_posts = arraySort(post_object_list_with_weights, 'weight'); // Sort weight ascending order

    //console.log("Sorted array length: " + String(sorted_posts.length))

    // for(let element of sorted_posts){
    //     console.log("Element: " + element['post'] + " Weight: " + element['weight'])
    // }
    return sorted_posts;
}

async function getPost(post_id, keyword, userLat, userLong) {
    return new Promise((resolve, reject) => {
        Post_Object.findOne({'post_ID': post_id}, {}, function(err, postObj) {
            let weight = calculate_weight(postObj, keyword, userLat, userLong);
            resolve({'post': postObj, 'weight': weight});
        });
    });
}

function calculate_weight(post, keyword, userLat, userLong) { // Calculate sorting weight (smaller weight is better)
    var distance = geolib.getDistance(
        { latitude: userLat, longitude: userLong },
        { latitude: post['latitude'], longitude: post['longitude'] }
    );
    // console.log(`Distance: ${distance}`)
    let score;

    let post_keyword_string = post.keywordListString

    // console.log("Post keyword string: " + post_keyword_string)

    let post_keyword_array = post_keyword_string.split(",");
    // console.log('')
    // console.log("Post keyword array: " + post_keyword_array)

    for(let element of post_keyword_array){
        let split_element = element.split(":");
        if(split_element[0].toLowerCase() == keyword.toLowerCase()){
            score = parseFloat(split_element[1]);
            break;
        }

    }
    // console.log(`Score: ${score}`)
    return (1 - score) * distance / 1000;
}

// function getDistance() {
//     return new Promise((resolve, reject) => {
//         var distance = geolib.getDistance(
//             { latitude: userLat, longitude: userLong },
//             { latitude: post['latitude'], longitude: post['longitude'] }
//         );
//     });
// }


// let test_post = {
//     'post_ID': 'HQhWdv58ZNZKNUBzEVFB',
//     'user_ID': 'testuser1',
//     'image_url': 'https://storage.googleapis.com/mapic_bucket/5PCl7aYZPzUT.jpg',
//     'title': '',
//     'keywordListString': 'Atmosphere:0.9481807947158813,Sky:0.9274134635925293,Natural landscape:0.8970191478729248,Astronomical object:0.8155921101570129,Star:0.8144868016242981,Tree:0.8070366978645325,Horizon:0.7958246469497681,Landscape:0.7874084711074829,Science:0.7852889895439148,Slope:0.7846237421035767',
//     'latitude': 13.43534535,
//     'longitude': 14.54535345,
//     '_id': '609735bf816fc856102912b5',
//     '__v': 0
//   }

// let test_keyword = 'sky'

// let test_userLat = 13.5453452

// let test_userLong = 56.312331


// // console.log("Test weight: " + calculate_weight(test_post, test_keyword, test_userLat, test_userLong))

// let test_post_array = [ 'MtDFay1QdKKxfWI9cSJv', 'HQhWdv58ZNZKNUBzEVFB' ]

// async function test(){
//     post_array_sort(test_post_array, 'sky', test_userLat, test_userLong)

// }

// test()


// console.log("Async test")

module.exports = {post_array_sort} 