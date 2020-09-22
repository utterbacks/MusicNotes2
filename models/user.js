const   mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        passportLocalMongoose = require("passport-local-mongoose");


const UserSchema= new Schema({
    firstName: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    password: String,
    students: [],
    isTeacher: {
        type: Boolean,
        default: false
    }
    
});

UserSchema.plugin(passportLocalMongoose, {usernameField: "email"});

const User = mongoose.model("user", UserSchema);

module.exports = User;