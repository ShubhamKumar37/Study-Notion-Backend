import { Router } from "express";
import { auth, isInstructor } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createCourse, createSection, createSubSection, deleteCourse, deleteSection, deleteSubSection, getAllCourses, getAllSection, getCourseDetail, updateCourse, updateSection, updateSubSectionText, updateSubSectionVideo } from "../controllers/index.js";

const courseRouter = Router();

// Course routes
courseRouter.get("/", getAllCourses); // Working
courseRouter.get("/:courseId", getCourseDetail); // Working
courseRouter.delete("/:courseId", auth, isInstructor, deleteCourse); // Working
courseRouter.put("/", auth, isInstructor, upload.single("thumbnail"), updateCourse); // Working
courseRouter.post("/", auth, isInstructor, upload.single("thumbnail"), createCourse); // Working

// Section routes
courseRouter.get("/section/:courseId", getAllSection); // Working
courseRouter.post("/section/:courseId", auth, isInstructor, createSection); // Working
courseRouter.put("/section/:sectionId", auth, isInstructor, updateSection); // Working
courseRouter.delete("/section/:courseId", auth, isInstructor, deleteSection); // Working - more Work of delete the media

// SubSection routes
courseRouter.put("/subsection", auth, isInstructor, updateSubSectionText); // Woeking
courseRouter.delete("/subsection/:sectionId", auth, isInstructor, deleteSubSection); // Working
courseRouter.post("/subsection/:sectionId", auth, isInstructor, upload.single("videoFile"), createSubSection); // Working
courseRouter.put("/subsection/:subSectionId", auth, isInstructor, upload.single("videoFile"), updateSubSectionVideo); // Working


export { courseRouter };