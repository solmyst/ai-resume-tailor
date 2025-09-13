@echo off
echo ========================================
echo    AI Resume Tailor - Simple Setup
echo ========================================
echo.

echo [1/3] Installing frontend dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
) else (
    echo Frontend dependencies already installed.
)
echo.

echo [2/3] Setting up Python backend...
cd backend

echo Installing basic Python packages...
pip install flask flask-cors openai PyPDF2 python-docx python-dotenv requests

if not exist ".env" (
    echo Creating .env file...
    echo # OpenAI API Key (optional)> .env
    echo OPENAI_API_KEY=your_openai_api_key_here>> .env
    echo.>> .env
    echo # Flask Configuration>> .env
    echo FLASK_ENV=development>> .env
    echo FLASK_DEBUG=True>> .env
)

echo.
echo [3/3] Starting servers...
echo Starting backend server...
start "Resume Tailor Backend" cmd /k "python app.py"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

cd ..
echo Starting frontend server...
start "Resume Tailor Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo    Setup Complete!
echo ========================================
echo.
echo Frontend: http://localhost:5173 (or 5174)
echo Backend:  http://localhost:5000
echo.
echo Both servers are starting in separate windows.
echo.
pause