import mongoose from "mongoose";

// --- Schema/Model (ประกาศในไฟล์นี้เพื่อให้ใช้งานได้เลย) ---
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: "text" },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true } // createdAt, updatedAt
);

// index เพิ่มเติมสำหรับคิวรีทั่วไป
ProductSchema.index({ price: 1, stock: 1 });

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

// --- Controllers ---

export const list = async (req, res, next) => {
  try {
    const {
      q,               // ค้นหาข้อความ (full-text ที่ name/tags)
      minPrice,
      maxPrice,
      tag,
      sort = "-updatedAt", // e.g. "price" หรือ "-price"
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    // ถ้าตั้ง text index แล้ว ใช้ $text ได้
    if (q) {
      // ถ้าอยาก fallback regex ให้ใช้บรรทัดด้านล่างแทน $text
      // filter.name = { $regex: String(q), $options: "i" };
      filter.$text = { $search: String(q) };
    }
    if (tag) filter.tags = String(tag);
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const toSort = {};
    if (sort) {
      const s = String(sort);
      const desc = s.startsWith("-");
      const field = desc ? s.slice(1) : s;
      toSort[field] = desc ? -1 : 1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filter).sort(toSort).skip(skip).limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const doc = await Product.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { next(err); }
};

export const create = async (req, res, next) => {
  try {
    const { name, price, stock = 0, tags = [] } = req.body || {};
    if (!name || price == null) {
      return res.status(400).json({ message: "name & price are required" });
    }
    const doc = await Product.create({ name, price, stock, tags });
    res.status(201).json(doc);
  } catch (err) { next(err); }
};

export const update = async (req, res, next) => {
  try {
    const allowed = ["name", "price", "stock", "tags"];
    const payload = {};
    for (const k of Object.keys(req.body || {})) {
      if (allowed.includes(k)) payload[k] = req.body[k];
    }
    const doc = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { next(err); }
};

export const remove = async (req, res, next) => {
  try {
    const doc = await Product.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) { next(err); }
};
