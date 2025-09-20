import express from "express";
import Product from "../models/Product.js";
import Shop from "../models/Shop.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Public: list products by shop
router.get("/", async (req, res) => {
  const { shopId } = req.query;
  if (!shopId) return res.status(400).json({ error: "shopId query is required" });
  const products = await Product.find({ shop: shopId, isActive: true }).sort({ createdAt: -1 });
  res.json(products);
});

// Shop owner: list my products
router.get("/mine", requireAuth, requireRole("shop"), async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return res.status(400).json({ error: "Create your shop first" });
  const products = await Product.find({ shop: shop._id }).sort({ createdAt: -1 });
  res.json(products);
});

// Shop owner: create product
router.post("/", requireAuth, requireRole("shop"), async (req, res) => {
  const { name, description, price, stock, imageUrl, isActive } = req.body;
  if (!name || price == null) return res.status(400).json({ error: "name and price are required" });
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return res.status(400).json({ error: "Create your shop first" });
  const product = await Product.create({ shop: shop._id, name, description, price, stock, imageUrl, isActive });
  res.json(product);
});

// Shop owner: update product
router.put("/:id", requireAuth, requireRole("shop"), async (req, res) => {
  const { id } = req.params;
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return res.status(400).json({ error: "Create your shop first" });
  const product = await Product.findOne({ _id: id, shop: shop._id });
  if (!product) return res.status(404).json({ error: "Product not found" });
  const fields = ["name","description","price","stock","imageUrl","isActive"];
  fields.forEach(f => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });
  await product.save();
  res.json(product);
});

// Shop owner: delete product
router.delete("/:id", requireAuth, requireRole("shop"), async (req, res) => {
  const { id } = req.params;
  const shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) return res.status(400).json({ error: "Create your shop first" });
  const product = await Product.findOneAndDelete({ _id: id, shop: shop._id });
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json({ ok: true });
});

export default router;
