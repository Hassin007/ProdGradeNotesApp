# Ⓝ Notiq - Modern Notes Application

A full-stack notes application built with React.js, Node.js, and MongoDB. Features real-time synchronization, advanced organization tools, and a seamless user experience.

![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passed-brightgreen)
![Test Coverage](https://img.shields.io/badge/Coverage-85%25-green)
![Security Rating](https://img.shields.io/badge/Security-A-brightgreen)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-20.0+-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0+-47a248)
![Express](https://img.shields.io/badge/Express-4.18.0-000000)
![Jest](https://img.shields.io/badge/Jest-29.0+-c21325)
![SonarQube](https://img.shields.io/badge/SonarQube-Analyzed-4e9aec)

## Features

### Core Functionality
- Create, edit, and organize notes with rich text support
- Categorize notes with custom tags and labels
- Advanced search across all notes and content
- Archive and pin important notes for better organization

### Security & Authentication
- Secure JWT-based authentication system
- Password protection with BCrypt hashing
- Secure token-based session management
- Complete data isolation between users

### User Experience
- Fully responsive design for desktop and mobile
- Dark and light theme options
- Real-time updates and synchronization
- Clean, intuitive interface with smooth animations

### Quality Assurance
- Jest - Testing framework
- React Testing Library - Component testing
- SonarQube - Code quality and security analysis
- GitHub Actions - CI/CD pipeline

## Installation Guide

### Prerequisites
- Node.js (v20 or higher)
- MongoDB (local or Atlas)
- npm package manager

### Backend Setup

```bash
# Clone the repository
git clone github.com/Hassin007/ProdGradeNotesApp
cd notes-app/backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit the .env file with your configuration

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
npm run dev
# Application will open at http://localhost:3000

# Run tests
npm test

# Build for production
npm run build
```

# (.env) Backend
```bash
PORT=9000
MONGODB_URI=mongodb://localhost:27017/notes-app
OR for MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notes-app
```

## CORS
```bash
CORS_ORIGIN=*
For production, specify your frontend URL:
CORS_ORIGIN=http://localhost:3000

ACCESS_TOKEN_SECRET=your-super-secure-access-token-secret-minimum-32-chars
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your-super-secure-refresh-token-secret-minimum-32-chars
REFRESH_TOKEN_EXPIRY=7d
```

## Cloudinary for file uploads (optional)
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Frontend URL
```bash
FRONTEND_URL=http://localhost:3000
```

## Email service (Gmail)
```bash
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  # Use App Password, not regular password

NODE_ENV=development
```
