import { Course, User } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler, mailSender } from "../utils/index.js";
import { instance } from "../config/razorpay.js";


const createPayment = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user._id;

    if (!courseId) throw new ApiError(400, "Course id is not provided");
    const courseExist = await Course.findById(courseId);
    if (!courseExist) throw new ApiError(404, "Course does not exist");

    if (courseExist.studentEnrolled.includes(userId)) throw new ApiError(403, "You have already purchased the course");

    const amount = courseExist.price;
    const currency = "INR";
    const options = {
        amount: amount * 100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes: {
            message: `Payment for the course - ${courseExist.courseName}`,
            courseId,
            userId
        }
    };

    try {
        const paymentResponse = await instance.orders.create(options);
        console.log("This is payment response = ", paymentResponse);

        const responsePaymentOptions = {
            courseName: courseExist.courseName,
            courseDescription: courseExist.courseDescription,
            thumbnail: courseExist.thumbnail,
            orderId: paymentResponse.id,
            amount: paymentResponse.amount,
        };

        return res.status(200).json(
            new ApiResponse(200, "Payment is created successfully", responsePaymentOptions)
        );

    } catch (error) {
        throw new ApiError(500, "Error while creating a payment", error);
    }


});

const verifySignature = asyncHandler(async (req, res) => {
    const webHookSecret = "12345678";
    const signature = req.headers["x-razorpay-signature"];
    const shasum = crypto.createHmac("sha256", webHookSecret).update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest === signature) {
        console.log("Payment is authorized");

        const { userId, courseId } = req.body.payLoad.payment.entity.notes;

        try {
            const updatedUser = await User.findByIdAndUpdate(userId, {
                $push: { courses: courseId }
            }, { new: true });

            const updatedCourse = await Course.findByIdAndUpdate(courseId, {
                $push: {
                    studentEnrolled: userId
                }
            }, { new: true });

            await mailSender(updatedCourse.email, "Payment successfull for course | Study-Again", "HTML for payment successfull");

            return res.status(200).json(
                new ApiResponse(200, "Payment is successful and you are now enrolled in course", { updatedCourse, updatedUser })
            );
        }
        catch (error) {
            throw new ApiError(500, "Error occur while making payment and verifying signature", error);
        }
    }
});


export { createPayment, verifySignature };