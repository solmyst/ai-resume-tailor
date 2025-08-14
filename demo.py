#!/usr/bin/env python3
"""
Demo script for AI Resume Tailor
Creates sample data and demonstrates the functionality
"""

import requests
import json
import time
import os

API_BASE = "http://localhost:8000"

def check_api_health():
    """Check if API is running"""
    try:
        response = requests.get(f"{API_BASE}/")
        if response.status_code == 200:
            print("✅ API is running!")
            return True
        else:
            print("❌ API is not responding correctly")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the backend is running on port 8000")
        return False

def create_sample_resume():
    """Create a sample resume file for demo"""
    sample_resume = """
JOHN DOE
Software Engineer
Email: john.doe@email.com
Phone: +1-555-0123

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of expertise in full-stack development, 
cloud technologies, and team leadership. Proven track record of delivering scalable 
solutions and driving technical innovation.

TECHNICAL SKILLS
• Programming: Python, JavaScript, Java, TypeScript
• Frameworks: React, Node.js, Django, Flask
• Databases: PostgreSQL, MongoDB, Redis
• Cloud: AWS, Docker, Kubernetes
• Tools: Git, Jenkins, CI/CD

PROFESSIONAL EXPERIENCE

Senior Software Engineer | Tech Solutions Inc | 2021-2024
• Led development of scalable web applications using modern technologies
• Managed team of 5 developers and improved system performance by 40%
• Implemented microservices architecture reducing deployment time by 60%
• Collaborated with product teams to deliver features for 100K+ users

Software Developer | StartupCorp | 2019-2021
• Developed full-stack applications using React and Node.js
• Implemented CI/CD pipelines and automated testing frameworks
• Built RESTful APIs serving 10K+ daily requests
• Optimized database queries improving response time by 50%

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2019

PROJECTS
E-commerce Platform
• Built full-stack e-commerce solution with React frontend and Node.js backend
• Technologies: React, Node.js, MongoDB, Stripe API

Data Analytics Dashboard
• Created real-time analytics dashboard for business intelligence
• Technologies: Python, Django, PostgreSQL, Chart.js
"""
    
    with open("sample_resume.txt", "w") as f:
        f.write(sample_resume)
    
    print("📄 Created sample resume: sample_resume.txt")
    return "sample_resume.txt"

def demo_resume_upload(resume_file):
    """Demo resume upload functionality"""
    print("\n🔄 Testing resume upload...")
    
    try:
        with open(resume_file, 'rb') as f:
            files = {'file': (resume_file, f, 'text/plain')}
            response = requests.post(f"{API_BASE}/upload-resume", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Resume uploaded and parsed successfully!")
            print(f"   Name: {data['data']['name']}")
            print(f"   Email: {data['data']['email']}")
            print(f"   Skills: {', '.join(data['data']['skills'][:5])}...")
            return data['data']
        else:
            print(f"❌ Upload failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error uploading resume: {e}")
        return None

def demo_job_analysis():
    """Demo job description analysis"""
    print("\n🔄 Testing job description analysis...")
    
    sample_job = """
Senior Full Stack Developer - Remote

We are looking for a Senior Full Stack Developer to join our growing team. 

Requirements:
• 5+ years of experience in full-stack development
• Strong proficiency in React, Node.js, and TypeScript
• Experience with cloud platforms (AWS preferred)
• Knowledge of microservices architecture
• Proficiency in SQL and NoSQL databases (PostgreSQL, MongoDB)
• Experience with Docker and Kubernetes
• Strong understanding of CI/CD pipelines
• Excellent problem-solving skills

Preferred Qualifications:
• Experience with Python and Django
• Knowledge of machine learning concepts
• Experience with Agile/Scrum methodologies
• Strong communication skills

We offer:
• Competitive salary and equity
• Remote-first culture
• Professional development opportunities
• Collaborative and innovative environment
"""
    
    try:
        payload = {"text": sample_job}
        response = requests.post(f"{API_BASE}/analyze-job", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Job description analyzed successfully!")
            print(f"   Required Skills: {', '.join(data['data']['required_skills'][:5])}...")
            print(f"   Experience Level: {data['data']['experience_level']}")
            print(f"   Company Values: {', '.join(data['data']['company_values'][:3])}...")
            return data['data']
        else:
            print(f"❌ Analysis failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error analyzing job: {e}")
        return None

def demo_resume_tailoring(resume_data, job_analysis):
    """Demo resume tailoring functionality"""
    print("\n🔄 Testing resume tailoring...")
    
    try:
        payload = {
            "resume_data": resume_data,
            "job_analysis": job_analysis
        }
        response = requests.post(f"{API_BASE}/tailor-resume", json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Resume tailored successfully!")
            print(f"   Match Score: {data['data']['match_score']:.1%}")
            print(f"   Recommended Skills: {', '.join(data['data']['recommended_skills'][:5])}...")
            print(f"   Tailored Summary Preview: {data['data']['tailored_summary'][:100]}...")
            return data['data']
        else:
            print(f"❌ Tailoring failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error tailoring resume: {e}")
        return None

def demo_pdf_generation(tailored_resume):
    """Demo PDF generation"""
    print("\n🔄 Testing PDF generation...")
    
    try:
        response = requests.post(f"{API_BASE}/generate-pdf", json=tailored_resume)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ PDF generated successfully!")
            print(f"   PDF Path: {data['pdf_path']}")
            print(f"   Download URL: {API_BASE}{data['download_url']}")
            return data
        else:
            print(f"❌ PDF generation failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error generating PDF: {e}")
        return None

def main():
    """Run the complete demo"""
    print("🚀 AI Resume Tailor - Demo Script")
    print("=" * 50)
    
    # Check API health
    if not check_api_health():
        print("\n💡 To start the API, run: python backend/main.py")
        return
    
    # Create sample resume
    resume_file = create_sample_resume()
    
    # Demo workflow
    print("\n🎯 Starting demo workflow...")
    
    # Step 1: Upload resume
    resume_data = demo_resume_upload(resume_file)
    if not resume_data:
        return
    
    # Step 2: Analyze job description
    job_analysis = demo_job_analysis()
    if not job_analysis:
        return
    
    # Step 3: Tailor resume
    tailored_resume = demo_resume_tailoring(resume_data, job_analysis)
    if not tailored_resume:
        return
    
    # Step 4: Generate PDF
    pdf_result = demo_pdf_generation(tailored_resume)
    if not pdf_result:
        return
    
    print("\n🎉 Demo completed successfully!")
    print("\n📋 Summary:")
    print(f"   ✅ Resume parsed and analyzed")
    print(f"   ✅ Job description analyzed")
    print(f"   ✅ Resume tailored with {tailored_resume['match_score']:.1%} match")
    print(f"   ✅ PDF generated and ready for download")
    
    print(f"\n🌐 Try the web interface:")
    print(f"   Frontend: http://localhost:3000 (if running)")
    print(f"   API Docs: http://localhost:8000/docs")
    
    # Cleanup
    if os.path.exists(resume_file):
        os.remove(resume_file)
        print(f"\n🧹 Cleaned up {resume_file}")

if __name__ == "__main__":
    main()