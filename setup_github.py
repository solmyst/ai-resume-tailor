#!/usr/bin/env python3
"""
GitHub Repository Setup Script for AI Resume Tailor
This script helps you create and push the repository to GitHub
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(command, description=""):
    """Run a command and handle errors"""
    print(f"🔄 {description or command}")
    try:
        result = subprocess.run(command, shell=True, check=True, 
                              capture_output=True, text=True)
        if result.stdout.strip():
            print(f"   {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e.stderr.strip() if e.stderr else str(e)}")
        return False

def check_git_installed():
    """Check if Git is installed"""
    return run_command("git --version", "Checking Git installation")

def check_github_cli():
    """Check if GitHub CLI is installed"""
    return run_command("gh --version", "Checking GitHub CLI")

def initialize_git_repo():
    """Initialize Git repository"""
    print("\n📁 Setting up Git repository...")
    
    if not run_command("git init", "Initializing Git repository"):
        return False
    
    if not run_command("git add .", "Adding all files to Git"):
        return False
    
    if not run_command('git commit -m "Initial commit: AI Resume Tailor v1.0.0"', 
                      "Creating initial commit"):
        return False
    
    return True

def create_github_repo_cli(repo_name):
    """Create GitHub repository using GitHub CLI"""
    print(f"\n🌐 Creating GitHub repository: {repo_name}")
    
    # Create repository
    create_cmd = f'gh repo create {repo_name} --public --description "🚀 AI-powered resume and portfolio tailor that automatically customizes resumes based on job descriptions using NLP and machine learning"'
    
    if not run_command(create_cmd, f"Creating repository {repo_name}"):
        return False
    
    # Add remote and push
    if not run_command(f"git remote add origin https://github.com/$(gh api user --jq .login)/{repo_name}.git", 
                      "Adding remote origin"):
        return False
    
    if not run_command("git branch -M main", "Setting main branch"):
        return False
    
    if not run_command("git push -u origin main", "Pushing to GitHub"):
        return False
    
    return True

def manual_github_setup(repo_name):
    """Provide manual setup instructions"""
    username = input("Enter your GitHub username: ").strip()
    
    print(f"\n📋 Manual GitHub Setup Instructions:")
    print("=" * 50)
    print("1. Go to https://github.com/new")
    print(f"2. Repository name: {repo_name}")
    print("3. Description: 🚀 AI-powered resume and portfolio tailor")
    print("4. Make it Public")
    print("5. Don't initialize with README (we have one)")
    print("6. Click 'Create repository'")
    print("\n7. Then run these commands:")
    print(f"   git remote add origin https://github.com/{username}/{repo_name}.git")
    print("   git branch -M main")
    print("   git push -u origin main")
    
    return input("\nHave you created the repository and run the commands? (y/n): ").lower().startswith('y')

def setup_repository():
    """Main repository setup function"""
    print("🚀 AI Resume Tailor - GitHub Repository Setup")
    print("=" * 50)
    
    # Check if we're already in a git repo
    if os.path.exists('.git'):
        print("⚠️  Git repository already exists!")
        if not input("Continue anyway? (y/n): ").lower().startswith('y'):
            return False
    
    # Check Git installation
    if not check_git_installed():
        print("❌ Git is not installed. Please install Git first.")
        print("   Download from: https://git-scm.com/downloads")
        return False
    
    # Get repository name
    default_name = "ai-resume-tailor"
    repo_name = input(f"Repository name [{default_name}]: ").strip() or default_name
    
    # Initialize Git repository
    if not initialize_git_repo():
        return False
    
    # Try GitHub CLI first
    if check_github_cli():
        print("\n✅ GitHub CLI found! Using automated setup...")
        if create_github_repo_cli(repo_name):
            print(f"\n🎉 Repository created successfully!")
            print(f"🌐 Repository URL: https://github.com/$(gh api user --jq .login)/{repo_name}")
            return True
        else:
            print("❌ GitHub CLI setup failed. Falling back to manual setup...")
    
    # Manual setup
    print("\n📝 GitHub CLI not available. Using manual setup...")
    return manual_github_setup(repo_name)

def post_setup_instructions():
    """Show post-setup instructions"""
    print("\n🎯 Next Steps:")
    print("=" * 30)
    print("1. ⭐ Star your repository (if you like it!)")
    print("2. 📝 Edit the repository description on GitHub")
    print("3. 🏷️  Add topics/tags: python, ai, resume, nlp, fastapi, react")
    print("4. 📋 Consider adding a repository banner/logo")
    print("5. 🔗 Share with others!")
    
    print("\n🚀 To run the project:")
    print("   git clone <your-repo-url>")
    print("   cd ai-resume-tailor")
    print("   python run.py")
    
    print("\n📚 Documentation:")
    print("   • README.md - Project overview")
    print("   • START_HERE.md - Setup guide")
    print("   • CONTRIBUTING.md - Contribution guidelines")
    print("   • API docs at http://localhost:8000/docs")

def main():
    """Main function"""
    try:
        if setup_repository():
            post_setup_instructions()
            print("\n🎉 GitHub repository setup complete!")
        else:
            print("\n❌ Repository setup failed. Please try manual setup.")
            return 1
    except KeyboardInterrupt:
        print("\n\n🛑 Setup cancelled by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(main())