
const express = require("express");

const {
  getSettings,
  getLowStockAlerts,
  updateSettings,
  backupHistory,
  createManualBackup,
  downloadBackup,
  getUserProfile,
updateUserProfile,
updateAccountCredentials,
} = require("../controllers/settingsController");

const authenticate = require("../middleware/authenticate");
const authorizeOwner = require("../middleware/authorizeOwner");

const router = express.Router();

// Settings
router.get("/", authenticate, getSettings);
router.get("/low-stock-alerts", authenticate, getLowStockAlerts);
router.put("/", authenticate, updateSettings);

// User Profile
router.get("/profile", authenticate, getUserProfile);
router.put("/profile", authenticate, updateUserProfile);

// Update logged-in user's username and password
router.put("/account", authenticate, updateAccountCredentials);

// Owner-only backup features
router.get("/backups", authenticate, authorizeOwner, backupHistory);
router.post("/backups", authenticate, authorizeOwner, createManualBackup);
router.get(
  "/backups/:filename/download",
  authenticate,
  authorizeOwner,
  downloadBackup
);

module.exports = router;
