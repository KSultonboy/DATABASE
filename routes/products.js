// routes/products.js
const express = require("express");
const router = express.Router();
const db = require("../db/database");
const multer = require("multer");
const path = require("path");

// ======= FILE UPLOAD SETUP =======
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ======= ROUTES =======

// POST /products (rasm bilan)
router.post("/", upload.single("image"), (req, res) => {
  const { name, category, price, description } = req.body;
  const image = req.file?.filename;

  if (!name || !category || !price) {
    return res.status(400).send("❌ Majburiy maydonlar to‘ldirilmagan");
  }

  db.run(
    `INSERT INTO products (name, category, price, image, description) VALUES (?, ?, ?, ?, ?)`,
    [name, category, price, image || "", description || ""],
    (err) => {
      if (err) return res.status(500).send("❌ Mahsulotni saqlashda xatolik: " + err.message);
      res.send("✅ Mahsulot muvaffaqiyatli qo‘shildi");
    }
  );
});


// GET /products
router.get("/", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).send("Xatolik: " + err.message);
    res.json(rows); // 👈 MUHIM: JSON yuborilishi kerak!
  });
});


// DELETE /products/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM products WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).send("❌ O‘chirishda xatolik: " + err.message);
    if (this.changes === 0) return res.status(404).send("❌ Mahsulot topilmadi");
    res.send("🗑️ Mahsulot muvaffaqiyatli o‘chirildi");
  });
});

// PUT /products/:id
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { name, category, price, image, description } = req.body;

  db.run(
    `UPDATE products SET name = ?, category = ?, price = ?, image = ?, description = ? WHERE id = ?`,
    [name, category, price, image || "", description || "", id],
    function (err) {
      if (err) return res.status(500).send("❌ Yangilashda xatolik: " + err.message);
      if (this.changes === 0) return res.status(404).send("❌ Mahsulot topilmadi");
      res.send("✏️ Mahsulot muvaffaqiyatli yangilandi");
    }
  );
});


module.exports = router;
