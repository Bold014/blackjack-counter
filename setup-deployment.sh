#!/bin/bash

# This script helps set up your app for deployment to Heroku

echo "========== HitOrStand Deployment Setup =========="
echo "This script will help you deploy your app to Heroku"
echo

# Check if logged in to Heroku
echo "Step 1: Let's make sure you're logged in to Heroku"
heroku whoami || heroku login

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Step 2: Initializing git repository"
    git init
fi

# Ask for Heroku app name
echo "Step 3: Let's configure your Heroku app"
read -p "Enter your Heroku app name (should match what you set up in GitHub): " HEROKU_APP_NAME

# Update frontend serverUrl with the correct Heroku app name
echo "Step 4: Updating the frontend to use your Heroku app URL"
sed -i "s|\[YOUR-ACTUAL-HEROKU-APP-NAME\]|$HEROKU_APP_NAME|g" camera-integration.js

# Prepare model for deployment
echo "Step 5: Preparing the model for deployment"
python prepare-model.py

# Instructions for next steps
echo
echo "========== Setup Complete =========="
echo "Your app is now configured for deployment to Heroku."
echo
echo "Next steps:"
echo "1. Commit your changes:    git add . && git commit -m 'Configured for Heroku deployment'"
echo "2. Push to GitHub:         git push origin main"
echo "3. Verify deployment:      Go to your Heroku dashboard and check if the deployment was successful."
echo "4. Test your frontend by loading your Vercel app and see if it can communicate with the backend API."
echo
echo "Note: If you need to upload your trained model to Heroku, use Git LFS or another method to handle large files."
echo "For more info, see: https://devcenter.heroku.com/articles/git-lfs" 