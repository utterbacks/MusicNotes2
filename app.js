const   express = require("express"), 
        app = express(), 
        bodyParser = require("body-parser"), 
        mongoose = require("mongoose"),
        flash = require("connect-flash"), 
        passport = require("passport"),
        localStrategy = require("passport-local"),
        methodOverride = require("method-override"),
        expressSanitizer = require("express-sanitizer"),
        User = require("./models/user"),
        indexRoutes = require("./routes/index"),
        studentRoutes = require("./routes/student"),
        assignmentRoutes = require("./routes/assignment");



mongoose.connect("process.env.DATABASEURL", {
	useNewUrlParser: true,
	useCreateIndex: true, 
        useUnifiedTopology: true,
        useFindAndModify: false
}).then(() => {
        console.log("You're using the test environment DB. Have fun!")
}).catch(err => {
        console.log("ERROR", err.message);
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(flash());

// PASSPORT CONFIG
app.use(require("express-session")({
	secret: "Alexa is the best wife.",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use("userLocal", new localStrategy(User.authenticate()));
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

app.listen(3000, function(){
	console.log("Music Notes is running quick go catch it")
});