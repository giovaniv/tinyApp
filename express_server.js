const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  var num = Math.random() * 100;
  return num.toString(36).slice(2,8);
}

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

app.get('/hello', (req, res) => {
  var html = '<html><body><b>Hello World!</b></body></html>';
  res.end(html);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// REDIRECT TO THE ORIGINAL URL (THAT WAS NOT SHORTED)
app.post('/urls', (req, res) => {
  var shortLink = generateRandomString();
  urlDatabase[shortLink] = req.body.longURL;
  var shortUrl = '/u/'+shortLink;
  res.redirect(shortUrl);
});

// DELETE
app.post('/urls/:id/delete', (req, res) => {
  var id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// UPDATE
app.post('/urls/:id', (req, res) => {
  var id = req.params.id;
  var longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});






