import { Course, Section, SubSection } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler, cloudinaryDelete, getFilePublicId } from "../utils/index.js";


const createSection = asyncHandler(async (req, res) => {
    const { sectionName } = req.body;
    const { courseId } = req.params;

    if (!sectionName || sectionName.trim().length === 0) throw new ApiError(400, "Section name is not provided");
    if (!courseId) throw new ApiError(400, "Course id is not provided");

    const newSection = await Section.create({ sectionName });
    const updateCourse = await Course.findByIdAndUpdate(courseId,
        {
            $push: {
                courseContent: newSection._id,
            }
        }, { new: true }
    ).populate({
        path: "courseContent",
        select: "sectionName subSection",
        populate: { path: "subSection" }
    });

    if (!updateCourse) throw new ApiError(404, "Course does not exist for this id");

    return res.status(200).json(
        new ApiResponse(200, "Section is created successfully", updateCourse)
    );
});

const updateSection = asyncHandler(async (req, res) => {
    const { sectionName } = req.body;
    const { sectionId } = req.params;

    if (!sectionId) throw new ApiError(400, "Section id is not provided");
    if (!sectionName || sectionName.trim().length === 0) throw new ApiError(400, "Please provide this only detail section name");

    const updatedSection = await Section.findByIdAndUpdate(sectionId,
        {
            $set: { sectionName }
        },
        { new: true }
    );
    if (!updateSection) throw new ApiError(404, "Section does not exist");

    return res.status(200).json(
        new ApiResponse(200, "Section updated successfully", updatedSection)
    );
});

const getAllSection = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!courseId) throw new ApiError(400, "Course id is not provided");

    const allSection = await Course.findById(courseId).populate({
        path: "courseContent",
        populate: {
            path: "subSection"
        }
    });
    if (!allSection) throw new ApiError(400, "Course doesnot exist or no section is created yet");

    return res.status(200).json(
        new ApiResponse(200, "All section fetched successfully", allSection)
    );
});

const deleteSection = asyncHandler(async (req, res) => {
    const { sectionId } = req.body;
    const { courseId } = req.params;

    if (!sectionId) throw new ApiError(400, "Section id is not provided");
    if (!courseId) throw new ApiError(400, "Course id is not provided");

    const courseExist = await Course.findByIdAndUpdate(courseId, {
        $pull: {
            courseContent: sectionId
        }
    }, { new: true });
    if (!courseExist) throw new ApiError(404, "Course does not exist");

    const sectionExist = await Section.findByIdAndDelete(sectionId).populate("subSection");
    if (!sectionExist) throw new ApiError(404, "Section does not exist or may be it is deleted already");

    // Delete all video from subsection
    const allVideo = sectionExist.subSection;
    for (let i of allVideo) {
        const publicId = getFilePublicId(i.videoUrl);
        const cloudinaryDeleteResponse = await cloudinaryDelete(publicId, "video");

        if (cloudinaryDeleteResponse && cloudinaryDeleteResponse.result === "ok") {
            await SubSection.findByIdAndDelete(i._id);
        }
        else {
            console.log(`Failed to delete video: ${i.videoUrl}`);
        }
    }

    return res.status(200).json(new ApiResponse(200, "Section deleted successfully", courseExist))
});


export { createSection, updateSection, getAllSection, deleteSection };