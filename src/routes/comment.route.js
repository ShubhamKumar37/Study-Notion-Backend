import { Router } from "express";
import { auth } from "../middlewares/auth.middleware.js";
import { createComment, deleteComment, getAllComment, getAllCommentCourse, getAverageRating, updateComment } from "../controllers/index.js";

const commentRouter = Router();

commentRouter.post("/:courseId", auth, createComment); // Working
commentRouter.get("/avg-rating/:courseId", getAverageRating); // Working
commentRouter.get("/:courseId", getAllCommentCourse); // Working
commentRouter.get("/", getAllComment); // Working
commentRouter.put("/:commentId", auth, updateComment);
commentRouter.delete("/:commentId", auth, deleteComment); // Working


export { commentRouter };