const   express = require("express"),
        router = express.Router(),
        Assignment = require("../models/assignment"),
        Student = require("../models/student");



// USER CREATE ASSIGNMENT
router.get("/student/:student_id/createAssignment", function(req, res){
    res.render("assignments/createAssignment", {student: req.params.student_id})
});

router.post("/student/:student_id/createAssignment", function(req, res){
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
router.get("/assignments/:assignment_id", function(req, res){
    Assignment.findById(req.params.assignment_id, function(err, foundAssignment){
            if(err){
                    req.flash("error", "Can't find that assignment.");
                    console.log(err);
            } else {
                    res.render("assignments/showAssignments", {assignment: foundAssignment})
            }
    })
})

module.exports = router;