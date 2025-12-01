from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from typing import Dict, List
import PyPDF2
import docx
from io import BytesIO
import json
import requests
from bs4 import BeautifulSoup
from database import db, init_db
from models import User, Resume, JobAnalysis, TailoredResume, ActivityLog
from ai_service import AIService
from werkzeug.security import generate_password_hash, check_password_hash
import uuid
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///resume_tailor.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Initialize extensions
init_db(app)
ai_service = AIService()

# Helper functions
def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text from uploaded file"""
    try:
        if filename.lower().endswith('.pdf'):
            pdf_reader = PyPDF2.PdfReader(BytesIO(file_content))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
        elif filename.lower().endswith('.docx'):
            doc = docx.Document(BytesIO(file_content))
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        else:  # txt file
            return file_content.decode('utf-8')
    except Exception as e:
        print(f"Error extracting text: {e}")
        return ""

def scrape_job_description(url: str) -> str:
    """Scrape job description from URL"""
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.decompose()
            
        # Get text
        text = soup.get_text(separator='\n')
        
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        
        return text[:10000]  # Limit length
    except Exception as e:
        print(f"Error scraping URL: {e}")
        return ""

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')

        if not email or not password or not name:
            return jsonify({'error': 'Missing required fields'}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'Email already registered'}), 400

        user_id = str(uuid.uuid4())
        user = User(
            id=user_id,
            email=email,
            name=name,
            password_hash=generate_password_hash(password)
        )
        
        db.session.add(user)
        db.session.commit()

        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'subscription': 'free'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Invalid email or password'}), 401

        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'name': user.name,
                'email': user.email,
                'subscription': 'free'
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upload-resume', methods=['POST'])
def analyze_job():
    """Analyze job description from text or URL"""
    try:
        data = request.get_json()
        job_text = data.get('job_description', '')
        job_url = data.get('job_url', '')
        
        if job_url and not job_text:
            job_text = scrape_job_description(job_url)
            if not job_text:
                return jsonify({'error': 'Failed to scrape job description from URL'}), 400
        
        if not job_text:
            return jsonify({'error': 'Job description or URL is required'}), 400
        
        # Analyze with AI
        job_analysis = ai_service.analyze_job(job_text)
        
        # Save to DB
        new_job = JobAnalysis(
            job_text=job_text,
            job_url=job_url,
            role=job_analysis.get('role'),
            company=job_analysis.get('company'),
            required_skills=job_analysis.get('required_skills')
        )
        db.session.add(new_job)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'job_analysis': job_analysis,
            'job_id': new_job.id,
            'scraped_text': job_text if job_url else None
        })
    
    except Exception as e:
        return jsonify({'error': f'Analysis error: {str(e)}'}), 500

@app.route('/api/tailor-resume', methods=['POST'])
def tailor_resume():
    """Tailor resume based on job description"""
    try:
        data = request.get_json()
        resume_text = data.get('resume_text', '')
        job_text = data.get('job_description', '')
        user_id = data.get('userId', 'guest')
        
        if not resume_text or not job_text:
            return jsonify({'error': 'Resume and Job Description are required'}), 400
            
        # Tailor with AI
        result = ai_service.tailor_resume(resume_text, job_text)
        
        # Save activity
        if user_id != 'guest':
            user = User.query.get(user_id)
            if user:
                activity = ActivityLog(
                    user_id=user_id,
                    action=f"Tailored resume",
                    details={'match_score': result.get('match_score')}
                )
                db.session.add(activity)
                db.session.commit()
        
        return jsonify({
            'success': True,
            'tailored_resume': result.get('tailored_text', ''),
            'match_score': result.get('match_score', 0),
            'added_keywords': result.get('changes_made', []),
            'suggested_projects': [], # Can add this to AI service later
            'ats_optimized': True,
            'job_analysis': {} # Already done in previous step
        })
    
    except Exception as e:
        print(f"Error in tailor_resume: {e}")
        return jsonify({'error': f'Tailoring error: {str(e)}'}), 500

@app.route('/api/user/<user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Calculate stats
        resumes_tailored = TailoredResume.query.join(Resume).filter(Resume.user_id == user_id).count()
        
        # Calculate average match score
        tailored_resumes = TailoredResume.query.join(Resume).filter(Resume.user_id == user_id).all()
        total_score = sum(r.match_score for r in tailored_resumes if r.match_score)
        avg_score = int(total_score / len(tailored_resumes)) if tailored_resumes else 0

        # Get recent activity
        activities = ActivityLog.query.filter_by(user_id=user_id).order_by(ActivityLog.timestamp.desc()).limit(5).all()
        recent_activity = [{
            'id': a.id,
            'action': a.action,
            'time': a.timestamp.strftime('%Y-%m-%d %H:%M'),
            'status': 'completed'
        } for a in activities]

        return jsonify({
            'success': True,
            'stats': {
                'resumes_tailored': resumes_tailored,
                'average_match_score': avg_score,
                'applications_sent': 0, # Placeholder
                'recent_activity': recent_activity
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/user/<user_id>/activity', methods=['POST'])
def add_user_activity(user_id):
    """Log user activity"""
    try:
        data = request.get_json()
        action = data.get('action', '')
        
        # Create user if not exists (simple auto-registration for demo)
        user = User.query.get(user_id)
        if not user:
            # Only create if not exists, but ideally should be registered
            # For backward compatibility with guest mode
            pass 
        
        activity = ActivityLog(user_id=user_id, action=action)
        db.session.add(activity)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'ai_provider': ai_service.provider,
        'database': 'connected'
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)