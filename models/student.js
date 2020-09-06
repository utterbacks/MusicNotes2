const mongoose = require("mongoose"), 
        Schema = mongoose.Schema;

const StudentSchema= new Schema({
    firstName: String,
    lastName: String,
    age: String,
    instrument: String,
    assignments: [],
    parent: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
});

const Student = mongoose.model("student", StudentSchema);

module.exports = Student;