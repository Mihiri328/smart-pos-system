
const db = require("../config/database");
const bcrypt = require("bcryptjs");

const {
  createBackup,
  getBackupHistory,
  getBackupFile,
} = require("../services/backupService");

// GET: Retrieve store settings
const getSettings = async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM store_settings WHERE id = 1"
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Settings not found.",
      });
    }

    res.json({ settings: rows[0] });
  } catch (error) {
    console.error("getSettings error:", error);
    res.status(500).json({
      message: "Failed to retrieve settings.",
    });
  }
};

// GET: Retrieve low stock alerts
const getLowStockAlerts = async (req, res) => {
  try {
    const [settings] = await db.execute(
      "SELECT low_stock_alerts FROM store_settings WHERE id = 1"
    );

    if (settings.length === 0) {
      return res.status(404).json({
        message: "Settings not found.",
      });
    }

    if (!settings[0].low_stock_alerts) {
      return res.json({
        enabled: false,
        items: [],
      });
    }

    const [items] = await db.execute(
      `SELECT item_id, item_name, quantity
       FROM item
       WHERE quantity <= 10
       ORDER BY quantity ASC`
    );

    res.json({
      enabled: true,
      items,
    });
  } catch (error) {
    console.error("getLowStockAlerts error:", error);
    res.status(500).json({
      message: "Failed to retrieve low stock alerts.",
    });
  }
};


// PUT: Update store settings
const updateSettings = async (req, res) => {
  try {
    const {
      storeName,
      registrationNumber,
      address,
      phone,
      whatsapp,
      currency,
      taxEnabled,
      taxRate,
      receiptFooter,
      autoBackup,
      lowStockAlerts,
    } = req.body;

    // Validate required text fields
    if (
      typeof storeName !== "string" ||
      !storeName.trim() ||
      storeName.length > 100
    ) {
      return res.status(400).json({
        message: "Please enter a valid store name.",
      });
    }

    if (
      registrationNumber != null &&
      (typeof registrationNumber !== "string" ||
        registrationNumber.length > 50)
    ) {
      return res.status(400).json({
        message: "Invalid registration number.",
      });
    }

    if (!["LKR", "USD", "INR"].includes(currency)) {
      return res.status(400).json({
        message: "Invalid store currency.",
      });
    }

    const rate = Number(taxRate);

    if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
      return res.status(400).json({
        message: "Tax rate must be between 0 and 100.",
      });
    }

    const validBoolean = (value) =>
      value === true || value === false ||
      value === 1 || value === 0;

    if (
      !validBoolean(taxEnabled) ||
      !validBoolean(autoBackup) ||
      !validBoolean(lowStockAlerts)
    ) {
      return res.status(400).json({
        message: "Invalid settings toggle value.",
      });
    }

    
    await db.execute(
      `UPDATE store_settings SET
        store_name = ?,
        registration_number = ?,
        address = ?,
        phone = ?,
        whatsapp = ?,
        currency = ?,
        tax_enabled = ?,
        tax_rate = ?,
        receipt_footer = ?,
        auto_backup = ?,
        low_stock_alerts = ?
       WHERE id = 1`,
      [
        storeName.trim(),
        registrationNumber || null,
        address || null,
        phone || null,
        whatsapp || null,
        currency,
        Number(taxEnabled),
        rate,
        receiptFooter || null,
        Number(autoBackup),
        Number(lowStockAlerts),
      ]
    );

    res.json({
      message: "Settings updated successfully.",
    });
  } catch (error) {
    console.error("updateSettings error:", error);

    res.status(500).json({
      message: "Failed to update settings.",
    });
  }
};


// GET: Backup history
const backupHistory = async (req, res) => {
  try {
    const backups = getBackupHistory();

    res.json({ backups });
  } catch (error) {
    console.error("Backup history error:", error);
    res.status(500).json({
      message: "Failed to retrieve backup history.",
    });
  }
};

// POST: Create backup manually
const createManualBackup = async (req, res) => {
  try {
    const success = await createBackup(true);

    if (!success) {
      return res.status(409).json({
        message: "A backup is already running or the backup could not be created.",
      });
    }

    res.json({
      message: "Database backup created successfully.",
    });
  } catch (error) {
    console.error("Manual backup error:", error);
    res.status(500).json({
      message: "Failed to create database backup.",
    });
  }
};

