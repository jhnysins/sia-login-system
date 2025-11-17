const { db } = require('../config/firebase-admin');

// In-memory store for failed attempts (use Redis in production)
const failedAttempts = new Map();

// Get email from username
exports.getEmailFromUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const snapshot = await db.collection('users').where('username', '==', username).limit(1).get();
    
    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userData = snapshot.docs[0].data();
    res.json({ email: userData.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check if account is locked
exports.checkLockout = async (req, res) => {
  try {
    let { email } = req.body;
    
    // If email contains no @, treat as username and lookup email
    if (!email.includes('@')) {
      const snapshot = await db.collection('users').where('username', '==', email).limit(1).get();
      if (!snapshot.empty) {
        email = snapshot.docs[0].data().email;
      }
    }
    
    const attempts = failedAttempts.get(email) || { count: 0, lockedUntil: null };

    if (attempts.lockedUntil && Date.now() < attempts.lockedUntil) {
      const remainingTime = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
      return res.status(429).json({ 
        locked: true,
        message: `Account locked. Try again in ${remainingTime} minute(s).`,
        remainingMinutes: remainingTime
      });
    }

    res.json({ locked: false });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Record failed login attempt
exports.recordFailedAttempt = async (req, res) => {
  try {
    const { email } = req.body;
    const attempts = failedAttempts.get(email) || { count: 0, lockedUntil: null };

    // Reset if lock expired
    if (attempts.lockedUntil && Date.now() >= attempts.lockedUntil) {
      attempts.count = 0;
      attempts.lockedUntil = null;
    }

    attempts.count++;

    if (attempts.count >= 5) {
      attempts.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
      failedAttempts.set(email, attempts);
      return res.json({ 
        locked: true,
        message: 'Too many failed attempts. Account locked for 15 minutes.',
        remainingAttempts: 0
      });
    }

    failedAttempts.set(email, attempts);
    res.json({ 
      locked: false,
      remainingAttempts: 5 - attempts.count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset attempts on successful login
exports.resetAttempts = async (req, res) => {
  try {
    const { email } = req.body;
    failedAttempts.delete(email);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
