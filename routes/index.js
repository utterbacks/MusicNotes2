const { doesNotReject } = require("assert");

const   express = require("express"),
        router = express.Router(),
        passport = require("passport"),
        Student = require("../models/student"),
        User = require("../models/user"),
        async = require("async"),
        nodemailer = require("nodemailer"),
        crypto = require("crypto");

// LANDING
router.get("/", (req, res) => {
    res.render("landing");
});

// MORE INFO
router.get("/about", (req, res) => {
    res.render("learnMore");
});

// new user
router.get("/signup", (req,res) => {
        res.render("users/signup")
})


router.post("/signup", (req, res) => {
        const newUser = new User({
                firstName: req.body.firstName,
                lastName: req.body.lastName, 
                email: req.body.email,
        });
        if(req.body.adminCode === "newmusicnotesteacher"){
                newUser.isTeacher = true;
        };
        User.register(newUser, req.body.password, function (err, user){
        if(err){
                console.log(err);
                return res.redirect("users/signup", {"error": err.message});
                };
                req.login(user, function(err){    
                        if(err){
                                req.flash("error", err.message);
                                res.redirect("back")
                        } else{
                        req.flash("success", "Welcome to MusicNotes, " + user.firstName + "! Check your email and spam folder and make sure to whitelist musicnoteshelp@gmail.com so you receive assignment notifications!");
                        res.redirect("/users/:id")
                        }
                });    
                
        });
        const smtpTransport = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                        type: 'OAuth2',
                        user: 'musicnoteshelp@gmail.com',
                        clientId: '106565881651-mjsq8rnsmodnlf7l8l6ak6jc2r3qfgue.apps.googleusercontent.com',
                        clientSecret: 'y-mZ0ltUVzqAVOCiYkqiGV15',
                        refreshToken: '1//04TysrBLi4-WjCgYIARAAGAQSNwF-L9IrfpBX3ULxINmoOdh5QLSZVR0c3ejJyxTx_tUwBxrXSdRvWltXmXxpnuwqG_h8PpXYy5E',
                        accessToken: 'ya29.a0AfH6SMA7d1IGUqLZWDTXr1qUT0hFdnoxLtVgFHbD0yAbC7MzKz6lC3d8N9fo0_AUQK_Yiia1PZovFXas6A3TnWoW1lHxufuxGKOptm-pdcnpwpG0KDA_GTMy-uFpTpK7liGPBk1Ow4iZjJwwZcdSZbPB7D-HqSSUBmw'
                }
        });
        const mailOptions = {
                to: newUser.email,
                from: "musicnoteshelp@gmail.com",
                subject: "Welcome to Lesson Notebook!",
                text: "You are receiving this email because you signed up for Lesson Notebook"
                        + "Make sure that this email address is added to your inbox so that you see when a new assignment has been posted. " +
                        + "Click here to sign in and create a student so that your teacher can create their first assignment! \n\n" +
                        "http://" + req.headers.host + "/signin\n\n" 
                        
        };
        smtpTransport.sendMail(mailOptions, function(err){
                if(err){
                        req.flash("error", err.message);
                } else{
                        console.log("mail sent");
                }
        });
});

// user sign-in
router.get("/signin", (req, res) => {
    res.render("users/signin");
});
router.post('/signin', passport.authenticate('local',
{ 
        successRedirect: '/users/:id',
        failureRedirect: '/signin',
        failureFlash: true
}));

// FORGOT PASS

router.get("/forgot", (req, res) => {
        res.render("users/forgot");
})

router.post("/forgot", (req, res, next) => {
        async.waterfall([
                function(done) {
                        crypto.randomBytes(20, function(err, buf){
                                const token = buf.toString('hex');
                                done(err, token);
                        });
                },
                function(token, done) {
                        User.findOne({email: req.body.email}, function(err, user){
                                if(!user) {
                                        req.flash("error", "No account found with that email.");
                                        return res. redirect("/forgot");
                                }
                                user.resetPasswordToken = token;
                                user.resetPasswordExpires = Date.now() + 3600000;
                                user.save(function(err){
                                        done(err, token, user);
                                });
                        });
                },
                function(token, user, done){
                        const smtpTransport = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                        type: 'OAuth2',
                                        user: 'musicnoteshelp@gmail.com',
                                        clientId: '106565881651-mjsq8rnsmodnlf7l8l6ak6jc2r3qfgue.apps.googleusercontent.com',
                                        clientSecret: 'y-mZ0ltUVzqAVOCiYkqiGV15',
                                        refreshToken: '1//04TysrBLi4-WjCgYIARAAGAQSNwF-L9IrfpBX3ULxINmoOdh5QLSZVR0c3ejJyxTx_tUwBxrXSdRvWltXmXxpnuwqG_h8PpXYy5E',
                                        accessToken: 'ya29.a0AfH6SMA7d1IGUqLZWDTXr1qUT0hFdnoxLtVgFHbD0yAbC7MzKz6lC3d8N9fo0_AUQK_Yiia1PZovFXas6A3TnWoW1lHxufuxGKOptm-pdcnpwpG0KDA_GTMy-uFpTpK7liGPBk1Ow4iZjJwwZcdSZbPB7D-HqSSUBmw'
                                }
                        });
                        const mailOptions = {
                                to: user.email,
                                from: "musicnoteshelp@gmail.com",
                                subject: "Music Notes Password Reset",
                                text: "You are receiving this email because you (or someone else) have requested a password reset for your account on MusicNotes.app."
                                        + "If you made this request your self, click the link below and we'll get you back into your account. " +
                                        "http://" + req.headers.host + "/reset/" + token + "\n\n" +
                                        "If you did not request this change, ignore this email and your password will remain unchanged. "
                        };
                        smtpTransport.sendMail(mailOptions, function(err){
                                console.log("mail sent");
                                req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions.");
                                done(err, "done");
                        });
                }
        ], function(err) {
                if(err) return next(err);
                res.redirect("/forgot");
        });
});

