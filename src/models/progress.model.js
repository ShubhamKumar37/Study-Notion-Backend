import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
    {
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
        },
        completedVideos: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "SubSection"
            }
        ],
    }, { timestamps: true }
);

export const Progress = mongoose.models.Progress || mongoose.model("Progress", progressSchema);