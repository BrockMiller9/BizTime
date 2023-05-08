const { Client } = require("pg");

let DB_URI;

process.env.PGPASSWORD = process.env.DB_PASSWORD;

if (process.env.NODE_ENV === "test") {
  DB_URI = "postgresql:///biztime_test";
} else {
  DB_URI = "postgresql:///biztime";
}

let db = new Client({
  connectionString: DB_URI,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect();

module.exports = db;
