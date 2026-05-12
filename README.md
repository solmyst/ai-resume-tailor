# 🚀 AI Resume Tailor

> **Stop applying. Start landing.**  
> A premium, AI-powered platform designed to optimize your resume for specific job descriptions in seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)

---

## ✨ Features

- **🎯 ATS Optimization**: Sophisticated AI analysis to align your resume with job requirements and pass Applicant Tracking Systems.
- **📄 Smart PDF Generation**: Beautiful, professional typography and layout constraints applied automatically.
- **🔗 URL Scraping**: Import job descriptions directly from LinkedIn, Indeed, and other major platforms.
- **🛡️ Privacy First**: Local-first processing architecture ensuring your professional data stays secure.
- **📊 Interactive Dashboard**: Track your tailoring history, match scores, and application progress.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS (Premium Glassmorphism Design)
- **Icons**: Lucide React
- **Build Tool**: Vite

### Backend
- **Core**: Flask (Python)
- **Database**: SQLite with SQLAlchemy
- **AI Engine**: Google Gemini / OpenAI / Ollama (Local)
- **PDF Engine**: PyPDF2 / Custom Generators

---

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/solmyst/ai-resume-tailor.git
cd ai-resume-tailor
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### 3. Setup Frontend
```bash
# In the root directory
npm install
npm run dev
```

---

## 🌐 Going Live (GitHub Pages)

### 1. Configure the API URL
Create a `.env.production` file in the root directory:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### 2. Deploy to GitHub Pages
```bash
npm run deploy
```
*Your site will be live at: `https://<username>.github.io/ai-resume-tailor/`*

### 3. Host the Backend
Since GitHub Pages only hosts static files, you must host the Python backend separately. We recommend:
- [Render](https://render.com/) (Free Tier available)
- [Railway](https://railway.app/)
- [Heroku](https://www.heroku.com/)

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/solmyst">Solmyst</a>
</p>