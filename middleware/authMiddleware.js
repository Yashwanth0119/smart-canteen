import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'canteen_super_secure_jwt_secret_key_2026_xyz';

/**
 * Authentication Middleware:
 * Verifies that the request carries a valid JSON Web Token (JWT)
 * passed via either Authorization Bearer header or HTTP-only cookie.
 * 
 * Returns HTTP 401 Unauthorized if the token is missing, invalid, or expired.
 */
export const authenticateJWT = (req, res, next) => {
  let token = null;

  // 1. Check Authorization header: 'Bearer <token>'
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // 2. Check HTTP-only cookie
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      code: 401,
      error: 'Unauthorized',
      message: 'Access denied (HTTP 401). No authentication token provided. Please log in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token (HTTP 401). Please re-authenticate.',
      details: error.message
    });
  }
};

/**
 * Authorisation (RBAC) Middleware:
 * Role-Based Access Control enforcing permissions for: Admin, Teacher, and Student.
 * 
 * Returns HTTP 403 Forbidden if the authenticated user lacks the required role.
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 401,
        error: 'Unauthorized',
        message: 'Authentication required before authorisation check.'
      });
    }

    // Worker role maps to Admin privileges in canteen staff operations
    const userRole = req.user.role;
    const isAllowed = allowedRoles.includes(userRole) || 
                      (allowedRoles.includes('admin') && userRole === 'worker');

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        code: 403,
        error: 'Forbidden',
        message: `Action Forbidden (HTTP 403). Your role [${userRole}] does not have permission. Required role: ${allowedRoles.join(' or ')}.`
      });
    }

    next();
  };
};
