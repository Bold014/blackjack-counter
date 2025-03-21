import os
import torch
import shutil
from model import CardClassifierCNN

def prepare_model():
    """
    Prepares the model for Heroku deployment.
    This script will check if a pre-trained model exists in the card_classifier_model.pth directory,
    and if so, create a proper .pth file that can be loaded by the server.
    """
    print("Preparing model for Heroku deployment...")
    
    # Create models directory if it doesn't exist
    if not os.path.exists('models'):
        os.makedirs('models')
    
    # Initialize model
    model = CardClassifierCNN(num_classes=53)
    
    # Check if we can find an existing model to use
    model_path = None
    
    # Try to find existing model
    if os.path.exists('card_classifier_model.pth') and not os.path.isdir('card_classifier_model.pth'):
        model_path = 'card_classifier_model.pth'
    elif os.path.isdir('card_classifier_model.pth'):
        # Since this is a directory, check for model files inside
        print("Searching for model files inside card_classifier_model.pth directory...")
        for root, dirs, files in os.walk('card_classifier_model.pth'):
            for file in files:
                if file.endswith('.pth') or file.endswith('.pt'):
                    model_path = os.path.join(root, file)
                    print(f"Found model file: {model_path}")
                    break
            if model_path:
                break
    
    if model_path:
        try:
            print(f"Loading model from {model_path}")
            # Load model
            model.load_state_dict(torch.load(model_path, map_location='cpu'))
            # Save model in correct format for server
            target_path = os.path.join('models', 'card_classifier_model.pth')
            torch.save(model.state_dict(), target_path)
            print(f"Model saved successfully to {target_path}")
            return True
        except Exception as e:
            print(f"Error loading or saving model: {e}")
            return False
    else:
        print("No model file found. Creating a blank model for structure.")
        # Save empty model just for structure
        target_path = os.path.join('models', 'card_classifier_model.pth')
        torch.save(model.state_dict(), target_path)
        print(f"Blank model saved to {target_path}")
        print("WARNING: This is a blank untrained model. Replace with a trained model before deployment.")
        return True

if __name__ == "__main__":
    prepare_model() 