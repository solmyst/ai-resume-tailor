#!/usr/bin/env python3
"""
Simple demo runner that shows the UI and starts the backend
"""

import subprocess
import webbrowser
import time
import os
import threading
import sys

def start_backend():
    """Start the backend server"""
    print("🚀 Starting backend server...")
    try:
        # Start the backend server
        process = subprocess.Popen([sys.executable, "backend/main.py"], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        return process
    except Exception as e:
        print(f"❌ Error starting backend: {e}")
        return None

def open_demo_ui():
    """Open the demo UI in browser"""
    time.sleep(2)  # Wait a bit for server to start
    
    # Get the full path to the HTML file
    html_path = os.path.abspath("demo_ui.html")
    
    print("🌐 Opening demo UI in browser...")
    try:
        webbrowser.open(f"file://{html_path}")
        print("✅ Demo UI opened!")
    except Exception as e:
        print(f"⚠️  Could not open browser: {e}")
        print(f"📁 Manually open: {html_path}")

def test_api():
    """Test the API with a simple request"""
    time.sleep(3)  # Wait for server to be ready
    
    try:
        import requests
        response = requests.get("http://localhost:8001/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend API is running!")
            print("📝 API Documentation: http://localhost:8001/docs")
        else:
            print("⚠️  Backend API responded with error")
    except Exception as e:
        print(f"⚠️  Could not connect to backend: {e}")

def main():
    """Main demo function"""
    print("🎉 AI Resume Tailor - UI Demo")
    print("=" * 40)
    
    # Start backend server
    backend_process = start_backend()
    
    if not backend_process:
        print("❌ Could not start backend server")
        print("💡 Try running manually: python backend/main.py")
        return
    
    # Open demo UI in browser
    ui_thread = threading.Thread(target=open_demo_ui)
    ui_thread.daemon = True
    ui_thread.start()
    
    # Test API connection
    api_thread = threading.Thread(target=test_api)
    api_thread.daemon = True
    api_thread.start()
    
    print("\n🎯 Demo is running!")
    print("📱 The UI demo shows exactly how the application looks")
    print("🔧 The backend API is running for full functionality")
    print("\n🌐 Available URLs:")
    print("   • Demo UI: file://" + os.path.abspath("demo_ui.html"))
    print("   • API Server: http://localhost:8001")
    print("   • API Docs: http://localhost:8001/docs")
    
    print("\n⌨️  Press Ctrl+C to stop the demo")
    
    try:
        # Keep the script running
        backend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 Stopping demo...")
        backend_process.terminate()
        print("✅ Demo stopped")

if __name__ == "__main__":
    main()