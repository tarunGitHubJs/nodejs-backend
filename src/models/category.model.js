import mongoose, { Schema } from "mongoose";

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    total_price: { type: Number, required: true },
    discount: { type: Number, required: true },
    net_price: { type: Number, required: true },
  },

  tags: {
    ISI_tag: { type: String, required: true },
    assured_tag: { type: String, required: true },
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: "Category",
  },
});

export const Product = mongoose.model("Product", productSchema);

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unqiue: true,
    },
  },
  { timestamps: true }
);

export const Category = mongoose.model("Category", categorySchema);

const productDetailSchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  quanity_unit: {
    type: String,
    required: true,
  },
  specification: [{ name: { type: String }, value: { type: String } }],
  rating: {
    type: Number,
  },
});

export const ProductDetail = mongoose.model(
  "ProductDetail",
  productDetailSchema
);

// const cartSchema



// const productCartSchema = new Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   productImage: {
//     type: String,
//     required: true,
//   },
//   price: {
//     total_price: { type: Number, required: true },
//     discount: { type: Number, required: true },
//     net_price: { type: Number, required: true },
//     rating: { type: Number, required: true },
//     base_price:{type:Number,required:true}
//   },
//   quantity:{
//     type:Number,
//     required:true
//   },
//   productId:{
//     type:String,
//     required:true
//   },
// });

// export const ProductCart = mongoose.model("ProductCart", productCartSchema);
