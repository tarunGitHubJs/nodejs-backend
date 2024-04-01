import mongoose, { Schema } from "mongoose";
const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

const emailSchema = new Schema({
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
});

export const Email = mongoose.model("Email", emailSchema);
