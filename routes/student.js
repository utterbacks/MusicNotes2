const   express = require("express"),
        router = express.Router(),
        Student = require("../models/student"),
        User = require("../models/user");

// STUDENT VIEW

router.get("/student/:student_id", function(req, res){
    Student.findById(req.params.student_id, function(err, foundStudent){
            if(err || !foundStudent){
                    req.flash("error", "No Student Found");
                    console.log(err)
                    return res.redirect("back");
            } else{
                    res.render("users/studentDash", {user_id: req.params.id, student: foundStudent});
            }
    });
});

// USER CREATE STUDENT
router.get("/users/:id/createStudent", function(req, res){
    res.render("users/createStudent");
});

router.post("/users/:id/createStudent", function(req, res){
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
    Student.create(newStudent, function(err, newlyCreated){
            if(err){
                    console.log(err);
                    req.flash("error", "error")
            } else {
                    User.findById(req.params.id, function(err, parent){
                            if(err){
                                    req.flash("error", "error");
                                    console.log(err);
                            } else {
                                    parent.students.push(newlyCreated);
                                    return parent.save();
                                    
                            }
                    })
                    .then(() => {
                            req.flash("success", "Succesfully added student.")
                            res.redirect("/users/:id");
                    })
            }     
    })
})

// router.post("/users/:id", function(req, res, next){
//         Student.create(function(err){
//                 if(err){
//                         console.log(err)
//                         res.redirect("/")
//                 } else {
//                         const newStudent = new Student({
//                                 firstName: req.body.firstName,
//                                 lastName: req.body.lastName,
//                                 age: req.body.age,
//                                 instrument: req.body.instrument,
//                         });
//                         newStudent.save()
//                         .then(() => User.findById(req.params.id))
//                         .then((user) => {
//                                 user.students.push(newStudent);
//                                 return user.save();
//                         })
//                         .then(() => {
//                                 req.flash("success", "Successfully created student!");
//                                 return res.redirect("/users/:id")
//                         })
//                         .catch(next);
//                 }
//         })
// });

// TEACHER ADDS STUDENT
router.get("/users/:id/findStudents", function (req,res){
    Student.find({}, function(err, students){
            if(err){
                    req.flash("error", "No Students Found")
                    console.log(err);
            } else {
                    res.render("users/studentSelect", {students: students})
            }
    })

});

router.post("/users/:id/findStudents", function(req, res){
    Student.findOne({firstName: req.body.studentName}, function(err, foundStudent){
        if(err){
            req.flash("error", "let's try that again")
            console.log(err)
        } else {
            User.findById(req.params.id, function(err, teacher){
                if(err){
                    req.flash("error", err.message)
                    console.log(err)
                } else{
                    teacher.students.push(foundStudent);
                    teacher.save();
                    res.redirect("/users/:id");                                                                        
                }
            });
        }
    });       
});
module.exports = router;