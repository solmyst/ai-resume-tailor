#!/usr/bin/env python3
"""
System test script for AI Resume Tailor
Tests all components without starting servers
"""

import sys
import os
import tempfile
from pathlib import Path

# Add backend to path
sys.path.append('backend')

def test_imports():
    """Test that all required modules can be imported"""
    print("🔍 Testing imports...")
    
    try:
        from app.models.schemas import ParsedResume, JobAnalysis, TailoredResume, JobDescription
        print("✅ Schemas imported successfully")
    except Exception as e:
        print(f"❌ Schema import failed: {e}")
        return False
    
    try:
        from app.services.resume_parser import ResumeParser
        print("✅ Resume parser imported successfully")
    except Exception as e:
        print(f"❌ Resume parser import failed: {e}")
        return False
    
    try:
        from app.services.job_analyzer import JobAnalyzer
        print("✅ Job analyzer imported successfully")
    except Exception as e:
        print(f"❌ Job analyzer import failed: {e}")
        return False
    
    try:
        from app.services.resume_tailor import ResumeTailor
        print("✅ Resume tailor imported successfully")
    except Exception as e:
        print(f"❌ Resume tailor import failed: {e}")
        return False
    
    try:
        from app.services.pdf_generator import PDFGenerator
        print("✅ PDF generator imported successfully")
    except Exception as e:
        print(f"❌ PDF generator import failed: {e}")
        return False
    
    return True

def test_resume_parsing():
    """Test resume parsing functionality"""
    print("\n📄 Testing resume parsing...")
    
    try:
        from app.services.resume_parser import ResumeParser
        
        parser = ResumeParser()
        
        # Create sample resume content
        sample_resume = """
        John Smith
        Software Engineer
        john.smith@email.com
        +1-555-0123
        
        SUMMARY
        Experienced software engineer with expertise in Python and web development.
        
        SKILLS
        Python, JavaScript, React, SQL, AWS
        
        EXPERIENCE
        Senior Developer | Tech Corp | 2020-2024
        Developed web applications and managed databases.
        """
        
        # Test parsing
        parsed = parser._parse_resume_text(sample_resume)
        
        print(f"✅ Parsed name: {parsed.name}")
        print(f"✅ Parsed email: {parsed.email}")
        print(f"✅ Parsed skills: {len(parsed.skills)} skills found")
        print(f"✅ Parsed experience: {len(parsed.experience)} jobs found")
        
        return True
        
    except Exception as e:
        print(f"❌ Resume parsing failed: {e}")
        return False

def test_job_analysis():
    """Test job description analysis"""
    print("\n🔍 Testing job analysis...")
    
    try:
        from app.services.job_analyzer import JobAnalyzer
        
        analyzer = JobAnalyzer()
        
        sample_job = """
        Senior Python Developer - Remote
        
        We are looking for a Senior Python Developer with 5+ years of experience.
        
        Requirements:
        • Strong proficiency in Python and Django
        • Experience with React and JavaScript
        • Knowledge of AWS and Docker
        • SQL database experience
        • Agile development experience
        
        Preferred:
        • Machine Learning experience
        • Leadership skills
        """
        
        analysis = analyzer.analyze(sample_job)
        
        print(f"✅ Required skills found: {len(analysis.required_skills)}")
        print(f"✅ Experience level: {analysis.experience_level}")
        print(f"✅ Key responsibilities: {len(analysis.key_responsibilities)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Job analysis failed: {e}")
        return False

def test_resume_tailoring():
    """Test resume tailoring functionality"""
    print("\n🎯 Testing resume tailoring...")
    
    try:
        from app.services.resume_parser import ResumeParser
        from app.services.job_analyzer import JobAnalyzer
        from app.services.resume_tailor import ResumeTailor
        
        # Create sample data
        parser = ResumeParser()
        analyzer = JobAnalyzer()
        tailor = ResumeTailor()
        
        sample_resume = "John Doe\njohn@email.com\nPython developer with React experience"
        sample_job = "Looking for Python developer with React and AWS skills"
        
        parsed_resume = parser._parse_resume_text(sample_resume)
        job_analysis = analyzer.analyze(sample_job)
        
        tailored = tailor.tailor(parsed_resume, job_analysis)
        
        print(f"✅ Match score: {tailored.match_score:.1%}")
        print(f"✅ Tailored summary length: {len(tailored.tailored_summary)} chars")
        print(f"✅ Recommended skills: {len(tailored.recommended_skills)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Resume tailoring failed: {e}")
        return False

def test_pdf_generation():
    """Test PDF generation"""
    print("\n📑 Testing PDF generation...")
    
    try:
        from app.services.resume_parser import ResumeParser
        from app.services.job_analyzer import JobAnalyzer
        from app.services.resume_tailor import ResumeTailor
        from app.services.pdf_generator import PDFGenerator
        
        # Create sample tailored resume
        parser = ResumeParser()
        analyzer = JobAnalyzer()
        tailor = ResumeTailor()
        pdf_gen = PDFGenerator()
        
        sample_resume = "John Doe\njohn@email.com\nPython developer"
        sample_job = "Python developer needed"
        
        parsed_resume = parser._parse_resume_text(sample_resume)
        job_analysis = analyzer.analyze(sample_job)
        tailored = tailor.tailor(parsed_resume, job_analysis)
        
        # Generate PDF
        pdf_path = pdf_gen.generate(tailored)
        
        if os.path.exists(pdf_path):
            print(f"✅ PDF generated: {pdf_path}")
            print(f"✅ File size: {os.path.getsize(pdf_path)} bytes")
            return True
        else:
            print("❌ PDF file not created")
            return False
        
    except Exception as e:
        print(f"❌ PDF generation failed: {e}")
        return False

def test_api_compatibility():
    """Test API schema compatibility"""
    print("\n🔌 Testing API compatibility...")
    
    try:
        from app.models.schemas import JobDescription, ParsedResume, JobAnalysis, TailoredResume
        
        # Test JobDescription
        job_desc = JobDescription(text="Sample job description")
        print("✅ JobDescription schema works")
        
        # Test ParsedResume
        resume = ParsedResume(
            name="John Doe",
            email="john@email.com",
            summary="Developer",
            experience=[],
            education=[],
            skills=["Python"],
            projects=[]
        )
        print("✅ ParsedResume schema works")
        
        # Test serialization
        resume_dict = resume.dict()
        print(f"✅ Resume serialization works: {len(resume_dict)} fields")
        
        return True
        
    except Exception as e:
        print(f"❌ API compatibility failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 AI Resume Tailor - System Test")
    print("=" * 50)
    
    tests = [
        ("Import Test", test_imports),
        ("Resume Parsing", test_resume_parsing),
        ("Job Analysis", test_job_analysis),
        ("Resume Tailoring", test_resume_tailoring),
        ("PDF Generation", test_pdf_generation),
        ("API Compatibility", test_api_compatibility)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} CRASHED: {e}")
    
    print(f"\n{'='*50}")
    print(f"🎯 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! System is ready to run.")
        print("\n🚀 Next steps:")
        print("   python run.py          # Quick start")
        print("   python start_demo.py   # Full demo")
        print("   python demo.py         # API demo")
    else:
        print("⚠️  Some tests failed. Check the errors above.")
        print("\n💡 Try installing missing dependencies:")
        print("   pip install fastapi uvicorn reportlab pydantic")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)