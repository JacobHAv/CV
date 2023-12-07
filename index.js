//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use('/public', express.static('public'));
app.use(passport.initialize());

mongoose.connect('mongodb://127.0.0.1:27017/personalDB');


//post table
const postSchema = new mongoose.Schema({
    title: {type: String, 
      maxLength: 100},
    text: {type: String},
    email: {type: String}
  })

const Post = mongoose.model('Post', postSchema);


//admin table
const userSchema = new mongoose.Schema({
    username: {type: String},
    password: {type: String},
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = mongoose.model('User', userSchema);


app.route("/").get(function(req, res) {
    res.render("home.ejs")
});


app.route("/contact")
.get(function (req, res) {
    res.render("contact")
})
.post(function (req,res) {
   
    const post = new Post ({
        title: req.body.title,
        text: req.body.txt,
        email: req.body.email
      });
    console.log(post);
    post.save();
    
    
    res.redirect("/posts")
    
})


app.get("/posts", function(req, res){
const reqId = req.params.postId;

Post.find().then(function(posts){
  res.render("post.ejs", {posts:posts});
});

})

app.get("/admin", function(req, res){
  res.render("admin.ejs", {})
})


app.listen("3000", function() {
    console.log("Server is running on PORT 3000.")
})