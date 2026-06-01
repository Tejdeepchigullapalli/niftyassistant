@echo off
echo =============================================
echo    Nifty AI Investment Assistant
echo =============================================
echo.

echo [1/2] Starting FastAPI Backend...
cd backend
pip install -r requirements.txt
start "Backend" cmd /k "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
echo Backend started at http://localhost:8000
cd ..

timeout /t 3 /nobreak > NUL

echo.
echo [2/2] Starting Next.js Frontend...
cd frontend
call npm install
start "Frontend" cmd /k "npm run dev"
echo Frontend started at http://localhost:3000
cd ..

echo.
echo =============================================
echo   Both services are running!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:8000
echo   API Docs: http://localhost:8000/docs
echo =============================================
pause
