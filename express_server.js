const express = require('express');
const bodyParser = require('body-parser');
const funcs = require('./functions');

const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// Initial Database of our tinyApp
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// function generateRandomString(m) {
//   s = '';
//   r = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   for (var i=0; i < m; i++) {
//     s += r.charAt(Math.floor(Math.random() * r.length));
//   }
//   return s;
// }

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// REDIRECT TO THE ORIGINAL URL (THAT WAS NOT SHORTED)
app.post('/urls', (req, res) => {
  let shortLink = funcs.generateRandomString(6);
  urlDatabase[shortLink] = req.body.longURL;
  let shortUrl = '/u/'+shortLink;
  res.redirect(shortUrl);
});

// DELETE
app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// UPDATE
app.post('/urls/:id', (req, res) => {
  let id = req.params.id;
  let longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Giovani's TinyApp listening on port ${port}!`);
});






