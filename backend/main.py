from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from app.services.resume_parser import ResumeParser
from app.services.job_analyzer import JobAnalyzer
from app.services.resume_tailor import ResumeTailor
from app.services.simple_pdf_generator import SimplePDFGenerator
from app.models.schemas import JobDescription, TailoredResume, ParsedResume, JobAnalysis
import os
from dotenv import load_dotenv
import json

load_dotenv()

app = FastAPI(title="AI Resume Tailor", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files
if os.path.exists("generated_resumes"):
    app.mount("/files", StaticFiles(directory="generated_resumes"), name="files")

# Initialize services
resume_parser = ResumeParser()
job_analyzer = JobAnalyzer()
resume_tailor = ResumeTailor()
pdf_generator = SimplePDFGenerator()

class TailorRequest(BaseModel):
    resume_data: dict
    job_analysis: dict

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "AI Resume Tailor API is running!", "status": "healthy"}

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Parse uploaded resume and extract information"""
    try:
        content = await file.read()
        parsed_resume = resume_parser.parse(content, file.filename or "resume.txt")
        return {"status": "success", "data": parsed_resume.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing resume: {str(e)}")

@app.post("/analyze-job")
async def analyze_job(job_description: JobDescription):
    """Analyze job description and extract key requirements"""
    try:
        analysis = job_analyzer.analyze(job_description.text)
        return {"status": "success", "data": analysis.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error analyzing job: {str(e)}")

@app.post("/tailor-resume")
async def tailor_resume(request: TailorRequest):
    """Generate tailored resume based on job requirements"""
    try:
        # Convert dict to Pydantic models
        resume_data = ParsedResume(**request.resume_data)
        job_analysis = JobAnalysis(**request.job_analysis)
        
        tailored = resume_tailor.tailor(resume_data, job_analysis)
        return {"status": "success", "data": tailored.dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error tailoring resume: {str(e)}")

@app.post("/generate-pdf")
async def generate_pdf(tailored_resume: dict):
    """Generate ATS-optimized PDF"""
    try:
        # Convert dict to TailoredResume model
        tailored_resume_obj = TailoredResume(**tailored_resume)
        pdf_path = pdf_generator.generate(tailored_resume_obj)
        
        # Return file path for download
        filename = os.path.basename(pdf_path)
        return {"status": "success", "pdf_path": pdf_path, "download_url": f"/download-pdf/{filename}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generating PDF: {str(e)}")

@app.get("/download-pdf/{filename}")
async def download_pdf(filename: str):
    """Download generated PDF"""
    file_path = os.path.join("generated_resumes", filename)
    if os.path.exists(file_path):
        return FileResponse(
            path=file_path,
            filename=filename,
            media_type='application/pdf'
        )
    else:
        raise HTTPException(status_code=404, detail="PDF not found")

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting AI Resume Tailor API...")
    print("📝 API Documentation: http://localhost:8000/docs")
    print("🔗 Health Check: http://localhost:8000/")
    uvicorn.run(app, host="0.0.0.0", port=8000)