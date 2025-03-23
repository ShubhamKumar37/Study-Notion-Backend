import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import cors from "cors";

dotenv.config();

const app = express();

// Use middlewares
app.use(express.json());
app.use(cookieparser());
app.use(express.static("public"));
app.use(cors({
    origin: [
        "http://localhost:3000",
        "https://study-notion-frontend-orpin.vercel.app",
        "https://study-notion-frontend-shubham-kumars-projects-c7fe827c.vercel.app",
        "https://study-notion-frontend-git-main-shubham-kumars-projects-c7fe827c.vercel.app",
        "http://localhost:3001"
    ],
    credentials: true, 
}));


import { userRouter, profileRouter, paymentRouter, courseRouter, commentRouter, categoryRouter } from "./routes/index.js";

app.use("/api/v1/user", userRouter); // Working
app.use("/api/v1/course", courseRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/category", categoryRouter);
app.use(errorHandler);

app.get("/", (_, res) => {
    res.send("Welcome to home page");
});


export { app };