router.get("/reset/:token", function(req, res){
        User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}, function(err, user){
                if(!user){
                        req.flash("error", "Reset token is invalid or expired. Please try resetting your password again.");
                        console.log(err);
                        res.redirect("/forgot");
                }
                res.render("./users/reset", {token: req.params.token});
        });
});

router.post("/reset/:token", function(req, res){
        async.waterfall([
                function(done){
                        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() }}, function(err, user){
                                if(!user){
                                        req.flash("error", "Reset token is invalid or expired. Please try resetting your password again.")
                                        return res.redirect("back");
                                }
                                if(req.body.password === req.body.confirm){
                                        user.setPassword(req.body.password, function(err){
                                                user.resetPasswordToken = undefined;
                                                user.resetPasswordExpires = undefined;
                                                user.save(function(err){
                                                        req.logIn(user, function(err){
                                                                done(err, user);
                                                        });
                                                });
                                        });
                                } else {
                                        req.flash("error", "Passwords do not match.");
                                        return res.redirect("back");
                                }
                        });
                },
                function(user, done){
                        const smtpTransport = nodemailer.createTransport({
                                service:"Gmail", 
                                auth: {
                                        type: 'OAuth2',
                                        user: 'musicnoteshelp@gmail.com',
                                        clientId: '106565881651-mjsq8rnsmodnlf7l8l6ak6jc2r3qfgue.apps.googleusercontent.com',
                                        clientSecret: 'y-mZ0ltUVzqAVOCiYkqiGV15',
                                        refreshToken: '1//04TysrBLi4-WjCgYIARAAGAQSNwF-L9IrfpBX3ULxINmoOdh5QLSZVR0c3ejJyxTx_tUwBxrXSdRvWltXmXxpnuwqG_h8PpXYy5E',
                                        accessToken: 'ya29.a0AfH6SMA7d1IGUqLZWDTXr1qUT0hFdnoxLtVgFHbD0yAbC7MzKz6lC3d8N9fo0_AUQK_Yiia1PZovFXas6A3TnWoW1lHxufuxGKOptm-pdcnpwpG0KDA_GTMy-uFpTpK7liGPBk1Ow4iZjJwwZcdSZbPB7D-HqSSUBmw'
                                }
                        });
                        const mailOptions = {
                                to: user.email, 
                                from: 'musicnoteshelp@gmail.com',
                                subject: "Your MusicNotes password has changed.",
                                text: "Hello, \n\n" + user.username + "!" +
                                        " This is a confirmation that the password for your account " + user.email + " has just changed." +
                                "If you did not make this change, respond to this email and tell me immediately."                     
                        };
                        smtpTransport.sendMail(mailOptions, function(err) {
                                req.flash("success", "Success! Your password has been changed.");
                                done(err);
                        });
                }
        ], function(err){
                res.redirect("/users/" + req.user._id);
        });
});


            // user dash
router.get("/users/:id", function(req, res){
        User.findById(req.user._id, function(err, foundUser){
                if(err){
                        req.flash("error", err.message);
                        res.redirect("back");
                } else if(foundUser.isTeacher === false){
                        Student.find().where("parent.id").equals(foundUser._id).exec(function(err, students){
                                if(err){          
                                        req.flash("error", err.message);
                                        res.redirect("back");
                                }
                                res.render("users/userDash", {user: foundUser, students: students});
                                })
                } else if(foundUser.isTeacher === true){
                        Student.find().where("teacher._id").equals(foundUser._id).exec(function(err, students){
                                if(err){
                                        req.flash("error", err.message);
                                        res.redirect("back");
                                }
                                res.render("users/userDash", {user: foundUser, students: students})
                        })
                }
                
        })
});

router.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "Logged you out!")
	res.redirect("/");
});

module.exports = router;