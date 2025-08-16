#!/usr/bin/env python3
"""
Backend-only startup script with UI instructions
"""

import subprocess
import sys
import time
import webbrowser
import threading

def start_backend():
    """Start the FastAPI backend"""
    print("🚀 Starting backend API server...")
    try:
        # Start the backend server
        process = subprocess.Popen([sys.executable, "backend/main.py"])
        return process
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def wait_for_backend():
    """Wait for backend to be ready"""
    print("⏳ Waiting for backend to start...")
    
    for i in range(30):
        try:
            import requests
            response = requests.get("http://localhost:8001/", timeout=2)
            if response.status_code == 200:
                print("✅ Backend API is ready!")
                return True
        except:
            pass
        time.sleep(1)
    
    print("❌ Backend failed to start within 30 seconds")
    return False

def open_api_docs():
    """Open API documentation"""
    time.sleep(2)
    try:
        webbrowser.open("http://localhost:8001/docs")
        print("🌐 Opened API documentation in browser")
    except Exception as e:
        print(f"⚠️  Could not open browser: {e}")

def main():
    """Main function"""
    print("🎉 AI Resume Tailor - Backend Server")
    print("=" * 40)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        return
    
    # Wait for backend
    if not wait_for_backend():
        backend_process.terminate()
        return
    
    # Open API docs
    docs_thread = threading.Thread(target=open_api_docs)
    docs_thread.daemon = True
    docs_thread.start()
    
    print("\n🎯 Backend is running!")
    print("\n🌐 Available URLs:")
    print("   • API Server: http://localhost:8001")
    print("   • API Docs: http://localhost:8001/docs")
    print("   • Health Check: http://localhost:8001/")
    
    print("\n📱 Frontend UI:")
    print("   • Modern UI: frontend/ (requires Node.js)")
    print("   • Demo UI: demo_ui.html (open in browser)")
    
    print("\n🔧 API Endpoints:")
    print("   • POST /upload-resume - Upload resume file")
    print("   • POST /analyze-job - Analyze job description")
    print("   • POST /tailor-resume - Generate tailored resume")
    print("   • POST /generate-pdf - Create PDF")
    
    print("\n💡 To use the modern UI:")
    print("   1. Install Node.js from https://nodejs.org")
    print("   2. cd frontend")
    print("   3. npm install")
    print("   4. npm run dev")
    
    print("\n⌨️  Press Ctrl+C to stop the server")
    
    try:
        # Keep the script running
        backend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping server...")
        backend_process.terminate()
        print("✅ Server stopped")

if __name__ == "__main__":
    main()