require('dotenv').config();
const express = require('express');
const cors = require('cors');
const qrVerifyController = require('./controllers/qrVerifyController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// QR Verification routes
app.post('/api/qr/store', qrVerifyController.storeQRToken);
app.get('/api/qr/check/:token', qrVerifyController.checkQRStatus);
app.post('/api/qr/confirm', qrVerifyController.verifyQR);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
