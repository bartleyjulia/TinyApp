var express = require("express");
var app = express();
// default port 8080
var PORT = process.env.PORT || 8080;

var cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const letters = 'abcdefghijklmnopqrstuvwxyz';
const alphabet = `${letters + letters.toUpperCase()}0123456789`;
function generateRandomString() {
  let output = '';
  for (let i = 0; i < 6; i++) {
    output += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return output;
}

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


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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


app.get("/urls", (req, res) => {
  var currentUser = "";
  if (req.cookies){
    currentUser = req.cookies.username;
  }
  let templateVars = {
    name: "Julia",
    urls: urlDatabase,
    username: currentUser,
    userDB: users
  };
  // console.log('urls', currentUser);
  // console.log(req.cookies);
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  var currentUser = "";
  if (req.cookies){
    currentUser = req.cookies.username;
  }
  templateVars = {
    username: currentUser,
    userDB: users
  };
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  var currentUser = "";
  if (req.cookies){
    currentUser = req.cookies.username;
  }
  templateVars = {
    username: currentUser,
    userDB: users
  };
  res.render("urls_login", templateVars);
});


app.get("/register", (req, res) => {
  let templateVars = { userDB: users, registryError: req.cookies.registryError };
  res.clearCookie('registryError');
  res.render("urls_register", templateVars);
});

app.get("/urls/:id", (req, res) => {
  var currentUser = "";
  if (req.cookies){
    currentUser = req.cookies.username;
  }
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], username: currentUser, userDB: users};
  if (urlDatabase[req.params.id]) {
    templateVars["longURL"] = urlDatabase[req.params.id];
  }
  res.render("url_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  // console.log(experiment);
  // console.log(urlDatabase[experiment]);
  // console.log(req.params);
  delete urlDatabase[shortURL];
  // console.log(urlDatabase);
  res.redirect(302, "..");
});

app.post("/login", (req, res) => {
  let username = req.body.username;
  if (!username) {
    res.redirect(404);
  }
  res.cookie('username', username);
  // console.log(res.cookie);
  // console.log();
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  let username = req.cookies.username;
  res.clearCookie('username');
  // console.log(username);
  res.redirect('/urls');
});


app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(302, "/urls");
});


app.post("/urls", (req, res) => {
  // debug statement to see POST parameters
  // console.log(req.body);
  let shortURL = generateRandomString();
  if (!urlDatabase[req.body]) {
    urlDatabase[shortURL] = req.body.longURL;
  }
  // console.log(urlDatabase);
  res.redirect(302, `urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  let emailtest = req.body.email;
  let passwordtest = req.body.password;
  if (!emailtest || !passwordtest ){
    res.cookie('registryError', "registryError");
    res.redirect("/register");
  }
  if (compare(emailtest, users) === false) {
  let randomID = generateRandomString();
  users[randomID] = { id: randomID,
    email: req.body.email,
    password: req.body.password};
  res.cookie('user_id', randomID);
  res.redirect("urls");
  } else {
  res.cookie('registryError', "registryError");
  res.redirect("/register");
  }
  // console.log();
  // console.log();
  console.log(users);
});

app.get("/u/:shortURL", (req, res) => {
  // if (shortURL does not exist) {
  //   res.redirect(404, 'http://www.404errorpages.com/');
  // }
  let shorterURL = req.params['shortURL'];
  let longURL = urlDatabase[shorterURL];
  res.redirect(302, longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});