const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


function compare(input, database){
  var regex = new RegExp(input);
  var text = '';
  var result = false;
  for (item in database) {
    for (inner in database[item]) {
      text += database[item][inner];
    }
    // console.log(text);
    var x = text.search(regex);
    if (x > 0) {
      result = true;
   }
  }
  return result;
}
 // printSearchResults: function(query) {
 //    var regex = new RegExp(query);
 //    for (var item in library.tracks){
 //      for ( var inner in library.tracks[item]) {
 //        var test = library.tracks[item][inner].toString();
 //        var x = test.search(regex);
 //        if ( x > 0 ) {
 //          console.log(item + ": " + library.tracks[item].name + " by " + library.tracks[item].artist + " (" + library.tracks[item].album + ")" );
 //        }
 //      }

 //    }
 //  }

console.log(compare("user2@example.com", users));
console.log(compare("dishwasher-funk", users));
console.log(compare("user3@example.com", users));
console.log(compare("user1@example.com", users));
console.log(compare("user4@example.com", users));
