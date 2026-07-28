const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

const initDb = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT UNIQUE NOT NULL,
        phone_number TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        available_date DATE NOT NULL,
        status TEXT DEFAULT 'available',
        hired_by INTEGER REFERENCES users(id),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, available_date)
      );
    `);
    console.log("Database tables initialized successfully (SQLite)");
  } catch (err) {
    console.error("Error initializing database", err);
  }
};

const query = async (text, params = []) => {
  if (!db) {
      throw new Error("Database not initialized yet");
  }
  // Convert Postgres $1, $2 to SQLite ?, ?
  const sqliteText = text.replace(/\$\d+/g, '?');
  
  try {
      const rows = await db.all(sqliteText, params);
      return { rows };
  } catch (err) {
      console.error("Query Error:", err);
      throw err;
  }
};

module.exports = {
  initDb,
  query
};
