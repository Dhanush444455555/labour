const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

let db;

const initDb = async () => {
  try {
    db = await open({
      filename: path.join(__dirname, 'farm_connect.sqlite'),
      driver: sqlite3.Database
    });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uid TEXT UNIQUE NOT NULL,
        phone_number TEXT UNIQUE NOT NULL,
        name TEXT,
        role TEXT DEFAULT NULL,
        location TEXT,
        experience TEXT,
        expected_wage TEXT,
        skills TEXT,
        availability TEXT DEFAULT 'AVAILABLE',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hirer_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        work_date TEXT NOT NULL,
        work_time TEXT NOT NULL,
        wage TEXT NOT NULL,
        laborers_required INTEGER NOT NULL,
        hirer_name TEXT,
        hirer_phone TEXT,
        status TEXT DEFAULT 'OPEN',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS job_acceptances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL REFERENCES jobs(id),
        laborer_id TEXT NOT NULL,
        laborer_name TEXT NOT NULL,
        laborer_phone TEXT NOT NULL,
        status TEXT DEFAULT 'ACCEPTED',
        accepted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, laborer_id)
      );

      CREATE TABLE IF NOT EXISTS job_rejections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL REFERENCES jobs(id),
        laborer_id TEXT NOT NULL,
        rejected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(job_id, laborer_id)
      );

      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id TEXT NOT NULL,
        laborer_id TEXT NOT NULL,
        work_title TEXT NOT NULL,
        wage TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        related_job_id INTEGER,
        related_booking_id INTEGER,
        is_read INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS laborer_availability (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        laborer_id TEXT NOT NULL,
        available_date TEXT NOT NULL,
        status TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(laborer_id, available_date)
      );
    `);
    console.log("Database initialized successfully with 7 tables (SQLite)");
  } catch (err) {
    console.error("Error initializing database", err);
  }
};

const query = async (text, params = []) => {
  if (!db) {
    throw new Error("Database not initialized yet");
  }
  const sqliteText = text.replace(/\$\d+/g, '?');
  try {
    const rows = await db.all(sqliteText, params);
    return { rows };
  } catch (err) {
    console.error("Query Error:", err);
    throw err;
  }
};

const run = async (text, params = []) => {
  if (!db) {
    throw new Error("Database not initialized yet");
  }
  const sqliteText = text.replace(/\$\d+/g, '?');
  try {
    return await db.run(sqliteText, params);
  } catch (err) {
    console.error("Run Error:", err);
    throw err;
  }
};

const get = async (text, params = []) => {
  if (!db) {
    throw new Error("Database not initialized yet");
  }
  const sqliteText = text.replace(/\$\d+/g, '?');
  try {
    return await db.get(sqliteText, params);
  } catch (err) {
    console.error("Get Error:", err);
    throw err;
  }
};

module.exports = {
  initDb,
  query,
  run,
  get
};
