import { Router } from "express";
import { updateProfile, getUserDetails, getStudentEnrolledCourse, updateProfilePicture } from "../controllers/index.js";
import { auth } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const profileRouter = Router();

profileRouter.get("/", auth, getUserDetails); // Working
profileRouter.put("/", auth, updateProfile); // Working
profileRouter.get("/course-enrolled", auth, getStudentEnrolledCourse); // Working
profileRouter.put("/pp", auth, upload.single("userImage"), updateProfilePicture); // Working

export { profileRouter };