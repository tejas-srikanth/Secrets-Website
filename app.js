require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express()


app.use(express.urlencoded({
  extended: true
}));
app.set("view engine", 'ejs')
app.use(express.static("public"))

app.use(session({
  secret: 'I wanna be a cowboy baby.',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true)

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);


passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.listen(3000, function() {
  console.log("Listening on port 3000");
});

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err){
      res.redirect("/login")
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  })

});

app.get("/secrets", function(req, res){

  if (req.isAuthenticated()){
    res.render("secrets")
  } else {
    res.redirect("/login")
  }

});

app.get("/register", function(req, res) {

  res.render("register");

});

app.post("/register", function(req, res) {

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      res.redirect("/login")
    } else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets")
      });
    }

  });

});

app.get("/logout", function(req, res) {
  res.redirect("/");
})
