// routes/production.js
const express = require("express");
const router = express.Router();
const db = require("../db/database");

router.post("/production", (req, res) => {
  const { name, quantity, unit, date } = req.body;
  db.run(
    "INSERT INTO production (name, quantity, unit, date) VALUES (?, ?, ?, ?)",
    [name, quantity, unit, date],
    err => {
      if (err) return res.status(500).send("❌ Yozishda xatolik: " + err.message);
      res.send("✅ Ishlab chiqarilgan mahsulot qo‘shildi");
    }
  );
});


router.get("/", (req, res) => {
  db.all("SELECT * FROM production", [], (err, rows) => {
    if (err) return res.status(500).send("Xatolik: " + err.message);
    res.json(rows);
  });
});

module.exports = router;
