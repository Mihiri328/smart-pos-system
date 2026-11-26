
function authorizeOwner(req, res, next) {
  // Allow any authenticated user to access backup features
  next();
}

module.exports = authorizeOwner;
