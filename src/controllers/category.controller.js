import mongoose from "mongoose";
import {
  Category,
  Product,
  ProductDetail,
  // ProductCart,
  // SubCategory,
} from "../models/category.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res
        .status(400)
        .json(new ApiResponse(400, {}, "Category name is required"));
    } else {
      const category = await Category.create({
        name,
      });
      await category.save();
      res
        .status(200)
        .json(new ApiResponse(200, category, "A new category is created"));
    }
  } catch (error) {
    console.log(error.message);
  }
});

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, totalPrice, id, discount, ISI_tag, assured_tag } = req.body;
    if (!name || !totalPrice || !discount || !ISI_tag || !assured_tag) {
      res.status(400).json(new ApiResponse(400, {}, "All fields are required"));
    } else if (!id) {
      res.status(400).json(new ApiResponse(400, {}, "Category id is required"));
    } else {
      const netPrice = Math.round(totalPrice * ((100 - discount) / 100));
      const productImageLocalPath = req.file?.path;
      const productImage = await uploadOnCloudinary(productImageLocalPath);
      if (!productImage) {
        res
          .status(400)
          .json(new ApiResponse(400, {}, "Product image is required"));
      } else {
        const product = await new Product({
          name,
          image: productImage?.url,
          price: {
            total_price: totalPrice,
            discount: discount,
            net_price: netPrice,
          },
          category_id: id,
          tags: {
            ISI_tag,
            assured_tag,
          },
        });

        await product.save();
        // console.log(product, "product");
        res
          .status(200)
          .json(new ApiResponse(200, product, "A new product is added"));
      }
    }
  } catch (error) {
    console.log(error.message, "error");
  }
});

const editProductDetails = asyncHandler(async (req, res) => {
  try {
    const { totalPrice, discount, ISI_tag, assured_tag } = req.body;
    const id = req.query;
    if (!totalPrice || !discount || !id) {
      res.status(400).json(new ApiResponse(400, {}, "All fields are required"));
    } else {
      const productId = new mongoose.Types.ObjectId(id);
      const product = await Product.findById(productId);
      const netPrice = Math.round(totalPrice * ((100 - discount) / 100));
      product.price.total_price = totalPrice;
      product.price.discount = discount;
      product.price.net_price = netPrice;
      product.tags.ISI_tag = ISI_tag;
      product.tags.assured_tag = assured_tag;
      await product.save();
      console.log(product);
      res.status(200).json(new ApiResponse(200, product, "Field are updated"));
    }
  } catch (error) {
    console.log(error.message);
  }
});

const getCategory = asyncHandler(async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(new ApiResponse(200, categories, "Categories data"));
  } catch (error) {
    console.log(error.message);
  }
});

