import os
import io
import base64
import torch
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify, after_this_request
from flask_cors import CORS, cross_origin
import torchvision.transforms as transforms
from model import CardClassifierCNN  # We'll implement this next

app = Flask(__name__)
# Update CORS configuration to explicitly allow Vercel domain
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "https://blackjack-counter-six.vercel.app", "*"]}}, supports_credentials=True)

# CORS headers helper
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# Class mapping
CARD_CLASSES = {
    0: '2', 1: '3', 2: '4', 3: '5', 4: '6', 5: '7', 6: '8', 7: '9', 8: '10',
    9: 'J', 10: 'Q', 11: 'K', 12: 'A',
    # The actual model has 53 classes, we're simplifying to just the value for this example
}

# Load the model
MODEL_PATHS = [
    'card_classifier_model.pth',  # Original path
    os.path.join('models', 'card_classifier_model.pth'),  # models directory
    os.path.join(os.path.dirname(os.path.abspath(__file__)), 'card_classifier_model.pth'),  # Absolute path
]
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

def load_model():
    model = CardClassifierCNN(num_classes=53)  # Assuming 53 classes as mentioned in the GitHub
    
    # Try different paths for the model
    model_loaded = False
    for model_path in MODEL_PATHS:
        try:
            if os.path.exists(model_path):
                model.load_state_dict(torch.load(model_path, map_location=device))
                print(f"Model loaded successfully from {model_path}")
                model_loaded = True
                break
        except Exception as e:
            print(f"Failed to load model from {model_path}: {e}")
    
    if not model_loaded:
        raise Exception("Could not find or load model file")
        
    model.eval()
    return model

# Preprocessing transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Initialize model
try:
    model = load_model()
    print("Model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/api/recognize-card', methods=['POST'])
def recognize_card():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    try:
        # Get the image data from the request
        image_data = request.json.get('image')
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Decode base64 image
        image_data = image_data.split(',')[1] if ',' in image_data else image_data
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Preprocess image
        image_tensor = transform(image).unsqueeze(0).to(device)
        
        # Make prediction
        with torch.no_grad():
            outputs = model(image_tensor)
            _, predicted = torch.max(outputs, 1)
            predicted_class = predicted.item()
        
        # Map class index to card value
        # This is a simplified mapping - you'll need to create a more accurate one
        # based on your model's actual class indices
        card_value = CARD_CLASSES.get(predicted_class % 13, 'Unknown')
        
        # Return the prediction
        return jsonify({
            'card': card_value,
            'confidence': float(torch.nn.functional.softmax(outputs, dim=1).max().item())
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

if __name__ == '__main__':
    # Get port from environment variable (Heroku sets this)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 