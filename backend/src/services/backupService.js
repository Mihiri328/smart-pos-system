
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { pipeline } = require("stream/promises");
const db = require("../config/database");

// MySQL dump executable
const MYSQLDUMP_PATH =
  process.env.MYSQLDUMP_PATH || "C:\\MySQL\\bin\\mysqldump.exe";

// Backup folder
const BACKUP_DIR = path.join(__dirname, "../../backups");

// Keep backups for 30 days
const RETENTION_DAYS = 30;

const BACKUP_PATTERN =
  /^smart-pos-backup-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.sql$/;

let backupRunning = false;
let midnightTimer = null;

// Create backup folder if it does not exist
function createBackupFolder() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

// Remove backups older than 30 days
function cleanOldBackups() {
  createBackupFolder();

  const now = Date.now();
  const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000;

  for (const file of fs.readdirSync(BACKUP_DIR)) {
    if (!BACKUP_PATTERN.test(file)) {
      continue;
    }

    const filePath = path.join(BACKUP_DIR, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile() && now - stats.mtimeMs > retentionMs) {
      fs.unlinkSync(filePath);
      console.log(`Old backup deleted: ${file}`);
    }
  }
}

// Create a database backup
// force = true allows manual backup even when automatic backup is OFF
async function createBackup(force = false) {
  if (backupRunning) {
    console.log("Backup already running. Skipping.");
    return false;
  }

  backupRunning = true;
  let filePath = null;

  try {
    if (!force) {
      const [rows] = await db.execute(
        "SELECT auto_backup FROM store_settings WHERE id = 1"
      );

      if (!rows.length || Number(rows[0].auto_backup) !== 1) {
        console.log("Automatic backup is disabled.");
        return false;
      }
    }

    createBackupFolder();

    const date = new Date();

    const timestamp = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0"),
      String(date.getSeconds()).padStart(2, "0"),
    ].join("-");

    filePath = path.join(
      BACKUP_DIR,
      `smart-pos-backup-${timestamp}.sql`
    );

    const args = [
      `--host=${process.env.DB_HOST || "localhost"}`,
      `--port=${process.env.DB_PORT || 3306}`,
      `--user=${process.env.DB_USER || "root"}`,
      "--single-transaction",
      "--routines",
      "--triggers",
      process.env.DB_NAME || "smart_pos_db",
    ];

    const output = fs.createWriteStream(filePath);

    const dump = spawn(MYSQLDUMP_PATH, args, {
      env: {
        ...process.env,
        MYSQL_PWD: process.env.DB_PASSWORD || "1234",
      },
      windowsHide: true,
    });

    let errorMessage = "";

    dump.stderr.on("data", (data) => {
      errorMessage += data.toString();
    });

    const processPromise = new Promise((resolve, reject) => {
      dump.on("error", reject);

      dump.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(errorMessage || `mysqldump exited with code ${code}`)
          );
        }
      });
    });

    await Promise.all([
      pipeline(dump.stdout, output),
      processPromise,
    ]);

    cleanOldBackups();

    console.log(`Database backup created: ${filePath}`);
    return true;
  } catch (error) {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    console.error("Database backup failed:", error.message);
    return false;
  } finally {
    backupRunning = false;
  }
}

// Get available backup history
function getBackupHistory() {
  createBackupFolder();

  cleanOldBackups();

  return fs.readdirSync(BACKUP_DIR)
    .filter((file) => BACKUP_PATTERN.test(file))
    .map((file) => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);

      return {
        filename: file,
        size: stats.size,
        createdAt: stats.mtime,
      };
    })
    .filter((backup) =>
      fs.statSync(path.join(BACKUP_DIR, backup.filename)).isFile()
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// Get a valid backup file for download
function getBackupFile(filename) {
  if (
    typeof filename !== "string" ||
    !BACKUP_PATTERN.test(filename) ||
    path.basename(filename) !== filename
  ) {
    return null;
  }

  const filePath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return null;
  }

  return filePath;
}

// Check whether today's backup already exists
function hasBackupToday() {
  createBackupFolder();

  const today = new Date();

  const datePrefix = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return fs.readdirSync(BACKUP_DIR).some(
    (file) =>
      file.startsWith(`smart-pos-backup-${datePrefix}-`) &&
      file.endsWith(".sql")
  );
}

// Schedule the next backup at midnight
function scheduleNextBackup() {
  const now = new Date();
  const nextMidnight = new Date(now);

  nextMidnight.setDate(nextMidnight.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);

  const delay = nextMidnight.getTime() - now.getTime();

  midnightTimer = setTimeout(async () => {
    await createBackup();
    scheduleNextBackup();
  }, delay);
}

// Start automatic backup scheduling
async function startAutomaticBackup() {
  console.log("Starting automatic backup scheduler...");

  cleanOldBackups();

  if (!hasBackupToday()) {
    await createBackup();
  }

  scheduleNextBackup();

  console.log("Automatic backup scheduler is ready.");
}

module.exports = {
  createBackup,
  getBackupHistory,
  getBackupFile,
  cleanOldBackups,
  startAutomaticBackup,
};
