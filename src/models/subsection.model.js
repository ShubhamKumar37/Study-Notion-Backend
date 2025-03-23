import mongoose from "mongoose";

const subSectionSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        videoUrl: { type: String, required: true },
        timeDuration: { type: String },
    }, { timestamps: true }
);

export const SubSection = mongoose.models.SubSection || mongoose.model("SubSection", subSectionSchema);