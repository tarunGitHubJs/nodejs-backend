import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.modals.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res, next) => {
  // res.status(201).json({message:"success"})
  const { userName, email, fullName, password } = req.body;

  // conditon check if no value is empty
  if (
    [userName, email, fullName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //   check if user is already registered
  const existedUser = await User.findOne({ $or: [{ userName }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User is already registered");
  }

  const avatarLocalFilePath = req.files?.avatar[0]?.path;
  const coverImageLocalFilePath = req.files?.coverImage[0]?.path;

  //   check if avatar file is uploade or not
  if (!avatarLocalFilePath) {
    throw new ApiError(400, "Avatar file is required");
  }
  const avatarImage = await uploadOnCloudinary(avatarLocalFilePath);
  const coverImage = await uploadOnCloudinary(coverImageLocalFilePath);

  if (!avatarImage) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    userName:userName.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatarImage.url,
    coverImage: coverImage.url || "",
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Successfully registered"));
});
export { registerUser };
