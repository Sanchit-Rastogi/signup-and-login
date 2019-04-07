var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var session = require("express-session");
var passport = require("passport");
var passportLocalMongoose = require("passport-local-mongoose");

var app = express();

app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));

app.use(session({
    secret: "a weired serect",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    mail: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(User, done) {
  done(null, User);
});

passport.deserializeUser(function(User, done) {
  done(null, User);
});

app.get("/", function(req, res){
    res.render("index");
});

app.get("/final", function(req, res){
    res.render("final");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.post("/login", function(req, res){

    const user = new User({
        mail: req.body.username,
        password: req.body.password
    })

    req.login(user, function(err){
        if(err){
            console.log(err);
            res.redirect("/");
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/final");
            })
        }
    });

});

app.post("/",function(req,res){

    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err){
            console.log(err);
            res.redirect("/");
        }else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/final");
            });
        }
    });
});

app.listen(3000, function(req, res){
    console.log("Server is running on port 3000 ...");
}); 