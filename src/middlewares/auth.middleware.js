import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.modals.js";

const verifyJWT = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken || req.headers?.authorization;
    if (!token) {
      new ApiError(401, "Unauthorized - No token provided");
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Please login again to be logged out");
  }
};

export { verifyJWT };
