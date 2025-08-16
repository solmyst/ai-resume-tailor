# 🤖 AI Resume & Portfolio Tailor

An intelligent application that automatically customizes resumes and portfolios based on job descriptions using advanced NLP and machine learning techniques.

## ✨ Features

- 📄 **Smart Resume Parsing** - Upload PDF, DOCX, or text resumes
- 🔍 **Job Description Analysis** - Extract key requirements and skills
- 🎯 **AI-Powered Tailoring** - Match resume content to job requirements
- 📊 **Match Scoring** - See how well your resume fits the job
- 📋 **ATS-Optimized PDF** - Generate professional, ATS-friendly resumes
- 🌐 **Modern Web Interface** - Beautiful, responsive UI with Tailwind CSS

## 🚀 Quick Start

### Option 1: Full Application (Recommended)
```bash
# 1. Start the backend
python run_project.py

# 2. In a new terminal, start the frontend
cd frontend
npm install
npm run dev
```

Then open: **http://localhost:5173**

### Option 2: Backend Only (API Testing)
```bash
python start_backend_only.py
```

Then open: **http://localhost:8001/docs**

## 🎯 Complete Workflow

1. **Upload Resume** - Drag & drop your resume file (PDF, DOCX, TXT)
2. **Paste Job Description** - Copy job posting text
3. **AI Analysis** - System extracts key requirements and skills
4. **Resume Tailoring** - AI rewrites content to match job requirements
5. **Download PDF** - Get your ATS-optimized resume

## 📊 Example Results

```
Match Score: 87%
✅ Required Skills Matched: React, Node.js, Python, AWS
✅ Experience Level: Senior (5+ years)
✅ Tailored Summary: Enhanced with job-specific keywords
✅ ATS-Optimized: Professional formatting for applicant tracking systems
```

## 🏗️ Project Structure

```
ai-resume-tailor/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── main.py            # API server
│   └── requirements.txt   # Python dependencies
├── frontend/               # Modern Vite + React + TypeScript
│   ├── src/
│   │   ├── components/    # React components
│   │   └── services/      # API client
│   ├── package.json       # Node.js dependencies
│   └── vite.config.ts     # Vite configuration
├── run_project.py         # Simple project runner
└── README.md              # This file
```

## 🎨 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Pydantic** - Data validation and serialization
- **ReportLab** - PDF generation
- **Advanced NLP** - Text processing and analysis

### Frontend
- **Vite** - Lightning-fast build tool
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Beautiful icons

## 🔧 API Endpoints

- `GET /` - Health check
- `POST /upload-resume` - Parse resume file
- `POST /analyze-job` - Analyze job description
- `POST /tailor-resume` - Generate tailored resume
- `POST /generate-pdf` - Create ATS-optimized PDF
- `GET /docs` - Interactive API documentation

## 🌐 Access Points

- **Frontend App**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:8001
- **API Docs**: http://localhost:8001/docs
- **Health Check**: http://localhost:8001/

## 🔮 Advanced Features

- **Real-time Processing** - Instant feedback and analysis
- **Drag & Drop Upload** - Intuitive file handling
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Error Handling** - Graceful fallbacks and user-friendly messages
- **API Status Indicator** - Shows backend connection status
- **Professional Styling** - Modern UI with smooth animations

## 🧪 Testing

Test the API endpoints:
```bash
python demo.py
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `python run_project.py`
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Ready to optimize your job applications? Run `python run_project.py` and start the frontend! ✨**