#!/usr/bin/env python3
"""
Quick start script - minimal setup for immediate demo
"""

import subprocess
import sys
import os

def install_backend_deps():
    """Install only essential backend dependencies"""
    print("📦 Installing backend dependencies...")
    
    essential_deps = [
        "fastapi==0.104.1",
        "uvicorn==0.24.0", 
        "python-multipart==0.0.6",
        "pydantic==2.5.0",
        "python-docx==1.1.0",
        "PyPDF2==3.0.1",
        "reportlab==4.0.7",
        "python-dotenv==1.0.0",
        "aiofiles==0.23.2",
        "numpy==1.24.3",
        "requests==2.31.0"
    ]
    
    for dep in essential_deps:
        try:
            subprocess.run([sys.executable, "-m", "pip", "install", dep], 
                         check=True, capture_output=True)
            print(f"✅ {dep.split('==')[0]}")
        except subprocess.CalledProcessError:
            print(f"⚠️  Failed to install {dep}")

def start_backend():
    """Start the backend server"""
    print("\n🚀 Starting backend server...")
    
    try:
        # Start the server
        os.chdir("backend")
        subprocess.run([sys.executable, "main.py"], check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Quick start main function"""
    print("⚡ AI Resume Tailor - Quick Start")
    print("=" * 40)
    
    # Install dependencies
    install_backend_deps()
    
    # Start backend
    start_backend()

if __name__ == "__main__":
    main()