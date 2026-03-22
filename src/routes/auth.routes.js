import { Router } from   "express";
import * as authController from "../controllers/auth.controller.js";


const router = Router();
/**
 * POST /api/auth/register
 * Description: Register a new user
 * Access: Public   
 */
router.post("/register", authController.register);

/**
 * POST /api/auth/login
 * Description: Login user
 * Access: Public   
 */
router.post("/login", authController.login);

/**
 * GET /api/auth/get-me
 * Description: Get current user
 * Access: Private   
 */ 
router.get("/get-me", authController.getMe);

/**
 * GET /api/auth/refresh-token
 * Description: Refresh access token    
 * Access: Private   
 */
router.get("/refresh-token", authController.refreshToken);
/**
 * POST /api/auth/logout
 * Description: Logout user
 * Access: Private   
 */
router.post("/logout", authController.logout);  
/**
 * POST /api/auth/logout-all
 * Description: Logout user from all devices
 * Access: Private   
 */
router.post("/logout-all", authController.logoutAll);   
/**
 * POST /api/auth/verify-email
 * Description: Verify OTP
 * Access: Private   
 */
router.post("/verify-email", authController.verifyEmail);  
export default router; 