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
        Student = require("./models/student"),
        Assignment = require("./models/assignment");

mongoose.set('useUnifiedTopology', true);
mongoose.connect("mongodb://localhost:27017/music_notes2", {
	useNewUrlParser: true,
	useCreateIndex: true, 
	useUnifiedTopology: true
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs")
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/imgs'));
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

// LANDING
app.get("/", function(req, res){
    res.render("landing");
});

// MORE INFO
app.get("/about", function(req, res){
        res.render("learnMore");
});

// CREATE SINGLE USER MODEL
        // user sign-in
app.get("/signin", function(req, res){
        res.render("users/signin");
});
app.post('/signin', passport.authenticate('userLocal',
        { 
        successRedirect: '/users/:id',
        failureRedirect: '/signin',
        failureFlash: true
}));
        // new user
app.get("/signup", function(req,res){
        res.render("users/signup")
})
app.post("/signup", function(req, res){
        const newUser = new User({
                username: req.body.username,
                lastName: req.body.lastName, 
                email: req.body.email,
        });
        if(req.body.adminCode === "newMusicNotesteacher"){
                newUser.isTeacher = true;
        };
        User.register(newUser, req.body.password, function(err, user){
                if(err){
                        console.log(err);
                        return res.render("users/signup", {"error": err.message});
                } 
                passport.authenticate("userLocal")(req, res, function(){
                        req.flash("success", "Welcome to MusicNotes, " + user.username + "!");
                        res.redirect("/users/:id", {user: req.user});
                });
        });
});
        // user dash
app.get("/users/:id", function(req, res){
        const currentUser = req.user
        res.render("users/userDash", {user: currentUser})
});
// USER CREATE STUDENT
app.get("/users/:id/createStudent", function(req, res){
        res.render("users/createStudent");
});

app.post("/users/:id/createStudent", function(req, res){
        Student.create(function(err){
                if(err){
                        console.log(err)
                        res.redirect("/")
                } else {
                        const newStudent = new Student({
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                age: req.body.age,
                                instrument: req.body.instrument,
                        });
                        newStudent.save()
                        .then(() => User.findById(req.params.id))
                        .then((user) => {
                                user.students.push(newStudent);
                                return user.save();  
                        });            
                }
                
        })
        req.flash("success", "Successfully Created Student");
        res.redirect("/users/:id");
});

// TEACHER ADDS STUDENT
app.get("/users/:id/findStudents", function (req,res){
        Student.find({}, function(err, students){
                if(err){
                        req.flash("error", "No Students Found")
                        console.log(err);
                } else {
                        res.render("users/studentSelect", {students: students})
                }
        })

});

app.post("/users/:id/findStudents", function(req, res){
        Student.findOne({firstName: req.body.studentName}, function(err, foundStudent){
                if(err){
                        req.flash("error", "let's try that again")
                        console.log(err)
                } else {
                        console.log(foundStudent)
                        console.log(req.body.studentName)
                        res.redirect("/users/:id/findStudents")
                        // User.findById(req.params.id, function(err, teacher){
                        //         if(err){
                        //                 req.flash("error", err.message)
                        //                 console.log(err)
                        //         } else{
                        //                 teacher.students.push({foundStudent});
                        //                 teacher.save();
                        //                 res.redirect("/users/:id")
                        }
        });
});       

// USER STUDENT VIEW
app.get("/users/:id/student/:student_id", function(req, res){
        User.findById(req.user._id, function(err, foundUser){
                if(err || !foundUser){
                        req.flash("error", "Oops! That didn't work. Please try again.");
                        console.log(err);
                        return res.redirect("back");
                } else {
                                Student.findById(req.params.student_id, function(err, foundStudent){
                                if(err || !foundStudent){
                                        req.flash("error", "No Student Found");
                                        console.log(err)
                                        return res.redirect("back");
                                } else{
                                        res.render("users/studentDash", {user_id: req.params.id, student: foundStudent});
                                }
                        })
                }
        });
});

// USER CREATE ASSIGNMENT
app.get("/users/:id/student/:student_id/createAssignment", function(req, res){
        res.render("assignments/createAssignment", {student: req.params.student_id})
});

app.post("/users/:id/student/:student_id", function(req, res){
        Assignment.create(function(err){
                 if (err){
                         req.flash("error", "Try that again, I dare you.");
                         console.log(err);
                         res.redirect("back");
                 } else {
                         const newAssignment = new Assignment({
                                 title: req.body.title,
                                 content: req.body.content
                         });
                         Student.findOne({_id: req.params.student_id}, function(err, foundStudent){
                                 if(err){
                                         req.flash("error", "No Student Found");
                                         console.log(err)
                                         res.redirect("back");
                                 } else{
                                         newAssignment.save();
                                         foundStudent.assignments.push(newAssignment);
                                         foundStudent.save();
                                         res.render("students/studentDash", {student: foundStudent, assignment: newAssignment});
                                         }
                                 })
                 }
         });
 });

//  USER VIEW ASSIGNMENT
app.get("/users/:id/student/:student_id/assignments/:assignment_id", function(req, res){
        Assignment.findById(req.params.assignment_id, function(err, foundAssignment){
                if(err){
                        req.flash("error", "Can't find that assignment.");
                        console.log(err);
                } else {
                        res.render("assignments/showAssignments", {assignment: foundAssignment})
                }
        })
})

// USER LOGOUT

app.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!")
	res.redirect("/");
});

app.listen(3000, function(){
	console.log("Music Notes is running quick go catch it")
});