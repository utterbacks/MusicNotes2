const mongoose = require("mongoose"), 
        Schema = mongoose.Schema;

const assignmentSchema= new Schema({
    title: String,
    content: String,
    created:{
        type: Date,
        default: Date.now
    },
    author:{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    student:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        },
        firstName: String
    }
});

const Assignment = mongoose.model("assignment", assignmentSchema);

module.exports = Assignment;