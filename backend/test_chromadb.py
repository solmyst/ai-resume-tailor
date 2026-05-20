#!/usr/bin/env python3
"""
Test suite for ChromaDB Vector Store Integration
"""
import os
import sys
import json

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure encoding for Windows terminals
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
else:
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

from vector_store import VectorStore

def test_vector_store():
    print("Testing ChromaDB Vector Store Integration...")
    print("=" * 50)
    
    # Use a temporary chroma DB in instance/test_chroma_db
    base_dir = os.path.dirname(os.path.abspath(__file__))
    test_db_path = os.path.join(base_dir, 'instance', 'test_chroma_db')
    
    print(f"1. Initializing Vector Store persistent client at:\n   {test_db_path}")
    try:
        vs = VectorStore(persist_directory=test_db_path)
        print("   ✅ Vector Store initialized successfully")
    except Exception as e:
        print(f"   ❌ Failed to initialize Vector Store: {e}")
        return False

    print("\n2. Checking Project Seed Collection...")
    try:
        project_count = vs.projects_collection.count()
        print(f"   ✅ Collection count: {project_count} projects")
        if project_count == 0:
            print("   ❌ Seed projects count is 0")
            return False
    except Exception as e:
        print(f"   ❌ Failed checking projects: {e}")
        return False

    print("\n3. Testing Resume Indexing and Chunking...")
    sample_resume = """
    Jane Smith
    Lead Cloud Engineer | Python Developer
    jane.smith@example.com | Seattle, WA
    
    PROFESSIONAL SUMMARY
    Highly experienced backend engineer specializing in building high-throughput cloud services in Python and designing secure AWS deployments.
    
    TECHNICAL SKILLS
    Languages: Python, Go, SQL, Bash
    Technologies: AWS (VPC, RDS, ECS, Lambda), Docker, Terraform, Git, REST APIs
    
    EXPERIENCE
    Lead Cloud Developer | CloudCorp | 2021 - Present | Seattle, WA
    - Architected serverless REST API endpoints using Python, AWS Lambda, and API Gateway.
    - Automated deployment of full infrastructure stacks using Terraform pipelines, decreasing provisioning time by 60%.
    - Integrated Redis distributed caching layers, reducing SQL query response latency from 150ms to under 15ms.
    - Led a team of 4 software developers to build scalable enterprise apps.
    
    Software Developer | DevStack | 2018 - 2021 | Denver, CO
    - Built responsive web platforms using React, Node.js, and PostgreSQL databases.
    - Managed containerized service deployments using Docker Compose files.
    """
    
    try:
        success = vs.add_resume(
            user_id="test_user_123",
            resume_id="resume_999",
            resume_text=sample_resume,
            filename="jane_smith_resume.pdf"
        )
        if success:
            print("   ✅ Resume parsing and indexing successful")
            resume_chunks = vs.resumes_collection.count()
            print(f"   ✅ Indexed resume chunk count: {resume_chunks}")
        else:
            print("   ❌ Failed to add resume")
            return False
    except Exception as e:
        print(f"   ❌ Exception indexing resume: {e}")
        return False

    print("\n4. Testing Semantic RAG Retrieval (Resume Bullets)...")
    sample_queries = [
        "AWS and Terraform infrastructure deployment automation",
        "Python backend development and SQL database queries",
        "Frontend React development"
    ]
    
    for query in sample_queries:
        print(f"   Querying: '{query}'")
        try:
            matches = vs.query_relevant_resume_elements(
                user_id="test_user_123",
                query_text=query,
                limit=2
            )
            print(f"   Matches found: {len(matches)}")
            for idx, m in enumerate(matches):
                print(f"     Match #{idx+1} [Similarity {m['similarity']}%]: {m['text'][:100]}...")
            if not matches:
                print("   ❌ No semantic matches returned")
                return False
        except Exception as e:
            print(f"   ❌ Query failed: {e}")
            return False

    print("\n5. Testing Semantic Project Recommendations...")
    project_query = "We need an engineer to provision secure cloud networks, build CI/CD pipelines, and write Terraform IaC."
    print(f"   Querying: '{project_query}'")
    try:
        suggestions = vs.query_relevant_projects(project_query, limit=2)
        print(f"   Suggested projects: {len(suggestions)}")
        for idx, s in enumerate(suggestions):
            print(f"     Suggestion #{idx+1} [Score {s['relevanceScore']}%]: {s['name']}")
            print(f"       Tech Stack: {', '.join(s['technologies'])}")
        if not suggestions:
            print("   ❌ No project suggestions returned")
            return False
    except Exception as e:
        print(f"   ❌ Project recommendation query failed: {e}")
        return False

    print("\n6. Cleaning up test data...")
    try:
        vs.clear_user_data("test_user_123")
        user_count = len(vs.resumes_collection.get(where={"user_id": "test_user_123"})['ids'])
        if user_count == 0:
            print("   ✅ Test data cleaned up successfully")
        else:
            print("   ❌ Cleanup failed; items still present")
            return False
    except Exception as e:
        print(f"   ❌ Cleanup exception: {e}")
        return False
        
    return True

if __name__ == "__main__":
    success = test_vector_store()
    print("=" * 50)
    if success:
        print("🎉 ALL CHROMADB TESTS PASSED SUCCESSFULLY!")
        sys.exit(0)
    else:
        print("❌ CHROMADB TEST SUITE FAILED!")
        sys.exit(1)