const getProducts = asyncHandler(async (req, res) => {
  try {
    const { category } = req.query;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    // console.log(req.query)
    // console.log(category, "category");
    if (category == undefined) {
      const products = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category_id",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "productdetails",
            localField: "_id",
            foreignField: "product_id",
            as: "productdetail",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $unwind: {
            path: "$productdetail",
            preserveNullAndEmptyArrays: true, // Preserve unmatched products
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
            price: 1,
            tags: 1,
            category: "$category.name",
            category_id: "$category._id",
            productdetails: "$productdetail",
          },
        },
      ]);
      if (page && limit) {
        const skip = (page - 1) * limit;
        const productData = products.slice(skip, skip + limit);
        console.log(productData, "productData");

        // console.log(products, "products");

        res
          .status(200)
          .json(new ApiResponse(200, productData, "All Products fetched"));
      } else {
        res
          .status(200)
          .json(new ApiResponse(200, products, "All Products fetched"));
      }
    } else {
      const productWithCategory = await Product.aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "category_id",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $lookup: {
            from: "productdetails",
            localField: "_id",
            foreignField: "product_id",
            as: "productdetail",
          },
        },
        {
          $unwind: "$category",
        },
        {
          $unwind: {
            path: "$productdetail",
            preserveNullAndEmptyArrays: true, // Preserve unmatched products
          },
        },
        {
          $match: {
            "category.name": category, // Filter based on category name
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            image: 1,
            price: 1,
            tags: 1,
            category: "$category.name",
            category_id: "$category._id",
            productdetails: "$productdetail",
          },
        },
      ]);
      // console.log(productWithCategory, "productWithCategory");
      if (productWithCategory?.length > 0) {
        res
          .status(200)
          .json(
            new ApiResponse(200, productWithCategory, "All Products fetched")
          );
      } else if (productWithCategory?.length == 0) {
        res
          .status(400)
          .json(new ApiResponse(400, productWithCategory, "No data found"));
      }
    }
  } catch (error) {
    console.log(error.message, "error");
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json(new ApiResponse(400, {}, "No id is provided"));
    } else {
      const product = await Product.findByIdAndDelete(id);
      const productId = new mongoose.Types.ObjectId(id);
      const productDetail = await ProductDetail.findOneAndDelete({
        product_id: productId,
      });
      // const delteDetail = await productDetail.
      const public_id = product?.image
        ?.split("/")
        .slice(-1)
        .toString()
        .split(".")[0];
      await deleteFromCloudinary(public_id);
      res.status(200).json(new ApiResponse(200, product, "product deleted"));
    }
  } catch (error) {
    console.log(error?.message);
  }
});

const addProductDetails = asyncHandler(async (req, res) => {
  try {
    const {
      description,
      quantity,
      quantityUnit,
      rating,
      specifications,
      productId,
    } = req.body;
    console.log(req.body, "req.body");
    if (
      !description ||
      !quantity ||
      !quantityUnit ||
      !rating ||
      !specifications
    ) {
      res.status(400).json(new ApiResponse(400, {}, "All fields are required"));
    } else if (!productId || productId.length < 12) {
      res.status(400).json(new ApiResponse(400, {}, "Product id is required"));
    } else {
      const existedId = await ProductDetail.find({ product_id: productId });
      console.log(existedId, "existedId");
      if (existedId[0]?.product_id == productId) {
        res
          .status(400)
          .json(
            new ApiResponse(400, {}, "Data is already inserted for the product")
          );
      } else {
        const productDetails = await new ProductDetail({
          product_id: productId,
          description,
          quantity,
          quanity_unit: quantityUnit,
          specification: specifications.map((item) => {
            return {
              name: item.name,
              value: item.value,
            };
          }),
          rating,
        });
        await productDetails.save();
        console.log(productDetails, "productDetails");
        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              productDetails,
              "Product Details has been added"
            )
          );
      }
    }
  } catch (error) {
    console.log(error.message);
  }
});

// const getSubCategory = asyncHandler(async (req, res) => {
//   try {
//     const category = decodeURIComponent(req.query.category);
//     // console.log(decodeURIComponent(category),"category")
//     const mainCategory = await Category.find({ name: category });
//     if (mainCategory?.length == 0) {
//       res.status(400).json(new ApiResponse(400, {}, "No data found"));
//     } else {
//       const catId = mainCategory && mainCategory?.[0]?._id;
//       const subcatList = await SubCategory.find({ mainCategory: catId }).select(
//         "-mainCategory"
//       );

//       if (subcatList?.length > 0) {
//         res
//           .status(200)
//           .json(
//             new ApiResponse(200, subcatList, "sub categories list fetched")
//           );
//       } else {
//         res.status(400).json(new ApiResponse(400, {}, "No data found"));
//       }
//     }
//   } catch (error) {
//     console.log(error.message, "error");
//     res.status(400).json(new ApiResponse(400, {}, "No data found"));
//   }
// });

