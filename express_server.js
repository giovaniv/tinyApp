// REQUIRES
const express = require('express');
const bodyParser = require('body-parser');
const funcs = require('./functions');
var cookieParser = require('cookie-parser')

// STARTING THE APP
const app = express();
const port = 8080;

app.set('view engine', 'ejs');

// MIDDLEWARES (PLUG-INS)
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// FAKES DATABASES

// URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// USERS
const userDatabase = {
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
// ENDPOINTS - GET
// =======================================================

// Root of our TinyApp, until now just redirecting to the URL List
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// URLs list
app.get("/urls", (req, res) => {
  let userID = req.cookies.user_id;
  let templateVars = { user: userDatabase[userID], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Path to show our URLs Database in JSON format
app.get('/urls.json', (req,res) => {
  res.json(urlDatabase);
});

// Path to show our Users Database in JSON format
app.get('/users.json', (req,res) => {
  res.json(userDatabase);
});

// Form to create a new shortlink based on a longLink
app.get("/urls/new", (req, res) => {
  let userID = req.cookies.user_id;
  let templateVars = { user: userDatabase[userID] };
  res.render("urls_new", templateVars);
});

// Form to Edit or View a URL that was created
app.get("/urls/:id", (req, res) => {

  let userID = req.cookies.user_id;

  let templateVars = {
    user: userDatabase[userID],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] };

  res.render("urls_show", templateVars);

});

// Redirection of the short link that was created
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Register new User page
app.get("/register", (req, res) => {
  let userID = req.cookies.user_id;
  let templateVars = { user: userDatabase[userID] };
  res.render('register', templateVars);
});

// Login page
app.get("/login", (req, res) => {
  let userID = req.cookies.user_id;
  let templateVars = { user: userDatabase[userID] };
  res.render('login', templateVars);
});

// =======================================================
// ENDPOINTS - POST
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
      users: userDatabase,
      error: 'Please fill a long URL'
    });
  }

});

// DELETE URL
app.post('/urls/:id/delete', (req, res) => {
  let id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/");
});

// UPDATE URL
app.post('/urls/:id', (req, res) => {

  let error;
  let id = req.params.id;
  let longURL = req.body.longURL;
  let userID = req.cookies.user_id;

  if (longURL) {
    urlDatabase[id.toString()] = longURL;
    res.redirect("/",);
  }
  else {
    res.render('urls_show', {
      user: userDatabase[userID],
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
  let checkEmail;

  // we check if the email already exists
  checkEmail = funcs.checkData(userDatabase, 'email', email);

  // if already exist, 400 status
  if (checkEmail) {
    // res.status(400);
    // res.render('register', {
    //   users: userDatabase,
    //   error: 'Email already exists.'
    // });
    res.status(400).send('Email already exists.');
  }
  // if the email or password is empty, 400 status
  else if (!password || !email) {
    // res.status(400);
    // res.render('register', {
    //   users: userDatabase,
    //   error: 'Email or Password is empty.'
    // });
    res.status(400).send('Email or Password is empty.');
  }
  // else everything it's ok, we save this new user
  else {
    userDatabase[userID] = {
      id: userID.toString(),
      email: email,
      password: password
    };
    res.cookie('user_id', userID.toString());
    res.redirect("/");
  }

});

// LOGIN PAGE AND COOKIE SETUP
app.post('/login', (req, res) => {

  let checkID;
  let email = req.body.email;
  let password = req.body.password;

  // we check if the username already exists
  checkID = funcs.checkData(userDatabase, 'email', email);

  // if we have this email in database
  if (checkID) {

    if (password !== checkID.password) {
      // res.status(403);
      // res.render('/', {
      //   users: userDatabase,
      //   error: 'Wrong password. Please try again.'
      // });
      res.status(403).send('Wrong password. Please try again.');
    }
    else {
      res.cookie('user_id', checkID.id);
      res.redirect("/");
    }

  }
  // if this email doesnt exist
  else {
    // res.status(403);
    // res.render('/', {
    //   users: userDatabase,
    //   error: 'Email not found. Please register.'
    // });
    res.status(403).send('Email not found. Please register.');
  }

});

// LOGOUT AND CLEAN COOKIE
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/");
});

// LISTENER OF OUR TINYAPP
app.listen(port, () => {
  console.log(`Giovani's TinyApp listening on port ${port}!`);
});




