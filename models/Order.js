import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true }, // snapshot
    price: { type: Number, required: true }, // snapshot
    qty: { type: Number, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true, index: true },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true },
    address: { type: String, default: "" },
    paymentMode: { type: String, enum: ["COD"], default: "COD" },
    status: { 
      type: String, 
      enum: ["placed", "accepted", "packed", "out_for_delivery", "delivered", "cancelled"], 
      default: "placed" 
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
