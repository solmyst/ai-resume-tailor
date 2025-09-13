Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AI Resume Tailor - Simple Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Installing frontend dependencies..." -ForegroundColor Yellow
if (!(Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Green
    npm install
} else {
    Write-Host "Frontend dependencies already installed." -ForegroundColor Green
}
Write-Host ""

Write-Host "[2/3] Setting up Python backend..." -ForegroundColor Yellow
Set-Location backend

Write-Host "Installing basic Python packages..." -ForegroundColor Green
pip install flask flask-cors openai PyPDF2 python-docx python-dotenv requests

if (!(Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Green
    @"
# OpenAI API Key (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
"@ | Out-File -FilePath ".env" -Encoding UTF8
}

Write-Host ""
Write-Host "[3/3] Starting servers..." -ForegroundColor Yellow

Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python app.py"

Write-Host "Waiting for backend to start..." -ForegroundColor Green
Start-Sleep -Seconds 3

Set-Location ..
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend: http://localhost:5173 (or 5174)" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Both servers are starting in separate windows." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue"