import cors from 'cors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendOTP, verifyOTP } from './auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory session storage (in production, use Redis or JWT tokens)
const sessions = new Map();

// Authentication Routes
app.post('/api/auth/request-otp', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
  }

  const result = await sendOTP(email);
  
  if (result.success) {
    if (result.devMode) {
      res.json({ 
        success: true, 
        message: `OTP generated! Check the server console/terminal for your OTP code.`,
        devMode: true 
      });
    } else {
      res.json({ success: true, message: `OTP sent to ${email}. Please check your inbox!` });
    }
  } else {
    res.status(500).json(result);
  }
});

// Test email configuration endpoint
app.get('/api/auth/test-email', async (req, res) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.json({
      success: false,
      configured: false,
      message: 'Email not configured. Running in development mode. OTPs will be logged to console.',
      instruction: 'To enable email, create a .env file in the server folder with EMAIL_USER and EMAIL_PASS'
    });
  }

  try {
    const nodemailer = (await import('nodemailer')).default;
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Test connection
    await transporter.verify();
    
    res.json({
      success: true,
      configured: true,
      message: 'Email configuration is valid! ✅',
      email: process.env.EMAIL_USER
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      configured: true,
      message: 'Email configuration error: ' + error.message,
      instruction: 'Please check your EMAIL_USER and EMAIL_PASS in .env file'
    });
  }
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  const result = verifyOTP(email, otp);

  if (result.success) {
    // Create a session token (simple implementation)
    const sessionToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    sessions.set(sessionToken, {
      email,
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      message: 'Login successful!',
      token: sessionToken,
      email,
    });
  } else {
    res.status(401).json(result);
  }
});

app.post('/api/auth/verify-session', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  const session = sessions.get(token);

  if (!session) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' });
  }

  // Check if session is older than 24 hours
  if (Date.now() - session.createdAt > 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return res.status(401).json({ success: false, message: 'Session expired' });
  }

  res.json({ success: true, email: session.email });
});

app.post('/api/auth/logout', (req, res) => {
  const { token } = req.body;
  if (token) {
    sessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// API Routes
app.get('/api/message', (req, res) => {
  res.json({
    title: 'To My Amazing Girlfriend',
    messages: [
      'You light up my world every single day. Today, we celebrate you! 🎉',
      'Wishing you the happiest of birthdays filled with love, laughter, and all your favorite things.',
      'Thank you for being you! 💕'
    ],
    hearts: '💖💖💖'
  });
});

app.get('/api/birthday-info', (req, res) => {
  res.json({
    title: 'Happy Birthday!',
    subtitle: 'Click to open your surprise',
    icon: '🎂'
  });
});

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🎉 Server running on http://localhost:${PORT}`);
  
  // Show email configuration status
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n💡 Development Mode: Email not configured');
    console.log('   OTPs will be logged to console instead of being sent via email');
    console.log('   To enable email, create a .env file with EMAIL_USER and EMAIL_PASS\n');
  } else {
    console.log(`✅ Email configured: ${process.env.EMAIL_USER}`);
    console.log('   OTPs will be sent via email\n');
  }
});
