# QR Login Backend

## Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` file with Firebase Admin credentials (see `.env.example`)

3. Start server:
```bash
npm run dev
```

## API Endpoints

- `POST /api/qr/generate` - Generate QR token
- `GET /api/qr/poll/:token` - Poll token status
- `POST /api/qr/verify` - Verify token (mobile app)

## Flow

1. Web app calls `/api/qr/generate` to get token
2. Web app displays QR code with token
3. Web app polls `/api/qr/poll/:token` every 2s
4. Mobile app scans QR, calls `/api/qr/verify` with token + userId
5. Web app receives verified status + custom token
6. Web app signs in with custom token
