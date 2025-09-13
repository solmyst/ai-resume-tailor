#!/usr/bin/env python3
"""
Setup script for Resume Tailor Backend (Simplified)
"""

import subprocess
import sys
import os

def run_command(command):
    """Run a shell command and return success status"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✓ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("Setting up Resume Tailor Backend (Simplified)...")
    print("=" * 50)
    
    # Install Python dependencies
    print("\n1. Installing Python dependencies...")
    if not run_command("pip install -r requirements.txt"):
        print("Failed to install Python dependencies")
        print("Trying with --user flag...")
        if not run_command("pip install --user -r requirements.txt"):
            print("Failed to install dependencies. Please install manually:")
            print("pip install flask flask-cors openai PyPDF2 python-docx python-dotenv requests")
            return False
    
    # Create .env file if it doesn't exist
    print("\n2. Setting up environment variables...")
    if not os.path.exists('.env'):
        with open('.env', 'w') as f:
            f.write("# OpenAI API Key (optional - for enhanced AI tailoring)\n")
            f.write("OPENAI_API_KEY=your_openai_api_key_here\n")
            f.write("\n# Flask Configuration\n")
            f.write("FLASK_ENV=development\n")
            f.write("FLASK_DEBUG=True\n")
        print("✓ Created .env file")
    else:
        print("✓ .env file already exists")
    
    print("\n" + "=" * 50)
    print("Setup completed successfully!")
    print("\nFeatures available:")
    print("• File processing (PDF, DOC, DOCX, TXT)")
    print("• Keyword extraction and matching")
    print("• Rule-based resume tailoring")
    print("• ATS optimization")
    print("• OpenAI integration (optional)")
    print("\nNext steps:")
    print("1. (Optional) Add your OpenAI API key to the .env file")
    print("2. Run the server with: python app.py")
    print("3. The API will be available at http://localhost:5000")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)