#!/usr/bin/env python3
"""
Simple project runner - starts backend and provides frontend instructions
"""

import subprocess
import sys
import time
import webbrowser
import threading
import os

def start_backend():
    """Start the FastAPI backend"""
    print("🚀 Starting backend API server...")
    try:
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
    
    return False

def open_docs():
    """Open API documentation"""
    time.sleep(2)
    try:
        webbrowser.open("http://localhost:8001/docs")
        print("🌐 Opened API documentation")
    except Exception as e:
        print(f"⚠️  Could not open browser: {e}")

def check_node():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            return True
    except:
        pass
    return False

def main():
    """Main function"""
    print("🎉 AI Resume Tailor - Project Runner")
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
    docs_thread = threading.Thread(target=open_docs)
    docs_thread.daemon = True
    docs_thread.start()
    
    print("\n🎯 Backend is running!")
    print("\n🌐 Available URLs:")
    print("   • API Server: http://localhost:8001")
    print("   • API Docs: http://localhost:8001/docs")
    
    # Check for Node.js and provide instructions
    if check_node():
        print("\n✅ Node.js detected!")
        print("\n🚀 To start the frontend:")
        print("   cd frontend")
        print("   npm install")
        print("   npm run dev")
        print("   Then open: http://localhost:5173")
    else:
        print("\n⚠️  Node.js not found")
        print("\n💡 To use the modern UI:")
        print("   1. Install Node.js from https://nodejs.org")
        print("   2. cd frontend")
        print("   3. npm install")
        print("   4. npm run dev")
    
    print("\n📱 Alternative: Open demo_ui.html in your browser for a demo")
    
    print("\n⌨️  Press Ctrl+C to stop the backend")
    
    try:
        backend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping backend...")
        backend_process.terminate()
        print("✅ Backend stopped")

if __name__ == "__main__":
    main()