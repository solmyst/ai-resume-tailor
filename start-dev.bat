@echo off
echo ========================================
echo    AI Resume Tailor - Development Setup
echo ========================================
echo.

echo [1/4] Checking Node.js dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
) else (
    echo Frontend dependencies already installed.
)
echo.

echo [2/4] Setting up Python backend...
cd backend
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
)

echo Installing Python dependencies...
pip install -r requirements.txt

echo Downloading spaCy model...
python -m spacy download en_core_web_sm

echo.
echo [3/4] Starting backend server...
start "AI Resume Tailor - Backend" cmd /k "python app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

cd ..
echo.
echo [4/4] Starting frontend development server...
start "AI Resume Tailor - Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:5000
echo.
echo Both servers are starting in separate windows.
echo Close this window when you're done developing.
echo.
pause