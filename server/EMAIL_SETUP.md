# 📧 Email Setup Guide

## Step-by-Step Instructions

### Step 1: Create the .env file

In the `server` folder, create a file named `.env` (note the dot at the beginning).

**Windows (PowerShell):**
```powershell
cd server
New-Item -Path .env -ItemType File
```

**Or manually:**
- Create a new file in the `server` folder
- Name it exactly: `.env` (with the dot at the start)

### Step 2: Add Your Email Configuration

Open the `.env` file and add your email settings:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-app-password-here
EMAIL_FROM=your-actual-email@gmail.com

PORT=3001
NODE_ENV=development
```

### Step 3: Get Gmail App Password (If using Gmail)

1. **Enable 2-Factor Authentication:**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Birthday App" as the name
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

3. **Use the App Password:**
   - In your `.env` file, paste the App Password (remove spaces)
   - Example: `EMAIL_PASS=abcdefghijklmnop`

### Step 4: Save and Restart

1. Save the `.env` file
2. Restart your server:
   ```bash
   cd server
   npm start
   ```

You should see: `✅ Email configured: your-email@gmail.com`

---

## Example .env File

Here's what your `.env` file should look like (with YOUR actual values):

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=john.doe@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM=john.doe@gmail.com

PORT=3001
NODE_ENV=development
```

---

## Important Security Notes

⚠️ **NEVER share your `.env` file or email credentials!**
- The `.env` file is already in `.gitignore` (won't be committed to git)
- Don't share your App Password with anyone
- Don't paste your credentials in chat or emails

---

## Testing Your Email Setup

After setting up, test it:

1. **Start your server:**
   ```bash
   cd server
   npm start
   ```

2. **Visit in browser:**
   ```
   http://localhost:3001/api/auth/test-email
   ```

3. **You should see:**
   ```json
   {
     "success": true,
     "configured": true,
     "message": "Email configuration is valid! ✅",
     "email": "your-email@gmail.com"
   }
   ```

---

## Troubleshooting

**"Email not configured" message?**
- Make sure `.env` file is in the `server` folder (not `client`)
- Check file name is exactly `.env` (with dot)
- Restart the server after creating/editing `.env`

**"Invalid login" error?**
- For Gmail: Make sure you're using App Password, not regular password
- Verify 2FA is enabled on your Google account
- Check that App Password was copied correctly (no spaces)

**Email not sending?**
- Check spam folder
- Verify email address is correct
- Test with the `/api/auth/test-email` endpoint

---

## Alternative: Development Mode (No Email)

If you don't want to set up email right now, you can skip the `.env` file entirely. The app will work in development mode and show OTPs in the server console instead!
