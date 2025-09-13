#!/usr/bin/env python3
"""
Test script for Resume Tailor API
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_job_analysis():
    """Test job analysis endpoint"""
    print("\nTesting job analysis...")
    
    sample_job = """
    Software Engineer - Full Stack
    
    We are looking for a talented Software Engineer to join our team.
    
    Requirements:
    - 3+ years of experience in JavaScript and React
    - Experience with Node.js and Express
    - Knowledge of SQL databases
    - Familiarity with AWS cloud services
    - Experience with Git and CI/CD pipelines
    
    Preferred:
    - TypeScript experience
    - Docker and Kubernetes knowledge
    - GraphQL experience
    """
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/analyze-job",
            json={"job_description": sample_job}
        )
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_resume_tailoring():
    """Test resume tailoring endpoint"""
    print("\nTesting resume tailoring...")
    
    sample_resume = """
    John Doe
    Software Developer
    
    SKILLS:
    - JavaScript, Python, Java
    - React, Angular
    - Node.js, Express
    - MySQL, MongoDB
    - Git, Docker
    
    EXPERIENCE:
    Software Developer | ABC Company | 2020-2023
    - Developed web applications using React and Node.js
    - Worked with databases and APIs
    - Collaborated with team members
    """
    
    sample_job = """
    Senior React Developer
    
    Requirements:
    - 5+ years React experience
    - TypeScript knowledge
    - AWS experience
    - GraphQL preferred
    """
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/tailor-resume",
            json={
                "resume_text": sample_resume,
                "job_description": sample_job
            }
        )
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Match Score: {data.get('match_score', 'N/A')}%")
            print(f"Added Keywords: {data.get('added_keywords', [])}")
            print(f"Suggested Projects: {data.get('suggested_projects', [])}")
            print(f"ATS Optimized: {data.get('ats_optimized', False)}")
        else:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    print("Resume Tailor API Test Suite")
    print("=" * 40)
    
    tests = [
        ("Health Check", test_health),
        ("Job Analysis", test_job_analysis),
        ("Resume Tailoring", test_resume_tailoring)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n{test_name}:")
        print("-" * 20)
        success = test_func()
        results.append((test_name, success))
    
    print("\n" + "=" * 40)
    print("Test Results:")
    for test_name, success in results:
        status = "✓ PASS" if success else "✗ FAIL"
        print(f"{test_name}: {status}")
    
    all_passed = all(success for _, success in results)
    print(f"\nOverall: {'✓ ALL TESTS PASSED' if all_passed else '✗ SOME TESTS FAILED'}")

if __name__ == "__main__":
    main()