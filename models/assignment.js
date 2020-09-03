const mongoose = require("mongoose"), 
        Schema = mongoose.Schema;

const assignmentSchema= new Schema({
    title: String,
    content: String,
    created:{
        type: Date,
        default: Date.now
    }
});

const Assignment = mongoose.model("assignment", assignmentSchema);

module.exports = Assignment;