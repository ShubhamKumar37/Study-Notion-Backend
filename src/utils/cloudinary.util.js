import { v2 } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});

const cloudinaryUpload = async (filePath, resourceType = "auto", quality = 90, folder = "Study-Again") => {
    try {
        const uploadResponse = await v2.uploader.upload(filePath, { resource_type: resourceType, quality: quality, folder: folder });
        console.log("This is cloudinary upload response = ", uploadResponse);

        fs.unlinkSync(filePath);
        return uploadResponse;

    } catch (error) {
        console.log("There is a issue while uploading file to cloudinary = ", error);
        fs.unlinkSync(filePath);
        return null;
    }
}

const cloudinaryDelete = async (publicId, resourceType) => {
    try {
        if (!publicId) return null;

        const deleteResponse = await v2.uploader.destroy(publicId, { resource_type: resourceType });
        console.log("This is delete response from cloudinary = ", deleteResponse);

        return deleteResponse;
    }
    catch (error) {
        console.log("There is a issue while deleting file from cloudinary", error);
        return null;
    }
}

export { cloudinaryDelete, cloudinaryUpload };