# Blackjack Card Counter Backend

This is the backend server for the Blackjack Card Counter application. It uses Flask and PyTorch to provide card recognition capabilities.

## Deployment to Heroku

### Prerequisites

1. **Heroku CLI**: Install from [https://devcenter.heroku.com/articles/heroku-cli](https://devcenter.heroku.com/articles/heroku-cli)
2. **Git**: Make sure git is installed
3. **Heroku Account**: Create one at [https://signup.heroku.com/](https://signup.heroku.com/)
4. **Card Classifier Model**: Download or train the model from the [PyTorch CNN Playing Cards Classifier](https://github.com/hiroonwijekoon/pytorch-cnn-playing-cards-classifier) repository

### Setup

1. **Create a new Heroku app**:
   ```bash
   heroku login
   heroku create your-app-name
   ```

2. **Add Git Large File Storage for the model**:
   
   Since PyTorch models can be large, you might need Git LFS:
   ```bash
   # Install Git LFS
   git lfs install
   
   # Track large model file
   git lfs track "card_classifier_model.pth"
   git add .gitattributes
   ```

3. **Add the Heroku Python buildpack**:
   ```bash
   heroku buildpacks:set heroku/python
   ```

4. **Deploy to Heroku**:
   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

5. **Verify deployment**:
   ```bash
   heroku open
   ```
   Navigate to `/api/health` to check if the server is running.

## Important Notes

1. **Model File**: Make sure your `card_classifier_model.pth` is included in the repository or available at deployment time.

2. **Environment Variables**: You can set environment variables in Heroku using:
   ```bash
   heroku config:set VARIABLE_NAME=value
   ```

3. **Scaling**: If you need more processing power:
   ```bash
   heroku ps:scale web=1:standard-2x
   ```

4. **Logs**: View logs with:
   ```bash
   heroku logs --tail
   ```

## Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server locally:
   ```bash
   python server.py
   ```

3. The server will be available at http://localhost:5000 