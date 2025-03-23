import { Comment, Course } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";
import mongoose from "mongoose";


const createComment = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { rating, review = "" } = req.body;
    const { courseId } = req.params;

    if (!rating) throw new ApiError(400, "Rating is not provided");
    if (rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 to 5");
    if (!courseId) throw new ApiError(400, "Course id is not provided");

    const enrolledStudentCheck = await Course.findOne({
        _id: courseId,
        studentEnrolled: {
            $elemMatch: { $eq: userId }
        }
    }).select("image firstName lastName");

    if (!enrolledStudentCheck) throw new ApiError(404, "User is not enrolled in this course or the course does not exist");

    const commentExist = await Comment.findOne({ user: userId, course: courseId });
    if (commentExist) throw new ApiError(403, "Comment already exist try to upadate it");

    const newComment = await Comment.create({
        user: userId,
        rating,
        review,
        course: courseId
    });

    const addCommentToCourse = await Course.findByIdAndUpdate(courseId, {
        $push: {
            comment: newComment._id
        }
    }).select("courseName instructor category");
    if (!addCommentToCourse) throw new ApiError(404, "Course doesnot exist");

    return res.status(200).json(
        new ApiResponse(200, "Comment created successfully", { newComment, enrolledStudentCheck })
    );
});

const getAverageRating = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    if (!courseId) throw new ApiError(400, "No course id is provided");

    const courseExist = await Course.findById(courseId);
    if (!courseExist) throw new ApiError(404, "Course does not exist");

    const averageRating = await Comment.aggregate([
        {
            $match: {
                course: new mongoose.Types.ObjectId(courseId)
            },
        },
        {
            $group: {
                _id: null,
                averageRating: {
                    $avg: "$rating"
                }
            }
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, "Average rating fetched successfully", { "averageRating": averageRating[0].averageRating })
    );
});

const getAllCommentCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const { limit = 10, page = 1 } = req.body;
    if (!courseId) throw new ApiError(400, "Course id is not provided");

    const allComment = await Comment.find({ course: courseId }).populate({
        path: "user",
        select: "firstName lastName email image"
    }).populate({
        path: "course",
        select: "courseName"
    }).sort({ rating: -1 }).skip((page - 1) * limit).limit(limit);
    if (allComment.length === 0) throw new ApiError(400, "No comment exist for this course or may be the course does not exist");

    return res.status(200).json(
        new ApiResponse(200, "All comment are fetched for course successfully", allComment)
    );
});

const getAllComment = asyncHandler(async (req, res) => {
    const { limit = 10, page = 1 } = req.body;
    const skip = (page - 1) * limit;

    const allComment = await Comment.find({}).populate({
        path: "user",
        select: "firstName lastName email image"
    }).populate({
        path: "course",
        select: "courseName"
    }).sort({ rating: -1 }).skip(skip).limit(limit);

    if (allComment.length === 0) throw new ApiError(404, "No comment exist for any course");

    return res.status(200).json(
        new ApiResponse(200, "All comment is fetched successfully", allComment)
    );
});

const updateComment = asyncHandler(async (req, res) => {
    const { rating, review } = req.body;
    const { commentId } = req.params;

    if (!rating && !review) throw new ApiError(400, "Provided atleast one detail to be updated");
    if (!commentId) throw new ApiError(400, "Comment id is not provided;")

    const updateValues = {};
    if (rating) {
        if (rating < 1 || rating > 5) throw new ApiError(402, "Please provide a valid rating (1 to 5)");
        updateValues.rating = rating;
    }
    if (review) updateValues.review = review;

    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: updateValues
    }, { new: true });

    if (!updatedComment) throw new ApiError(404, "Comment does not exist");

    return res.status(200).json(
        new ApiResponse(200, "Comment updated successfully", updatedComment)
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!commentId) throw new ApiError(400, "Comment id is not provided");

    const commentExist = await Comment.findByIdAndDelete(commentId);
    if (!commentExist) throw new ApiError(404, "Comment does not exist");

    await Course.findByIdAndUpdate(commentExist.course, {
        $pull: {
            comment: commentId
        }
    }, { new: true });

    return res.status(200).json(
        new ApiResponse(200, "Comment deleted successfully")
    );
});


export { createComment, getAverageRating, getAllComment, getAllCommentCourse, updateComment, deleteComment };