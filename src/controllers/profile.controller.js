import { Profile, User } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler, cloudinaryDelete, cloudinaryUpload, getFilePublicId } from "../utils/index.js";


const updateProfile = asyncHandler(async (req, res) => {
    const { firstName, lastName, gender, about, dob = null, contactNumber = null } = req.body;
    const userId = req.user._id;

    let dataUpdateValues = {};
    if (firstName) dataUpdateValues.firstName = firstName;
    if (lastName) dataUpdateValues.lastName = lastName;

    const updateduser = await User.findByIdAndUpdate(userId, {
        $set: dataUpdateValues
    }, { new: true }).select("-password -token -resetPasswordExpires").lean();
    if (!updateduser) throw new ApiError(404, "User does not exist");

    dataUpdateValues = {};
    if (gender) dataUpdateValues.gender = gender;
    if (about) dataUpdateValues.about = about;
    if (dob) dataUpdateValues.dob = dob;
    if (contactNumber) dataUpdateValues.contactNumber = contactNumber;

    const updatedProfile = await Profile.findByIdAndUpdate(updateduser.additionalDetails, {
        $set: dataUpdateValues
    }, { new: true });

    updateduser.additionalDetails = updatedProfile;

    return res.status(200).json(
        new ApiResponse(200, "Profile updated successfully", updateduser)
    );
});

const getUserDetails = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userDetails = await User.findById(userId).populate("additionalDetails");

    if (!userDetails) throw new ApiError(404, "User does not exist");

    return res.status(200).json(
        new ApiResponse(200, "User details fetched successfully", userDetails)
    );
});

const getStudentEnrolledCourse = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const courseEnrolled = await User.findById(userId).populate("courses").select("courses");

    if (courseEnrolled.length === 0) throw new ApiError(404, "Student is not enrolled in any course");

    return res.status(200).json(
        new ApiResponse(200, "Enrolled courses fetched successfully", courseEnrolled)
    );
});

const updateProfilePicture = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const userImage = req.file.path;

    const userExist = await User.findById(userId).select("image _id");
    if (!userExist) throw new ApiError(404, "User does not exist");

    const publicId = getFilePublicId(userExist.image);
    if (publicId) {
        await cloudinaryDelete(publicId, "image");
    }

    const imageUploadResponse = await cloudinaryUpload(userImage);
    userExist.image = imageUploadResponse.secure_url;
    await userExist.save({ new: true });

    return res.status(200).json(
        new ApiResponse(200, "User image updated successfully", userExist)
    );
});


export { updateProfile, getUserDetails, getStudentEnrolledCourse, updateProfilePicture };