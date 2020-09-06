const   express = require("express"),
        router = express.Router(),
        passport = require("passport"),
        User = require("../models/user");

// LANDING
router.get("/", function(req, res){
    res.render("landing");
});

// MORE INFO
router.get("/about", function(req, res){
    res.render("learnMore");
});

// new user
router.get("/signup", function(req,res){
        res.render("users/signup")
})
router.post("/signup", function(req, res){
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

// user sign-in
router.get("/signin", function(req, res){
    res.render("users/signin");
});
router.post('/signin', passport.authenticate('userLocal',
        { 
        successRedirect: '/users/:id',
        failureRedirect: '/signin',
        failureFlash: true
}));

            // user dash
router.get("/users/:id", function(req, res){
        const currentUser = req.user
        res.render("users/userDash", {user: currentUser})
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!")
	res.redirect("/");
});

module.exports = router;