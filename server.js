// ======= SETUP =======
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const app = express();
const PORT = 3000;

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

// ======= ROUTES =======
app.use("/products", require("./routes/products"));
app.use("/production", require("./routes/production"));
app.use("/expenses", require("./routes/expenses"));
app.use("/orders", require("./routes/orders"));
app.use("/report", require("./routes/report")); 
app.use('/uploads', express.static('uploads'));
app.use("/branch-sales", require("./routes/branchSales"));





// ======= SERVER =======
app.listen(PORT, () => {
  console.log(`🚀 Server http://localhost:${PORT} da ishlayapti`);
});
