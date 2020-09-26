const   express = require("express"),
        router = express.Router(),
        Assignment = require("../models/assignment"),
        Student = require("../models/student"),
        User = require("../models/user"),
        nodemailer = require("nodemailer"),
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
                        User.findById(foundStudent.parent.id, function(err, parent){
                                const smtpTransport = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                                type: 'OAuth2',
                                                user: 'musicnoteshelp@gmail.com',
                                                clientId: '106565881651-mjsq8rnsmodnlf7l8l6ak6jc2r3qfgue.apps.googleusercontent.com',
                                                clientSecret: process.env.CLIENTSECRET,
                                                refreshToken: '1//04TysrBLi4-WjCgYIARAAGAQSNwF-L9IrfpBX3ULxINmoOdh5QLSZVR0c3ejJyxTx_tUwBxrXSdRvWltXmXxpnuwqG_h8PpXYy5E',
                                                accessToken: 'ya29.a0AfH6SMA7d1IGUqLZWDTXr1qUT0hFdnoxLtVgFHbD0yAbC7MzKz6lC3d8N9fo0_AUQK_Yiia1PZovFXas6A3TnWoW1lHxufuxGKOptm-pdcnpwpG0KDA_GTMy-uFpTpK7liGPBk1Ow4iZjJwwZcdSZbPB7D-HqSSUBmw'
                                        }
                                });
                                const mailOptions = {
                                        to: parent.email,
                                        from: "musicnoteshelp@gmail.com",
                                        subject: "You have a new assignment!",
                                        text: "You have a new assignment in Lesson Notebook! " +
                                                + "Sign in and check it out: " +
                                                        "http://" + req.headers.host + "/signin\n\n" +
                                                        "Happy practicing!"
                                                
                                };
                                smtpTransport.sendMail(mailOptions, function(err){
                                        if(err){
                                                req.flash("error", err.message);
                                        } else{
                                                console.log("mail sent");
                                        }
                                })
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
        });
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