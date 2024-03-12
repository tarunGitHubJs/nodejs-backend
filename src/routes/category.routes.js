import { Router } from "express";
import {
  addProductDetails,
  addToCart,
  cartItems,
  // addProductToCart,
  // cartproducts,
  createCategory,
  createProduct,
  deleteProduct,
  editProductDetails,
  // createSubCategory,
  // deleteCartProducts,
  getCategory,
  getProducts,
  // getSubCategory,
  // updateCartItems,
} from "../controllers/category.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();
router.route("/createcategory").post(createCategory);
router.route("/createproduct").post(upload.single("image"),createProduct);
router.route("/categorieslisting").get(getCategory);
router.route("/productlisting").get(getProducts)
router.route("/deleteproduct/:id").delete(deleteProduct);
router.route("/addproductdetails").post(addProductDetails);
router.route("/editproductdetails").patch(editProductDetails);
router.route("/addtocart/:productId").post(addToCart);
router.route("/cartitems").get(cartItems)
// router.route("/subcatlisting").get(getSubCategory);
// router.route("/cart").post(addProductToCart);
// router.route("/cartlisting").get(cartproducts);
// router.route("/deleteCartItems/:id").delete(deleteCartProducts)
// router.route("/updateCartItems").get(updateCartItems)
export default router;
