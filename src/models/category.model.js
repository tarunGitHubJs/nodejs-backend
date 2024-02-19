// import mongoose, { Schema } from "mongoose";

// const subCategorySchema = new Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   description: {
//     type: String,
//     required: true,
//   },
// });
// const categorySchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       unqiue: true,
//     },
//     description: {
//       type: String,
//       required: true,
//     },
//     subCategories: [subCategorySchema],
//   },
//   { timestamps: true }
// );

// export const Category = mongoose.model("Category", categorySchema);
import mongoose, { Schema } from "mongoose";

const subCategorySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  subCatImage: {
    type: String,
    required: true,
  },
  price: {
    total_price: { type: Number, required: true },
    discount: { type: Number, required: true },
    net_price: { type: Number, required: true },
    rating: { type: Number, required: true },
  },

  tags: {
    ISI_tag: { type: Boolean, required: true },
    assured_tag: { type: Boolean, required: true },
  },
  mainCategory: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
});

export const SubCategory = mongoose.model("SubCategory", subCategorySchema);

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unqiue: true,
    },
    catImage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);
