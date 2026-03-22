import mongoose from "mongoose";
import User from "./user.models.js";


const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email is already taken"],
        trim: true,
        lowercase: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User is required"]
    },
    otpHash: {
        type: String,
        required: [true, "OTP Hash is required"],
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 10
    }
},{
    timestamps: true
});

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;