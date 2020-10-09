const mongoose = require('mongoose'),
        Schema = mongoose.Schema;

const SchoolSchema = new Schema({
    schoolName: String,
    teachers: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username: String
    }],
    parents: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }],
    students: [{
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student"
        },
        firstName: String,
    }]
})

const School = mongoose.model("school", SchoolSchema);

module.exports = School;