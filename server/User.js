const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
    // Email, isVerified and verificationToken are removed
});

const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;