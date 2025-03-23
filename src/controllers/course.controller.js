import { Category, Course, Section, SubSection, User } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler, cloudinaryDelete, cloudinaryUpload, getFilePublicId } from "../utils/index.js";


const createCourse = asyncHandler(async (req, res) => {
    const { courseName, courseDescription, whatYouWillLearn, price, categoryId, status = "Draft", instructions, tag } = req.body;
    const thumbnail = req.file.path;

    if (req.user.accountType !== "Instructor") throw new ApiError(403, "You are not instructor");
    if (!courseName || courseName.trim().length === 0) throw new ApiError(400, "Course name is not provided");
    if (!courseDescription || courseDescription.trim().length === 0) throw new ApiError(400, "Course description is not provided");
    if (!whatYouWillLearn || whatYouWillLearn.trim().length === 0) throw new ApiError(400, "What you will learn seciton is not provided");
    if (!price) throw new ApiError(400, "Price is not provided");
    if (!categoryId) throw new ApiError(400, "Category is not provided");
    if (!thumbnail) throw new ApiError(400, "Thumbnail is not provided");

    const categoryExist = await Category.findById(categoryId);
    if (!categoryExist) throw new ApiError(404, "Category does not exist");

    const uploadResponse = await cloudinaryUpload(thumbnail);

    const newCourse = await Course.create({
        courseName,
        courseDescription,
        whatYouWillLearn,
        price,
        category: categoryExist._id,
        thumbnail: uploadResponse.secure_url,
        instructor: req.user._id,
        status,
        instructions,
        tag: tag,
    });

    const updateUserCourse = await User.findByIdAndUpdate(req.user._id, {
        $push: {
            courses: newCourse._id
        }
    });
    const updateCategory = await Category.findByIdAndUpdate(categoryId, {
        $push: {
            course: newCourse._id
        }
    });

    const allInfo = {
        newCourse, updateUserCourse, updateCategory
    };

    return res.status(200).json(
        new ApiResponse(200, "Course created successfully", allInfo)
    );
});

const updateCourse = asyncHandler(async (req, res) => {
    const { courseName, courseDescription, whatYouWillLearn, price, categoryId, status = "Draft", instructions, courseId, tag } = req.body;
    const thumbnail = req.file ? req.file.path : null;

    let updateCourseOptions = {};
    if (courseName) updateCourseOptions.courseName = courseName;
    if (courseDescription) updateCourseOptions.courseDescription = courseDescription;
    if (whatYouWillLearn) updateCourseOptions.whatYouWillLearn = whatYouWillLearn;
    if (price) updateCourseOptions.price = price;
    if (status) updateCourseOptions.status = status;
    if (instructions) updateCourseOptions.instructions = instructions;
    if (tag) updateCourseOptions.tag = tag;
    if (categoryId) updateCourseOptions.category = categoryId;

    const courseExist = await Course.findById(courseId);
    if (!courseExist) throw new ApiError(404, "Course does not exist");

    if (categoryId && courseExist.category.toString() !== categoryId) {
        await Category.findByIdAndUpdate(courseExist.category, {
            $pull: { course: courseExist._id }
        });

        const categoryExist = await Category.findById(categoryId);
        if (!categoryExist) throw new ApiError(404, "Category does not exist");

        if (!categoryExist.course.includes(courseExist._id)) {
            await Category.findByIdAndUpdate(categoryId, {
                $push: { course: courseExist._id }
            });
        }
    }

    if (thumbnail) {
        if (courseExist.thumbnail) {
            await cloudinaryDelete(getFilePublicId(courseExist.thumbnail), "image");
        }

        // Upload the new thumbnail to Cloudinary
        const uploadResponse = await cloudinaryUpload(thumbnail);
        updateCourseOptions.thumbnail = uploadResponse.secure_url;
    }

    const updatedCourse = await Course.findByIdAndUpdate(courseExist._id, {
        $set: updateCourseOptions
    }, { new: true });

    return res.status(200).json(
        new ApiResponse(200, "Course has been updated successfully", updatedCourse)
    );
});

const getAllCourses = asyncHandler(async (_, res) => {
    const allCourses = await Course.find({}, {
        courseName: 1,
        price: 1,
        category: 1,
        thumbnail: 1,
        instructor: 1,
        studentEnrolled: 1,
        ratingAndReviews: 1,
        studentCount: { $size: "$studentEnrolled" }
    }).populate("instructor").sort({ studentEnrolled: -1 }).exec();

    if (allCourses.length === 0) throw new ApiError(404, "No course exist in database");

    return res.status(200).json(
        new ApiResponse(200, "All courses are fetched", allCourses)
    );
});

const getCourseDetail = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    if (!courseId) throw new ApiError(400, "Course id is not provided");

    const courseDetails = await Course.findById(courseId).populate({
        path: "courseContent",
        populate: { path: "subSection" }
    }).populate("instructor category comment").exec();
    if (!courseDetails) throw new ApiError(404, "Course does not exist");

    return res.status(200).json(
        new ApiResponse(200, "Course detail fetched successfully", courseDetails)
    );
});

const deleteCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;

    if (!courseId) throw new ApiError(400, "Course id is not provided");

    const course = await Course.findByIdAndDelete(courseId)
        .populate({
            path: "courseContent",
            populate: {
                path: "subSection"
            }
        });

    if (!course) throw new ApiError(404, "Course not found");

    await User.findByIdAndUpdate(course.instructor, {
        $pull: { courses: course._id }
    });
    await Category.findByIdAndUpdate(course.category, {
        $pull: { course: course._id }
    });

    await cloudinaryDelete(getFilePublicId(course.thumbnail), "image");
    for (let section of course.courseContent) {
        for (let subSection of section.subSection) {
            if (subSection.videoUrl) {
                const publicId = getFilePublicId(subSection.videoUrl);
                if (publicId) {
                    await cloudinaryDelete(publicId, 'video');
                }
            }
            await SubSection.findByIdAndDelete(subSection._id);
        }
        await Section.findByIdAndDelete(section._id);
    }

    res.status(200).json(new ApiResponse(200, "Course deleted successfully with there related content"));
});


export { createCourse, updateCourse, getAllCourses, getCourseDetail, deleteCourse };