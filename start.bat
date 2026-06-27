@echo off
echo =============================================
echo    Nifty AI Investment Assistant
echo =============================================
echo.

echo [1/3] Starting FastAPI Backend on Port 8001...
cd backend
pip install -r requirements.txt
start "Python API" cmd /k "python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload"
echo FastAPI Backend started at http://localhost:8001

echo [2/3] Starting Node.js Express Backend on Port 8000...
call npm install
start "Node.js Express Backend" cmd /k "npm run dev"
echo Express Backend started at http://localhost:8000
cd ..

timeout /t 3 /nobreak > NUL

echo.
echo [3/3] Starting Next.js Frontend...
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
