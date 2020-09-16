const   express = require("express"),
        router = express.Router(),
        Assignment = require("../models/assignment"),
        Student = require("../models/student"),
        middleware = require("../middleware");



// USER CREATE ASSIGNMENT
router.get("/student/:student_id/createAssignment", middleware.isLoggedIn, function(req, res){
        Student.findById(req.params.student_id, function(err, student){
                if(err){
                        req.flash("error", err.message);
                        console.log(err)
                } else {
                        res.render("assignments/createAssignment", {student: student})
                }
        })
});

router.post("/student/:student_id/createAssignment", function(req, res){
        Student.findById(req.params.student_id, function(err, foundStudent){
                if(err){
                        req.flash("error", err.message);
                        console.log(err);
                        res.redirect("back");
                } else {
                        const newAssignment = new Assignment({
                                title: req.body.title,
                                content: req.body.content,
                                author: {
                                        id: req.user._id,
                                        username: req.user.username
                                },
                                student: {
                                        id: foundStudent._id,
                                        firstName: foundStudent.firstName
                                }
                        });
                        Assignment.create(newAssignment, function(err){
                                if (err){
                                        req.flash("error", "Try that again, I dare you.");
                                        console.log(err);
                                        res.redirect("back");
                                } else {
                                        newAssignment.save();                                        
                                        req.flash("success", "Successfully created assignment!")
                                        res.redirect("/student/" + req.params.student_id);
                                }
                        });
                }
        });
});


//  USER VIEW ASSIGNMENT
router.get("/student/:student_id/assignments/:assignment_id", middleware.isLoggedIn, function(req, res){
    Assignment.findById(req.params.assignment_id, function(err, foundAssignment){
            if(err){
                req.flash("error", "Can't find that assignment.");
                console.log(err);
            } else {
                Student.findById(req.params.student_id, function(err, student){
                        if(!student){
                                req.flash("error", "Can't find the student that that assignment belongs to.");
                                res.redirect("back");
                        } else {
                                res.render("assignments/showAssignment", {assignment: foundAssignment, student: student})                    
                        }
                })               
            }
    })
})

// UPDATE ASSIGNMENT

router.get("/student/:student_id/assignments/:assignment_id/edit", middleware.checkAssignmentOwnership, function(req, res){
        Assignment.findById(req.params.assignment_id, function(err, assignment){
               if(!err){
                       Student.findById(req.params.student_id, function(err, student){
                               if(!err){
                                res.render("./assignments/edit", {assignment: assignment, student: student})
                               } else {
                                       req.flash("error", err.message);
                                       res.redirect("back")
                               }
                       })
               } else {
                req.flash("error", err.message);
                res.redirect("back");
               }
        })
})

router.put("/student/:student_id/assignments/:assignment_id", function(req, res){
        Assignment.findByIdAndUpdate(req.params.assignment_id, req.body.assignment, function (err, update){
                if(err){
                        console.log(err);
                        req.flash("error", "Oops! We couldn't process that right now. Try again later.");
                        res.redirect("/student/:student_id/assignments/:assignment_id")
                } else {
                        req.flash("success", "Successfully updated assignment!")
                        res.redirect("/student/" + req.params.student_id )
                }
        })
})

// DELETE ASSIGNMENT

router.delete("/student/:student_id/assignments/:assignment_id", middleware.checkAssignmentOwnership, function(req, res){
       Assignment.findByIdAndRemove(req.params.assignment_id, function(err){
                if(err){
                        res.redirect("back");
                        req.flash("error", "Couldn't delete that assignment right now. Try again.");
                } else{
                        req.flash("success", "Deleted assignment")
                        res.redirect("/student/"+req.params.student_id);
                }
        })
})
       

module.exports = router;