const Database = require('better-sqlite3');
const db = new Database('./ruxshona.db');
module.exports = db;

db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT,
    price INTEGER,
    image TEXT,
    description TEXT
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS branch_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch TEXT NOT NULL,
    product TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    price INTEGER NOT NULL,
    date TEXT NOT NULL
  )
`);





module.exports = db;
