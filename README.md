# Ⓝ Notiq - Modern Notes Application

A full-stack notes application built with React.js, Node.js, and MongoDB featuring real-time synchronization, advanced organization, and seamless user experience.

![SonarQube Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passed-brightgreen)
![Test Coverage](https://img.shields.io/badge/Coverage-85%25-green)
![Security Rating](https://img.shields.io/badge/Security-A-brightgreen)
![Vulnerabilities](https://img.shields.io/badge/Vulnerabilities-0-green)

## 🚀 Features

### ✨ Core Functionality
- **📝 Rich Text Notes** - Create, edit, and organize notes with ease
- **🏷️ Smart Tagging** - Categorize notes with custom tags
- **🔍 Advanced Search** - Full-text search across all notes
- **📂 Organization** - Archive, pin, and categorize notes

### 🔐 Security & User Management
- **Secure Authentication** - JWT-based login/register system
- **Password Protection** - BCrypt hashing with salt rounds
- **Session Management** - Secure token-based authentication
- **User Isolation** - Complete data separation between users

### 📱 User Experience
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Dark/Light Theme** - Toggle between themes
- **Real-time Updates** - Instant synchronization
- **Intuitive UI** - Clean, modern interface with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hot Toast** - User notifications
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **BCrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Testing & Quality
- **Jest** - Testing framework
- **React Testing Library** - Component testing
- **SonarQube** - Code quality and security analysis
- **GitHub Actions** - CI/CD pipeline

## 📦 Installation

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (local or Atlas)
- npm 

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/notes-app.git
cd notes-app/backend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server
npm run dev

# Run tests
npm test
```
### Frontend setup 
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env

# Start development server
npm start
# Application will open at http://localhost:3000

# Run tests
npm test

# Build for production
npm run build
```

### (.env) Backend
PORT=9000
MONGODB_URI=mongodb://localhost:27017/notes-app
OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notes-app

# CORS
CORS_ORIGIN=*
For production, specify your frontend URL:
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your-super-secure-access-token-secret-minimum-32-chars
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-super-secure-refresh-token-secret-minimum-32-chars
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary for file uploads (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email service (Gmail)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  # Use App Password, not regular password

NODE_ENV=development
