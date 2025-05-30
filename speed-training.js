// Speed Training Page Component
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the speed training page
    initSpeedTraining();
    
    // Main initialization function
    function initSpeedTraining() {
        // Initialize navigation system
        initNavigation();
        
        // Show settings by default
        showSpeedTrainingSettings();
    }
    
    // Navigation system for different screens
    function initNavigation() {
        // Settings screen handlers
        const startBtn = document.getElementById('start-speed-training');
        
        if (startBtn) {
            startBtn.addEventListener('click', startSpeedTraining);
        }
        
        // Game screen handlers
        const endBtn = document.getElementById('end-training-early');
        if (endBtn) {
            endBtn.addEventListener('click', endSpeedTraining);
        }
    }
    
    // Show speed training settings screen
    function showSpeedTrainingSettings() {
        hideAllScreens();
        document.getElementById('speed-training-settings').classList.add('active');
    }
    
    // Show speed training game screen
    function showSpeedTrainingGame() {
        hideAllScreens();
        document.getElementById('speed-training-game').classList.add('active');
    }
    
    // Hide all screens
    function hideAllScreens() {
        const screens = ['speed-training-settings', 'speed-training-game'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.remove('active');
            }
        });
    }
    
    // Start speed training
    function startSpeedTraining() {
        // Get settings
        const settings = getSpeedSettings();
        
        // Initialize speed training
        initSpeedRun(settings);
        
        // Show game screen
        showSpeedTrainingGame();
    }
    
    // Get speed training settings from the form
    function getSpeedSettings() {
        return {
            decks: parseInt(document.getElementById('speed-decks')?.value || 6),
            timeLimit: parseInt(document.getElementById('speed-time-limit')?.value || 5),
            hitSoft17: document.getElementById('speed-hit-soft-17')?.value === 'yes',
            doubleAfterSplit: document.getElementById('speed-double-after-split')?.value === 'yes',
            resplitAces: document.getElementById('speed-resplit-aces')?.value === 'yes'
        };
    }
    
    // Initialize speed training run
    function initSpeedRun(settings) {
        // Initialize the actual trainer with speed training mode
        initTrainer(settings, true);
    }
    
    // End speed training early
    function endSpeedTraining() {
        // Calculate final results and redirect to results page
        calculateAndShowResults();
    }
    
    // Calculate and display speed training results
    function calculateAndShowResults() {
        // Finalize speed data calculation
        if (window.trainerState && window.trainerState.isSpeedMode) {
            // Call the finalization function from the trainer
            if (typeof finalizeSpeedData === 'function') {
                finalizeSpeedData();
            }
        }
        
        // Get speed training results from the trainer
        const results = getSpeedResults();
        
        // Store results in localStorage for the results page
        localStorage.setItem('speedResults', JSON.stringify(results));
        
        // Redirect to results page
        window.location.href = 'speed-results.html';
    }
    
    // Get speed training results from the trainer
    function getSpeedResults() {
        // This will be populated by the trainer
        return window.trainerSpeedPerformance || {
            finalAccuracy: 0,
            correctDecisions: 0,
            totalDecisions: 0,
            totalHands: 0,
            avgDecisionTime: 0,
            trainingDuration: 0,
            timeouts: 0
        };
    }

    // Separate function to initialize the actual trainer
    function initTrainer(settings = null, isSpeedMode = false) {
        // DOM Elements
        const dealButton = document.getElementById('deal-button');
        const hitButton = document.getElementById('hit-button');
        const standButton = document.getElementById('stand-button');
        const doubleButton = document.getElementById('double-button');
        const splitButton = document.getElementById('split-button');
        
        // Game state
        const state = {
            // Settings (use provided settings or defaults)
            decks: settings?.decks || 6,
            hitSoft17: settings?.hitSoft17 !== undefined ? settings.hitSoft17 : true,
            doubleAfterSplit: settings?.doubleAfterSplit !== undefined ? settings.doubleAfterSplit : true,
            resplitAces: settings?.resplitAces !== undefined ? settings.resplitAces : false,
            timeLimit: settings?.timeLimit || 5,
            
            // Speed mode settings
            isSpeedMode: isSpeedMode,
            speedStartTime: isSpeedMode ? Date.now() : null,
            
            // Game state
            deck: [],
            playerHands: [[]],
            dealerHand: [],
            currentHandIndex: 0,
            gamePhase: 'gameOver', // betting, playerTurn, dealerTurn, evaluating, gameOver
            
            // Timer state
            decisionTimer: null,
            decisionStartTime: null,
            timeRemaining: 0,
            
            // Performance tracking (only for speed mode)
            performance: isSpeedMode ? {
                correctDecisions: 0,
                totalDecisions: 0,
                handsPlayed: 0,
                decisionTimes: [],
                timeouts: 0,
                speedStartTime: Date.now()
            } : null
        };
        
        // Card values for Hi-Lo counting system (for basic strategy)
        const cardValues = {
            '2': 1, '3': 1, '4': 1, '5': 1, '6': 1,
            '7': 0, '8': 0, '9': 0,
            '10': -1, 'J': -1, 'Q': -1, 'K': -1, 'A': -1
        };
        
        // Map of internal card representation to SVG file paths
        const cardImagePaths = {
            // Hearts
            'A♥': '../assets/cards/ace_of_hearts.svg',
            '2♥': '../assets/cards/2_of_hearts.svg',
            '3♥': '../assets/cards/3_of_hearts.svg',
            '4♥': '../assets/cards/4_of_hearts.svg',
            '5♥': '../assets/cards/5_of_hearts.svg',
            '6♥': '../assets/cards/6_of_hearts.svg',
            '7♥': '../assets/cards/7_of_hearts.svg',
            '8♥': '../assets/cards/8_of_hearts.svg',
            '9♥': '../assets/cards/9_of_hearts.svg',
            '10♥': '../assets/cards/10_of_hearts.svg',
            'J♥': '../assets/cards/jack_of_hearts.svg',
            'Q♥': '../assets/cards/queen_of_hearts.svg',
            'K♥': '../assets/cards/king_of_hearts.svg',
            
            // Diamonds
            'A♦': '../assets/cards/ace_of_diamonds.svg',
            '2♦': '../assets/cards/2_of_diamonds.svg',
            '3♦': '../assets/cards/3_of_diamonds.svg',
            '4♦': '../assets/cards/4_of_diamonds.svg',
            '5♦': '../assets/cards/5_of_diamonds.svg',
            '6♦': '../assets/cards/6_of_diamonds.svg',
            '7♦': '../assets/cards/7_of_diamonds.svg',
            '8♦': '../assets/cards/8_of_diamonds.svg',
            '9♦': '../assets/cards/9_of_diamonds.svg',
            '10♦': '../assets/cards/10_of_diamonds.svg',
            'J♦': '../assets/cards/jack_of_diamonds.svg',
            'Q♦': '../assets/cards/queen_of_diamonds.svg',
            'K♦': '../assets/cards/king_of_diamonds.svg',
            
            // Clubs
            'A♣': '../assets/cards/ace_of_clubs.svg',
            '2♣': '../assets/cards/2_of_clubs.svg',
            '3♣': '../assets/cards/3_of_clubs.svg',
            '4♣': '../assets/cards/4_of_clubs.svg',
            '5♣': '../assets/cards/5_of_clubs.svg',
            '6♣': '../assets/cards/6_of_clubs.svg',
            '7♣': '../assets/cards/7_of_clubs.svg',
            '8♣': '../assets/cards/8_of_clubs.svg',
            '9♣': '../assets/cards/9_of_clubs.svg',
            '10♣': '../assets/cards/10_of_clubs.svg',
            'J♣': '../assets/cards/jack_of_clubs.svg',
            'Q♣': '../assets/cards/queen_of_clubs.svg',
            'K♣': '../assets/cards/king_of_clubs.svg',
            
            // Spades
            'A♠': '../assets/cards/ace_of_spades.svg',
            '2♠': '../assets/cards/2_of_spades.svg',
            '3♠': '../assets/cards/3_of_spades.svg',
            '4♠': '../assets/cards/4_of_spades.svg',
            '5♠': '../assets/cards/5_of_spades.svg',
            '6♠': '../assets/cards/6_of_spades.svg',
            '7♠': '../assets/cards/7_of_spades.svg',
            '8♠': '../assets/cards/8_of_spades.svg',
            '9♠': '../assets/cards/9_of_spades.svg',
            '10♠': '../assets/cards/10_of_spades.svg',
            'J♠': '../assets/cards/jack_of_spades.svg',
            'Q♠': '../assets/cards/queen_of_spades.svg',
            'K♠': '../assets/cards/king_of_spades.svg',
            
            // Back of card
            'back': '../assets/cards/BACKOFCARD.svg'
        };

        // Timer functions for speed training
        function startDecisionTimer() {
            if (!state.isSpeedMode) return;
            
            state.decisionStartTime = Date.now();
            state.timeRemaining = state.timeLimit;
            
            // Clear any existing timer
            if (state.decisionTimer) {
                clearInterval(state.decisionTimer);
            }
            
            // Update timer display immediately
            updateTimerDisplay();
            
            // Start countdown
            state.decisionTimer = setInterval(() => {
                state.timeRemaining -= 0.1;
                updateTimerDisplay();
                
                if (state.timeRemaining <= 0) {
                    handleTimeout();
                }
            }, 100);
        }
        
        function stopDecisionTimer() {
            if (state.decisionTimer) {
                clearInterval(state.decisionTimer);
                state.decisionTimer = null;
            }
            
            // Record decision time if we have a start time
            if (state.decisionStartTime && state.performance) {
                const decisionTime = (Date.now() - state.decisionStartTime) / 1000;
                state.performance.decisionTimes.push(decisionTime);
            }
            
            state.decisionStartTime = null;
        }
        
        function updateTimerDisplay() {
            const timerEl = document.getElementById('decision-timer');
            if (!timerEl || !state.isSpeedMode) return;
            
            const timeLeft = Math.max(0, state.timeRemaining);
            timerEl.textContent = timeLeft.toFixed(1) + 's';
            
            // Color coding based on time remaining
            const percentage = timeLeft / state.timeLimit;
            if (percentage > 0.6) {
                timerEl.className = 'timer good';
            } else if (percentage > 0.3) {
                timerEl.className = 'timer warning';
            } else {
                timerEl.className = 'timer danger';
            }
            
            // Hide timer when not in player turn
            if (state.gamePhase !== 'playerTurn') {
                timerEl.style.display = 'none';
            } else {
                timerEl.style.display = 'block';
            }
        }
        
        function handleTimeout() {
            if (state.gamePhase !== 'playerTurn') return;
            
            stopDecisionTimer();
            
            // Track timeout
            if (state.performance) {
                state.performance.timeouts++;
                // Timeout counts as incorrect decision
                recordDecision('timeout', false);
            }
            
            // Auto-stand on timeout
            playerStand();
        }
        
        function recordDecision(action, isCorrect) {
            if (!state.isSpeedMode || !state.performance) return;
            
            state.performance.totalDecisions++;
            if (isCorrect) {
                state.performance.correctDecisions++;
            }
            
            updateSpeedProgress();
        }
        
        function updateSpeedProgress() {
            if (!state.isSpeedMode) return;
            
            // Update hands played
            const handsPlayedEl = document.getElementById('hands-played');
            if (handsPlayedEl && state.performance) {
                handsPlayedEl.textContent = state.performance.handsPlayed.toString();
            }
            
            // Update accuracy
            const accuracyEl = document.getElementById('current-accuracy');
            if (accuracyEl && state.performance) {
                const accuracy = state.performance.totalDecisions > 0 ? 
                    (state.performance.correctDecisions / state.performance.totalDecisions) * 100 : 0;
                accuracyEl.textContent = `${Math.round(accuracy)}%`;
            }
            
            // Update average decision time
            const avgTimeEl = document.getElementById('avg-decision-time');
            if (avgTimeEl && state.performance && state.performance.decisionTimes.length > 0) {
                const avgTime = state.performance.decisionTimes.reduce((a, b) => a + b, 0) / state.performance.decisionTimes.length;
                avgTimeEl.textContent = `${avgTime.toFixed(1)}s`;
            } else if (avgTimeEl) {
                avgTimeEl.textContent = '0.0s';
            }
            
            // Check if training should end (after many hands)
            if (state.performance.handsPlayed >= 50) {
                setTimeout(() => {
                    calculateAndShowResults();
                }, 1000);
            }
        }
        
        function finalizeSpeedData() {
            if (!state.isSpeedMode || !state.performance) return;
            
            // Calculate final metrics
            const performance = state.performance;
            
            const finalAccuracy = performance.totalDecisions > 0 ? 
                (performance.correctDecisions / performance.totalDecisions) * 100 : 0;
            
            const avgDecisionTime = performance.decisionTimes.length > 0 ? 
                performance.decisionTimes.reduce((a, b) => a + b, 0) / performance.decisionTimes.length : 0;
            
            const trainingDuration = state.speedStartTime ? (Date.now() - state.speedStartTime) / 1000 : 0;
            
            // Store results globally for access
            window.trainerSpeedPerformance = {
                finalAccuracy,
                correctDecisions: performance.correctDecisions,
                totalDecisions: performance.totalDecisions,
                totalHands: performance.handsPlayed,
                avgDecisionTime,
                trainingDuration,
                timeouts: performance.timeouts
            };
        }
        
        // Initialize the game
        function init() {
            createDeck();
            shuffleDeck();
            bindEvents();
            updateControls();
            
            // Initialize speed progress if in speed mode
            if (state.isSpeedMode) {
                updateSpeedProgress();
                
                // Expose state and functions globally for speed mode
                window.trainerState = state;
                window.finalizeSpeedData = finalizeSpeedData;
            }
        }
        
        // Load settings
        function loadSettings() {
            // Settings are already loaded from parameters
        }
        
        // Bind event listeners
        function bindEvents() {
            // Game buttons
            if (dealButton) dealButton.addEventListener('click', startNewHand);
            if (hitButton) hitButton.addEventListener('click', () => makeDecision('hit'));
            if (standButton) standButton.addEventListener('click', () => makeDecision('stand'));
            if (doubleButton) doubleButton.addEventListener('click', () => makeDecision('double'));
            if (splitButton) splitButton.addEventListener('click', () => makeDecision('split'));
        }
        
        // Make a decision and track it for speed mode
        function makeDecision(action) {
            if (state.gamePhase !== 'playerTurn') return;
            
            // Check if this is the correct decision for speed mode
            if (state.isSpeedMode) {
                const correctAction = getBasicStrategyAdvice();
                let isCorrect = false;
                
                switch(action) {
                    case 'hit':
                        isCorrect = correctAction.toLowerCase().includes('hit');
                        break;
                    case 'stand':
                        isCorrect = correctAction.toLowerCase().includes('stand');
                        break;
                    case 'double':
                        isCorrect = correctAction.toLowerCase().includes('double');
                        break;
                    case 'split':
                        isCorrect = correctAction.toLowerCase().includes('split');
                        break;
                }
                
                recordDecision(action, isCorrect);
                stopDecisionTimer();
            }
            
            // Execute the action
            switch(action) {
                case 'hit':
                    playerHit();
                    break;
                case 'stand':
                    playerStand();
                    break;
                case 'double':
                    playerDouble();
                    break;
                case 'split':
                    playerSplit();
                    break;
            }
        }
        
        // Create and shuffle the deck
        function createDeck() {
            state.deck = [];
            const suits = ['♠', '♥', '♦', '♣'];
            const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            
            for (let d = 0; d < state.decks; d++) {
                for (let suit of suits) {
                    for (let value of values) {
                        state.deck.push({ suit, value });
                    }
                }
            }
        }
        
        // Shuffle the deck
        function shuffleDeck() {
            for (let i = state.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [state.deck[i], state.deck[j]] = [state.deck[j], state.deck[i]];
            }
        }
        
        // Deal a card
        function dealCard(isHidden = false, isDealer = false) {
            if (state.deck.length === 0) {
                createDeck();
                shuffleDeck();
            }
            
            const card = state.deck.pop();
            card.isHidden = isHidden;
            
            return card;
        }
        
        // Start a new hand
        function startNewHand() {
            // Reset hands
            state.playerHands = [[]];
            state.dealerHand = [];
            state.currentHandIndex = 0;
            
            // Set game phase to dealing
            state.gamePhase = 'dealing';
            
            // Start the sequential dealing animation
            dealNextCard();
            
            // Update controls
            updateControls();
        }
        
        // Helper function to deal cards sequentially with animation
        function dealNextCard() {
            const dealingDelay = 500; // Faster for speed training
            
            if (state.playerHands[0].length === 0) {
                // Player's first card
                state.playerHands[0].push(dealCard(false, false));
                updateGameDisplay();
                setTimeout(dealNextCard, dealingDelay);
            } else if (state.dealerHand.length === 0) {
                // Dealer's first card (face up)
                state.dealerHand.push(dealCard(false, true));
                updateGameDisplay();
                setTimeout(dealNextCard, dealingDelay);
            } else if (state.playerHands[0].length === 1) {
                // Player's second card
                state.playerHands[0].push(dealCard(false, false));
                updateGameDisplay();
                setTimeout(dealNextCard, dealingDelay);
            } else if (state.dealerHand.length === 1) {
                // Dealer's second card (face down)
                state.dealerHand.push(dealCard(true, true));
                updateGameDisplay();
                
                // Dealing complete, transition to player turn
                state.gamePhase = 'playerTurn';
                
                // Check for natural blackjacks
                if (getHandValue(state.playerHands[0]) === 21) {
                    // Player has blackjack, reveal dealer card and evaluate
                    revealDealerCards();
                    updateGameDisplay();
                    
                    if (getHandValue(state.dealerHand) === 21) {
                        // Push (tie)
                        state.gamePhase = 'gameOver';
                        displayOutcomeMessage('Push! Both have Blackjack.', 'push');
                    } else {
                        // Player wins with Blackjack
                        state.gamePhase = 'gameOver';
                        displayOutcomeMessage('Blackjack! You win!', 'blackjack');
                    }
                    
                    // Track hand completion
                    if (state.performance) {
                        state.performance.handsPlayed++;
                        updateSpeedProgress();
                    }
                } else {
                    // Start decision timer for speed mode
                    if (state.isSpeedMode) {
                        startDecisionTimer();
                    }
                }
                
                updateControls();
            }
        }
        
        // Player hits (takes a card)
        function playerHit() {
            if (state.gamePhase !== 'playerTurn') return;
            
            const currentHand = state.playerHands[state.currentHandIndex];
            currentHand.push(dealCard(false, false));
            
            const handValue = getHandValue(currentHand);
            
            // Check if player busts
            if (handValue > 21) {
                state.gamePhase = 'evaluating';
                stopDecisionTimer();
                
                // Reveal dealer's hole card
                revealDealerCards();
                updateGameDisplay();
                
                setTimeout(() => {
                    evaluateHands();
                }, 500);
            } else {
                // Continue with decision timer if in speed mode
                if (state.isSpeedMode) {
                    startDecisionTimer();
                }
            }
            
            updateGameDisplay();
            updateControls();
        }
        
        // Player stands (ends turn)
        function playerStand() {
            if (state.gamePhase !== 'playerTurn') return;
            
            state.gamePhase = 'dealerTurn';
            stopDecisionTimer();
            
            setTimeout(dealerTurn, 500);
            
            updateGameDisplay();
            updateControls();
        }
        
        // Player doubles down
        function playerDouble() {
            if (state.gamePhase !== 'playerTurn') return;
            
            // Check if hand is eligible for doubling
            const currentHand = state.playerHands[state.currentHandIndex];
            if (currentHand.length > 2) {
                return; // Can't double after hitting
            }
            
            stopDecisionTimer();
            
            // Deal one card and end turn for this hand
            currentHand.push(dealCard(false, false));
            
            state.gamePhase = 'dealerTurn';
            setTimeout(dealerTurn, 500);
            
            updateGameDisplay();
            updateControls();
        }
        
        // Player splits hand
        function playerSplit() {
            if (state.gamePhase !== 'playerTurn') return;
            
            const currentHand = state.playerHands[state.currentHandIndex];
            
            // Check if hand is eligible for splitting
            if (currentHand.length !== 2 || getCardValue(currentHand[0]) !== getCardValue(currentHand[1])) {
                return; // Can only split a pair
            }
            
            stopDecisionTimer();
            
            // Create new hand
            const newHand = [currentHand.pop()];
            
            // Deal a new card to each hand
            currentHand.push(dealCard(false, false));
            newHand.push(dealCard(false, false));
            
            // Add the new hand to player hands
            state.playerHands.splice(state.currentHandIndex + 1, 0, newHand);
            
            // Continue with current hand (restart timer)
            if (state.isSpeedMode) {
                startDecisionTimer();
            }
            
            updateGameDisplay();
            updateControls();
        }
        
        // Dealer's turn
        function dealerTurn() {
            // Reveal dealer's hole card first
            revealDealerCards();
            
            // Simple dealer logic for speed training
            function dealNextCard() {
                if (shouldDealerHit()) {
                    const newCard = dealCard(false, true);
                    state.dealerHand.push(newCard);
                    updateGameDisplay();
                    
                    setTimeout(dealNextCard, 500);
                } else {
                    // Dealer is done, evaluate hands
                    state.gamePhase = 'evaluating';
                    setTimeout(evaluateHands, 500);
                }
            }
            
            setTimeout(dealNextCard, 800);
        }
        
        // Determine if dealer should hit
        function shouldDealerHit() {
            const dealerValue = getHandValue(state.dealerHand);
            
            if (dealerValue >= 18) return false;
            if (dealerValue <= 16) return true;
            
            // For soft 17
            if (dealerValue === 17) {
                return state.hitSoft17 && isSoftHand(state.dealerHand);
            }
            
            return false;
        }
        
        // Reveal dealer's face down cards
        function revealDealerCards() {
            state.dealerHand.forEach(card => {
                card.isHidden = false;
            });
            updateGameDisplay();
        }
        
        // Evaluate all hands and determine winners
        function evaluateHands() {
            if (state.gamePhase !== 'evaluating') return;
            
            const dealerValue = getHandValue(state.dealerHand);
            const playerValue = getHandValue(state.playerHands[0]);
            
            state.gamePhase = 'gameOver';
            
            // Track hand completion for speed mode
            if (state.isSpeedMode && state.performance) {
                state.performance.handsPlayed++;
                updateSpeedProgress();
            }
            
            // Show outcome
            if (playerValue > 21) {
                displayOutcomeMessage('Bust!', 'bust');
            } else if (dealerValue > 21) {
                displayOutcomeMessage('You Win!', 'win');
            } else if (playerValue > dealerValue) {
                displayOutcomeMessage('You Win!', 'win');
            } else if (playerValue === dealerValue) {
                displayOutcomeMessage('Push', 'push');
            } else {
                displayOutcomeMessage('Dealer Wins', 'lose');
            }
            
            updateGameDisplay();
            updateControls();
        }
        
        // Get the value of a single card
        function getCardValue(card) {
            if (!card) return 0;
            
            if (card.value === 'A') return 11;
            if (['K', 'Q', 'J', '10'].includes(card.value)) return 10;
            return parseInt(card.value);
        }
        
        // Calculate the value of a hand
        function getHandValue(hand) {
            if (!hand || hand.length === 0) return 0;
            
            let sum = 0;
            let aceCount = 0;
            
            for (let card of hand) {
                if (card.value === 'A') {
                    aceCount++;
                    sum += 11;
                } else if (['K', 'Q', 'J', '10'].includes(card.value)) {
                    sum += 10;
                } else {
                    sum += parseInt(card.value);
                }
            }
            
            // Adjust for Aces if needed
            while (sum > 21 && aceCount > 0) {
                sum -= 10;
                aceCount--;
            }
            
            return sum;
        }
        
        // Check if a hand is soft (contains an Ace counted as 11)
        function isSoftHand(hand) {
            let sum = 0;
            let aceCount = 0;
            
            for (let card of hand) {
                if (card.value === 'A') {
                    aceCount++;
                    sum += 11;
                } else if (['K', 'Q', 'J', '10'].includes(card.value)) {
                    sum += 10;
                } else {
                    sum += parseInt(card.value);
                }
            }
            
            return aceCount > 0 && sum <= 21;
        }
        
        // Update controls based on game state
        function updateControls() {
            const isDealingPhase = state.gamePhase === 'dealing';
            
            if (dealButton) dealButton.disabled = (state.gamePhase !== 'gameOver') || isDealingPhase;
            if (hitButton) hitButton.disabled = state.gamePhase !== 'playerTurn' || isDealingPhase;
            if (standButton) standButton.disabled = state.gamePhase !== 'playerTurn' || isDealingPhase;
            if (doubleButton) {
                const canDouble = state.gamePhase === 'playerTurn' && 
                                  state.playerHands[state.currentHandIndex].length === 2;
                doubleButton.disabled = !canDouble || isDealingPhase;
            }
            if (splitButton) {
                const currentHand = state.playerHands[state.currentHandIndex] || [];
                const canSplit = state.gamePhase === 'playerTurn' && 
                                 currentHand.length === 2 && 
                                 currentHand[0]?.value === currentHand[1]?.value;
                splitButton.disabled = !canSplit || isDealingPhase;
            }
        }
        
        // Update game display with current state
        function updateGameDisplay() {
            renderCards();
        }
        
        // Render all cards on the table
        function renderCards() {
            const dealerCardArea = document.getElementById('dealer-cards');
            const playerCardArea = document.getElementById('player-cards');
            
            if (dealerCardArea) {
                dealerCardArea.innerHTML = '';
                
                const dealerHandEl = document.createElement('div');
                dealerHandEl.className = 'hand';
                
                state.dealerHand.forEach(card => {
                    const cardEl = document.createElement('div');
                    cardEl.className = 'card';
                    
                    const cardImage = document.createElement('img');
                    cardImage.className = 'card-img';
                    cardImage.alt = card.isHidden ? '?' : `${card.value}${card.suit}`;
                    cardImage.src = getCardImagePath(card);
                    
                    cardEl.appendChild(cardImage);
                    dealerHandEl.appendChild(cardEl);
                });
                
                // Display dealer hand value
                const dealerValueEl = document.createElement('div');
                dealerValueEl.className = 'hand-value';
                
                if (!state.dealerHand.some(card => card.isHidden) || state.gamePhase === 'gameOver') {
                    dealerValueEl.textContent = getHandValue(state.dealerHand);
                } else {
                    dealerValueEl.textContent = '?';
                }
                
                dealerHandEl.appendChild(dealerValueEl);
                dealerCardArea.appendChild(dealerHandEl);
            }
            
            if (playerCardArea) {
                playerCardArea.innerHTML = '';
                
                state.playerHands.forEach((hand, handIndex) => {
                    const handEl = document.createElement('div');
                    handEl.className = 'hand';
                    
                    if (handIndex === state.currentHandIndex && state.gamePhase === 'playerTurn') {
                        handEl.classList.add('active');
                    }
                    
                    hand.forEach(card => {
                        const cardEl = document.createElement('div');
                        cardEl.className = 'card';
                        
                        const cardImage = document.createElement('img');
                        cardImage.className = 'card-img';
                        cardImage.alt = `${card.value}${card.suit}`;
                        cardImage.src = getCardImagePath(card);
                        
                        cardEl.appendChild(cardImage);
                        handEl.appendChild(cardEl);
                    });
                    
                    // Display hand value
                    const valueEl = document.createElement('div');
                    valueEl.className = 'hand-value';
                    valueEl.textContent = getHandValue(hand);
                    
                    handEl.appendChild(valueEl);
                    playerCardArea.appendChild(handEl);
                });
            }
        }
        
        // Get the image path for a card
        function getCardImagePath(card) {
            if (card.isHidden) {
                return cardImagePaths.back;
            }
            
            const cardKey = `${card.value}${card.suit}`;
            return cardImagePaths[cardKey];
        }
        
        // Get basic strategy advice
        function getBasicStrategyAdvice() {
            if (state.gamePhase !== 'playerTurn') return 'Waiting for next hand...';
            
            const currentHand = state.playerHands[state.currentHandIndex];
            if (!currentHand || currentHand.length === 0) return 'Waiting for cards...';
            
            const playerValue = getHandValue(currentHand);
            const dealerUpcard = state.dealerHand[0]?.value;
            if (!dealerUpcard) return 'Waiting for dealer card...';
            
            const dealerValue = getCardValue(state.dealerHand[0]);
            
            // Check for pair
            if (currentHand.length === 2 && currentHand[0].value === currentHand[1].value) {
                return getPairAdvice(currentHand[0].value, dealerValue);
            }
            // Check for soft hand
            else if (isSoftHand(currentHand)) {
                return getSoftHandAdvice(playerValue, dealerValue);
            }
            // Hard hand
            else {
                return getHardHandAdvice(playerValue, dealerValue);
            }
        }
        
        // Get advice for pair hands
        function getPairAdvice(pairValue, dealerValue) {
            switch(pairValue) {
                case 'A': return 'Split';
                case 'K': case 'Q': case 'J': case '10': return 'Stand';
                case '9': return [7, 10, 11].includes(dealerValue) ? 'Stand' : 'Split';
                case '8': return 'Split';
                case '7': return dealerValue <= 7 ? 'Split' : 'Hit';
                case '6': return dealerValue <= 6 ? 'Split' : 'Hit';
                case '5': return dealerValue <= 9 ? 'Double' : 'Hit';
                case '4': return [5, 6].includes(dealerValue) ? 'Split' : 'Hit';
                case '3': case '2': return dealerValue <= 7 ? 'Split' : 'Hit';
                default: return 'Hit';
            }
        }
        
        // Get advice for soft hands
        function getSoftHandAdvice(playerValue, dealerValue) {
            if (playerValue >= 19) return 'Stand';
            if (playerValue === 18) return dealerValue <= 6 ? 'Double if allowed, otherwise Stand' : 
                                           dealerValue <= 8 ? 'Stand' : 'Hit';
            if (playerValue === 17) return dealerValue <= 6 ? 'Double if allowed, otherwise Hit' : 'Hit';
            if (playerValue >= 15) return dealerValue <= 6 ? 'Double if allowed, otherwise Hit' : 'Hit';
            if (playerValue >= 13) return dealerValue <= 5 ? 'Double if allowed, otherwise Hit' : 'Hit';
            return 'Hit';
        }
        
        // Get advice for hard hands
        function getHardHandAdvice(playerValue, dealerValue) {
            if (playerValue >= 17) return 'Stand';
            if (playerValue >= 13) return dealerValue <= 6 ? 'Stand' : 'Hit';
            if (playerValue === 12) return [4, 5, 6].includes(dealerValue) ? 'Stand' : 'Hit';
            if (playerValue === 11) return 'Double if allowed, otherwise Hit';
            if (playerValue === 10) return dealerValue <= 9 ? 'Double if allowed, otherwise Hit' : 'Hit';
            if (playerValue === 9) return [3, 4, 5, 6].includes(dealerValue) ? 'Double if allowed, otherwise Hit' : 'Hit';
            return 'Hit';
        }
        
        // Function to display outcome message
        function displayOutcomeMessage(message, outcomeType) {
            const messageEl = document.createElement('div');
            messageEl.className = `outcome-message ${outcomeType}`;
            messageEl.textContent = message;
            
            const table = document.querySelector('.blackjack-table');
            if (table) {
                table.appendChild(messageEl);
                
                setTimeout(() => {
                    messageEl.classList.add('show');
                }, 100);
                
                setTimeout(() => {
                    messageEl.classList.remove('show');
                    setTimeout(() => {
                        messageEl.remove();
                    }, 500);
                }, 2500);
            }
        }
        
        // Initialize the app
        init();
    }
}); 