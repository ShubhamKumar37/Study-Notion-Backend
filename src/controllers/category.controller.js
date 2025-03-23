import { Course, Category } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";


const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) throw new ApiError(400, "Name is not provided properly");
    if (!description || description.trim().length === 0) throw new ApiError(400, "Description is not provided properly");

    const categoryExist = await Category.findOne({ name, description });
    if (categoryExist) throw new ApiError(403, "Category already exist");

    const createCategory = await Category.create({ name, description });

    return res.status(200).json(
        new ApiResponse(200, "Category is created successfully", createCategory)
    );
});

const getAllCategory = asyncHandler(async (_, res) => {
    const getAllCategory = await Category.find({});
    if (getAllCategory.length === 0) throw new ApiError(404, "No category exist");

    return res.status(200).json(
        new ApiResponse(200, "All category has been fetched", getAllCategory)
    );
});

const getCategoryDetails = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    if (!categoryId) throw new ApiError(400, "Category id is not provided");

    const categoryDetails = await Category.findById(categoryId).populate("course");
    if (!categoryDetails) throw new ApiError(404, "No data found for this category id");

    const otherCategoryDetails = await Category.find({ _id: { $ne: categoryId } }).populate("course").exec();

    const topSellingCourse = await Course.find({}).sort({ studentEnrolled: -1 }).limit(10).exec();

    const allInfo = {
        categoryDetails, otherCategoryDetails, topSellingCourse
    }

    return res.status(200).json(
        new ApiResponse(200, "Here is the detail of category", allInfo)
    );
});

const updateCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { categoryId } = req.params;

    if (!categoryId) throw new ApiError(400, "Category id is not provided");
    if (!name && !description) throw new ApiError(403, "Proivde atleast one detail to be updated");

    const updateOptions = {};
    if (name) updateOptions.name = name;
    if (description) updateOptions.description = description;

    const updateCategory = await Category.findByIdAndUpdate(categoryId, {
        $set: updateOptions
    }, { new: true });

    if (!updateCategory) throw new ApiError(404, "No category find for this id");

    return res.status(200).json(
        new ApiResponse(200, "Category updated successfully", updateCategory)
    );
});


export { createCategory, getAllCategory, getCategoryDetails, updateCategory };