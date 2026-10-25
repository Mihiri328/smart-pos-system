const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const db = require("../config/database");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-auth"
    : "auth";

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

function createAuthToken(userId, rememberMe) {
  return jwt.sign(
    {},
    process.env.JWT_SECRET,
    {
      subject: String(userId),
      expiresIn: rememberMe ? "30d" : "1d",
      issuer: "smart-pos-system",
      audience: "smart-pos-client",
      algorithm: "HS256",
    }
  );
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email,
  };
}

function isValidPassword(password) {
  return (
    typeof password === "string" &&
    password.length >= 12 &&
    password.length <= 72 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

function createMailer() {
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASSWORD ||
    !process.env.SMTP_FROM
  ) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

// --------------------------------------------------
// POST /api/auth/login
// --------------------------------------------------
router.post("/login", async (req, res, next) => {
  try {
    const { username, password, rememberMe = false } = req.body || {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Username/email and password are required.",
      });
    }

    const [users] = await db.execute(
      `SELECT id, username, name, email, password_hash
       FROM users
       WHERE username = ? OR email = ?
       LIMIT 1`,
      [username.trim(), username.trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        message: "Invalid username/email or password.",
      });
    }

    const user = users[0];
    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid username/email or password.",
      });
    }

    const shouldRemember = rememberMe === true;
    const token = createAuthToken(user.id, shouldRemember);

    res.cookie(COOKIE_NAME, token, {
      ...cookieOptions,
      ...(shouldRemember
        ? { maxAge: 30 * 24 * 60 * 60 * 1000 }
        : {}),
    });

    return res.json({
      message: "Login successful.",
      user: publicUser(user),
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// GET /api/auth/me
// --------------------------------------------------
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const [users] = await db.execute(
      `SELECT id, username, name, email
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (users.length === 0) {
      res.clearCookie(COOKIE_NAME, cookieOptions);

      return res.status(401).json({
        message: "User account not found.",
      });
    }

    return res.json({
      user: publicUser(users[0]),
    });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// POST /api/auth/logout
// --------------------------------------------------
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, cookieOptions);

  return res.json({
    message: "Logged out successfully.",
  });
});

// --------------------------------------------------
// POST /api/auth/forgot-password
// --------------------------------------------------
router.post("/forgot-password", async (req, res, next) => {
  try {
    const { email } = req.body || {};

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Please enter a valid email address.",
      });
    }

    const [users] = await db.execute(
      `SELECT id, name, email
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email.trim()]
    );

    // Use the same response whether the email exists or not.
    const genericMessage =
      "If an account exists for that email, a password-reset link will be sent.";

    if (users.length === 0) {
      return res.json({ message: genericMessage });
    }

    const mailer = createMailer();

    if (!mailer) {
      console.error(
        "Password reset email is not configured. Check the SMTP environment variables."
      );

      return res.json({ message: genericMessage });
    }

    const user = users[0];

    // Invalidate older unused reset tokens for this user.
    await db.execute(
      `UPDATE password_resets
       SET used_at = UTC_TIMESTAMP()
       WHERE user_id = ? AND used_at IS NULL`,
      [user.id]
    );

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await db.execute(
      `INSERT INTO password_resets
         (user_id, token_hash, expires_at)
       VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 15 MINUTE))`,
      [user.id, tokenHash]
    );

    const clientUrl = process.env.CLIENT_URL;

    if (!clientUrl) {
      console.error("CLIENT_URL is not configured.");
      return res.json({ message: genericMessage });
    }

    const resetUrl = new URL("/reset-password", clientUrl);
    resetUrl.searchParams.set("token", rawToken);

    try {
  await mailer.sendMail({
    from: process.env.SMTP_FROM,
    to: user.email,
    subject: "Smart POS Password Reset",
    text: `Hello ${user.name},

We received a request to reset your Smart POS password.

Use this link within 15 minutes:
${resetUrl.toString()}

If you did not request this, you can ignore this email.`,
  });
} catch (mailError) {
  // Invalidate the token if email delivery fails.
  await db.execute(
    `UPDATE password_resets
     SET used_at = UTC_TIMESTAMP()
     WHERE token_hash = ?`,
    [tokenHash]
  );

  console.error("Password reset email failed:", mailError.message);
}

    return res.json({ message: genericMessage });
  } catch (error) {
    next(error);
  }
});

// --------------------------------------------------
// POST /api/auth/reset-password
// --------------------------------------------------
router.post("/reset-password", async (req, res, next) => {
  let connection;

  try {
    const { token, password } = req.body || {};

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token)
    ) {
      return res.status(400).json({
        message: "The password reset link is invalid or expired.",
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be 12–72 characters and contain an uppercase letter, a lowercase letter, and a number.",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const passwordHash = await bcrypt.hash(password, 12);

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [tokens] = await connection.execute(
      `SELECT id, user_id
       FROM password_resets
       WHERE token_hash = ?
         AND used_at IS NULL
         AND expires_at > UTC_TIMESTAMP()
       LIMIT 1
       FOR UPDATE`,
      [tokenHash]
    );

    if (tokens.length === 0) {
      await connection.rollback();

      return res.status(400).json({
        message: "The password reset link is invalid or expired.",
      });
    }

    const resetRecord = tokens[0];

    await connection.execute(
      `UPDATE users
       SET password_hash = ?
       WHERE id = ?`,
      [passwordHash, resetRecord.user_id]
    );

    // Consume this token and invalidate all other outstanding tokens.
    await connection.execute(
      `UPDATE password_resets
       SET used_at = UTC_TIMESTAMP()
       WHERE user_id = ? AND used_at IS NULL`,
      [resetRecord.user_id]
    );

    await connection.commit();

    return res.json({
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (error) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }

    next(error);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

module.exports = router;