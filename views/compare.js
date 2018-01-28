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
  for (var userident in database) {
    var user = database[userident];
    console.log(user.email);
    if (input === user.email) {
      return user.id;
    }
  }
  return null;
}


console.log(compare("user2@example.com", users));
console.log(compare("userexample.com", users));