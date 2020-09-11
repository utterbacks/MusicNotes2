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
                            if(err){
                                    console.log(err);
                            } else{
                                res.render("assignments/showAssignment", {assignment: foundAssignment, student:student})
                            }
                    })
                    
            }
    })
})

// router.put

router.delete("/student/:student_id/assignments/:assignment_id", function(req, res){
       Assignment.findByIdAndRemove(req.params.assignment_id, function(err){
                if(err){
                        res.redirect("back");
                        req.flash("error", "Couldn't delete that assignment right now. Try again.");
                } else{
                        req.flash("success", "Deleted assignment")
                        res.redirect("/student/" + req.params.student_id);
                }
        })
})
       

module.exports = router;