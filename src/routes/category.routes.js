import { Router } from "express";
import {
  addProductDetails,
  addToCart,
  cartItems,
  createCategory,
  createProduct,
  deleteCartItems,
  deleteProduct,
  editProductDetails,
  getCategory,
  getProducts,
  searchProductListing,
  sendMail,
  updateCartItemQuantity,
} from "../controllers/category.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route("/createcategory").post(createCategory);
router.route("/createproduct").post(upload.single("image"), createProduct);
router.route("/categorieslisting").get(getCategory);
router.route("/productlisting").get(getProducts);
router.route("/deleteproduct/:id").delete(deleteProduct);
router.route("/addproductdetails").post(addProductDetails);
router.route("/editproductdetails").patch(editProductDetails);
router.route("/addtocart/:productId").post(addToCart);
router.route("/cartitems").get(cartItems);
router.route("/updatequantity").patch(updateCartItemQuantity);
router.route("/sendmail").post(sendMail);
router.route("/searchproductlisting").get(searchProductListing);
router.route("/deletecartitem/:id").delete(deleteCartItems)

export default router;
