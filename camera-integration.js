// Camera integration for the Blackjack Card Counter
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const toggleCameraBtn = document.getElementById('toggle-camera-btn');
    const cameraSection = document.getElementById('camera-section');
    const captureBtn = document.getElementById('capture-btn');
    const autoCaptureBtn = document.getElementById('auto-capture-btn');
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const recognitionResult = document.getElementById('recognition-result');
    const serverStatus = document.getElementById('server-status');
    
    // State
    let currentMode = 'player'; // player or dealer
    let cardCamera = null;
    let isAutoCapturing = false;
    // Use Heroku URL in production, localhost for development
    let serverUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:5000'
        : 'https://blackjack-counter.herokuapp.com';
    
    // Functions
    function checkServerStatus() {
        fetch(`${serverUrl}/api/health`)
            .then(response => {
                if (response.ok) return response.json();
                throw new Error('Server connection failed');
            })
            .then(data => {
                if (data.model_loaded) {
                    serverStatus.innerHTML = '<i class="fas fa-server"></i><span>Server: Online</span>';
                    serverStatus.classList.add('online');
                    serverStatus.classList.remove('offline');
                } else {
                    serverStatus.innerHTML = '<i class="fas fa-server"></i><span>Server: Model not loaded</span>';
                    serverStatus.classList.add('offline');
                    serverStatus.classList.remove('online');
                }
            })
            .catch(error => {
                console.error('Server status check failed:', error);
                serverStatus.innerHTML = '<i class="fas fa-server"></i><span>Server: Offline</span>';
                serverStatus.classList.add('offline');
                serverStatus.classList.remove('online');
            });
    }
    
    async function initializeCamera() {
        if (!cardCamera) {
            cardCamera = new CardCamera({
                serverUrl: serverUrl,
                onCardRecognized: handleCardRecognized,
                confidenceThreshold: 0.7,
                processingFrequency: 1000 // 1 second between processes in auto mode
            });
            
            try {
                const success = await cardCamera.initialize('camera-view', 'camera-canvas');
                if (!success) {
                    throw new Error('Failed to initialize camera');
                }
            } catch (error) {
                console.error('Camera initialization error:', error);
                recognitionResult.innerHTML = `<span class="error">Camera error: ${error.message}</span>`;
                recognitionResult.classList.add('error');
                return false;
            }
        }
        return true;
    }
    
    function toggleCamera() {
        if (cameraSection.classList.contains('active')) {
            // Hide camera
            cameraSection.classList.remove('active');
            stopCamera();
        } else {
            // Show camera
            cameraSection.classList.add('active');
            initializeCamera();
        }
    }
    
    function stopCamera() {
        if (cardCamera) {
            cardCamera.stopProcessing();
            if (isAutoCapturing) {
                toggleAutoCapture();
            }
        }
    }
    
    function toggleAutoCapture() {
        if (!cardCamera || !cardCamera.isActive) return;
        
        if (isAutoCapturing) {
            // Stop auto-capture
            cardCamera.stopProcessing();
            autoCaptureBtn.classList.remove('active');
            autoCaptureBtn.querySelector('span').textContent = 'Auto Capture';
        } else {
            // Start auto-capture
            cardCamera.startProcessing();
            autoCaptureBtn.classList.add('active');
            autoCaptureBtn.querySelector('span').textContent = 'Stop';
        }
        
        isAutoCapturing = !isAutoCapturing;
    }
    
    async function captureCard() {
        if (!cardCamera || !cardCamera.isActive) return;
        
        recognitionResult.textContent = 'Processing...';
        recognitionResult.className = 'recognition-result';
        
        try {
            const result = await cardCamera.processSingleFrame();
            if (result && result.card && result.confidence) {
                handleCardRecognized(result);
            } else {
                recognitionResult.textContent = 'No card detected';
                recognitionResult.classList.add('error');
            }
        } catch (error) {
            console.error('Card capture error:', error);
            recognitionResult.textContent = `Error: ${error.message}`;
            recognitionResult.classList.add('error');
        }
    }
    
    function handleCardRecognized(result) {
        const { card, confidence } = result;
        
        // Show the recognition result
        recognitionResult.innerHTML = `
            <span class="success">Detected: ${card} (${Math.round(confidence * 100)}%)</span>
        `;
        recognitionResult.classList.add('success');
        
        // Add the card to the appropriate section
        if (currentMode === 'player') {
            // Check if card1 and card2 are already set
            if (!document.getElementById('player-card1').value) {
                document.getElementById('player-card1').value = card;
                // Trigger the change event
                document.getElementById('player-card1').dispatchEvent(new Event('change'));
            } else if (!document.getElementById('player-card2').value) {
                document.getElementById('player-card2').value = card;
                document.getElementById('player-card2').dispatchEvent(new Event('change'));
            } else {
                // Add as a hit card
                const hitButton = document.querySelector(`.hit-card-btn[data-value="${card}"]`);
                if (hitButton) {
                    hitButton.click();
                }
            }
        } else if (currentMode === 'dealer') {
            // Check if dealer card is already set
            if (!document.getElementById('dealer-card').value) {
                document.getElementById('dealer-card').value = card;
                document.getElementById('dealer-card').dispatchEvent(new Event('change'));
            } else {
                // Add as a dealer hit card
                const dealerHitButton = document.querySelector(`.dealer-hit-card-btn[data-value="${card}"]`);
                if (dealerHitButton) {
                    dealerHitButton.click();
                }
            }
        }
        
        // Update advice
        setTimeout(() => {
            document.getElementById('advise-btn').click();
        }, 500);
    }
    
    // Event listeners
    toggleCameraBtn.addEventListener('click', toggleCamera);
    captureBtn.addEventListener('click', captureCard);
    autoCaptureBtn.addEventListener('click', toggleAutoCapture);
    
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            toggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.getAttribute('data-target');
            
            // Update UI feedback
            recognitionResult.textContent = `Ready to capture ${currentMode} cards`;
            recognitionResult.className = 'recognition-result';
        });
    });
    
    // Check server status on load
    checkServerStatus();
    
    // Periodically check server status
    setInterval(checkServerStatus, 30000); // Every 30 seconds
}); 