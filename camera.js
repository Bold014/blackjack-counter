class CardCamera {
    constructor(options = {}) {
        this.videoElement = null;
        this.canvasElement = null;
        this.stream = null;
        this.isActive = false;
        this.serverUrl = options.serverUrl || 'http://localhost:5000';
        this.onCardRecognized = options.onCardRecognized || this.defaultCardHandler;
        this.confidenceThreshold = options.confidenceThreshold || 0.7;
        this.processingInterval = null;
        this.processingFrequency = options.processingFrequency || 1000; // ms
        this.isProcessing = false;
    }

    async initialize(videoElementId, canvasElementId) {
        this.videoElement = document.getElementById(videoElementId);
        this.canvasElement = document.getElementById(canvasElementId);
        
        if (!this.videoElement || !this.canvasElement) {
            throw new Error('Video or canvas element not found');
        }
        
        try {
            // Check if the API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API is not supported in this browser');
            }
            
            // Request camera access with environment-facing camera if available
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            // Connect stream to video element
            this.videoElement.srcObject = this.stream;
            
            // Set up canvas to match video dimensions when loaded
            this.videoElement.onloadedmetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
            };
            
            // Play the video
            await this.videoElement.play();
            this.isActive = true;
            
            return true;
        } catch (error) {
            console.error('Error initializing camera:', error);
            return false;
        }
    }
    
    startProcessing() {
        if (!this.isActive) {
            console.error('Camera is not active');
            return false;
        }
        
        // Start periodic frame processing
        this.processingInterval = setInterval(() => {
            this.processCurrentFrame();
        }, this.processingFrequency);
        
        return true;
    }
    
    stopProcessing() {
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
    }
    
    async processCurrentFrame() {
        if (this.isProcessing) return; // Avoid overlapping processing
        
        this.isProcessing = true;
        
        try {
            // Draw current video frame to canvas
            const context = this.canvasElement.getContext('2d');
            context.drawImage(
                this.videoElement, 
                0, 0, 
                this.canvasElement.width, 
                this.canvasElement.height
            );
            
            // Get image data as base64
            const imageData = this.canvasElement.toDataURL('image/jpeg', 0.8);
            
            // Send to server for processing
            const response = await fetch(`${this.serverUrl}/api/recognize-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: imageData
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Only process results above confidence threshold
            if (result.confidence >= this.confidenceThreshold) {
                this.onCardRecognized(result);
            }
        } catch (error) {
            console.error('Error processing frame:', error);
        } finally {
            this.isProcessing = false;
        }
    }
    
    // Single frame capture (manual mode)
    captureFrame() {
        if (!this.isActive) {
            console.error('Camera is not active');
            return null;
        }
        
        const context = this.canvasElement.getContext('2d');
        context.drawImage(
            this.videoElement, 
            0, 0, 
            this.canvasElement.width, 
            this.canvasElement.height
        );
        
        return this.canvasElement.toDataURL('image/jpeg', 0.8);
    }
    
    // Process a single frame manually
    async processSingleFrame() {
        const imageData = this.captureFrame();
        if (!imageData) return null;
        
        try {
            const response = await fetch(`${this.serverUrl}/api/recognize-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    image: imageData
                })
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error processing frame:', error);
            return null;
        }
    }
    
    // Default card handler (override this with your own function)
    defaultCardHandler(cardData) {
        console.log('Card recognized:', cardData);
    }
    
    shutdown() {
        this.stopProcessing();
        
        // Stop all tracks from the stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        // Reset video element
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        
        this.isActive = false;
    }
} 