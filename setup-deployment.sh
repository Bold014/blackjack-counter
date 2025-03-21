#!/bin/bash

# Setup deployment structure for split backend/frontend

# Create directories
mkdir -p backend
mkdir -p frontend

# Copy backend files
cp server.py backend/
cp model.py backend/
cp requirements.txt backend/
cp Procfile backend/
cp runtime.txt backend/
cp backend/README.md backend/

# Copy frontend files
cp index.html frontend/
cp styles.css frontend/
cp app.js frontend/
cp camera.js frontend/
cp camera-integration.js frontend/
cp frontend/README.md frontend/

echo "======================"
echo "Repository organized for split deployment!"
echo ""
echo "Backend files in './backend/'"
echo "Frontend files in './frontend/'"
echo ""
echo "Next steps:"
echo "1. Update the serverUrl in camera-integration.js"
echo "2. Deploy backend to Heroku"
echo "3. Deploy frontend to Vercel"
echo "======================" 