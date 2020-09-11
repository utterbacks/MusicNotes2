const   middlewareObj = {},
        User = require("../models/user"),
        Student = require("../models/user"),
        Assignment = require("../models/assignment");

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "You need to be logged in!");
    res.redirect("/signin");
}


module.exports = middlewareObj;