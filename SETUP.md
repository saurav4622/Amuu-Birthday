# Quick Setup Guide

## Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

## Step 2: Configure Email (Required for OTP)

1. Copy the example environment file:
   ```bash
   cd server
   copy env.example .env
   ```
   (On Linux/Mac: `cp env.example .env`)

2. Edit `.env` file with your email settings:

   **For Gmail:**
   - Go to https://myaccount.google.com/apppasswords
   - Generate an App Password
   - Use that password in `.env`

   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   PORT=3001
   NODE_ENV=development
   ```

## Step 3: Start Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## Step 4: Access the App

1. Open browser: `http://localhost:3000`
2. Enter your email address
3. Check your email for the 6-digit OTP
4. Enter OTP to login
5. Enjoy the birthday surprise! 🎉

## Troubleshooting

**Email not working?**
- Make sure `.env` file exists in `server/` folder
- For Gmail: Use App Password, not regular password
- Check server console for error messages

**Port already in use?**
- Change PORT in `.env` file
- Update `vite.config.js` proxy target if needed
