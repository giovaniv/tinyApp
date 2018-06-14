const express = require('express');
const bodyParser = require('body-parser');
const funcs = require('./functions');
var cookieParser = require('cookie-parser')

const app = express();
const port = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Users Database
const users = {
  "sd1Ev1": {
    id: "sd1Ev1",
    email: "giovaniv@gmail.com",
    password: "giovaniv"
  },
 "1ZdXjV": {
    id: "1ZdXjV",
    email: "andrade.gi@gmail.com",
    password: "andrade.gi"
  },
 "fCBciK": {
    id: "fCBciK",
    email: "vheytor@gmail.com",
    password: "vheytor"
  }
}

// =======================================================
// GET ROUTERS
// =======================================================

// Root of our TinyApp, until now just redirecting to the URL List
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// URLs list
app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies['username'], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Path to show our Database in JSON format
app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

// Form to create a new shortlink based on a longLink
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies['username']};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  let templateVars = {
    username: req.cookies['username'],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);

});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies['username']};
  res.render('register', templateVars);
});

// =======================================================
// POSTS ROUTERS
// =======================================================

// REDIRECT TO THE ORIGINAL URL (THAT WAS NOT SHORTED)
app.post('/urls', (req, res) => {

  let error;
  let shortLink = funcs.generateRandomString(6);

  if (req.body.longURL) {
    urlDatabase[shortLink.toString()] = req.body.longURL;
    let shortUrl = '/u/'+shortLink;
    res.redirect(shortUrl);
  }
  else {
    res.render('urls_new', {
      username: req.cookies['username'],
      error: 'Please fill a long URL'
    });
  }

});

// DELETE
app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/");
});

// UPDATE
app.post('/urls/:id', (req, res) => {

  let error;
  let id = req.params.id;
  let longURL = req.body.longURL;

  if (longURL) {
    urlDatabase[id.toString()] = longURL;
    res.redirect("/",);
  }
  else {
    res.render('urls_show', {
      username: req.cookies['username'],
      shortURL: id,
      longURL: longURL,
      error: 'Please fill a long URL'
    });
  }

});

// REGISTER A NEW USER IN THE SYSTEM
app.post('/register', (req, res) => {

  let error;
  let userID = funcs.generateRandomString(6);
  let email = req.body.email;
  let password = req.body.password;

  if (email && password) {
    users[userID] = {
      id: userID.toString(),
      email: email,
      password: password
    };
    res.cookie('user_id', userID);
    res.redirect("/");
  }
  else {
    res.render('register', {
      username: req.cookies['username'],
      error: 'Please fill an email and password'
    });
  }

});

// LOGIN PAGE AND COOKIE SETUP
app.post('/login', (req, res) => {

  var username = req.body.username;

  if (username) {
    res.cookie('username', username);
    res.redirect("/");
  }
  else {
    res.render('urls_index', {
      username: undefined,
      urls: urlDatabase,
      error: 'Please fill a username'
    });
  }

});

// LOGOUT AND CLEAN COOKIE
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect("/");
});

// LISTENER OF OUR TINYAPP
app.listen(port, () => {
  console.log(`Giovani's TinyApp listening on port ${port}!`);
});




