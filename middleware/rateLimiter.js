/**
 * Rate Limiting Middleware for Brute Force & Abuse Protection
 * Defense against brute-force password guessing (blocks after 5 failed tries).
 */

const failedAttempts = new Map();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes lockout

// Clean up stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of failedAttempts.entries()) {
    if (now - record.firstAttempt > LOCKOUT_WINDOW_MS) {
      failedAttempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Middleware: Checks if an IP / username is currently locked out due to too many failed attempts
 */
export const loginRateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const username = (req.body && typeof req.body.username === 'string') 
    ? req.body.username.trim().toLowerCase() 
    : '';
  const clientKey = `${ip}_${username}`;

  const record = failedAttempts.get(clientKey) || failedAttempts.get(ip);

  if (record && record.count >= MAX_FAILED_ATTEMPTS) {
    const elapsed = Date.now() - record.lastAttempt;
    if (elapsed < LOCKOUT_WINDOW_MS) {
      const minutesRemaining = Math.ceil((LOCKOUT_WINDOW_MS - elapsed) / 60000);
      return res.status(429).json({
        success: false,
        code: 429,
        error: 'Too Many Requests',
        message: `Too many failed login attempts (${record.count}/${MAX_FAILED_ATTEMPTS}). Account is locked for ${minutesRemaining} minute(s) to protect against brute-force attacks.`,
        retryAfterMinutes: minutesRemaining
      });
    } else {
      // Window expired, reset counter
      failedAttempts.delete(clientKey);
      failedAttempts.delete(ip);
    }
  }

  next();
};

/**
 * Call when an invalid password/username attempt occurs
 */
export const recordFailedLogin = (req) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const username = (req.body && typeof req.body.username === 'string') 
    ? req.body.username.trim().toLowerCase() 
    : '';
  const clientKey = `${ip}_${username}`;

  const now = Date.now();
  const record = failedAttempts.get(clientKey) || { count: 0, firstAttempt: now, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;
  failedAttempts.set(clientKey, record);

  // Also track at IP level
  const ipRecord = failedAttempts.get(ip) || { count: 0, firstAttempt: now, lastAttempt: now };
  ipRecord.count += 1;
  ipRecord.lastAttempt = now;
  failedAttempts.set(ip, ipRecord);

  return record.count;
};

/**
 * Call on successful login to clear failed attempts
 */
export const resetLoginAttempts = (req) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const username = (req.body && typeof req.body.username === 'string') 
    ? req.body.username.trim().toLowerCase() 
    : '';
  const clientKey = `${ip}_${username}`;

  failedAttempts.delete(clientKey);
  failedAttempts.delete(ip);
};
