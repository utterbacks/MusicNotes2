const mongoose = require("mongoose"), 
        Schema = mongoose.Schema;

const StudentSchema= new Schema({
    firstName: String,
    lastName: String,
    age: String,
    instrument: String,
    assignments: []
});

const Student = mongoose.model("student", StudentSchema);

module.exports = Student;