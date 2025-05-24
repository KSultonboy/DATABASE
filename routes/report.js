const express = require("express");
const router = express.Router();
const db = require("../db/database");
const { getDateRange } = require("../utils/dateHelpers");

router.get("/:type", (req, res) => {
  const { type } = req.params;
  const queryParam = req.query.date || req.query.week || req.query.month;

  if (!queryParam) return res.status(400).send("❌ Sana tanlanmagan");
  const { start, end } = getDateRange(type, queryParam);

  const report = {
    range: { start, end },
    total_production_kg: 0,
    total_production_dona: 0,
    store_sold_kg: 0,
    store_sold_kg_price: 0,
    store_sold_dona: 0,
    store_sold_dona_price: 0,
    total_orders: 0,
    total_order_income: 0,
    total_income: 0,
    total_expenses: 0,
    net_profit: 0,
    total_production_sum: 0,
    platforms: {},
    top_products: []
  };

  db.all(`SELECT quantity, unit FROM production WHERE date BETWEEN ? AND ?`, [start, end], (err, rows) => {
    if (err) return res.status(500).send("❌ Mahsulotlarni olishda xatolik: " + err.message);
    rows.forEach(row => {
      const unit = (row.unit || "").toLowerCase();
      const qty = parseFloat(row.quantity || 0);
      if (unit.includes("kg")) {
        report.total_production_kg += qty;
      } else {
        report.total_production_dona += qty;
      }
    });
    report.total_production_sum = report.total_production_kg + report.total_production_dona;

    db.get(`SELECT SUM(amount) as total FROM expenses WHERE date BETWEEN ? AND ?`, [start, end], (err, row) => {
      if (err) return res.status(500).send("❌ Xarajatlarni olishda xatolik: " + err.message);
      report.total_expenses = row?.total || 0;

      db.all(`SELECT product, quantity, unit, price, source FROM orders WHERE date BETWEEN ? AND ?`, [start, end], (err, orders) => {
        if (err) return res.status(500).send("❌ Buyurtmalarni olishda xatolik: " + err.message);
        report.total_orders = orders.length;

        const productSales = {};
        const platforms = {};
        let order_income = 0;

        orders.forEach(o => {
          const source = (o.source || '').toLowerCase();
          const isFilial = source === "filial";
          const qty = parseFloat(o.quantity || 0);
          const price = parseFloat(o.price || 0);
          const unit = (o.unit || '').toLowerCase();

          if (o.product) {
            productSales[o.product] = (productSales[o.product] || 0) + qty;
          }

          if (!isFilial) {
            platforms[source] = (platforms[source] || 0) + 1;
            order_income += qty * price;
          }
        });

        report.total_order_income = order_income;

        // === YANGI QISM: branch_sales dan olish ===
        db.get(`
          SELECT 
            SUM(CASE WHEN unit = 'kg' THEN quantity ELSE 0 END) AS total_kg,
            SUM(CASE WHEN unit = 'kg' THEN quantity * price ELSE 0 END) AS total_kg_price,
            SUM(CASE WHEN unit = 'dona' THEN quantity ELSE 0 END) AS total_dona,
            SUM(CASE WHEN unit = 'dona' THEN quantity * price ELSE 0 END) AS total_dona_price
          FROM branch_sales
          WHERE date BETWEEN ? AND ?
        `, [start, end], (err, branchData) => {
          if (err) return res.status(500).send("❌ Filial sotuvlarini olishda xatolik: " + err.message);

          report.store_sold_kg = branchData?.total_kg || 0;
          report.store_sold_kg_price = branchData?.total_kg_price || 0;
          report.store_sold_dona = branchData?.total_dona || 0;
          report.store_sold_dona_price = branchData?.total_dona_price || 0;

          report.total_income = report.total_order_income + report.store_sold_kg_price + report.store_sold_dona_price;
          report.net_profit = report.total_income - report.total_expenses;
          report.platforms = platforms;

          report.top_products = Object.entries(productSales)
            .map(([name, sold]) => ({ name, sold }))
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10);

          res.json(report);
        });
      });
    });
  });
});

module.exports = router;
