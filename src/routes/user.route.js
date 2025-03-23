import { Router } from "express";
import {
    sendOtp, signupUser, loginUser, changePassword,
    resetPasswordToken, resetPassword, logoutUser
} from "../controllers/index.js";
import { auth } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.put("/", loginUser); // Working
userRouter.post("/", signupUser); // Working
userRouter.put("/logout", logoutUser); // Working
userRouter.post("/sendotp", sendOtp); // Working

userRouter.put("/password-change", auth, changePassword); // Working
userRouter.put("/password-token", resetPasswordToken); // Working
userRouter.put("/password-reset/:token", resetPassword); // Working


export { userRouter };