#!/usr/bin/env python3
"""
Complete demo startup script for AI Resume Tailor
"""

import subprocess
import sys
import os
import time
import threading
import webbrowser
from pathlib import Path

def run_command(command, cwd=None, background=False):
    """Run a command with proper error handling"""
    try:
        if background:
            return subprocess.Popen(command, shell=True, cwd=cwd)
        else:
            result = subprocess.run(command, shell=True, check=True, cwd=cwd, 
                                  capture_output=True, text=True)
            return result
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running: {command}")
        print(f"Error: {e.stderr}")
        return None

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    # Check Python
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        return False
    
    # Check if backend dependencies are installed
    try:
        import fastapi
        import uvicorn
        print("✅ Backend dependencies found")
    except ImportError:
        print("⚠️  Installing backend dependencies...")
        result = run_command("pip install -r backend/requirements.txt")
        if not result:
            return False
    
    # Check if Node.js is available for frontend
    try:
        result = run_command("node --version")
        if result:
            print("✅ Node.js found")
        else:
            print("⚠️  Node.js not found - frontend won't be available")
    except:
        print("⚠️  Node.js not found - frontend won't be available")
    
    return True

def start_backend():
    """Start the FastAPI backend"""
    print("🚀 Starting backend server...")
    
    # Change to backend directory and start server
    backend_process = run_command("python main.py", cwd="backend", background=True)
    
    if backend_process:
        print("✅ Backend server starting on http://localhost:8000")
        return backend_process
    else:
        print("❌ Failed to start backend server")
        return None

def start_frontend():
    """Start the React frontend if available"""
    print("🌐 Starting frontend server...")
    
    # Check if node_modules exists
    if not os.path.exists("frontend/node_modules"):
        print("📦 Installing frontend dependencies...")
        result = run_command("npm install", cwd="frontend")
        if not result:
            print("❌ Failed to install frontend dependencies")
            return None
    
    # Start frontend
    frontend_process = run_command("npm start", cwd="frontend", background=True)
    
    if frontend_process:
        print("✅ Frontend server starting on http://localhost:3000")
        return frontend_process
    else:
        print("❌ Failed to start frontend server")
        return None

def wait_for_backend():
    """Wait for backend to be ready"""
    import requests
    
    print("⏳ Waiting for backend to be ready...")
    for i in range(30):  # Wait up to 30 seconds
        try:
            response = requests.get("http://localhost:8000/", timeout=2)
            if response.status_code == 200:
                print("✅ Backend is ready!")
                return True
        except:
            pass
        time.sleep(1)
    
    print("❌ Backend failed to start within 30 seconds")
    return False

def run_demo():
    """Run the demo script"""
    print("\n🎯 Running demo script...")
    time.sleep(2)  # Give servers time to fully start
    
    try:
        result = run_command("python demo.py")
        if result:
            print("✅ Demo completed successfully!")
        else:
            print("❌ Demo failed")
    except Exception as e:
        print(f"❌ Error running demo: {e}")

def open_browser():
    """Open browser tabs for the application"""
    time.sleep(5)  # Wait for servers to start
    
    try:
        # Open API documentation
        webbrowser.open("http://localhost:8000/docs")
        print("🌐 Opened API documentation in browser")
        
        # Try to open frontend if available
        try:
            import requests
            response = requests.get("http://localhost:3000", timeout=2)
            if response.status_code == 200:
                webbrowser.open("http://localhost:3000")
                print("🌐 Opened frontend in browser")
        except:
            pass
    except Exception as e:
        print(f"⚠️  Could not open browser: {e}")

def main():
    """Main demo function"""
    print("🎉 AI Resume Tailor - Complete Demo")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Dependency check failed")
        return
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        return
    
    # Wait for backend to be ready
    if not wait_for_backend():
        backend_process.terminate()
        return
    
    # Start frontend (optional)
    frontend_process = start_frontend()
    
    # Open browser in background
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Run demo
    run_demo()
    
    print("\n🎯 Demo completed! Servers are still running.")
    print("\n🌐 Available endpoints:")
    print("   • API Documentation: http://localhost:8000/docs")
    print("   • API Health Check: http://localhost:8000/")
    if frontend_process:
        print("   • Frontend App: http://localhost:3000")
    
    print("\n⌨️  Press Ctrl+C to stop all servers")
    
    try:
        # Keep the script running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Stopping servers...")
        backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        print("✅ All servers stopped")

if __name__ == "__main__":
    main()