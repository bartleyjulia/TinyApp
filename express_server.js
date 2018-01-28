const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// var cookieSession = require('cookie-session');

// app.use(cookieSession({
//   name: 'session',
//   keys: [ loopdeloop ],
//   maxAge: 24 * 60 * 60 * 1000 // 24 hours
// }));

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
  for (var userident in database) {
    var user = database[userident];
    if (input === user.email) {
      return user.id;
    }
  }
  return null;
}


var urlDatabase = {
  "b2xVn2": { url: "http://www.lighthouselabs.ca", userid: "userRandomID" },
  "9sm5xK": { url: "http://www.google.com", userid: "user2RandomID" }
};



function urlsforuserID(id) {
  let list = {};
  for ( let item in urlDatabase){
    if (id === urlDatabase[item].userid) {
      list[item] = urlDatabase[item].url;
    }
  }
  return list;
}

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

function authenticateUser(email, password){
  var flag = false;
  for(var key in users){

    if((users[key].email === email) && (bcrypt.compareSync(password, users[key].password))){
      flag = true;
      break;
    }
  }
  return flag;
}



app.get("/urls", (req, res) => {
  let filteredList = urlsforuserID(req.cookies.user_id);
  let templateVars = {
    urls: urlDatabase,
    userDB: users,
    userID: req.cookies.user_id,
    usersURLs: filteredList
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  templateVars = {
    userDB: users,
    userID: req.cookies.user_id
  };
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    registryError: req.cookies.registryError,
    userDB: users,
    userID: req.cookies.user_id,
    loginError: req.cookies.loginError
  };
  res.render("urls_login", templateVars);
});


app.get("/register", (req, res) => {
  let templateVars = { userID: req.cookies.user_id, registryError: req.cookies.registryError };
  res.clearCookie('registryError');
  res.render("urls_register", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let filteredList = urlsforuserID(req.cookies.user_id);
  let templateVars = {
    usersURLs: filteredList,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]["url"],
    urls: urlDatabase,
    userDB: users,
    userID: req.cookies.user_id};
  res.render("url_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect(302, "..");
});

app.post("/login", (req, res) => {
  let emailtest = req.body.email;
  let passwordtest = req.body.password;
  let test = authenticateUser(emailtest, passwordtest);
  let user = compare(emailtest, users);
  if (user === null){
    res.cookie('loginError', "loginError");
    res.redirect("/login");
  } else if (test === false){
    res.cookie('loginError', "loginError");
    res.redirect("/login");
  } else {
    res.cookie("user_id", user);
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});


app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = { url: req.body.longURL, userid: req.cookies.user_id};
  console.log(req.params.id);
  console.log(req.body);
  console.log(req.body.longURL);
  console.log(req.cookies.user_id);

  res.redirect(302, "/urls");
});


app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  if (!urlDatabase[req.body]) {
    urlDatabase[shortURL] = { url: req.body.longURL, userid: req.cookies.user_id
    };
  }
  res.redirect(302, `urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  let emailtest = req.body.email;
  let passwordtest = req.body.password;
  if (!emailtest || !passwordtest ){
    res.cookie('registryError', "registryError");
    res.redirect("/register");
  }
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let user = compare(emailtest, users);
  if ( user === null) {
    let randomID = generateRandomString();
    let newUser = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
    console.log(newUser);
    users[randomID] = newUser;
    res.cookie('user_id', randomID);
    res.redirect("urls");
  } else {
    res.cookie('registryError', "registryError");
    res.redirect("/register");
  }

});

app.get("/u/:shortURL", (req, res) => {
  let shorterURL = req.params['shortURL'];
  let longURL = urlDatabase[shorterURL];
  res.redirect(302, longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});