const jwt = require("jsonwebtoken");

const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Host-auth"
    : "auth";

function authenticate(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];

  if (!token) {
    return res.status(401).json({
      message: "Please sign in to continue.",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: "smart-pos-system",
      audience: "smart-pos-client",
    });

    req.user = {
      id: payload.sub,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your session is invalid or has expired. Please sign in again.",
    });
  }
}

module.exports = authenticate;