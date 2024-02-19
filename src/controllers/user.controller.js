import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.modals.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { json } from "express";

// Registering a new user.

const registerUser = asyncHandler(async (req, res) => {
  const { userName, email, fullName, password } = req.body;
  a

  // conditon check if no input fields are empty
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
    userName: userName.toLowerCase(),
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

// generating access and refresh tokens.

const getAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Error while genrating access Token and refresh Token"
    );
  }
};

// user Login

const loginUser = asyncHandler(async (req, res) => {
  const { userName, email, password } = req.body;

  const user = await User.findOne({ $or: [{ userName }, { email }] });
  // console.log(user,"user")
  if (!(user || email)) {
    throw new ApiError(400, "Please enter correct username of email");
  }
  // const loginPassword =  await user.findOne(password);

  const isPsswordValid = await user?.isPasswordCorrect(password);

  if (!isPsswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await getAccessTokenAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user?._id).select(
    "-password -refreshToken"
  );
  // console.log(loggedInUser,"loggedInUser")

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, loggedInUser, "user is login successfully"));
});

// user Logout

const userLogout = asyncHandler(async (req, res) => {
  // const user = await User.findById(req.user._id);
  // console.log(user,"user")
  if (!(req?.user || req.user._id)) {
    throw new ApiError(401, "No user found");
  }
  await User.findByIdAndUpdate(
    req?.user?._id,
    {
      $set: { refreshToken: "" },
    },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User is succefully logout"));
});

// generating newRefreshToken

const createNewRefreshToken = asyncHandler(async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    // console.log(token,"token")
    if (!token) {
      throw new ApiError(400, "Invalid Refresh Token");
    }
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded?._id);
    if (token !== user?.refreshToken) {
      throw new ApiError(400, "Refresh Token does not matches");
    }
    const tokens = await getAccessTokenAndRefreshToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", tokens.accessToken, options)
      .cookie("newRefreshToken", tokens.refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          },
          "New Access token has been generated"
        )
      );
  } catch (error) {
    throw new ApiError(401, "User validation is failed");
  }
});

// update user password

const updateUserPassword = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req?.user._id);
    if (!user) {
      throw new ApiError(
        400,
        "Please login with your email or username to change password"
      );
    }

    const { oldPassword, newPassword } = req.body;
    const verifyPassword = await user?.isPasswordCorrect(oldPassword);
    if (!verifyPassword) {
      throw new ApiError(404, "Please enter the correct password");
    }

    if (!newPassword) {
      throw new ApiError(401, "please enter the new password to be updated");
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json(new ApiResponse(200, {}, "password is updated"));
  } catch (error) {
    // console.log(error,"error")
    throw new ApiError(400, "Invalid credentials");
  }
});

// update avatar

const updateUserAvatar = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req?.user?._id);
    if (!user) {
      throw new ApiError(400, "user not found");
    }
    const avatarLocalFilePath = req.file?.path;
    // console.log(avatarLocalFilePath,"avatarLocalFilePath")
    if (!avatarLocalFilePath) {
      res.status(404).json(new ApiError(404, "Avatar file path is required"));
      // throw new ApiError(400, "Avatar file path is required");
    }
    const avatarImage = await uploadOnCloudinary(avatarLocalFilePath);
    // console.log(avatarImage,"avatarImage")
    if (!avatarImage) {
      res.status(404).json(new ApiError(404, "Avatar file path is required"));
      // throw new ApiError(400, "Avatar file is required");
    }
    user.avatar = avatarImage?.url;
    await user.save();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { avatarImage: avatarImage.url },
          "Avatar image successfully updated"
        )
      );
  } catch (error) {
    console.log(error.message);
    throw new ApiError(400, "Invalid credentials");
  }
});

// getting channels data

const getUserChannelProfile = asyncHandler(async (req, res) => {
  try {
    const { userName } = req.params;
    console.log(req.params,"params")
    // console.log(req?.user,"user")
    if (!userName){
      throw new ApiError("Please login to view channel details")
    }
    const channel = await User.aggregate([
      { $match: { userName: userName } },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribedTo",
        },
      },
      {
        $addFields: {
          subscribersCount: { $size: "$subscribers" },
          channelSubscribedToCount: { $size: "$subscribedTo" },
          isSubscribed: {
            $cond: {
              if: { $in: [req?.user?._id, "$subscribers.subscriber"] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          fullName: 1,
          userName: 1,
          subscribersCount: 1,
          channelSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
        },
      },
    ]);
    if (!channel.length > 0) {
      throw new ApiError(400, "No channel found");
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, channel[0], "Channel data fetched successfully")
      );
  } catch (error) {
    console.log(error.message,"message")
  }
});
// console.log(getUserChannelProfile(),"getUserChannelProfile")

export {
  registerUser,
  loginUser,
  userLogout,
  createNewRefreshToken,
  updateUserPassword,
  updateUserAvatar,
  getUserChannelProfile,
};
