const   express = require("express"), 
        app = express(), 
        bodyParser = require("body-parser"), 
        mongoose = require("mongoose"),
        flash = require("connect-flash"), 
        passport = require("passport"),
        localStrategy = require("passport-local"),
        methodOverride = require("method-override"),
        User = require("./models/user"),
        indexRoutes = require("./routes/index"),
        studentRoutes = require("./routes/student"),
        assignmentRoutes = require("./routes/assignment"),
        schoolRoutes = require("./routes/school")

// "mongodb://localhost:27017/music_notes2"

mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser: true,
	useCreateIndex: true, 
        useUnifiedTopology: true,
        useFindAndModify: false
}).then(() => {
        console.log("Connected to DB!")
}).catch(err => {
        console.log("ERROR", err.message);
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIG
const session = require('express-session'),
      MongoStore = require("connect-mongo")(session);  
app.use(require("express-session")({
	secret: process.env.PASSPORTSECRET,
	resave: false,
        saveUninitialized: false,
        store: new MongoStore({
                mongooseConnection: mongoose.connection
        }),
        expires: new Date(Date.now() + (7 * 86400))
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use("local", new localStrategy(User.authenticate()));
passport.serializeUser(function(user, done) { 
        done(null, user);
      });
passport.deserializeUser(function(user, done) {
        if(user!=null)
                done(null,user);
        });
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use(studentRoutes);
app.use(assignmentRoutes);
app.use(schoolRoutes);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port, function(){
	console.log("Music Notes is running quick go catch it")
});