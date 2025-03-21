# Blackjack Card Counter Frontend

This is the frontend for the Blackjack Card Counter application. It provides a user interface for tracking cards, calculating running and true counts, and getting strategy advice.

## Deployment to Vercel

### Prerequisites

1. **GitHub Account**: Create one at [https://github.com/join](https://github.com/join)
2. **Vercel Account**: Sign up at [https://vercel.com/signup](https://vercel.com/signup)

### Setup

1. **Push the frontend code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/blackjack-counter.git
   git push -u origin main
   ```

2. **Import project to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Click "Import"

3. **Configure project**:
   - Project Name: `blackjack-counter` (or your preferred name)
   - Framework Preset: Select "Other"
   - Root Directory: `./` (or `frontend/` if you've organized your repo differently)
   - Build Command: Leave empty
   - Output Directory: Leave empty

4. **Deploy**:
   - Click "Deploy"
   - Vercel will provide you with a unique URL for your application

### Connecting to Backend

Make sure to update the `serverUrl` in `camera-integration.js` with your Heroku backend URL:

```javascript
let serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000'
    : 'https://your-heroku-app-name.herokuapp.com'; // Replace with your actual Heroku app URL
```

## Local Development

To run the frontend locally:

1. Use a local server like `http-server` or `live-server`:
   ```bash
   # Using npm
   npm install -g http-server
   http-server -p 8080
   
   # Or python
   python -m http.server 8080
   ```

2. Open http://localhost:8080 in your browser

## Mobile Usage

Once deployed on Vercel with backend on Heroku:

1. Open the Vercel URL on your mobile device browser
2. Allow camera permissions when prompted
3. Use the camera to scan cards
4. The app will recognize the cards and update the count

## Important Notes

1. **HTTPS Required**: Mobile browsers only allow camera access over HTTPS, which Vercel provides automatically.

2. **Cross-Origin Issues**: Make sure CORS is properly enabled on your backend.

3. **Performance**: Card recognition happens on the backend, so a good internet connection is necessary for optimal performance. 