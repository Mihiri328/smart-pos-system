require("dotenv").config();

const bcrypt = require("bcryptjs");
const db = require("../src/config/database");

async function createUser() {
  try {
    const username = "admin";
    const name = "Smart POS Admin";
    const email = "admin@example.com";
    const password = "Admin@123456";

    console.log("Checking database connection...");

    await db.query("SELECT 1");

    console.log("Database connection successful.");

    // Check whether the user already exists
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUsers.length > 0) {
      console.log("User already exists. No new user was created.");
      return;
    }

    // Hash the password before storing it
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert the admin user
    const [result] = await db.execute(
      `INSERT INTO users
        (username, name, email, password_hash)
       VALUES (?, ?, ?, ?)`,
      [username, name, email, passwordHash]
    );

    console.log("\nAdmin user created successfully!");
    console.log("--------------------------------");
    console.log("User ID:", result.insertId);
    console.log("Username:", username);
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("--------------------------------");
    console.log("Please change the default password before production use.");
  } catch (error) {
    console.error("Failed to create admin user:", error.message);
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

createUser();