#!/usr/bin/env python3
"""
One-command startup for AI Resume Tailor
Usage: python run.py
"""

import subprocess
import sys
import os
import time
import threading
import webbrowser
from pathlib import Path

def install_minimal_deps():
    """Install only the essential dependencies for a quick demo"""
    print("📦 Installing minimal dependencies...")
    
    minimal_deps = [
        "fastapi>=0.104.0",
        "uvicorn>=0.24.0", 
        "python-multipart>=0.0.6",
        "pydantic>=2.5.0",
        "python-dotenv>=1.0.0",
        "aiofiles>=0.23.0",
        "reportlab>=4.0.0"
    ]
    
    for dep in minimal_deps:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True, text=True)
            print(f"✅ {dep.split('>=')[0]}")
        except subprocess.CalledProcessError as e:
            print(f"⚠️  Failed to install {dep}: {e}")

def check_backend_ready():
    """Check if backend is responding"""
    import requests
    
    for i in range(20):  # Wait up to 20 seconds
        try:
            response = requests.get("http://localhost:8000/", timeout=2)
            if response.status_code == 200:
                return True
        except:
            pass
        time.sleep(1)
    return False

def open_browser_tabs():
    """Open relevant browser tabs"""
    time.sleep(3)  # Give server time to start
    
    try:
        # Open API docs
        webbrowser.open("http://localhost:8000/docs")
        print("🌐 Opened API documentation")
        
        # Open health check
        webbrowser.open("http://localhost:8000/")
        print("🌐 Opened health check")
        
    except Exception as e:
        print(f"⚠️  Browser opening failed: {e}")

def run_quick_demo():
    """Run a quick API demo"""
    print("\n🎯 Running quick demo...")
    time.sleep(2)
    
    try:
        # Run the demo script
        result = subprocess.run([sys.executable, "demo.py"], 
                              capture_output=True, text=True, timeout=60)
        
        if result.returncode == 0:
            print("✅ Demo completed successfully!")
            print(result.stdout[-500:])  # Show last 500 chars
        else:
            print("⚠️  Demo had some issues:")
            print(result.stderr[-300:])  # Show last 300 chars of errors
            
    except subprocess.TimeoutExpired:
        print("⚠️  Demo timed out (this is normal)")
    except Exception as e:
        print(f"⚠️  Demo error: {e}")

def main():
    """Main startup function"""
    print("⚡ AI Resume Tailor - Quick Start")
    print("=" * 40)
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ required")
        sys.exit(1)
    
    # Install minimal dependencies
    install_minimal_deps()
    
    # Create necessary directories
    os.makedirs("backend/generated_resumes", exist_ok=True)
    os.makedirs("backend/app", exist_ok=True)
    os.makedirs("backend/app/services", exist_ok=True)
    os.makedirs("backend/app/models", exist_ok=True)
    
    print("\n🚀 Starting backend server...")
    
    # Start backend in background
    try:
        backend_process = subprocess.Popen(
            [sys.executable, "main.py"], 
            cwd="backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        print("⏳ Waiting for server to start...")
        
        # Check if backend is ready
        if check_backend_ready():
            print("✅ Backend server is running!")
            print("🌐 API: http://localhost:8000")
            print("📚 Docs: http://localhost:8000/docs")
            
            # Open browser tabs in background
            browser_thread = threading.Thread(target=open_browser_tabs)
            browser_thread.daemon = True
            browser_thread.start()
            
            # Run demo in background
            demo_thread = threading.Thread(target=run_quick_demo)
            demo_thread.daemon = True
            demo_thread.start()
            
            print("\n🎉 System is ready!")
            print("\n💡 What you can do:")
            print("   • Check API docs: http://localhost:8000/docs")
            print("   • Test endpoints manually")
            print("   • Upload resume files via API")
            print("   • Analyze job descriptions")
            
            print("\n⌨️  Press Ctrl+C to stop")
            
            # Keep running
            try:
                backend_process.wait()
            except KeyboardInterrupt:
                print("\n🛑 Stopping server...")
                backend_process.terminate()
                print("✅ Server stopped")
                
        else:
            print("❌ Backend failed to start")
            backend_process.terminate()
            
    except Exception as e:
        print(f"❌ Error starting backend: {e}")

if __name__ == "__main__":
    main()