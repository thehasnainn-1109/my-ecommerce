// Protects routes that require the user to be logged in.
// Relies on express-session: req.session.userId is set at login time.
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: "You must be logged in to do that." });
}

module.exports = { requireAuth };
