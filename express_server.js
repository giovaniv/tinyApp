// REQUIRES
const express = require('express');
const bodyParser = require('body-parser');
const funcs = require('./functions');
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs');

// STARTING THE APP
const app = express();
const port = 8080;

app.set('view engine', 'ejs');

// MIDDLEWARES (PLUG-INS)
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'user_id',
  keys: ['key1', 'key2']
}))

// FAKES DATABASES

const urlDatabase = {};

// USERS
const userDatabase = {}

// =======================================================
// ENDPOINTS - GET
// =======================================================

// Root of our TinyApp, until now just redirecting to the URL List
app.get("/", (req, res) => {
  res.redirect("/urls");
});

// URLs list
app.get("/urls", (req, res) => {

  let userID = req.session.user_id;
  let urlsList = funcs.urlsForUser(userID,urlDatabase);
  let templateVars = {
    user: userDatabase[userID],
    urls: urlsList
  };
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

  let userID = req.session.user_id;

  if (!userID) {
    res.render('login');
  }
  else {
    let templateVars = { user: userDatabase[userID] };
    res.render("urls_new", templateVars);
  }

});

// Form to Edit or View a URL that was created
app.get("/urls/:id", (req, res) => {

  let userID = req.session.user_id;
  let shortURL = req.params.id;

  // we check if the user is loggedIn
  if (userID) {
    // if its we check if it can edit
    if (userID !== urlDatabase[shortURL].userID) {
      res.render('urls_index', {
        user: userDatabase[userID],
        urls: urlDatabase,
        error: 'You cannot edit a short Link of other user'
      });
      return;
    }
  } else {
    res.render("login");
    return;
  }

  let templateVars = {
    user: userDatabase[userID],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL].longURL };

  res.render("urls_show", templateVars);

});

// Redirection of the short link that was created
app.get("/u/:shortURL", (req, res) => {

  let shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);

});

// Register new User page
app.get("/register", (req, res) => {

  let userID = req.session.user_id;
  let templateVars = { user: userDatabase[userID] };
  res.render('register', templateVars);

});

// Login page
app.get("/login", (req, res) => {

  let userID = req.session.user_id;
  let templateVars = { user: userDatabase[userID] };
  res.render('login', templateVars);

});

// List of all URLs
app.get("/list", (req, res) => {

  let userID = req.session.user_id;
  let templateVars = {
    user: userDatabase[userID],
    urls: urlDatabase
  };
  res.render("urls_list", templateVars);

});

// =======================================================
// ENDPOINTS - POST
// =======================================================

// REDIRECT TO THE ORIGINAL URL (THAT WAS NOT SHORTED)
app.post('/urls', (req, res) => {

  let error;
  let userID = req.session.user_id;
  let shortLink = funcs.generateRandomString(6);

  if (req.body.longURL) {
    urlDatabase[shortLink.toString()] = {
      id: shortLink.toString(),
      longURL: req.body.longURL,
      userID: userID
    };
    let shortUrl = '/u/'+shortLink;
    //res.redirect(shortUrl);
    res.redirect('/urls');
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
  let userID = req.session.user_id;

  // we check if the user is loggedIn
  if (userID) {
    // if its we check if it can edit
    if (userID !== urlDatabase[id].userID) {
      res.render('urls_index', {
        user: userDatabase[userID],
        urls: urlDatabase,
        error: 'You cannot delete a short Link of other user'
      });
      return;
    }
  } else {
    res.render("login");
    return;
  }

  delete urlDatabase[id];
  res.redirect("/");

});

// UPDATE URL
app.post('/urls/:id', (req, res) => {

  let error;
  let id = req.params.id.toString();
  let longURL = req.body.longURL;
  let userID = req.session.user_id;

  // if the user isn't the owner of this short link
  // we redirect to the list of short links
  if (userID !== urlDatabase[id].userID) {
    res.redirect("/");
  }

  if (longURL) {
    urlDatabase[id].longURL = longURL;
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
  const hashed = bcrypt.hashSync(password, 10);

  // we check if the email already exists
  checkEmail = funcs.checkData(userDatabase, 'email', email);

  // if already exist, 400 status
  if (checkEmail) {
    res.status(400);
    res.render('register', {
      user: userDatabase[userID],
      error: 'Email already exists.'
    });
    //res.status(400).send('Email already exists.');
  }
  // if the email or password is empty, 400 status
  else if (!password || !email) {
    res.status(400);
    res.render('register', {
      user: userDatabase[userID],
      error: 'Email or Password is empty.'
    });
    //res.status(400).send('Email or Password is empty.');
  }
  // else everything it's ok, we save this new user
  else {
    userDatabase[userID] = {
      id: userID.toString(),
      email: email,
      password: hashed  //encripted password
    };

    req.session.user_id = userID.toString();
    res.redirect("/");
  }

});

// LOGIN PAGE AND COOKIE SETUP
app.post('/login', (req, res) => {

  let checkID;
  let userID = undefined;
  let email = req.body.email;
  let password = req.body.password;

  if (req.cookies) {
    userID = userDatabase[req.cookies.user_id];
  }

  if (!email || !password) {
    res.render('login', {
      user: userID,
      error: 'Email and/or password is empty.'
    });
    return;
  }

  // we check if the username already exists
  checkID = funcs.checkData(userDatabase, 'email', email);

  // if we have this email in database
  if (checkID) {

    // we check the hashed password with the parameter password
    let checkPassword = bcrypt.compareSync(password, checkID.password);

    if (!checkPassword) {
      res.status(403);
      res.render('login', {
        user: userID,
        error: 'Wrong password. Please try again.'
      });
      //res.status(403).send('Wrong password. Please try again.');
    }
    else {
      req.session.user_id = checkID.id;
      res.redirect("/");
    }

  }
  // if this email doesnt exist
  else {
    res.status(403);
    res.render('login', {
      user: userID,
      error: 'Email not found. Please register.'
    });
    //res.status(403).send('Email not found. Please register.');
  }

});

// LOGOUT AND CLEAN COOKIE
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/");
});

// LISTENER OF OUR TINYAPP
app.listen(port, () => {
  console.log(`Giovani's TinyApp listening on port ${port}!`);
});


