# 🛡️ TruthShield
### AI-Powered Fake Content & Phishing Detection Platform

🔍 Detect fake news, scam messages, phishing URLs, and suspicious content using a hybrid keyword + AI analysis engine.

---

## 📌 Project Overview

Every day, people are exposed to fake news, scam forwards, and phishing links, leading to misinformation and financial risk.

TruthShield addresses this by analyzing URLs, pasted text, WhatsApp forwards, and photos/screenshots — combining fast keyword-pattern matching with a Python ML confidence score to flag likely fake, scam, fraud, or rumor content. The app provides a secure, bilingual (English/Tamil) interface backed by a full-stack Java + Python + React architecture.

---

## ✨ Key Features

- 📰 Fake / Scam / Fraud / Rumor Content Detection
- 🌐 URL & Text Analysis
- 📷 Camera, Image, and QR-Code Scanning (OCR runs entirely in-browser)
- 🔐 Secure Authentication — Spring Security + JWT, BCrypt password hashing
- 👤 User Registration & Login
- 📊 Per-User Scan History & Analytics (charts)
- ⚡ REST API Integration
- 🌍 Bilingual UI (English / Tamil), Dark/Light Theme
- 📱 Chrome Extension + Desktop App (Tauri/Electron)
- 🗄 MongoDB Database Integration

---

## 🏗 System Architecture

```
React Frontend (Netlify)
        ⬇  JWT Bearer Token
Spring Security Filter Chain
        ⬇
Spring Boot Backend (Render)
        ⬇
Python ML Service (Flask + scikit-learn)
        ⬇
MongoDB Atlas (Users, Scan History)
```

Detection is **hybrid**: keyword-pattern matching runs first for a fast, explainable signal, then a Python ML confidence score is layered on top. If the ML service is ever unreachable, the app **gracefully falls back** to keyword-only scoring instead of failing.

---

## 🛠 Technology Stack

### 🎨 Frontend
- React.js
- Recharts (analytics), Tesseract.js (OCR), jsQR (QR scan), jsPDF

### ⚙ Backend
- Java 17, Spring Boot
- Spring Security + JWT Authentication
- REST APIs

### 🗄 Database
- MongoDB Atlas (NoSQL)

### 🤖 AI / ML
- Python, Flask
- scikit-learn (TF-IDF + Logistic Regression)

### 🧰 Tools
- VS Code
- Git & GitHub
- GitHub Actions (CI/CD)

---

## 🔄 Workflow

1. 👤 User registers or logs in
2. 🔐 Spring Security validates the JWT on every request
3. 📝 User submits a URL, text, WhatsApp message, or photo
4. ⚙ Backend runs keyword-pattern matching
5. 🤖 Python ML service adds a confidence score
6. 📊 Combined result (FAKE / GENUINE + category + score) is returned
7. 💾 Result saved to that user's scan history in MongoDB

---

## 🚀 Project Highlights

- 💻 Full-Stack Java + Python + React Development
- 🛡 Hybrid AI + Keyword Detection Engine
- 🔐 Real Spring Security + JWT Authentication (stateless, BCrypt-hashed passwords)
- 🌐 RESTful API Architecture
- ⚛ React Frontend with client-side OCR/QR
- 🔁 CI/CD via GitHub Actions (build, test, and gated deploy)
- 🗄 MongoDB Atlas, Per-User Data Isolation

---

## 🔮 Future Enhancements

- 📱 Native Mobile App
- 🔎 Larger, production-grade ML training dataset
- 🧩 Chrome Extension login flow (JWT support)
- ☁ Multi-instance rate limiting (Redis)
- 📊 Admin Analytics Dashboard

---

## 🌐 Live Deployment

**App:** https://truthshield-ai-fake-detection-system.netlify.app

---

## 👨‍💻 Developer

**Sarsika Sri K**
Java Full Stack Developer

## 📞 Contact
- GitHub: https://github.com/sarsika
