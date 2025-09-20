import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Create order (customer)
router.post("/", requireAuth, requireRole("customer"), async (req, res) => {
  const { shopId, items, address } = req.body;
  if (!shopId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "shopId and non-empty items are required" });
  }
  const shop = await Shop.findById(shopId);
  if (!shop) return res.status(400).json({ error: "Invalid shopId" });

  // Build snapshot
  const productMap = new Map();
  const ids = items.map(i => i.productId);
  const prods = await Product.find({ _id: { $in: ids }, shop: shopId });
  prods.forEach(p => productMap.set(String(p._id), p));

  const snapItems = [];
  let total = 0;
  for (const it of items) {
    const p = productMap.get(String(it.productId));
    if (!p) return res.status(400).json({ error: `Invalid productId ${it.productId}` });
    const qty = Math.max(1, parseInt(it.qty || 1, 10));
    snapItems.push({ product: p._id, name: p.name, price: p.price, qty });
    total += p.price * qty;
  }

  const order = await Order.create({
    customer: req.user._id,
    shop: shopId,
    items: snapItems,
    total,
    address: address || ""
  });
  res.json(order);
});

// List my orders (customer) or shop orders (shop)
router.get("/", requireAuth, async (req, res) => {
  if (req.user.role === "customer") {
    const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } else if (req.user.role === "shop") {
    const shop = await Shop.findOne({ owner: req.user._id });
    if (!shop) return res.json([]);
    const orders = await Order.find({ shop: shop._id }).sort({ createdAt: -1 });
    return res.json(orders);
  } else {
    return res.status(400).json({ error: "Unknown role" });
  }
});

// Update order status (shop)
router.put("/:id/status", requireAuth, requireRole("shop"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const allowed = ["accepted","packed","out_for_delivery","delivered","cancelled"];
  if (!allowed.includes(status)) return res.status(400).json({ error: "Invalid status" });
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return res.status(400).json({ error: "Create your shop first" });
  const order = await Order.findOne({ _id: id, shop: shop._id });
  if (!order) return res.status(404).json({ error: "Order not found" });
  order.status = status;
  await order.save();
  res.json(order);
});

export default router;
