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

middlewareObj.checkAssignmentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Assignment.findById(req.params.assignment_id, function(err, assignment){
            if(err || !assignment){
                req.flash("error", "that didn't work");
                console.log(assignment)
                res.redirect("back");
            } else {
                if(assignment.author.id.equals(req.user._id)){
                    next();
                } else{
                    req.flash("error", "You don't have permission to do that!");
                    res.redirect("back");
                }
                
            }
        })
    }
}


module.exports = middlewareObj;