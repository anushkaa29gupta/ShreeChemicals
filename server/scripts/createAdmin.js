const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const readline = require("readline");

const Admin = require("../models/Admin");

dotenv.config({ path: require("path").join(__dirname, "../.env") });

const ADMIN_EMAIL = "01shreechemicals@gmail.com";
const ADMIN_NAME = "Shree Chemicals Maintainer";

function getHiddenPassword(promptText) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdin.setRawMode) {
      reject(new Error("Please run this script in a terminal that supports hidden input."));
      return;
    }

    process.stdout.write(promptText);

    let password = "";

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    const onData = (key) => {
      if (key === "\u0003") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdout.write("\nCancelled.\n");
        reject(new Error("Cancelled by user."));
        return;
      }

      if (key === "\r" || key === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
        return;
      }

      if (key === "\u007f" || key === "\b") {
  if (password.length > 0) {
    password = password.slice(0, -1);
    process.stdout.write("\b \b");
  }
  return;
}

if (key >= " " && key <= "~") {
  password += key;
  process.stdout.write("*");
}
    };

    process.stdin.on("data", onData);
  });
}

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from server/.env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");

    const existingAdmin = await Admin.findOne({
      email: ADMIN_EMAIL.toLowerCase(),
    });

    if (existingAdmin) {
      console.log("An admin with this email already exists.");
      console.log("No changes were made.");
      return;
    }

    const password = await getHiddenPassword("Enter new admin password: ");
    const confirmPassword = await getHiddenPassword("Confirm password: ");

    if (password !== confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    if (password.length < 12) {
      throw new Error("Password must contain at least 12 characters.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL.toLowerCase(),
      password: hashedPassword,
    });

    console.log("\nMaintainer account created successfully!");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password stored as bcrypt hash.");
    console.log("You can now log in through the Admin login page.");
  } catch (error) {
    console.error("\nAdmin creation failed:", error.message);
  } finally {
    await mongoose.disconnect().catch(() => {});
    console.log("MongoDB connection closed.");
  }
}

createAdmin();