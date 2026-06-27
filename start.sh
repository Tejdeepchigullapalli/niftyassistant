#!/bin/bash

echo "============================================="
echo "   Nifty AI Investment Assistant"
echo "============================================="
echo ""

# Start FastAPI Backend
echo "[1/3] Starting FastAPI Backend on Port 8001..."
cd backend
pip install -r requirements.txt -q
uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
FASTAPI_PID=$!
echo "✅ FastAPI Backend started (PID: $FASTAPI_PID) → http://localhost:8001"
echo "   API Docs → http://localhost:8001/docs"

# Start Node.js Express Backend
echo "[2/3] Starting Node.js Express Backend on Port 8000..."
npm install --silent
npm run dev &
NODE_PID=$!
echo "✅ Express Backend started (PID: $NODE_PID) → http://localhost:8000"
cd ..

sleep 3

# Start Frontend
echo ""
echo "[3/3] Installing & Starting Next.js Frontend..."
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

trap "kill $FASTAPI_PID $NODE_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
