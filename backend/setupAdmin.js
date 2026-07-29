const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function makeAdmin() {
  const phone = process.argv[2];
  if (!phone) {
    console.error("Usage: node setupAdmin.js <phone_number>");
    process.exit(1);
  }

  try {
    const db = await open({
      filename: path.join(__dirname, 'farm_connect.sqlite'),
      driver: sqlite3.Database
    });

    const user = await db.get('SELECT * FROM users WHERE phone_number = ?', [phone]);
    if (!user) {
      console.error(`User with phone number ${phone} not found.`);
      process.exit(1);
    }

    await db.run("UPDATE users SET role = 'owner' WHERE phone_number = ?", [phone]);
    console.log(`Success! User ${user.name || phone} is now an OWNER.`);
    console.log("You can now log into the application and access the /admin route.");
    
  } catch (err) {
    console.error("Database error:", err);
  }
}

makeAdmin();
