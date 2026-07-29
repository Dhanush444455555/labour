const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

// Securely hash password using scrypt
const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve({ salt, hash: derivedKey.toString('hex') });
    });
  });
};

async function makeAdmin() {
  const phone = process.argv[2];
  if (!phone) {
    console.error("Usage: node setupAdmin.js <phone_number>");
    process.exit(1);
  }

  try {
    const password = await question("Enter a new password for this Admin account: ");
    if (!password || password.length < 6) {
      console.error("Password must be at least 6 characters long.");
      process.exit(1);
    }

    const { salt, hash } = await hashPassword(password);

    const db = await open({
      filename: path.join(__dirname, 'farm_connect.sqlite'),
      driver: sqlite3.Database
    });

    const user = await db.get('SELECT * FROM users WHERE phone_number = ?', [phone]);
    if (!user) {
      console.error(`User with phone number ${phone} not found. Please log in on the frontend first to create the account.`);
      process.exit(1);
    }

    await db.run(
      "UPDATE users SET role = 'owner', password_hash = ?, password_salt = ? WHERE phone_number = ?", 
      [hash, salt, phone]
    );
    console.log(`Success! User ${user.name || phone} is now an OWNER.`);
    console.log("You can now log into the application using your phone number and the new password at /admin/login.");
    
  } catch (err) {
    console.error("Database error:", err);
  } finally {
    rl.close();
  }
}

makeAdmin();
