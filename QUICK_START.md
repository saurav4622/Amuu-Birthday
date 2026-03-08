# 🚀 Quick Start Guide

## Option 1: Development Mode (No Email Setup Required)

Perfect for testing! OTPs will be displayed in the server console.

1. **Install dependencies:**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

2. **Start the servers:**
   
   Terminal 1 (Backend):
   ```bash
   cd server
   npm start
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

3. **Login:**
   - Go to `http://localhost:3000`
   - Enter any email address
   - **Check the server console/terminal** for the OTP code
   - Enter the OTP to login

That's it! No email configuration needed for testing. 🎉

---

## Option 2: Production Mode (With Email)

For actual email delivery:

1. **Set up email configuration:**
   ```bash
   cd server
   copy env.example .env
   ```
   
   Edit `.env` with your email credentials:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   PORT=3001
   NODE_ENV=development
   ```

2. **For Gmail:**
   - Enable 2-Factor Authentication
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use the App Password (16 characters)

3. **Test email configuration:**
   ```bash
   # Visit in browser or use curl:
   curl http://localhost:3001/api/auth/test-email
   ```

4. **Start servers and login:**
   - OTPs will now be sent to your email inbox

---

## Troubleshooting

**OTP not showing in console?**
- Make sure the backend server is running
- Check the terminal where you ran `npm start` in the server folder

**Email not working?**
- Verify `.env` file exists in `server/` folder
- Check email credentials are correct
- For Gmail: Use App Password, not regular password
- Test with: `GET http://localhost:3001/api/auth/test-email`

**Port already in use?**
- Change `PORT` in `.env` file
- Update `vite.config.js` proxy target if needed

---

## Pages Available

- `/login` - Login page
- `/dashboard` - Main birthday card
- `/gallery` - Photo gallery
- `/messages` - Special messages

Enjoy your birthday app! 🎂🎉✨
