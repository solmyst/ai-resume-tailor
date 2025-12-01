from datetime import datetime
from database import db

class User(db.Model):
    id = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resumes = db.relationship('Resume', backref='user', lazy=True)
    activities = db.relationship('ActivityLog', backref='user', lazy=True)

class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    original_text = db.Column(db.Text, nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    parsed_data = db.Column(db.JSON)  # Store skills, etc.
    tailored_versions = db.relationship('TailoredResume', backref='original_resume', lazy=True)

class JobAnalysis(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    job_text = db.Column(db.Text, nullable=False)
    job_url = db.Column(db.String(500))
    role = db.Column(db.String(100))
    company = db.Column(db.String(100))
    required_skills = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    tailored_resumes = db.relationship('TailoredResume', backref='job', lazy=True)

class TailoredResume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    resume_id = db.Column(db.Integer, db.ForeignKey('resume.id'), nullable=False)
    job_id = db.Column(db.Integer, db.ForeignKey('job_analysis.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    match_score = db.Column(db.Integer)
    added_keywords = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(200), nullable=False)
    details = db.Column(db.JSON)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
