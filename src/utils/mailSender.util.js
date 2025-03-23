import nodemailer from "nodemailer";
import { ApiError } from "./index.js";

const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});

const mailSender = async (email, title, body) => {
    try {
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS || !process.env.MAIL_HOST) {
            throw new Error("Missing required environment variables for mail configuration");
        }

        const mailOptions = {
            from: "Study Again :: " + process.env.MAIL_USER,
            to: email,
            subject: title,
            html: body
        }
        const mailResponse = await transporter.sendMail(mailOptions);
        // console.log("This is the mail response :: ", mailResponse, "\n This console.log() is present in utils/mailSender");

        return mailResponse;
    }
    catch (error) {
        console.error("Error occurred while sending the mail :: ", error);
        throw new ApiError(500, "There is issue in sending mail");
    }
}

export default mailSender;