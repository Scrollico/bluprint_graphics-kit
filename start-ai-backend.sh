#!/bin/bash

# Start AI Backend Script for Bluprint Graphics Kit

echo "🚀 Starting AI Backend Server..."

cd ai-backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup.py first."
    exit 1
fi

# Start the server
echo "📡 Starting FastAPI server on http://127.0.0.1:8000"
echo "📊 API Documentation: http://127.0.0.1:8000/docs"
echo "🔍 Health Check: http://127.0.0.1:8000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

./venv/bin/python main.py
