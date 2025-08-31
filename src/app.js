import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import productsRouter from "./products/products.routes.js";

// ใช้ 127.0.0.1 จะเสถียรกว่า localhost บนบางเครื่อง
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/express_crud";

await mongoose.connect(MONGO_URI);
mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err));

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/products", productsRouter);

// error handler กลาง (ต้องวางท้ายสุด)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ message: err.message ?? "Internal error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
