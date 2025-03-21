# HitOrStand: Blackjack Card Counter with Camera Recognition

A web-based Blackjack card counting application with computer vision capabilities for automatic card recognition. This project integrates a PyTorch CNN model for playing card classification with a modern web interface to provide real-time card counting and strategy advice.

## Project Structure

This project uses a split deployment architecture:
- **Frontend**: Static HTML/CSS/JS deployed on Vercel
- **Backend**: Python Flask server with PyTorch deployed on Heroku

## Setting Up for Deployment

### Option 1: Use the Provided Script

Run the setup script to organize files for deployment:
```bash
chmod +x setup-deployment.sh
./setup-deployment.sh
```

This will create separate directories for the frontend and backend components.

### Option 2: Manual Setup

1. **Backend Files**:
   - server.py
   - model.py
   - requirements.txt
   - Procfile
   - runtime.txt
   - card_classifier_model.pth (you need to provide this)

2. **Frontend Files**:
   - index.html
   - styles.css
   - app.js
   - camera.js
   - camera-integration.js

## Deployment Instructions

### Backend Deployment (Heroku)

See detailed instructions in [backend/README.md](backend/README.md)

1. **Create Heroku app**:
   ```bash
   heroku create your-backend-app-name
   ```

2. **Deploy**:
   ```bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend deployment"
   heroku git:remote -a your-backend-app-name
   git push heroku main
   ```

### Frontend Deployment (Vercel)

See detailed instructions in [frontend/README.md](frontend/README.md)

1. **Update backend URL**:
   Edit `camera-integration.js` to update the serverUrl to point to your Heroku app URL.

2. **Deploy to Vercel**:
   - Push your frontend code to GitHub
   - Connect to Vercel
   - Import your GitHub repository

## Features

- **Card Counting**: Track running count and true count using Hi-Lo system
- **Strategy Advisor**: Get optimal play recommendations based on your hand and the count
- **Camera Recognition**: Use your device's camera to automatically recognize cards
- **Manual Input**: Manually input cards if preferred
- **Responsive Design**: Works on both desktop and mobile devices

## Card Counting System

This app uses the Hi-Lo counting system:
- Cards 2-6: +1
- Cards 7-9: 0
- Cards 10, J, Q, K, A: -1

The true count is calculated by dividing the running count by the estimated number of decks remaining in the shoe.

## License

MIT

## Acknowledgements

- Card recognition model based on [PyTorch CNN Playing Cards Classifier](https://github.com/hiroonwijekoon/pytorch-cnn-playing-cards-classifier) by Hiroon Wijekoon
- Card counting logic using Hi-Lo system 