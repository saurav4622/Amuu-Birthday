import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

// In-memory storage for OTPs (in production, use Redis or a database)
const otpStore = new Map();

// Configure email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
export const sendOTP = async (email) => {
  try {
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
    });

    // Development mode: Log OTP to console instead of sending email
    const isDevMode = process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER;
    
    if (isDevMode) {
      console.log('\n🎉 ============================================');
      console.log('📧 OTP REQUESTED FOR:', email);
      console.log('🔑 YOUR OTP CODE IS:', otp);
      console.log('⏰ This OTP expires in 5 minutes');
      console.log('============================================\n');
      return { success: true, message: `OTP generated! Check server console for the code.`, devMode: true, otp };
    }

    // Production mode: Send actual email
    const transporter = createTransporter();
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  Email credentials not configured. Running in dev mode.');
      console.log('\n🎉 ============================================');
      console.log('📧 OTP REQUESTED FOR:', email);
      console.log('🔑 YOUR OTP CODE IS:', otp);
      console.log('⏰ This OTP expires in 5 minutes');
      console.log('💡 To enable email sending, configure .env file');
      console.log('============================================\n');
      return { success: true, message: `OTP generated! Check server console for the code.`, devMode: true, otp };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: '🎉 Hii baby, Happy Birthday!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 10px;">
            <h1 style="color: #667eea; text-align: center;">🎂 Happy Birthday! 🎉</h1>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Hello! babe, I am so excited to wish you a happy birthday!👋
            </p>
            <p style="font-size: 16px; color: #333; line-height: 1.6;">
              Your One-Time Password (OTP) to access your special birthday surprise is:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                ${otp}
              </div>
            </div>
            <p style="font-size: 14px; color: #666; line-height: 1.6;">
              This OTP will expire in 5 minutes. If you didn't request this, please ignore this email.
            </p>
            <p style="font-size: 14px; color: #666; margin-top: 20px;">
              Have a wonderful birthday! 🎈🎁✨
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent successfully to ${email}`);
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    
    // Fallback to dev mode if email fails
    const storedData = otpStore.get(email);
    if (storedData) {
      console.log('\n🎉 ============================================');
      console.log('📧 Email failed, but OTP is available:');
      console.log('🔑 YOUR OTP CODE IS:', storedData.otp);
      console.log('⏰ This OTP expires in 5 minutes');
      console.log('============================================\n');
      return { 
        success: true, 
        message: 'Email failed, but OTP generated. Check server console.', 
        devMode: true, 
        otp: storedData.otp 
      };
    }
    
    return { success: false, message: 'Failed to send OTP. Please check your email configuration.' };
  }
};

// Verify OTP
export const verifyOTP = (email, otp) => {
  const storedData = otpStore.get(email);
  
  if (!storedData) {
    return { success: false, message: 'OTP not found. Please request a new one.' };
  }

  if (Date.now() > storedData.expiresAt) {
    otpStore.delete(email);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (storedData.otp !== otp) {
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }

  // OTP verified successfully, remove it
  otpStore.delete(email);
  return { success: true, message: 'OTP verified successfully' };
};

// Clean up expired OTPs periodically
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
}, 60 * 1000); // Run every minute
