import { Section, SubSection } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler, cloudinaryDelete, cloudinaryUpload, getFilePublicId } from "../utils/index.js";


const createSubSection = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;
    const { title, description } = req.body;
    const videoFilePath = req.file.path;

    if (!sectionId) throw new ApiError(400, "Section id is not provided");
    if (!title || title.trim().length === 0) throw new ApiError(400, "Title of section is not provided");
    if (!description || description.trim().length === 0) throw new ApiError(400, "Description of section is not provided");
    if (!videoFilePath) throw new ApiError(400, "Video is not provided");

    const sectionExist = await Section.findById(sectionId);
    if (!sectionExist) throw new ApiError(404, "Section does not exist");

    const videoUpload = await cloudinaryUpload(videoFilePath);
    const newSubSection = await SubSection.create({
        title, description, timeDuration: videoUpload.duration, videoUrl: videoUpload.secure_url
    });
    const updatedSection = await Section.findByIdAndUpdate(sectionId, {
        $push: {
            subSection: newSubSection._id
        }
    }, { new: true }).populate("subSection");

    return res.status(200).json(
        new ApiResponse(200, "Subsection created successfully", updatedSection)
    );
});

const deleteSubSection = asyncHandler(async (req, res) => {
    const { sectionId } = req.params;
    const { subSectionId } = req.body;

    if (!sectionId) throw new ApiError(400, "Section id is not provided");
    if (!subSectionId) throw new ApiError(400, "SubSection id is not provided");

    const updatedSection = await Section.findByIdAndUpdate(sectionId, {
        $pull: {
            subSection: subSectionId
        }
    }, { new: true }).populate("subSection");

    if (!updatedSection) throw new ApiError(400, "Section does not exist");

    const subSectionExist = await SubSection.findByIdAndDelete(subSectionId);
    if (!subSectionExist) throw new ApiError(400, "Subsection does not exist");

    await cloudinaryDelete(getFilePublicId(subSectionExist.videoUrl), "video");

    return res.status(200).json(
        new ApiResponse(200, "Subsection deleted successfully", updatedSection)
    );
});

const updateSubSectionText = asyncHandler(async (req, res) => {
    const { subSectionId, title, description } = req.body;
    if (!subSectionId) throw new ApiError(400, "Subsection id is not provided");
    if (!title && !description) throw new ApiError(400, "Either title or description must be provided");

    const updateValues = {};
    if (title) updateValues.title = title;
    if (description) updateValues.description = description;

    const subSectionExist = await SubSection.findByIdAndUpdate(subSectionId, {
        $set: updateValues
    }, { new: true });

    if (!subSectionExist) throw new ApiError(404, "Subsection does not exist");

    return res.status(200).json(
        new ApiResponse(200, "Subsection textual data is updated", subSectionExist)
    );
});

const updateSubSectionVideo = asyncHandler(async (req, res) => {
    const videoFilePath = req.file?.path;
    const { subSectionId } = req.params;

    if (!subSectionId) throw new ApiError(400, "Subsection id is not provided");
    if (!videoFilePath) throw new ApiError(400, "Video file is not provided");

    const subSectionExist = await SubSection.findById(subSectionId);
    if (!subSectionExist) throw new ApiError(404, "Subsection does not exist");

    await cloudinaryDelete(getFilePublicId(subSectionExist.videoUrl), "video");
    const videoUploadResponse = await cloudinaryUpload(videoFilePath);

    subSectionExist.videoUrl = videoUploadResponse.secure_url;
    await subSectionExist.save({ new: true });

    return res.status(200).json(
        new ApiResponse(200, "Subsection video updated successfully", subSectionExist)
    );
});


export { createSubSection, deleteSubSection, updateSubSectionText, updateSubSectionVideo };