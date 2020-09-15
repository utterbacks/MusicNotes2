const Assignment = require("../models/assignment");

const   express = require("express"),
        router = express.Router(),
        Student = require("../models/student"),
        User = require("../models/user"),
        middleware = require("../middleware");

// STUDENT VIEW

router.get("/student/:student_id", middleware.isLoggedIn, function(req, res){
    Student.findById(req.params.student_id, function(err, foundStudent){
            if(err || !foundStudent){
                    req.flash("error", "No Student Found");
                    console.log(err)
                    return res.redirect("back");
            } else{
                Assignment.find().where("student.id").equals(foundStudent.id).exec(function(err, assignments){
                    if(err){
                        req.flash("error", err.message);
                        res.redirect("back");
                    } else{
                        res.render("users/studentDash", {student: foundStudent, assignments: assignments});
                    }
                })
            }
    });
});

// USER CREATE STUDENT
router.get("/users/:id/createStudent", middleware.isLoggedIn, function(req, res){
    res.render("users/createStudent");
});

router.post("/users/:id/createStudent", middleware.isLoggedIn, function(req, res){
    const firstName = req.body.firstName,
          lastName = req.body.lastName,
          age = req.body.age,
          instrument = req.body.instrument,
          parent = {
                  id: req.user._id,
                  username: req.user.username
                },
          newStudent = {
                  firstName: firstName,
                  lastName: lastName,
                  age: age,
                  instrument: instrument,
                  parent: parent
                }
        Student.create(newStudent,  function(err){
            if(err){
                    console.log(err);
                    req.flash("error", "error")
            } else {
                    res.redirect("/users/:id")     
                    }
                })        
    });

// TEACHER ADDS STUDENT
router.get("/users/:id/findStudents", middleware.isLoggedIn, function (req,res){
    Student.find({}, function(err, students){
            if(err){
                    req.flash("error", "No Students Found")
                    console.log(err);
            } else {
                    res.render("users/studentSelect", {students: students})
            }
    })

});

router.post("/users/:id/findStudents", middleware.isLoggedIn,  function(req, res){
    Student.findOne({firstName: req.body.studentName}, function(err, foundStudent){
        if(err){
            req.flash("error", "let's try that again")
            console.log(err)
        } else {
            User.findById(req.params.id, async function(err, teacher){
                if(err){
                    req.flash("error", err.message)
                    console.log(err)
                } else{
                    foundStudent.teacher.push(teacher.toJSON());
                    await foundStudent.save();
                                                                                        
                }
            })
            .then(() => {
                req.flash("success", "You added a student to your roster!");
                return res.redirect("/users/:id")
            })
        }
    });       
});

// parent deletes student

router.delete("/student/:student_id", function(req, res){
    Student.findByIdAndRemove(req.params.student_id, function(err, foundStudent){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else{
            res.redirect("/users/" + req.user.id);
        }
    })
})
module.exports = router;