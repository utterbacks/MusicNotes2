const mongoose = require('mongoose'),
        Schema = mongoose.Schema;

const SchoolSchema = new Schema({
    schoolName: String,
    admin: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    instruments: [],
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