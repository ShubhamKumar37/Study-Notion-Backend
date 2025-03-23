import { Router } from "express";
import { isAdmin, auth } from "../middlewares/auth.middleware.js";
import { createCategory, getAllCategory, getCategoryDetails, updateCategory } from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.post("/", auth, isAdmin, createCategory); // Working
categoryRouter.get("/", getAllCategory); // Working
categoryRouter.get("/:categoryId", getCategoryDetails); // Working
categoryRouter.put("/:categoryId", auth, isAdmin, updateCategory); // Working


export { categoryRouter };