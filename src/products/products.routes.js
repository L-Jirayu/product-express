import { Router } from "express";
import { list, getById, create, update, remove } from "./products.controller.js";

const router = Router();

// ตัวอย่าง: GET /products?q=key&minPrice=500&maxPrice=2000&tag=gear&sort=-price&page=1&limit=20
router.get("/", list);
router.get("/:id", getById);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);

export default router;
