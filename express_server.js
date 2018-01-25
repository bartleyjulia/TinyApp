var express = require("express");
var app = express();
// default port 8080
var PORT = process.env.PORT || 8080;

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
// console.log(generateRandomString());



var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/urls", (req, res) => {
  let templateVars = {
    name: "Julia",
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  res.render("urls_new");

});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
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
  console.log(urlDatabase);
  res.redirect(302, `urls/${shortURL}`);
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