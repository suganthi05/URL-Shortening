var express = require("express");
var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs");


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  '9sm5xK': "http://www.google.com"
};
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

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
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
  let templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});

// Add new Short URL ??
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };//doubt
  res.render("hello_world", templateVars);
});

//Add a GET Route to Show the Form
//a GET route to render the urls_new.ejs template
app.get("/urls/new", (req, res) => {
  //console.log(req.session);
  res.render("urls_new");
});

// Display a single URL and its shortened form
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

//a POST route to add the entered long URL along with the generated short url
app.post("/urls", (req, res) => {
  var tinyURL = generateRandomString();
  var inputURL = req.body.longURL;
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect("/urls");
});

//a POST route to add the entered long URL along with the generated short url
app.post("/urls/:id/update", (req, res) => {
	console.log(req.params.id);
  var tinyURL = req.params.id;
  //var inputURL = req.body.longURL;
  urlDatabase[tinyURL] = req.body.longURL;
  res.redirect("/urls");
});

//a POST route to handle the form submission for Adding the new LongURL
app.post("/urls/:id/", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

//a POST route to delete the selected URL
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
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
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
    // ... any other vars
  };
  res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
	console.log(req.body.username);
  res.cookie('username', req.body.username);
  
  res.redirect("/urls");
});

/*
app.post("/loginok", (req, res) => {
   console.log(req.body.username);
   res.cookie('username', req.body.username);
  
  res.redirect("/urls/new");
});
*/

app.post("/logout", (req, res) => {
  res.clearCookie("username")
 // clear.cookie('username', req.body.username);
 res.redirect("/login");
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/registration", (req, res) => {
 var userID = generateRandomString();
  var email = req.body.email;
  var password = req.body.password;
  users[userID] = req.body.email;
  users[userID] = req.body.password;
  res.redirect("/login");
console.log("Registration Successful");
  res.redirect("/urls");
});
//Implement a function that produces a string of 6 random alphanumeric characters
function generateRandomString() {
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   var text = "";
  for (var i = 0; i < 6; i++)
  {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});