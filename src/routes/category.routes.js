import { Router } from "express";
import { createCategory, createSubCategory } from "../controllers/category.controller.js";
const router = Router();
router.route("/category").post(createCategory);
router.route("/subcategory").post(createSubCategory)
export default router;
