const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: [ 'secretkey' ],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.use(function(req, res, next) {
  res.locals.user_id = req.session.user_id || false;
  next();

});

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


let urlDatabase = {
  "b2xVn2": { url: "http://www.lighthouselabs.ca", userid: "userRandomID" },
  "9sm5xK": { url: "http://www.google.com", userid: "user2RandomID" }
};


const ensureLoggedIn = (req, res, next) => {
  if (res.locals.user_id)
    return next();
  else
    return res.sendStatus(403);
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

function shortUrlsForUserID(id) {
  let list = [];
  for ( let item in urlDatabase){
    if (id === urlDatabase[item].userid) {
      list.push(item);
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
  let flag = false;
  for(let key in users){

    if((users[key].email === email) && (bcrypt.compareSync(password, users[key].password))){
      flag = true;
      break;
    }
  }
  return flag;
}



app.get("/urls", (req, res) => {
  let filteredList = urlsforuserID(req.session.user_id);
  let templateVars = {
    urls: urlDatabase,
    userDB: users,
    userID: req.session.user_id,
    usersURLs: filteredList,
    missingURL: req.session.missingURL
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  templateVars = {
    userDB: users,
    userID: req.session.user_id
  };
  res.render("urls_new", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    registryError: req.session.registryError,
    userDB: users,
    userID: req.session.user_id,
    loginError: req.session.loginError
  };
  res.render("urls_login", templateVars);
});


app.get("/register", (req, res) => {
  let templateVars = { userID: req.session.user_id, registryError: req.session.registryError };
  res.session = null;
  res.render("urls_register", templateVars);
});

app.get("/urls/:id", ensureLoggedIn, (req, res) => {
  let filteredList = urlsforuserID(req.session.user_id);
  let templateVars = {
    usersURLs: filteredList,
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]["url"],
    urls: urlDatabase,
    userDB: users,
    userID: req.session.user_id};
  console.log("session", req.session.user_id);
  res.render("url_show", templateVars);
});

app.post("/urls/:id/delete", ensureLoggedIn, (req, res) => {
  let shortURL = req.params.id;
  const ownedUrlThings = shortUrlsForUserID(res.locals.user_id);
  if (!ownedUrlThings.includes(shortURL))
    return res.sendStatus(403);
  delete urlDatabase[shortURL];
  return res.redirect(302, "..");
});

app.post("/login", (req, res) => {
  let emailtest = req.body.email;
  let passwordtest = req.body.password;
  let test = authenticateUser(emailtest, passwordtest);
  let user = compare(emailtest, users);
  if (user === null){
    req.session.loginError = "loginError";
    res.redirect("/login");
  } else if (test === false){
    req.loginError = "loginError";
    res.redirect("/login");
  } else {
    req.session.user_id = user;
    res.redirect("/urls");
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});


app.post('/urls/:id', ensureLoggedIn, (req, res) => {
  let shortURL = req.params.id;
  const ownedUrlThings = shortUrlsForUserID(res.locals.user_id);
  if (!ownedUrlThings.includes(shortURL))
    return res.sendStatus(403);
  urlDatabase[req.params.id] = { url: req.body.longURL, userid: req.session.user_id};
  res.redirect(302, "/urls");
});


app.post("/urls", ensureLoggedIn, (req, res) => {
  let shortURL = generateRandomString();
  if (!urlDatabase[req.body]) {
    urlDatabase[shortURL] = { url: req.body.longURL, userid: req.session.user_id
    };
  }
  res.redirect(302, `urls/${shortURL}`);
});

app.post("/register", (req, res) => {
  let email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  let user = compare(email, users);
  if (!email || !password ){
    req.session.registryError = 'registryError';
    res.redirect("/register");
  } else if ( user === null) {
    let randomID = generateRandomString();
    let newUser = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
    console.log(newUser);
    users[randomID] = newUser;
    req.session.user_id = randomID;
    res.redirect("/urls");
  } else {
    req.session.registryError = "registryError";
    res.redirect("/register");
  }

});

app.get("/u/:shortURL", (req, res) => {
  let shorterURL = req.params['shortURL'];
  if (!urlDatabase[shorterURL]) {
    req.session.missingURL = 'missingURL';
    res.redirect(302, '/urls');
  }
  let longURL = urlDatabase[shorterURL].url;
  res.redirect(302, longURL);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});