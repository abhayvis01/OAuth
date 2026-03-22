import userModel from "../models/user.models.js";
import crypto from "crypto";
import jwt from "jsonwebtoken"; 
import config from "../config/config.js";   
import sessionModel from "../models/session.model.js";
import {sendEmail} from "../services/email.service.js";     
import {GenerateOtp, getOtpHtml} from "../utils/utils.js";
import otpModel from "../models/otp.model.js";


export async function register(req, res){
    try {
        const {username, email, password} = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }

        const isAlreadyRegistered = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]   
        });
        if(isAlreadyRegistered){
            return res.status(409).json({ message: "User already registered" });
        }   
        const hashedPassword = crypto.createHash("sha256").update(String(password)).digest("hex");  

        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        }); 
        const otp = GenerateOtp();
        const html = getOtpHtml(otp, user.username, user.email);    
        const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
        await otpModel.deleteMany({email, user: user._id,otpHash});
        const otpEntry = await otpModel.create({
            email,
            user: user._id,
            otpHash
        }); 

        await sendEmail(user.email, "OTP Verification", "Welcome to our platform", html);

        res.status(201).json({ message: "User registered successfully",
            user:{
                username: user.username,
                email: user.email,
                Verified: user.Verified
            }
         });
    } catch (error) {
        console.log("Error inside register:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });  
    }   
}

export async function login(req, res){
    try {
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await userModel.findOne({email});
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        if(!user.Verified){
            return res.status(401).json({ message: "User not verified" });
        }
        
        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid){
            return res.status(401).json({ message: "Invalid password or password not match" });
        }
        const refreshToken = jwt.sign({id: user._id.toString()}, config.JWT_SECRET, {expiresIn: "7d"});
        const refreshTokenHash = crypto.createHash("sha256").update(String(refreshToken)).digest("hex");
        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            createdAt: new Date(),
            revoked: false
        }); 
        const AccessToken = jwt.sign({id: user._id.toString(),
            sessionId: session._id  
        }, config.JWT_SECRET, {expiresIn: "1d"});
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }); 
        return res.status(200).json({ 
            message: "User logged in successfully", 
            username: user.username, 
            email: user.email, 
            AccessToken, 
            refreshToken 
        }); 
    } catch (error) {
        console.log("Error inside login:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });  
    }
}

export async function getMe(req, res){
    try {
        // Fix #1: Use req.headers instead of req.header
        const token = req.headers.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        const decodedToken = jwt.verify(token, config.JWT_SECRET);
        console.log(decodedToken);
        // Fix #2: Exclude the password using .select("-password")
        const user = await userModel.findById(decodedToken.id).select("-password");
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        
        return res.status(200).json({ user });
    } catch (error) {
        console.log("Error inside getMe:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });  
    }
}

export async function refreshToken(req, res){
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({ message: "Unauthorized No Refresh Token" });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(refreshToken, config.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: "Invalid or expired refresh token" });
        }

        const refreshTokenHash = crypto.createHash("sha256").update(String(refreshToken)).digest("hex");

        const session = await sessionModel.findOne({
            refreshTokenHash,
            user: decodedToken.id,
            revoked: false
        });
        if(!session){
            return res.status(404).json({ message: "Invalid refresh token or Session not found" });
        }   

        const user = await userModel.findById(decodedToken.id).select("-password");
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        // Revoke old session
        session.revoked = true;
        await session.save();

        // Generate new tokens
        const newRefreshToken = jwt.sign({id: decodedToken.id}, config.JWT_SECRET, {expiresIn: "7d"});
        const newRefreshTokenHash = crypto.createHash("sha256").update(String(newRefreshToken)).digest("hex");

        // Create new session
        const newSession = await sessionModel.create({
            user: user._id,
            refreshTokenHash: newRefreshTokenHash,
            ip: req.ip,
            userAgent: req.headers["user-agent"],
            createdAt: new Date(),
            revoked: false
        });

        // Generate a new access token
        const newAccessToken = jwt.sign({
            id: user._id.toString(),
            sessionId: newSession._id  
        }, config.JWT_SECRET, {expiresIn: "1d"});

        // Send the new cookies
        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        // Send the final response
        return res.status(200).json({
            message: "Tokens refreshed successfully",
            AccessToken: newAccessToken,
            refreshToken: newRefreshToken
        });

    } catch (error) {
        console.log("Error inside refreshToken:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });  
    }
}
export async function logout(req, res){
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({ message: "Unauthorized No Refresh Token" });
        }

        const refreshTokenHash = crypto.createHash("sha256").update(String(refreshToken)).digest("hex");

        const session = await sessionModel.findOne({
            refreshTokenHash,
            revoked: false
        });
        
        if(session){
            session.revoked = true;
            await session.save();
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.status(200).json({ message: "Logout successful" });  

    } catch (error) {
        console.log("Error inside logout:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });  
    }
}
export async function logoutAll(req, res){
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(401).json({ message: "Unauthorized No Refresh Token" });
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(refreshToken, config.JWT_SECRET, { ignoreExpiration: true });
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized Invalid Token" });
        }

        if(!decodedToken){
            return res.status(401).json({ message: "Unauthorized Invalid Token" });
        }

        await sessionModel.updateMany({
            user: decodedToken.id,
            revoked: false
        }, {
            revoked: true
        }); 

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });

        return res.status(200).json({ message: "Logout successful" });  

    } catch (error) {
        console.log("Error inside logout:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });  
    }
}

export async function verifyEmail(req, res){
    try {
        const {email, otp} = req.body;
        if(!email || !otp){
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
        const otpDoc = await otpModel.findOne({email, otpHash});
        if(!otpDoc){
            return res.status(404).json({ message: "OTP not found or invalid" });
        }   
        
        const user = await userModel.findByIdAndUpdate(otpDoc.user, {Verified: true}, {new: true});
        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        
        await otpModel.deleteMany({email, user: user._id});
        
        return res.status(200).json({ 
            message: "User verified successfully",
            user:{
                username: user.username,
                email: user.email,
                Verified: user.Verified
            }
        });
    } catch (error) {
        console.log("Error inside verifyEmail:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });  
    }
}