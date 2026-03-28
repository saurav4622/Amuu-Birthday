# 🎉 Interactive 3D Birthday Web App

A highly interactive, multi-phase 3D birthday web application. Built with React, Three.js, and Node.js to provide a magical, personalized journey full of animations, cosmic themes, and cherished memories.

## ✨ Features

- **Multi-Phase 3D Journey:** A guided interactive experience transitioning through 6 beautiful phases.
- **Immersive 3D Graphics:** Beautiful webGL-based scenes and interactions using Three.js and React-Three-Fiber.
- **Fluid Animations:** Smooth page transitions, floating elements, and interactions powered by Framer Motion.
- **Secure Access:** Email-based OTP authentication ensuring only the special someone can access it.
- **Admin Dashboard:** A secret admin panel to seamlessly manage the memories and data.
- **Sensory Experience:** Integrated interactive background audio to complement the visual journey.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, React Router DOM, TailwindCSS
- **3D & Animations:** Three.js, `@react-three/fiber`, `@react-three/drei`, Framer Motion
- **Backend:** Node.js, Express
- **Authentication / Data:** Firebase Authentication / Email OTP (Nodemailer)

## 🗺️ Experience Phases

- **Phase 1: Intro (`/intro`)** - The welcoming beginning of the journey.
- **Phase 2: Keyhole (`/keyhole`)** - Unlocking the magical experience.
- **Phase 3: Orbit (`/orbit`)** - An interactive 3D orbital sphere representing core memories.
- **Phase 4: Whispers (`/whispers`)** - Floating 3D messages appearing gracefully.
- **Phase 5: Celestial Timeline (`/stars`)** - A journey traversing through a starry timeline of memories.
- **Phase 6: Final Wishes (`/wishes`)** - A heartfelt video conclusion.

## 📁 Project Structure

```
Birthday-Project/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable React components & Protected Routes
│   │   ├── context/        # Auth, AdminAuth, and Audio contexts
│   │   ├── pages/          # Phase pages + Auth views
│   │   └── App.jsx         # App routing
├── server/                 # Node.js Express Backend
│   ├── env.example         # Environment template
│   └── server.js           # Express API and routes
└── README.md               # Project documentation
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- Firebase Account (for data management)
- Email Account (for Nodemailer OTP sending)

### 1. Installation

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 2. Environment Configuration

1. Create a `.env` in the `server` directory based on `env.example`.
2. Configure **Email Credentials** (e.g. Gmail App Passwords) for sending login OTPs.
3. Configure **Firebase Credentials** for any backend operations.

### 3. Running Development Servers

**Start the Server:**
```bash
cd server
npm start # or npm run dev
```
*(Runs on http://localhost:3001 by default)*

**Start the Client:**
```bash
cd client
npm run dev
```
*(Runs on Vite's default port, likely http://localhost:5173)*

## 🔒 Access Roles

- **Guest/User:** Login via `/login` using the email-based OTP mechanism. All phases (`/intro`, `/keyhole`, etc.) are protected routes.
- **Admin:** Access the secret admin dashboard via `/secret-admin/login` to securely manage application content data.

## 📄 License
ISC
