# 🛡️ Digital Footprint Tracker

An AI-powered cybersecurity platform that helps users analyze their digital footprint, detect cyber threats, and receive AI-driven security recommendations.

## 🚀 Features

- **Digital Footprint Analysis**: Track and map your online presence across multiple platforms using OSINT tools.
- **Threat Detection**: Advanced scanning for malicious URLs and suspicious files.
- **Identity & Privacy Protection**: Email breach scanning and identity exposure monitoring.
- **AI-Driven Security Recommendations**: Intelligent risk scoring and actionable steps to secure your digital life.

## 💻 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI & Security**: Custom AI Risk Engine, Sherlock OSINT Tool

## 📁 Project Structure

```text
digital-footprint-tracker/
├── client/                 # Frontend application (Next.js)
├── server/                 # Backend API, Routes, Controllers
├── ai-engine/              # AI intelligence layer for risk assessment
├── threat-detection/       # URL and File scanning modules
├── identity-privacy/       # Email and Identity scanners
└── sherlock-env/           # Environment for Sherlock OSINT tool
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python 3.x (for Sherlock OSINT integration)
- MongoDB instance (local or Atlas)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd digital-footprint-tracker
```

### 2. Setup the Backend Server

```bash
cd server
npm install
npm start
```
*(Ensure you have a `.env` file configured properly before starting the server.)*

### 3. Setup the Frontend Client

```bash
cd client
npm install
npm run dev
```

The application will be accessible at `http://localhost:3000`.

## 👥 Team & Modules

- **Pratik**: Backend (Express+MongoDB) + AI Engine
- **Aaryan**: Frontend (Next.js)
- **Siddhant**: Threat Detection (URL/File Scanning)
- **Impana**: Identity & Privacy (Email/Identity Monitoring)

> **Note**: For internal team workflow, branch naming conventions, and scanner output contracts, please refer to the `general_instructions.md` file.
