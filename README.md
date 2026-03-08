# 🎉 Birthday Web App

A beautiful, interactive multi-page birthday web application built with React and Node.js, featuring email-based OTP authentication.

## Features

- 🔐 **Email OTP Authentication** - Secure login with one-time password sent via email
- ✨ Animated gradient background
- 🎂 Interactive 3D flip card with birthday message
- 🎊 Confetti animations
- 🌟 Floating emoji decorations
- 📱 Fully responsive design
- 🎨 Smooth animations and transitions
- 📄 **Multi-page Navigation** - Dashboard, Gallery, and Messages pages
- 🔒 **Protected Routes** - Secure access to authenticated pages

## Tech Stack

- **Frontend**: React 18 with Vite, React Router
- **Backend**: Node.js with Express
- **Email**: Nodemailer for OTP delivery
- **Styling**: CSS3 with animations

## Project Structure

```
Birthday-Project/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components (Login, Dashboard, Gallery, Messages)
│   │   ├── App.jsx         # Main app with routing
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
├── server/                 # Node.js backend
│   ├── auth.js            # OTP generation and email sending
│   ├── server.js          # Express server with API routes
│   ├── env.example        # Environment variables template
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Email account (Gmail recommended) for sending OTPs

### Email Configuration

1. **For Gmail users:**
   - Enable 2-Factor Authentication on your Google account
   - Generate an App Password: https://support.google.com/accounts/answer/185833
   - Use this App Password (not your regular password) in the `.env` file

2. **Create environment file:**
   ```bash
   cd server
   cp env.example .env
   ```

3. **Edit `.env` file with your email credentials:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   PORT=3001
   NODE_ENV=development
   ```

### Installation

1. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Running the Application

1. **Start the backend server:**
   ```bash
   cd server
   npm start
   ```
   The server will run on `http://localhost:3001`

2. **Start the frontend development server:**
   ```bash
   cd client
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

3. **Access the application:**
   - Navigate to `http://localhost:3000`
   - You'll be redirected to the login page
   - Enter your email address
   - Check your email for the 6-digit OTP
   - Enter the OTP to login
   - Explore the Dashboard, Gallery, and Messages pages!

## Pages

- **Login** (`/login`) - Email-based OTP authentication
- **Dashboard** (`/dashboard`) - Main birthday card with animations
- **Gallery** (`/gallery`) - Photo gallery (customize with your photos)
- **Messages** (`/messages`) - Special birthday messages

## API Endpoints

### Authentication
- `POST /api/auth/request-otp` - Request OTP for email
  - Body: `{ "email": "user@example.com" }`
- `POST /api/auth/verify-otp` - Verify OTP and login
  - Body: `{ "email": "user@example.com", "otp": "123456" }`
- `POST /api/auth/verify-session` - Verify session token
- `POST /api/auth/logout` - Logout user

### Content
- `GET /api/birthday-info` - Returns birthday card front information
- `GET /api/message` - Returns birthday message content

## Customization

- **Email Templates**: Edit the HTML email template in `server/auth.js`
- **Birthday Messages**: Edit messages in `server/server.js` API routes
- **Gallery Photos**: Add your photos in `client/src/pages/Gallery.jsx`
- **Messages**: Customize messages in `client/src/pages/Messages.jsx`
- **Styles**: Modify CSS files in respective component/page folders

## Production Build

1. **Build the React app:**
   ```bash
   cd client
   npm run build
   ```

2. **Set NODE_ENV to production and start the server:**
   ```bash
   cd server
   NODE_ENV=production npm start
   ```
   The server will serve the built React app.

## Security Notes

- OTPs expire after 5 minutes
- Sessions expire after 24 hours
- In production, consider using:
  - Redis for OTP storage
  - JWT tokens for sessions
  - Rate limiting for OTP requests
  - HTTPS for secure communication

## Troubleshooting

**Email not sending?**
- Verify your `.env` file has correct credentials
- For Gmail, ensure you're using an App Password, not your regular password
- Check that 2FA is enabled on your Google account
- Check server console for error messages

**OTP not received?**
- Check spam/junk folder
- Verify email address is correct
- Wait a few seconds and try again
- Check server logs for errors

## License

ISC
