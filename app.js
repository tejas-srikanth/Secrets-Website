require("dotenv").config();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const express = require("express");
const mongoose = require("mongoose");
const ejs = require("ejs")
const encrypt = require("mongoose-encryption")

const app = express()
app.use(express.urlencoded({extended: true}));
app.set("view engine", 'ejs')
app.use(express.static("public"))

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

app.listen(3000, function(){
  console.log("Listening on port 3000");
});

app.get("/", function(req, res){
  res.render("home")
});

app.get("/login", function(req, res){
  res.render("login")
});

app.post("/login", function(req, res){
  const email = req.body.username;


    User.findOne({email: email}, function(err, foundEmail){
      if (err){
        console.log(err);
      } else{
        bcrypt.compare(req.body.password, foundEmail.password, function(err, result) {
          if (result){
            res.render("secrets");
          }
        });

      }
    });

});

app.get("/register", function(req, res){
  res.render("register")
});

app.post("/register", function(req, res){

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
      const newUser = new User({
        email: req.body.username,
        password: hash
      });

    newUser.save(function(err){
      if (!err){
        res.render("secrets")
      } else{
        res.send(err)
      }
    });

  });
});

app.get("/logout", function(req, res){
  res.redirect("/")
})
