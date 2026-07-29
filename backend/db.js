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

      CREATE TABLE IF NOT EXISTS reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reporter_id TEXT NOT NULL,
        reported_id TEXT,
        related_job_id INTEGER,
        reason TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'OPEN',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        admin_id TEXT NOT NULL,
        action TEXT NOT NULL,
        target TEXT NOT NULL,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS direct_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        owner_id TEXT NOT NULL,
        laborer_id TEXT NOT NULL,
        work_title TEXT NOT NULL,
        wage TEXT NOT NULL,
        status TEXT DEFAULT 'PENDING',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS login_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        success INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS cms_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add status column to users if it doesn't exist
    try {
      await db.exec(`ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'ACTIVE'`);
      console.log("Added status column to users table.");
    } catch (e) {
      // Column already exists
    }

    try {
      await db.exec(`ALTER TABLE users ADD COLUMN password_hash TEXT`);
      await db.exec(`ALTER TABLE users ADD COLUMN password_salt TEXT`);
      console.log("Added password columns to users table.");
    } catch (e) {
      // Columns already exist
    }

    try {
      await db.exec(`ALTER TABLE users ADD COLUMN gender TEXT DEFAULT 'Unspecified'`);
      console.log("Added gender column to users table.");
    } catch (e) {
      // Column already exists
    }

    // Initialize default settings if empty
    const existingSettings = await db.all(`SELECT count(*) as count FROM settings`);
    if (existingSettings[0].count === 0) {
      await db.run(`INSERT INTO settings (key, value, description) VALUES 
        ('site_name', 'FarmConnect', 'Name of the application'),
        ('maintenance_mode', 'false', 'Enable maintenance mode'),
        ('allow_new_registrations', 'true', 'Allow new users to register'),
        ('default_currency', 'INR', 'Default currency code'),
        ('support_email', 'support@farmconnect.com', 'Contact email for users')
      `);
      console.log("Initialized default admin settings.");
    }

    console.log("Database initialized successfully (SQLite)");
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

const logAuditAction = async (adminId, action, target, metadata = null) => {
  try {
    await run(
      `INSERT INTO audit_logs (admin_id, action, target, metadata) VALUES (?, ?, ?, ?)`,
      [adminId, action, target, metadata ? JSON.stringify(metadata) : null]
    );
  } catch (err) {
    console.error("Audit Log Error:", err);
  }
};

module.exports = {
  initDb,
  query,
  run,
  get,
  logAuditAction
};
