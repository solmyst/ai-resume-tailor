#!/usr/bin/env python3
"""
Complete application startup script
Starts both backend API and frontend UI
"""

import subprocess
import sys
import os
import time
import threading
import webbrowser
from pathlib import Path

def start_backend():
    """Start the FastAPI backend"""
    print("🚀 Starting backend API server...")
    try:
        # Start the backend server
        process = subprocess.Popen([sys.executable, "backend/main.py"], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        return process
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def start_frontend():
    """Start the Vite frontend"""
    print("🌐 Starting frontend development server...")
    
    ui_path = Path("frontend")
    
    # Check if node_modules exists
    if not (ui_path / "node_modules").exists():
        print("📦 Installing frontend dependencies...")
        try:
            subprocess.run(["npm", "install"], cwd=ui_path, check=True)
            print("✅ Frontend dependencies installed")
        except subprocess.CalledProcessError:
            print("❌ Failed to install frontend dependencies")
            return None
    
    try:
        # Start the frontend dev server
        process = subprocess.Popen(["npm", "run", "dev"], 
                                 cwd=ui_path,
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        return process
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        return None

def wait_for_servers():
    """Wait for both servers to be ready"""
    print("⏳ Waiting for servers to start...")
    
    # Wait for backend
    backend_ready = False
    for i in range(30):
        try:
            import requests
            response = requests.get("http://localhost:8001/", timeout=2)
            if response.status_code == 200:
                print("✅ Backend API is ready!")
                backend_ready = True
                break
        except:
            pass
        time.sleep(1)
    
    # Wait for frontend
    frontend_ready = False
    for i in range(30):
        try:
            import requests
            response = requests.get("http://localhost:5173/", timeout=2)
            if response.status_code == 200:
                print("✅ Frontend is ready!")
                frontend_ready = True
                break
        except:
            pass
        time.sleep(1)
    
    return backend_ready, frontend_ready

def open_browser():
    """Open the application in browser"""
    time.sleep(3)
    try:
        webbrowser.open("http://localhost:5173")
        print("🌐 Opened application in browser")
    except Exception as e:
        print(f"⚠️  Could not open browser: {e}")

def main():
    """Main startup function"""
    print("🎉 AI Resume Tailor - Full Application Startup")
    print("=" * 50)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        print("❌ Could not start backend")
        return
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("❌ Could not start frontend")
        backend_process.terminate()
        return
    
    # Wait for servers
    backend_ready, frontend_ready = wait_for_servers()
    
    if not backend_ready:
        print("⚠️  Backend not ready - app will run in demo mode")
    
    if not frontend_ready:
        print("❌ Frontend not ready")
        backend_process.terminate()
        frontend_process.terminate()
        return
    
    # Open browser
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    print("\n🎯 Application is running!")
    print("\n🌐 Available URLs:")
    print("   • Frontend App: http://localhost:5173")
    print("   • Backend API: http://localhost:8001")
    print("   • API Docs: http://localhost:8001/docs")
    
    print("\n✨ Features:")
    print("   • Upload and parse resumes (PDF, DOCX, TXT)")
    print("   • AI-powered job description analysis")
    print("   • Intelligent resume tailoring")
    print("   • ATS-optimized PDF generation")
    print("   • Portfolio project suggestions")
    
    print("\n⌨️  Press Ctrl+C to stop all servers")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✅ All servers stopped")

if __name__ == "__main__":
    main()