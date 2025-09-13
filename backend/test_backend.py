#!/usr/bin/env python3
"""
Test script for Resume Tailor Backend
"""

import requests
import json

BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("1. Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Backend is healthy")
            print(f"   OpenAI configured: {data.get('openai_configured', False)}")
            return True
        else:
            print(f"   ❌ Health check failed")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_resume_tailoring():
    """Test resume tailoring endpoint"""
    print("\n2. Testing resume tailoring...")
    
    sample_resume = """
    John Doe
    Software Developer
    
    EXPERIENCE:
    Software Developer at ABC Company (2020-2023)
    - Developed web applications using JavaScript and React
    - Worked with databases and APIs
    - Collaborated with team members on various projects
    
    SKILLS:
    JavaScript, React, HTML, CSS, Git
    
    EDUCATION:
    Bachelor's in Computer Science
    """
    
    sample_job = """
    Senior React Developer
    
    We are looking for a Senior React Developer to join our team.
    
    Requirements:
    - 3+ years of React experience
    - TypeScript knowledge
    - Node.js experience
    - AWS cloud experience preferred
    - Strong problem-solving skills
    """
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/tailor-resume",
            json={
                "resume_text": sample_resume,
                "job_description": sample_job
            },
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"   ✅ Resume tailoring successful")
                print(f"   Match Score: {data.get('match_score', 'N/A')}%")
                print(f"   Added Keywords: {len(data.get('added_keywords', []))} keywords")
                print(f"   Suggested Projects: {len(data.get('suggested_projects', []))} projects")
                print(f"   ATS Optimized: {data.get('ats_optimized', False)}")
                return True
            else:
                print(f"   ❌ Tailoring failed: {data}")
                return False
        else:
            print(f"   ❌ HTTP Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def test_user_stats():
    """Test user statistics endpoints"""
    print("\n3. Testing user statistics...")
    
    try:
        # Test getting stats
        response = requests.get(f"{BASE_URL}/api/user/test-user/stats")
        print(f"   Get stats status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print(f"   ✅ User stats retrieved")
                stats = data.get('stats', {})
                print(f"   Resumes tailored: {stats.get('resumes_tailored', 0)}")
                print(f"   Average match score: {stats.get('average_match_score', 0)}%")
            else:
                print(f"   ❌ Failed to get stats: {data}")
                return False
        else:
            print(f"   ❌ HTTP Error: {response.text}")
            return False
        
        # Test adding activity
        activity_response = requests.post(
            f"{BASE_URL}/api/user/test-user/activity",
            json={
                "action": "Test resume tailoring",
                "match_score": 85
            },
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"   Add activity status: {activity_response.status_code}")
        
        if activity_response.status_code == 200:
            activity_data = activity_response.json()
            if activity_data.get('success'):
                print(f"   ✅ Activity tracking successful")
                return True
            else:
                print(f"   ❌ Activity tracking failed: {activity_data}")
                return False
        else:
            print(f"   ❌ HTTP Error: {activity_response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    print("Resume Tailor Backend Test Suite")
    print("=" * 50)
    
    tests = [
        ("Health Check", test_health),
        ("Resume Tailoring", test_resume_tailoring),
        ("User Statistics", test_user_stats)
    ]
    
    results = []
    for test_name, test_func in tests:
        success = test_func()
        results.append((test_name, success))
    
    print("\n" + "=" * 50)
    print("Test Results:")
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"  {test_name}: {status}")
    
    all_passed = all(success for _, success in results)
    print(f"\nOverall: {'✅ ALL TESTS PASSED' if all_passed else '❌ SOME TESTS FAILED'}")
    
    if all_passed:
        print("\n🎉 Backend is working correctly!")
        print("You can now start the frontend with: npm run dev")
    else:
        print("\n🔧 Please check the backend logs for errors")

if __name__ == "__main__":
    main()