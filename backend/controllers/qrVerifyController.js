const { db } = require('../config/firebase-admin');

// Store QR verification status
exports.storeQRToken = async (req, res) => {
  try {
    const { token, userId } = req.body;
    
    await db.collection('qrVerifications').doc(token).set({
      userId,
      verified: false,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60000
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check QR verification status (desktop polls this)
exports.checkQRStatus = async (req, res) => {
  try {
    const { token } = req.params;
    const doc = await db.collection('qrVerifications').doc(token).get();

    if (!doc.exists) {
      return res.json({ verified: false });
    }

    const data = doc.data();
    
    if (Date.now() > data.expiresAt) {
      await db.collection('qrVerifications').doc(token).delete();
      return res.json({ verified: false, expired: true });
    }

    res.json({ verified: data.verified });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify QR (phone calls this after scanning)
exports.verifyQR = async (req, res) => {
  try {
    const { token } = req.body;
    const doc = await db.collection('qrVerifications').doc(token).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Token not found' });
    }

    const data = doc.data();

    if (Date.now() > data.expiresAt) {
      await db.collection('qrVerifications').doc(token).delete();
      return res.status(410).json({ error: 'Token expired' });
    }

    await db.collection('qrVerifications').doc(token).update({
      verified: true,
      verifiedAt: Date.now()
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
