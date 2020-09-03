const   mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        passportLocalMongoose = require("passport-local-mongoose");


const UserSchema= new Schema({
    username: String,
    lastName: String,
    email: String,
    password: String,
    students: [],
    isTeacher: {
        type: Boolean,
        default: false
    }
    
});

UserSchema.plugin(passportLocalMongoose);

const User = mongoose.model("user", UserSchema);

module.exports = User;