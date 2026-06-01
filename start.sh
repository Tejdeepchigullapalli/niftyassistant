#!/bin/bash

echo "============================================="
echo "   Nifty AI Investment Assistant"
echo "============================================="
echo ""

# Start Backend
echo "[1/2] Starting FastAPI Backend..."
cd backend
pip install -r requirements.txt -q
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "✅ Backend started (PID: $BACKEND_PID) → http://localhost:8000"
echo "   API Docs → http://localhost:8000/docs"
cd ..

sleep 3

# Start Frontend
echo ""
echo "[2/2] Installing & Starting Next.js Frontend..."
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend started (PID: $FRONTEND_PID) → http://localhost:3000"
cd ..

echo ""
echo "============================================="
echo "  🎉 Both services are running!"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo "============================================="
echo ""
echo "Press Ctrl+C to stop all services"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
