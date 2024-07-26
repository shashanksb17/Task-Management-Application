const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: { type: String, required: false },
    firstName: { type: String, required: true },
    lastName: { type: String,},
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, 
    avatar : {type:String},
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
