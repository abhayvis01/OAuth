import mongoose from "mongoose";
import config from "./config.js";
import dns from "node:dns";

dns.setServers(["8.8.8.8"]);

async function connectDB() {
    await mongoose.connect(config.MONGO_URI)
    console.log("Database connected")
}

export default connectDB;