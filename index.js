//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use('/public', express.static('public'));
app.use(passport.initialize());

app.use(session({
  secret: "SHESAIDSHEWASTWELVE",
  resave: false,
  saveUninitialized: false
}))
app.use(passport.session());

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

passport.use(User.createStrategy());

//serialize
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, {
      id: user.id,
      username: user.username,
    });
  });
});
//deserialize
passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});


//SETUP DONE//



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
  res.render("admin.ejs", {response: " "})
});

var isLogged;

 app.route("/register").post(function(req,res){
   console.log(req.body["username"]);
   User.register({username: req.body["username"], active: true}, req.body.password).then(function (err, user) {
     if(!err){
         console.log(err);
         res.redirect("/");
     }else{
         passport.authenticate("local") (req, res, function(){
                 res.redirect("/admin")    
         })  
     }
     });
 });
// 6572ce0405e770b0892bef5d

app.post("/login", function(req,res){ 
    const username = req.body.username;
    const password = req.body.password;

  User.findOne({username: username}).then(function(foundUser){
    console.log(foundUser);
    if(foundUser === null){
      res.render("admin.ejs", {response: "User does not exist!"});
    }else{
      isLogged = true;
      res.redirect("/admin/posts");
    }
    
  });
});

app.get("/logout", function(req,res) {
  req.logout(function (err) {
      if(err){
          console.log(err);
      }else{
          isLogged = false;
          console.log(isLogged);
          res.redirect("/");
        }
  });

})

app.get("/admin/posts", function(req,res){
    console.log(isLogged);
    if(isLogged === true){
      Post.find().then(function(posts){
        res.render("admin-posts.ejs", {posts: posts});
      });
    }else{
      res.redirect("/admin");
    };
    
});

app.post("/delete", function(req,res){
  const deletedPost = req.body.delete;
  Post.findByIdAndDelete({_id: deletedPost}).then(function(){
    res.redirect("/admin/posts");
  });
});


app.listen("3000", function() {
    console.log("Server is running on PORT 3000.")
});