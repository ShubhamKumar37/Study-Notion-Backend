import { Router } from "express";
import { auth, isStudent } from "../middlewares/auth.middleware.js";
import { createPayment, verifySignature } from "../controllers/index.js";

const paymentRouter = Router();

paymentRouter.post("/", auth, isStudent, createPayment);
paymentRouter.post("/verify", auth, isStudent, verifySignature);


export { paymentRouter };