// GET: Download selected backup
const downloadBackup = async (req, res) => {
  try {
    const filePath = getBackupFile(req.params.filename);

    if (!filePath) {
      return res.status(404).json({
        message: "Backup file not found.",
      });
    }

    res.download(filePath, (error) => {
      if (error) {
        console.error("Backup download error:", error);

        if (!res.headersSent) {
          res.status(500).json({
            message: "Failed to download backup.",
          });
        }
      }
    });
  } catch (error) {
    console.error("Download backup error:", error);
    res.status(500).json({
      message: "Failed to download backup.",
    });
  }
};

// ================= USER PROFILE =================

// Get logged-in user's profile
const getUserProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT
         u.id,
         u.name,
         up.full_name,
         up.profile_photo
       FROM users u
       LEFT JOIN user_profiles up
         ON u.id = up.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.json({
      profile: {
        userId: rows[0].id,
        fullName: rows[0].full_name || rows[0].name,
        profilePhoto: rows[0].profile_photo,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      message: "Failed to load profile.",
    });
  }
};


// Update logged-in user's profile
const updateUserProfile = async (req, res) => {
  try {
    const { fullName, profilePhoto } = req.body;

    if (
      typeof fullName !== "string" ||
      !fullName.trim() ||
      fullName.trim().length > 150
    ) {
      return res.status(400).json({
        message: "Please enter a valid full name.",
      });
    }

    let photo = null;

    if (profilePhoto) {
      if (
        typeof profilePhoto !== "string" ||
        !/^data:image\/(jpeg|png|webp);base64,/.test(profilePhoto)
      ) {
        return res.status(400).json({
          message: "Invalid profile picture format.",
        });
      }

      const imageSize = Buffer.from(
        profilePhoto.split(",")[1],
        "base64"
      ).length;

      if (imageSize > 1024 * 1024) {
        return res.status(400).json({
          message: "Profile picture must be smaller than 5MB.",
        });
      }

      photo = profilePhoto;
    }

    await db.execute(
      `INSERT INTO user_profiles (user_id, full_name, profile_photo)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       full_name = VALUES(full_name),
       profile_photo = COALESCE(VALUES(profile_photo), profile_photo)`,
      [req.user.id, fullName.trim(), photo]
    );

    res.json({
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Failed to update profile.",
    });
  }
};


// Update logged-in user's username and password
const updateAccountCredentials = async (req, res) => {
  try {
    const {
      currentPassword,
      newUsername,
      newPassword,
    } = req.body || {};

    if (
      typeof currentPassword !== "string" ||
      !currentPassword
    ) {
      return res.status(400).json({
        message: "Please enter your current password.",
      });
    }

    const usernameProvided = newUsername !== undefined &&
      newUsername !== "";

    const passwordProvided = newPassword !== undefined &&
      newPassword !== "";

    if (!usernameProvided && !passwordProvided) {
      return res.status(400).json({
        message: "Please enter a new username or password.",
      });
    }

    if (
      usernameProvided &&
      (typeof newUsername !== "string" ||
        !newUsername.trim() ||
        newUsername.trim().length > 100)
    ) {
      return res.status(400).json({
        message: "Please enter a valid username.",
      });
    }

    if (
      passwordProvided &&
      (typeof newPassword !== "string" ||
        newPassword.length < 6 ||
        !/[a-z]/.test(newPassword) ||
        !/[A-Z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword))
    ) {
      return res.status(400).json({
        message:
          "Password must contain at least 6 characters, an uppercase letter, a lowercase letter, and a number.",
      });
    }

    const [users] = await db.execute(
      "SELECT username, password_hash FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        message: "User account not found.",
      });
    }

    const user = users[0];

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Current password is incorrect.",
      });
    }

    if (usernameProvided) {
      const username = newUsername.trim();

      const [existingUsers] = await db.execute(
        "SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1",
        [username, req.user.id]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({
          message: "This username is already taken.",
        });
      }
    }

    const updates = [];
    const values = [];

    if (usernameProvided) {
      updates.push("username = ?");
      values.push(newUsername.trim());
    }

    if (passwordProvided) {
      const passwordHash = await bcrypt.hash(newPassword, 12);
      updates.push("password_hash = ?");
      values.push(passwordHash);
    }

    values.push(req.user.id);

    await db.execute(
      `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return res.json({
      message: "Account details updated successfully.",
    });
  } catch (error) {
    console.error("Update account credentials error:", error);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "This username is already taken.",
      });
    }

    return res.status(500).json({
      message: "Failed to update account details.",
    });
  }
};


module.exports = {
  getSettings,
  getLowStockAlerts,
  updateSettings,
  backupHistory,
  createManualBackup,
  downloadBackup,
  getUserProfile,
  updateUserProfile,
  updateAccountCredentials,
};
