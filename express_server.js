const express = require('express');
const bodyParser = require('body-parser');
const funcs = require('./functions');
var cookieParser = require('cookie-parser')

const app = express();
const port = 8080;

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Initial Database of our tinyApp
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

// REDIRECT TO THE ORIGINAL URL (THAT WAS NOT SHORTED)
app.post('/urls', (req, res) => {

  let error;
  let shortLink = funcs.generateRandomString(6);

  if (req.body.longURL) {
    urlDatabase[shortLink] = req.body.longURL;
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
    urlDatabase[id] = longURL;
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

// LOGIN PAGE AND COOKIE SETUP
app.post('/login', (req, res) => {
  var username = req.body.username;
  res.cookie('username', username);
  res.redirect("/");
});

// Listener to our tinyApp
app.listen(port, () => {
  console.log(`Giovani's TinyApp listening on port ${port}!`);
});






