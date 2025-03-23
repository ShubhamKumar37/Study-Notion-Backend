import { User } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler, mailSender } from "../utils/index.js";


const resetPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) throw new ApiError(400, "Email is not provided");

    const userExist = await User.findOne({ email });
    if (!userExist) throw new ApiError(404, "User does not exist");

    const token = crypto.randomUUID();

    const updateUserDetails = await User.findByIdAndUpdate(userExist._id,
        {
            $set: {
                resetPasswordExpires: Date.now() + 5 * 60 * 1000,
                token,
            }
        }, { new: true }
    ).select("-password");

    const url = `http://localhost:3000/update-password/${token}`;
    await mailSender(email, "Study-Again | Reset password link", url);

    return res.status(200).json(
        new ApiResponse(200, "A reset password link is sended to you email", updateUserDetails)
    );
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!token) throw new ApiError(400, "Token is not provided");
    if (!password || !confirmPassword) throw new ApiError(400, "Password or confirm password is not provided");
    if (password !== confirmPassword) throw new ApiError(400, "Passwords do not match");

    const userExist = await User.findOne({ token: token }).select("-password");
    if (!userExist) throw new ApiError(404, "User does not exist for this token");
    if (userExist.resetPasswordExpires < Date.now()) throw new ApiError(400, "Reset password link and token expiered");

    userExist.password = password;
    await userExist.save();

    userExist.token = null;
    userExist.resetPasswordExpires = null;

    return res.status(200).json(
        new ApiResponse(200, "Password reseted successfully", userExist)
    );
});


export { resetPasswordToken, resetPassword };