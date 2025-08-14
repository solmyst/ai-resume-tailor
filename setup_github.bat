@echo off
echo 🚀 AI Resume Tailor - GitHub Setup (Windows)
echo ================================================

REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git is not installed. Please install Git first.
    echo    Download from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo ✅ Git found!

REM Get repository name
set /p repo_name="Repository name [ai-resume-tailor]: "
if "%repo_name%"=="" set repo_name=ai-resume-tailor

echo.
echo 📁 Setting up Git repository...

REM Initialize Git repository
git init
if errorlevel 1 goto error

git add .
if errorlevel 1 goto error

git commit -m "Initial commit: AI Resume Tailor v1.0.0"
if errorlevel 1 goto error

echo.
echo 📋 Manual GitHub Setup Instructions:
echo ====================================
echo 1. Go to https://github.com/new
echo 2. Repository name: %repo_name%
echo 3. Description: 🚀 AI-powered resume and portfolio tailor
echo 4. Make it Public
echo 5. Don't initialize with README (we have one)
echo 6. Click 'Create repository'
echo.

set /p username="Enter your GitHub username: "

echo.
echo 7. Run these commands after creating the repository:
echo    git remote add origin https://github.com/%username%/%repo_name%.git
echo    git branch -M main
echo    git push -u origin main
echo.

set /p created="Have you created the repository on GitHub? (y/n): "
if /i not "%created%"=="y" goto manual_exit

REM Add remote and push
git remote add origin https://github.com/%username%/%repo_name%.git
if errorlevel 1 goto error

git branch -M main
if errorlevel 1 goto error

git push -u origin main
if errorlevel 1 goto error

echo.
echo 🎉 Repository setup complete!
echo 🌐 Repository URL: https://github.com/%username%/%repo_name%
goto success

:error
echo ❌ An error occurred during setup
pause
exit /b 1

:manual_exit
echo.
echo 📝 Please complete the setup manually using the commands above.
pause
exit /b 0

:success
echo.
echo 🎯 Next Steps:
echo • Star your repository
echo • Add topics: python, ai, resume, nlp, fastapi, react
echo • Share with others!
echo.
echo 🚀 To run the project:
echo   python run.py
pause