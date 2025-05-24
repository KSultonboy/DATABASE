// routes/branchSales.js
const express = require("express");
const router = express.Router();
const db = require("../db/database");

// YANGI SOTUV QO‘SHISH
router.post("/", (req, res) => {
  const { branch, product, quantity, unit, price, date } = req.body;
  if (!branch || !product || !quantity || !unit || !price || !date) {
    return res.status(400).send("❌ Barcha maydonlar to‘ldirilishi kerak");
  }

  db.run(
    `INSERT INTO branch_sales (branch, product, quantity, unit, price, date) VALUES (?, ?, ?, ?, ?, ?)`,
    [branch, product, quantity, unit, price, date],
    function (err) {
      if (err) return res.status(500).send("❌ Saqlashda xatolik: " + err.message);
      res.send("✅ Sotuv muvaffaqiyatli saqlandi");
    }
  );
});

// SOTUVLARNI O‘QISH (sana bo‘yicha filter opsional)
router.get("/", (req, res) => {
  const { date } = req.query;
  const query = date
    ? `SELECT * FROM branch_sales WHERE date = ?`
    : `SELECT * FROM branch_sales`;

  db.all(query, date ? [date] : [], (err, rows) => {
    if (err) return res.status(500).send("❌ O‘qishda xatolik: " + err.message);
    res.json(rows);
  });
});

module.exports = router;
