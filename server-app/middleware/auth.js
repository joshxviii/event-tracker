const jwt = require('jsonwebtoken');

// Parses a Bearer token (if present) and attaches a lightweight `req.user` object.
// This middleware is non-blocking: it doesn't require a token, it only parses one
// if provided. Use the exported `requireAuth` to enforce authentication on
// specific routes.
function parseToken(req, res, next) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    req.user = null;
    return next();
  }

  const token = match[1];
  try {
    const secret = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY;
    if (!secret) {
      console.warn('JWT secret not set; token verification skipped');
      // still attempt decode without verification
      const payload = jwt.decode(token);
      const userId = payload?.userId || payload?.id || payload?.sub;
      req.user = userId ? { userId, role: payload?.role || 'user', payload } : null;
      return next();
    }

    const payload = jwt.verify(token, secret);
    const userId = payload?.userId || payload?.id || payload?.sub;
    req.user = userId ? { userId, role: payload?.role || 'user', payload } : null;
  } catch (err) {
    // silent fail: don't block, leave req.user null
    console.warn('Failed to verify JWT token:', err.message);
    req.user = null;
  }

  return next();
}

// Enforce that a valid parsed token exists and contains a user id.
function requireAuth(req, res, next) {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  return next();
}

module.exports = { parseToken, requireAuth };
