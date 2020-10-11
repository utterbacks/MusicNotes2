const { schema } = require("./student");

const   mongoose = require("mongoose"),
        Schema = mongoose.Schema,
        passportLocalMongoose = require("passport-local-mongoose");


const UserSchema= new Schema({
    username: String,
    lastName: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    password: String,
    school: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "School"
        },
        schoolName: String,
    },
    isTeacher: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
    
});

schema.plugin(require('mongoose-beautiful-unique-validation'));
UserSchema.plugin(passportLocalMongoose, {usernameField: "email"});

const User = mongoose.model("user", UserSchema);

module.exports = User;