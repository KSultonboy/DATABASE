const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.post("/orders", (req, res) => {
  const { customer, product, quantity, unit, source, price, date, note } = req.body;
  db.run("INSERT INTO orders (customer, product, quantity, unit, source, price, date, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [customer, product, quantity, unit, source, price, date, note], err => {
    if (err) return res.status(500).send(err.message);
    res.send("✅ Buyurtma muvaffaqiyatli qo‘shildi");
  });
});

router.get("/orders", (_, res) => {
  db.all("SELECT * FROM orders ORDER BY date DESC", [], (err, rows) => {
    if (err) return res.status(500).send(err.message);
    res.json(rows);
  });
});

module.exports = router;