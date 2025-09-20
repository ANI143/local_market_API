import express from "express";
import Shop from "../models/Shop.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// List active shops
router.get("/", async (req, res) => {
  const shops = await Shop.find({ isActive: true }).sort({ createdAt: -1 });
  res.json(shops);
});

// My shop (for shop owners)
router.get("/me", requireAuth, requireRole("shop"), async (req, res) => {
  const shop = await Shop.findOne({ owner: req.user._id });
  res.json(shop || null);
});

// Create or update shop
router.post("/", requireAuth, requireRole("shop"), async (req, res) => {
  const { name, address, phone, openTime, closeTime, isActive } = req.body;
  let shop = await Shop.findOne({ owner: req.user._id });
  if (!shop) {
    if (!name) return res.status(400).json({ error: "name is required to create shop" });
    shop = await Shop.create({ owner: req.user._id, name, address, phone, openTime, closeTime, isActive });
  } else {
    if (name !== undefined) shop.name = name;
    if (address !== undefined) shop.address = address;
    if (phone !== undefined) shop.phone = phone;
    if (openTime !== undefined) shop.openTime = openTime;
    if (closeTime !== undefined) shop.closeTime = closeTime;
    if (isActive !== undefined) shop.isActive = isActive;
    await shop.save();
  }
  res.json(shop);
});

export default router;
