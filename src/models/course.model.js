import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        courseName: {
            type: String,
            required: true,
            trim: true,
        },
        courseDescription: {
            type: String,
            required: true,
            trim: true,
        },
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        whatYouWillLearn: {
            type: String,
            required: true,
        },
        courseContent: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Section"
            }
        ],
        comment: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment",
            }
        ],
        price: {
            type: Number,
            required: true,
        },
        thumbnail: {
            type: String,
            require: true
        },
        tag: {
            type: [String],
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        studentEnrolled: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        instructions: [{
            type: String
        }],
        status: {
            type: String,
            enum: ["Draft", "Published"],
            default: "Draft"
        },
    }, { timestamps: true }
);

export const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);