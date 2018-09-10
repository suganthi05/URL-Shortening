var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");

//app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["fujlsispog", "anbuagbula", "fbyonyesvl"]
}));


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};

const usersDatabase = { 
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

function generateRandomString() {
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   var text = "";
  for (var i = 0; i < 6; i++)
  {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function matchUserURL(id, tinyUrl) {
  return (id === urlDatabase[tinyUrl].userID);
} 

function getURLForUser(id) {
  const userUrlDatabase = new Object();
  if (urlDatabase) {
    const urlArr = Object.getOwnPropertyNames(urlDatabase);
    urlArr.some(function(tinyUrl) {
      if (id === urlDatabase[tinyUrl].userID) {
        userUrlDatabase[tinyUrl] = urlDatabase[tinyUrl].url;
      }
    });
  }
  return userUrlDatabase;
}

function checkSmallURL(URL) {
  const urlsArr = Object.getOwnPropertyNames(urlDatabase);
  return urlsArr.some(function(tinyURL) {
    return URL === tinyURL;
  }); 
}

function checkUserInfo(callback) {
  const usersArr = Object.getOwnPropertyNames(usersDatabase);
  return usersArr.some(callback);
}

function checkEmail(email) {
  return checkUserInfo(function(user) {
    return email === usersDatabase[user].email;
  });
}

function checkLoginInfo(username, password) {
  return checkUserInfo(function(user) {
    return (username === usersDatabase[user].email && (password === usersDatabase[user].password ||
        bcrypt.compareSync(password, usersDatabase[user].password)));
  });
}

function checkSession(cookieUserID) {
  return checkUserInfo(function(user) {
    return cookieUserID === user;
  });
}

function getUserFromEmail(email) {
  const usersArr = Object.getOwnPropertyNames(usersDatabase);
  return usersArr.find(function(user) {
    if (email === usersDatabase[user].email) {
      return user;
    }
  });
}

app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Adding Routes
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Sending HTML
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//Index- Display all the URLs and their shortened forms,
app.get("/urls", (req, res) => {
  if (req.session.user_id) {

    // Check if cookie is valid, i.e., user still exists.
    if (!checkSession(req.session.user_id)) {
      req.session.user_id = null;
      res.redirect("/login");
    }

    const userId = req.session.user_id;
    const database = getURLForUser(userId);
    const templateVars = {
                            urls: database,
                            users: usersDatabase,
                            user: userId
                          };
    res.render("urls_index", templateVars);
  } else {
    res.status(401);
    res.send(`<html><body>Access denied! Please <a href="/login">login</a> or <a href="/register">register</a> to continue.</body></html>\n`);
  }
});


app.post("/urls", (req, res) => {
  var tinyURL = generateRandomString();
  var inputURL = req.body.longURL;
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect("/urls");
});




// Add new Short URL ??
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };//doubt
  res.render("hello_world", templateVars);
});

//Add a GET Route to Show the Form
//a GET route to render the urls_new.ejs template


app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    var templateVars = {users: usersDatabase, user: req.session.user_id};
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls_login");
  }
});



app.post("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {userID: req.session.user_id, url: req.body.longURL};
    res.redirect("/urls/" + shortURL);
  } else {
    res.status(401);
    res.send(`<html><body>Access denied! Please <a href="/login">login</a> or <a href="/register">register</a> to continue.</body></html>\n`);
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    if (checkSmallURL(req.params.id)) {
      const userId = req.session.user_id;
      if (matchUserURL(userId, req.params.id)) {
        const templateVars = {
                              urls: urlDatabase,
                              shortURL: req.params.id,
                              users: usersDatabase,
                              user: userId
                            };
        res.render("urls_show", templateVars);
      } else {
        res.status(403);
        res.send(`<html><body>URL Access Forbidden.</body></html>\n`);
      }
    } else {
      res.status(404);
      res.send("<html><body>404 Not found. Please try again.</body></html>\n");
    }
  } else {
    res.status(401);
    res.send(`<html><body>Access denied! Please <a href="/login">login</a> or <a href="/register">register</a> to continue.</body></html>\n`);
  }
});

//a POST route to add the entered long URL along with the generated short url
app.post("/urls/:id/update", (req, res) => {
	console.log(req.params.id);
  var tinyURL = req.params.id;
  //var inputURL = req.body.longURL;
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect("/urls");
});

//a POST route to handle the form submission for Adding the new LongUR

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
    const shortURL = req.params.id;
    if (matchUserURL(userId, req.params.id)) {
      urlDatabase[shortURL].url = req.body.longURL;
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send("403 Access Forbidden.\n");
    }
  } else {
    res.status(401);
    res.send("401 Access Denied.\n");
  }
});
//a POST route to delete the selected URL
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id) {
    const userId = req.session.user_id;
    if (matchUserURL(userId, req.params.id)) {
      console.log(req.params.id);
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send("403 Access Forbidden.\n");
    }
  } else {
    res.status(401);
    res.send("401 Access denied.\n");
  }
});

//a POST route to edit the selected URL
app.post("/urls/:id/edit", (req, res) => {
	  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show",templateVars);
 });

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("urls/");
  } else {
    const templateVars = {
                          users: usersDatabase,
                          user: undefined
                        };
    res.render("urls_login", templateVars);
}
});

app.post("/login", (req, res) => {
  const givenEmail = req.body.user;
  const givenPassword = req.body.password;
  if (checkLoginInfo(givenEmail, givenPassword)) {
    req.session.user_id = getUserFromEmail(givenEmail);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send(`<html><body>Invalid username or password. <a href="/login">Please try again</a>.</body></html>`);
  }
});
;

app.post("/logout", (req, res) => {
 req.session.user_id = null;
 res.redirect("/login");
});


app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
                          users: usersDatabase,
                          user: undefined,
                          email: req.body.email,
                          password: req.body.password
                        }
    res.render("urls_register", templateVars);
  }
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email && password) {
    if (checkEmail(email)) {
      res.status(400);
      res.send(`<html><body>Email already registered. Please <a href="/login">login</a>.</body></html>`);
    } else {
      const userId = generateRandomString();
      const hashedPassword = bcrypt.hashSync(password, 10);
      usersDatabase[userId] = {
        id: userId,
        email: email,
        password: hashedPassword
      };
      req.session.user_id = userId;
      res.redirect("/login");
    }
  } else {
    res.status(400);
    res.send(`<html><body>Please enter valid email and password to register. <a href="/register">Please try again.</a></body></html>`);
  }
});

app.get("/u/:shortURL", (req, res) => {
  console.log('test');
    let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  if (checkSmallURL(req.params.shortURL)) {
    const longURL = urlDatabase[req.params.shortURL].url;
    console.log(urlDatabase[req.params.shortURL]);
    console.log(longURL);

    res.redirect(longURL);
  } else {
    res.status(404);
    res.send("<html><body>404 Not found. Please try again.</body></html>\n");
  }
});
//Implement a function that produces a string of 6 random alphanumeric characters
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});