// const addProductToCart = asyncHandler(async (req, res) => {
//   try {
//     const {
//       product_name,
//       product_image_path,
//       product_qty,
//       product_price_detail,
//       product_id,
//     } = req.body;
//     if (
//       !product_name ||
//       !product_image_path ||
//       !product_qty ||
//       !product_price_detail
//     ) {
//       res
//         .status(400)
//         .json(new ApiResponse(400, {}, "please provide all fields"));
//     }
//     const existedProduct = await ProductCart.findOne({ productId: product_id });
//     // console.log(existedProduct, "existingproduct");
//     if (existedProduct) {
//       existedProduct.quantity += product_qty;
//       existedProduct.price.total_price =
//         existedProduct.quantity * product_price_detail.totalPrice;
//       existedProduct.price.net_price =
//         existedProduct.quantity * product_price_detail.netPrice;
//       await existedProduct.save();
//       res
//         .status(200)
//         .json(
//           new ApiResponse(
//             200,
//             existedProduct,
//             "product is already present in the cart"
//           )
//         );
//     }

//     if (!existedProduct) {
//       const cart = await new ProductCart({
//         name: product_name,
//         productImage: product_image_path,
//         price: {
//           total_price: product_price_detail.totalPrice,
//           discount: product_price_detail.discount,
//           net_price: product_price_detail.netPrice,
//           rating: product_price_detail.rating,
//           base_price:product_price_detail.basePrice
//         },
//         quantity: product_qty,
//         productId: product_id,
//       });
//       // console.log(cart, "cart");

//       await cart.save();
//       res.status(200).json(new ApiResponse(200, cart, "cart data inserted"));
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// });

// const cartproducts = asyncHandler(async (req, res) => {
//   try {
//     const cart = await ProductCart.find();
//     res.status(200).json(new ApiResponse(200, cart, "All categories fetched"));
//   } catch (error) {
//     console.log(error.message);
//   }
// });
// const deleteCartProducts = asyncHandler(async (req, res) => {
//   try {
//     const { id } = req.params;
//     const cart = await ProductCart.findByIdAndDelete(id).select(
//       "-price -quantity -productImage -productId"
//     );
//     if (!cart) {
//       res
//         .status(400)
//         .json(new ApiResponse(400, {}, "No product found to be deleted"));
//     } else {
//       res.status(200).json(new ApiResponse(200, cart, "One Item is deleted"));
//     }
//   } catch (error) {
//     console.log(error.message, "error");
//   }
// });

// const updateCartItems = asyncHandler(async (req, res) => {
//   try {
//     const { id, type } = req.query;
//     console.log(req.query);
//     const cart = await ProductCart.findById(id);
//     console.log(cart, "cart");
//     if (cart) {
//       if (type === "add") {
//         cart.quantity = cart.quantity + 1;
//         cart.price.total_price = cart.quantity * cart.price.total_price;
//         cart.price.net_price = cart.quantity * cart.price.net_price;
//         await cart.save();
//         console.log(cart,"updatedcartplus")
//         res
//           .status(200)
//           .json(new ApiResponse(200, cart, "Item updated to plus one"));
//       } else if (type === "minus") {
//         let basePrice = cart.price
//         cart.quantity = cart.quantity - 1;
//         // cart.price.total_price = ;
//         cart.price.net_price = cart.quantity * cart.price.net_price;
//         await cart.save();
//         console.log(cart,"updatedcartminus")
//         res
//           .status(200)
//           .json(new ApiResponse(200, cart, "Item updated to minus one"));
//       }
//     } else {
//       res
//         .status(400)
//         .json(new ApiResponse(400, {}, "No product found to be updated"));
//     }
//   } catch (error) {
//     console.log(error.message, "error-message");
//   }
// });

export {
  createCategory,
  createProduct,
  getCategory,
  getProducts,
  deleteProduct,
  addProductDetails,
  editProductDetails,
  // getSubCategory,
  // addProductToCart,
  // cartproducts,
  // deleteCartProducts,
  // updateCartItems,
};
