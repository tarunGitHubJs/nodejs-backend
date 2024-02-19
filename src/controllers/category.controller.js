// import { Category } from "../models/category.model.js";
// import { User } from "../models/user.modals.js";
// import { ApiResponse } from "../utils/apiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// const getCategoryData = async (data) => {
//   try {
//     const category = await Category.create(data);
//     return category;
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// const getSubCategoryData = async (id, data) => {
//   try {
//     const category = await Category.findById(id);
//     if (!category) {
//       throw new Error("Category not found");
//     }
//     if (category._id == id) {
//       const newSubcategory = new Category(data);
//       category.subCategories.push(newSubcategory);
//       const subCategory = await category.save();
//       return subCategory;
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

// const createCategory = asyncHandler(async (req, res) => {
//   try {
//     const { name, description } = req.body;
//     const topCategory = await Category.save({
//       name,
//       description,
//     });
//     const categoryData = await getCategoryData(topCategory);

//     return res
//       .status(200)
//       .json(new ApiResponse(200, categoryData, "One category inserted"));
//   } catch (error) {
//     console.log(error.message);
//   }
// });

// const createSubCategory = asyncHandler(async (req, res) => {
//   try {
//     const topCatId = "65c5bfb57964f1ca918314d2";
//     const { name, description } = req.body;
//     const category = await Category.create({
//       name,
//       description,
//     });
//     const subCatData = await getSubCategoryData(topCatId, category);
//     return res
//       .status(200)
//       .json(new ApiResponse(200, subCatData, "sub category inserted"));
//   } catch (error) {
//     console.log(error.message);
//   }
// });
// export { createCategory, createSubCategory };

// import { Category } from "../models/category.model.js";
// import { User } from "../models/user.modals.js";
// import { ApiResponse } from "../utils/apiResponse.js";
// import { asyncHandler } from "../utils/asyncHandler.js";

// const createCategory = asyncHandler(async (req, res) => {
//   try {
//     const main_category = await new Category({
//       name: req.body.name,
//     });
//     await main_category.save();
//     res
//       .status(200)
//       .json(
//         new ApiResponse(200, main_category, "A new main category is added")
//       );
//   } catch (error) {
//     console.log(error.message);
//   }
// });

// const createSubCategory = asyncHandler(async (req, res) => {
//   try {
//     const sub_category = await new Category({
//       name: req.body.name,
//       parentCategory: "65c5fd2dca2eeee59c860a34",
//     });
//     await sub_category.save();
//     res
//       .status(200)
//       .json(
//         new ApiResponse(200, sub_category, "A new sub  category is added")
//       );
//   } catch (error) {
//     console.log(error.message);
//   }
// });
// export { createCategory, createSubCategory };

import { Category, SubCategory } from "../models/category.model.js";
import { User } from "../models/user.modals.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createCategory = asyncHandler(async (req, res) => {
  try {
    const main_category = await Category.create({
      name: req.body.name,
      catImage: req.body.image,
    });
    await main_category.save();
    res
      .status(200)
      .json(new ApiResponse(200, main_category, "categgory is inserted"));
  } catch (error) {
    console.log(error.message);
  }
});

const createSubCategory = asyncHandler(async (req, res) => {
  try {
    const sub_category = await new SubCategory({
      name: req.body.name,
      subCatImage: req.body.image,
      price: {
        total_price: req.body.price.totalPrice,
        discount: req.body.price.discount,
        net_price: req.body.price.netPrice,
        rating: req.body.price.rating,
      },
      mainCategory: "65c69a3b5fc8714a487974a3",
      tags: {
        ISI_tag: req.body.tags.ISI_tag,
        assured_tag: req.body.tags.assuredTag,
      },
    });

    await sub_category.save();
    res
      .status(200)
      .json(new ApiResponse(200, sub_category, "sub-categgory is inserted"));
  } catch (error) {
    console.log(error.message);
  }
});
export { createCategory, createSubCategory };
