import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
        },
        course: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            default: []
        }],
    }, { timestamps: true }
);

export const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);