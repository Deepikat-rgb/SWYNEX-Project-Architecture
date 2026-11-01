// TODO: verify the JWT cookie and attach req.user. Placeholder for the starter.
exports.requireLogin = (req, res, next) => next();
exports.requireRole = (role) => (req, res, next) => next();
