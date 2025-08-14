#!/usr/bin/env python3
"""
Setup script for AI Resume Tailor
"""

import subprocess
import sys
import os

def run_command(command, cwd=None):
    """Run a shell command and handle errors"""
    try:
        result = subprocess.run(command, shell=True, check=True, cwd=cwd, 
                              capture_output=True, text=True)
        print(f"✓ {command}")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"✗ Error running: {command}")
        print(f"Error: {e.stderr}")
        return None

def setup_backend():
    """Setup Python backend"""
    print("\n🔧 Setting up backend...")
    
    # Install Python dependencies
    run_command("pip install -r backend/requirements.txt")
    
    # Download spaCy model
    run_command("python -m spacy download en_core_web_sm")
    
    print("✓ Backend setup complete!")

def setup_frontend():
    """Setup React frontend"""
    print("\n🔧 Setting up frontend...")
    
    # Install Node.js dependencies
    run_command("npm install", cwd="frontend")
    
    print("✓ Frontend setup complete!")

def create_env_file():
    """Create .env file from example"""
    if not os.path.exists('.env'):
        print("\n📝 Creating .env file...")
        run_command("cp .env.example .env")
        print("⚠️  Please edit .env file and add your API keys!")
    else:
        print("✓ .env file already exists")

def main():
    """Main setup function"""
    print("🚀 Setting up AI Resume Tailor...")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required")
        sys.exit(1)
    
    setup_backend()
    setup_frontend()
    create_env_file()
    
    print("\n🎉 Setup complete!")
    print("\nNext steps:")
    print("1. Edit .env file with your API keys")
    print("2. Run backend: python backend/main.py")
    print("3. Run frontend: cd frontend && npm start")

if __name__ == "__main__":
    main()