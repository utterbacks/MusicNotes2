const   express = require("express"),
        router = express.Router(),
        passport = require("passport"),
        User = require("../models/user"),
        School = require("../models/school"),
        async = require("async"),
        nodemailer = require("nodemailer"),
        crypto = require("crypto"),
        middleware = require("../middleware");


// ADMIN REGISTER FORM

router.get("/adminRegister", (req, res) => {
    res.render('./schools/adminRegister');
})

// CREATE SCHOOL

router.get("/createSchool", (req, res) => {
    res.render("./schools/create")
});

router.post('/createSchool', middleware.isLoggedIn, (req, res) => {
    const   newSchool = {
                schoolName: req.body.schoolName,
                admin: {
                        id: req.user._id,
                        username: req.user.username
                    },
                instruments: [req.body.instruments],
            }
         School.create(newSchool, function(err){
             if(err){
                 console.log(err);
                 req.flash("error", "Try that again, please!");
                 res.redirect("back")
             } else{
                 res.redirect("users/:id")
             }
         })
})

module.exports = router