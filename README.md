# AI-Driven Resume & Portfolio Tailor

An intelligent application that automatically rewrites resumes and suggests portfolio projects based on job descriptions using advanced NLP and machine learning techniques.

## 🚀 Quick Start (Windows)

**Easiest way to get started:**

1. **Clone and setup:**
   ```bash
   git clone <your-repo>
   cd ai-resume-tailor
   ```

2. **Run the setup script:**
   
   **For Command Prompt:**
   ```bash
   .\start-simple.bat
   ```
   
   **For PowerShell:**
   ```bash
   .\start-simple.ps1
   ```
   
   This will automatically:
   - Install all dependencies
   - Set up the Python backend (simplified version)
   - Start both servers

3. **Access the application:**
   - Frontend: http://localhost:5173 (or 5174)
   - Backend API: http://localhost:5000

## ✨ Features

- **Complete User Interface**: Landing page, dashboard, authentication
- **Smart Resume Upload**: Supports PDF, DOC, DOCX, and TXT files
- **AI-Powered Analysis**: Uses spaCy and Sentence Transformers for keyword extraction
- **Job Description Processing**: Automatically extracts requirements and key skills
- **ATS Optimization**: Ensures resumes pass Applicant Tracking Systems
- **Portfolio Suggestions**: Recommends relevant projects based on job requirements
- **Interview Practice**: AI-generated interview questions
- **Real-time Analytics**: Match scores and optimization insights

## 🛠 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling

### Backend
- **Python Flask** API
- **Rule-based NLP** for keyword extraction
- **Pattern matching** for skill identification
- **OpenAI GPT** integration (optional)
- **PyPDF2 & python-docx** for file processing

### AI Components
- **Keyword Extraction**: Pattern-based skill and technology identification
- **Smart Matching**: Rule-based similarity scoring with skill weighting
- **AI Rewriting**: OpenAI GPT integration with intelligent fallbacks
- **ATS Optimization**: Custom keyword placement and formatting rules

## 📋 Manual Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- pip package manager

### Frontend Setup
```bash
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python setup.py
python app.py
```

### Test Connection
```bash
node test-connection.js
```

## 🔧 Configuration

### Environment Variables
Create `backend/.env`:
```bash
# OpenAI API Key (optional - for enhanced AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
```

## 📱 How to Use

1. **Sign Up/Sign In**: Create an account or use demo mode
2. **Upload Resume**: Drag & drop your resume (PDF, DOC, DOCX, TXT)
3. **Add Job Description**: Paste the job posting you're applying for
4. **AI Processing**: Watch as AI analyzes and optimizes your resume
5. **Review Results**: See match scores, added keywords, and suggestions
6. **Download**: Get your tailored, ATS-optimized resume

## 🧠 AI Features

### What Makes It Unique
This isn't just ChatGPT + prompts. It includes:

- **Custom NLP Pipeline**: spaCy for skill extraction and entity recognition
- **Semantic Similarity**: BERT embeddings for intelligent matching
- **ATS Optimization**: Keyword placement and formatting algorithms
- **Smart Fallbacks**: Works without OpenAI using built-in models
- **Real-time Processing**: Live feedback and progress indicators

### ML Pipeline
1. **Text Extraction**: Parse resumes from various file formats
2. **NLP Analysis**: Extract skills, experience, and entities using spaCy
3. **Job Parsing**: Identify requirements and key skills from job descriptions
4. **Semantic Matching**: Calculate similarity scores using BERT embeddings
5. **AI Rewriting**: Generate optimized content while maintaining truthfulness
6. **ATS Compliance**: Ensure proper formatting and keyword density

## 🔍 API Endpoints

- `POST /api/upload-resume` - Upload and process resume file
- `POST /api/analyze-job` - Analyze job description
- `POST /api/tailor-resume` - Generate tailored resume
- `GET /api/health` - Health check and model status

## 🚨 Troubleshooting

### Common Issues

**Backend not starting:**
```bash
cd backend
pip install flask flask-cors openai PyPDF2 python-docx python-dotenv requests
python app.py
```

**Frontend errors:**
```bash
npm install
npm run dev
```

**CORS issues:**
- Ensure backend is running on port 5000
- Check Flask-CORS is installed

**File upload problems:**
- Verify file format (PDF, DOC, DOCX, TXT)
- Check file size (max 10MB)

### Test Backend Health
```bash
node test-connection.js
```

## 📊 Development Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend
npm run backend      # Start backend server
npm run setup-backend # Setup backend dependencies

# Combined
npm run start        # Start both frontend and backend
```

## 🎯 Project Structure

```
ai-resume-tailor/
├── src/                    # Frontend React app
│   ├── components/         # React components
│   ├── App.tsx            # Main app component
│   └── main.tsx           # Entry point
├── backend/               # Python Flask API
│   ├── app.py            # Main Flask application
│   ├── requirements.txt   # Python dependencies
│   └── setup.py          # Setup script
├── start-dev.bat         # Windows startup script
├── test-connection.js    # Connection test
└── README.md            # This file
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the 'dist' folder
```

### Backend (Heroku/Railway)
1. Add `Procfile`: `web: python app.py`
2. Set environment variables
3. Deploy backend folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🗺 Roadmap

- [ ] LinkedIn profile integration
- [ ] Multiple resume templates
- [ ] Batch processing for multiple jobs
- [ ] Chrome extension for job sites
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Mobile app version

---

**Ready to land your dream job? Start tailoring your resume with AI! 🎯**