import { Router } from "express";
import {
  createNewRefreshToken,
  getUserChannelProfile,
  loginUser,
  registerUser,
  updateUserAvatar,
  updateUserPassword,
  userLogout,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 },
  ]),
  registerUser
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, userLogout);
router.route("/verify-user").post(createNewRefreshToken);
router.route("/update-password").post(verifyJWT, updateUserPassword);
router
  .route("/update-avatar")
  .post(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/channel/:userName").get(verifyJWT, getUserChannelProfile);

export default router;
