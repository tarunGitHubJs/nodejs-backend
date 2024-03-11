import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file uploaded successfully
    console.log("File is uploaded in cloudinary ", response.url);
    console.log(response,"coudinaryImageUplodaResponse")
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove the locally saved temporay file as the upload operation got failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (id) => {
  try {
    const image = await cloudinary.uploader.destroy(id);
    console.log(image)
  } catch (error) {
    console.log(error.message);
  }
};

export { uploadOnCloudinary,deleteFromCloudinary };
