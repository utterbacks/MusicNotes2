const   express = require("express"),
        router = express.Router(),
        passport = require("passport"),
        User = require("../models/user"),
        async = require("async"),
        nodemailer = require("nodemailer"),
        crypto = require("crypto");


// ADMIN REGISTER FORM

router.get("/adminRegister", (req, res) => {
    res.render('./schools/adminRegister');
})

// CREATE SCHOOL

router.get("/createSchool", (req, res) => {
    res.render("./schools/create")
})

module.exports = router