// ======= SETUP =======
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
// ======= FILE UPLOAD SETUP =======
const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });


app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// marshrutlar
app.use("/products", require("./routes/products"));
app.use("/expenses", require("./routes/expenses"));
app.use("/orders", require("./routes/orders"));
app.use("/production", require("./routes/production"));
app.use("/report", require("./routes/report"));
app.use("/branch-sales", require("./routes/branchSales"));



// serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
});