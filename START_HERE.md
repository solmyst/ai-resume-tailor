# 🚀 AI Resume Tailor - Quick Start Guide

## One-Command Startup

```bash
python run.py
```

This will:
- ✅ Install minimal dependencies
- ✅ Start the backend API server
- ✅ Open browser with API documentation
- ✅ Run a demo automatically

## Alternative Startup Methods

### Method 1: Full Demo with Frontend
```bash
python start_demo.py
```
- Starts both backend and frontend
- Runs complete demo
- Opens browser tabs

### Method 2: Backend Only
```bash
python quick_start.py
```
- Minimal backend setup
- Perfect for API testing

### Method 3: Manual Setup
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start backend
cd backend
python main.py

# In another terminal, run demo
python demo.py
```

## 🌐 Access Points

Once running, you can access:

- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/
- **Frontend** (if started): http://localhost:3000

## 🎯 What the Demo Does

1. **Creates a sample resume** with realistic data
2. **Uploads and parses** the resume via API
3. **Analyzes a job description** to extract requirements
4. **Tailors the resume** to match the job
5. **Generates a PDF** of the tailored resume
6. **Shows match score** and recommendations

## 📋 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/upload-resume` | POST | Upload and parse resume |
| `/analyze-job` | POST | Analyze job description |
| `/tailor-resume` | POST | Generate tailored resume |
| `/generate-pdf` | POST | Create PDF resume |
| `/download-pdf/{filename}` | GET | Download generated PDF |

## 🔧 Troubleshooting

### Common Issues

**"Module not found" errors:**
```bash
pip install fastapi uvicorn python-multipart pydantic reportlab
```

**Port 8000 already in use:**
- Kill existing processes: `lsof -ti:8000 | xargs kill -9`
- Or change port in `backend/main.py`

**Frontend won't start:**
- Make sure Node.js is installed
- Run `npm install` in the frontend directory

### Dependencies

**Minimal (for basic demo):**
- Python 3.8+
- fastapi, uvicorn, pydantic, reportlab

**Full features:**
- spaCy + English model
- sentence-transformers
- transformers
- torch
- OpenAI API key (optional)

## 🎨 Customization

### Add Your OpenAI Key
1. Copy `.env.example` to `.env`
2. Add your OpenAI API key
3. Restart the server

### Modify Resume Templates
Edit `backend/app/services/pdf_generator.py` to customize PDF layout.

### Add New Skills
Update skill patterns in `backend/app/services/job_analyzer.py`.

## 📱 Usage Examples

### Upload Resume via cURL
```bash
curl -X POST "http://localhost:8000/upload-resume" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@your_resume.pdf"
```

### Analyze Job Description
```bash
curl -X POST "http://localhost:8000/analyze-job" \
  -H "Content-Type: application/json" \
  -d '{"text": "We are looking for a Python developer..."}'
```

## 🚀 Next Steps

1. **Try the demo** - Run `python run.py`
2. **Upload your own resume** - Use the API or frontend
3. **Test with real job descriptions** - Copy from job boards
4. **Customize the AI prompts** - Edit the tailoring logic
5. **Deploy to cloud** - Use Docker or cloud platforms

## 💡 Tips

- The system works without ML dependencies for basic functionality
- Add spaCy and transformers for advanced NLP features
- Use OpenAI API key for better resume rewriting
- The PDF generator creates ATS-friendly resumes
- Match scores help you optimize for specific jobs

---

**Need help?** Check the API docs at http://localhost:8000/docs or run the demo scripts!