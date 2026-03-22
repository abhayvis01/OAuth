import mongoose from "mongoose";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [ true, "Username is required"],
        unique: [true, "Username is already taken"],
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email is already taken"],
        trim: true,
        lowercase: true
    },
    password: {
        type: String,   
        required: [true, "Password is required"]
    },
    Verified: {
        type: Boolean,
        default: false
    },
    refreshToken: {
        type: String
    }
})

userSchema.methods.comparePassword = function(password) {
    const hashedPassword = crypto.createHash("sha256").update(String(password)).digest("hex");
    return this.password === hashedPassword;
};

const User = mongoose.model("User", userSchema);

export default User;    