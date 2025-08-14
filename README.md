# 🤖 AI Resume & Portfolio Tailor

An intelligent application that automatically customizes resumes and portfolios based on job descriptions using advanced NLP and machine learning techniques.

## ✨ Features

- 📄 **Smart Resume Parsing** - Upload PDF, DOCX, or text resumes
- 🔍 **Job Description Analysis** - Extract key requirements and skills
- 🎯 **AI-Powered Tailoring** - Match resume content to job requirements
- 📊 **Match Scoring** - See how well your resume fits the job
- 📋 **ATS-Optimized PDF** - Generate professional, ATS-friendly resumes
- 🌐 **Web Interface** - Clean, intuitive user experience

## 🚀 Quick Start (One-Command Demo)

```bash
python start_demo.py
```

This will:
- ✅ Install all dependencies
- 🚀 Start backend and frontend servers
- 🌐 Open browser with the application
- 🎯 Run a complete demo workflow
- 📊 Show all features in action

## 🛠️ Manual Setup

### Backend Setup
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start the API server
python backend/main.py
```

### Frontend Setup (Optional)
```bash
# Install Node.js dependencies
cd frontend && npm install

# Start the React app
npm start
```

## 🎯 Demo Workflow

1. **Upload Resume** - Drag & drop your resume file
2. **Paste Job Description** - Copy job posting text
3. **AI Analysis** - System extracts key requirements
4. **Resume Tailoring** - AI rewrites content to match job
5. **Download PDF** - Get your optimized resume

## 📊 Example Results

```
Match Score: 87%
✅ Required Skills Matched: React, Node.js, Python, AWS
✅ Experience Level: Senior (5+ years)
✅ Tailored Summary: Enhanced with job-specific keywords
✅ ATS-Optimized: Professional formatting for applicant tracking systems
```

## 🔧 API Endpoints

- `POST /upload-resume` - Parse resume file
- `POST /analyze-job` - Analyze job description
- `POST /tailor-resume` - Generate tailored resume
- `POST /generate-pdf` - Create ATS-optimized PDF
- `GET /docs` - Interactive API documentation

## 🌐 Access Points

- **Frontend App**: http://localhost:3000
- **API Server**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/

## 🧪 Testing

Run the demo script to test all functionality:
```bash
python demo.py
```

## 📁 Project Structure

```
ai-resume-tailor/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── models/         # Pydantic schemas
│   │   └── services/       # Business logic
│   ├── main.py            # API server
│   └── requirements.txt   # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   └── services/      # API client
│   └── package.json       # Node.js dependencies
├── demo.py                # Demo script
├── start_demo.py          # One-command demo
└── README.md              # This file
```

## 🎨 Tech Stack

- **Backend**: FastAPI, Python, Pydantic
- **Frontend**: React, TypeScript, Material-UI
- **NLP**: Advanced text processing and keyword extraction
- **PDF**: ReportLab for professional document generation
- **Deployment**: Docker-ready, cloud-compatible

## 🔮 Advanced Features

- **Semantic Matching**: Intelligent skill matching beyond keywords
- **Industry Adaptation**: Tailoring based on job industry
- **ATS Optimization**: Formatting optimized for applicant tracking systems
- **Multi-format Support**: PDF, DOCX, and text resume parsing
- **Real-time Processing**: Fast analysis and generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `python demo.py`
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Ready to optimize your job applications? Run `python start_demo.py` and see the magic! ✨**