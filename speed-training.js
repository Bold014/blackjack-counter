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
        const startTrainingBtn = document.getElementById('start-speed-training');
        
        if (startTrainingBtn) {
            startTrainingBtn.addEventListener('click', startSpeedTraining);
        }
        
        // Game screen handlers
        const endTrainingBtn = document.getElementById('end-speed-early');
        if (endTrainingBtn) {
            endTrainingBtn.addEventListener('click', endSpeedTraining);
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
    
    // Get speed settings from the form
    function getSpeedSettings() {
        return {
            decks: parseInt(document.getElementById('speed-decks')?.value || 6),
            hitSoft17: document.getElementById('speed-hit-soft-17')?.value === 'yes',
            doubleAfterSplit: document.getElementById('speed-double-after-split')?.value === 'yes',
            resplitAces: false, // Always false for speed training
            timeLimit: parseInt(document.getElementById('speed-time-limit')?.value || 5),
            difficulty: document.getElementById('speed-difficulty')?.value || 'medium',
            handsToPlay: parseInt(document.getElementById('speed-hands-to-play')?.value || 50)
        };
    }
    
    // Initialize speed run with time tracking
    function initSpeedRun(settings) {
        // Initialize the actual trainer with speed mode
        initTrainer(settings, true);
    }
    
    // End speed training early
    function endSpeedTraining() {
        // Calculate final results and redirect to results page
        calculateAndShowResults();
    }
    
    // Calculate and display training results
    function calculateAndShowResults() {
        // Finalize performance data calculation
        if (window.trainerState && window.trainerState.isSpeedMode) {
            // Call the finalization function from the trainer
            if (typeof finalizeSpeedData === 'function') {
                finalizeSpeedData();
            }
        }
        
        // Get performance data from the trainer
        const results = getSpeedResults();
        
        // Store results in localStorage for the results page
        localStorage.setItem('speedResults', JSON.stringify(results));
        
        // Redirect to results page
        window.location.href = 'speed-results.html';
    }
    
    // Get speed results from the trainer
    function getSpeedResults() {
        // This will be populated by the trainer
        return window.speedPerformance || {
            finalScore: 100,
            correctDecisions: 0,
            totalDecisions: 0,
            wrongDecisions: 0,
            timeouts: 0,
            avgDecisionTime: 0,
            fastestDecision: 0,
            slowestDecision: 0,
            totalHands: 0,
            penaltyPoints: 0
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
        const speedTimer = document.getElementById('speed-timer');
        const timerDisplay = document.getElementById('timer-display');
        
        // Game state
        const state = {
            // Settings (use provided settings or defaults)
            decks: settings?.decks || 6,
            hitSoft17: settings?.hitSoft17 !== undefined ? settings.hitSoft17 : true,
            doubleAfterSplit: settings?.doubleAfterSplit !== undefined ? settings.doubleAfterSplit : true,
            resplitAces: false,
            
            // Speed mode settings
            isSpeedMode: isSpeedMode,
            speedStartTime: isSpeedMode ? Date.now() : null,
            timeLimit: settings?.timeLimit || 5,
            difficulty: settings?.difficulty || 'medium',
            handsToPlay: settings?.handsToPlay || 50,
            
            // Game state
            deck: [],
            playerHands: [[]],
            dealerHand: [],
            currentHandIndex: 0,
            gamePhase: 'waiting', // waiting, playerTurn, dealerTurn, evaluating, gameOver
            doubledHands: new Set(),
            splitHands: [],
            
            // Speed mode tracking
            currentScore: 100,
            decisionStartTime: null,
            decisionTimer: null,
            currentTimeRemaining: 0,
            
            // Performance tracking (for speed mode)
            performance: isSpeedMode ? {
                handsPlayed: 0,
                correctDecisions: 0,
                totalDecisions: 0,
                wrongDecisions: 0,
                timeouts: 0,
                decisionTimes: [],
                penalties: []
            } : null
        };
        
        // Penalty rates based on difficulty
        const penaltyRates = {
            easy: 0.1,    // 10% penalty
            medium: 0.2,  // 20% penalty
            hard: 0.3     // 30% penalty
        };
        
        // Card image paths map
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
        
        // Timer functions
        function startDecisionTimer() {
            if (!state.isSpeedMode) return;
            
            state.decisionStartTime = Date.now();
            state.currentTimeRemaining = state.timeLimit;
            
            // Show timer
            updateTimerDisplay();
            
            // Start countdown
            state.decisionTimer = setInterval(() => {
                state.currentTimeRemaining -= 0.1;
                updateTimerDisplay();
                
                if (state.currentTimeRemaining <= 0) {
                    handleTimeout();
                }
            }, 100);
        }
        
        function stopDecisionTimer() {
            if (state.decisionTimer) {
                clearInterval(state.decisionTimer);
                state.decisionTimer = null;
            }
            
            // Hide speed timer
            if (speedTimer) {
                speedTimer.textContent = state.timeLimit.toString();
                speedTimer.className = 'speed-timer';
            }
        }
        
        function updateTimerDisplay() {
            if (!speedTimer) return;
            
            const timeLeft = Math.max(0, state.currentTimeRemaining);
            speedTimer.textContent = timeLeft.toFixed(1);
            
            // Update timer styling based on time remaining
            speedTimer.className = 'speed-timer';
            if (timeLeft <= 2) {
                speedTimer.classList.add('danger');
            } else if (timeLeft <= state.timeLimit / 2) {
                speedTimer.classList.add('warning');
            }
            
            // Show big timer for last 3 seconds
            if (timeLeft <= 3 && timerDisplay) {
                timerDisplay.textContent = Math.ceil(timeLeft).toString();
                timerDisplay.className = 'timer-display active';
                if (timeLeft <= 1) {
                    timerDisplay.classList.add('warning');
                }
            } else if (timerDisplay) {
                timerDisplay.className = 'timer-display';
            }
        }
        
        function handleTimeout() {
            stopDecisionTimer();
            
            // Record timeout
            if (state.performance) {
                state.performance.timeouts++;
                state.performance.totalDecisions++;
            }
            
            // Apply penalty
            applyPenalty('TIMEOUT');
            
            // Auto-select the safest option (usually stand)
            playerStand();
        }
        
        function recordDecision(action, isCorrect) {
            if (!state.isSpeedMode || !state.performance) return;
            
            const decisionTime = (Date.now() - state.decisionStartTime) / 1000;
            state.performance.decisionTimes.push(decisionTime);
            state.performance.totalDecisions++;
            
            if (isCorrect) {
                state.performance.correctDecisions++;
                // Bonus points for fast correct decisions
                if (decisionTime < 2) {
                    updateScore(2); // Small bonus
                }
            } else {
                state.performance.wrongDecisions++;
                applyPenalty('WRONG DECISION');
            }
            
            updateSpeedProgress();
        }
        
        function applyPenalty(reason) {
            const penaltyAmount = Math.floor(100 * penaltyRates[state.difficulty]);
            state.currentScore = Math.max(0, state.currentScore - penaltyAmount);
            
            if (state.performance) {
                state.performance.penalties.push({
                    reason,
                    amount: penaltyAmount,
                    timestamp: Date.now()
                });
            }
            
            // Show penalty animation
            showPenaltyAnimation(`-${penaltyAmount}`);
            updateSpeedProgress();
        }
        
        function updateScore(points) {
            state.currentScore = Math.min(100, state.currentScore + points);
            updateSpeedProgress();
        }
        
        function showPenaltyAnimation(text) {
            const penalty = document.createElement('div');
            penalty.className = 'penalty-animation';
            penalty.textContent = text;
            
            // Position near the game controls
            const controls = document.querySelector('.game-controls');
            if (controls) {
                const rect = controls.getBoundingClientRect();
                penalty.style.left = rect.left + rect.width / 2 + 'px';
                penalty.style.top = rect.top - 50 + 'px';
            }
            
            document.body.appendChild(penalty);
            
            // Remove after animation
            setTimeout(() => {
                penalty.remove();
            }, 2000);
        }
        
        function updateSpeedProgress() {
            if (!state.isSpeedMode) return;
            
            // Update hands played
            const handsPlayedEl = document.getElementById('hands-played');
            if (handsPlayedEl && state.performance) {
                handsPlayedEl.textContent = state.performance.handsPlayed.toString();
            }
            
            // Update current score
            const currentScoreEl = document.getElementById('current-score');
            if (currentScoreEl) {
                currentScoreEl.textContent = state.currentScore.toString();
            }
            
            // Update average decision time
            const avgTimeEl = document.getElementById('avg-decision-time');
            if (avgTimeEl && state.performance && state.performance.decisionTimes.length > 0) {
                const avgTime = state.performance.decisionTimes.reduce((a, b) => a + b, 0) / state.performance.decisionTimes.length;
                avgTimeEl.textContent = avgTime.toFixed(1) + 's';
            }
            
            // Check if training is complete
            if (state.handsToPlay > 0 && state.performance && state.performance.handsPlayed >= state.handsToPlay) {
                setTimeout(() => {
                    calculateAndShowResults();
                }, 1000);
            }
        }
        
        function finalizeSpeedData() {
            if (!state.isSpeedMode || !state.performance) return;
            
            const performance = state.performance;
            
            // Calculate final metrics
            const avgDecisionTime = performance.decisionTimes.length > 0 ? 
                performance.decisionTimes.reduce((a, b) => a + b, 0) / performance.decisionTimes.length : 0;
            
            const fastestDecision = performance.decisionTimes.length > 0 ?
                Math.min(...performance.decisionTimes) : 0;
                
            const slowestDecision = performance.decisionTimes.length > 0 ?
                Math.max(...performance.decisionTimes) : 0;
            
            const totalPenalties = performance.penalties.reduce((sum, p) => sum + p.amount, 0);
            
            // Store results globally for access
            window.speedPerformance = {
                finalScore: state.currentScore,
                correctDecisions: performance.correctDecisions,
                totalDecisions: performance.totalDecisions,
                wrongDecisions: performance.wrongDecisions,
                timeouts: performance.timeouts,
                avgDecisionTime,
                fastestDecision,
                slowestDecision,
                totalHands: performance.handsPlayed,
                penaltyPoints: totalPenalties
            };
        }
        
        // Initialize the game
        function init() {
            loadSettings();
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
        
        function loadSettings() {
            // Settings are already loaded from the settings object
            if (settings) {
                state.decks = settings.decks;
                state.hitSoft17 = settings.hitSoft17;
                state.doubleAfterSplit = settings.doubleAfterSplit;
                state.resplitAces = settings.resplitAces;
            }
        }
        
        function bindEvents() {
            dealButton?.addEventListener('click', deal);
            hitButton?.addEventListener('click', () => makeDecision('hit'));
            standButton?.addEventListener('click', () => makeDecision('stand'));
            doubleButton?.addEventListener('click', () => makeDecision('double'));
            splitButton?.addEventListener('click', () => makeDecision('split'));
        }
        
        function makeDecision(action) {
            if (!state.isSpeedMode) {
                // Normal mode - just execute the action
                switch(action) {
                    case 'hit': playerHit(); break;
                    case 'stand': playerStand(); break;
                    case 'double': playerDouble(); break;
                    case 'split': playerSplit(); break;
                }
                return;
            }
            
            // Speed mode - check if decision is correct
            stopDecisionTimer();
            
            const correctAction = getBasicStrategyAdvice();
            const isCorrect = action === correctAction.toLowerCase();
            
            recordDecision(action, isCorrect);
            
            // Execute the action
            switch(action) {
                case 'hit': playerHit(); break;
                case 'stand': playerStand(); break;
                case 'double': playerDouble(); break;
                case 'split': playerSplit(); break;
            }
        }
        
        function createDeck() {
            const suits = ['♥', '♦', '♣', '♠'];
            const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
            
            state.deck = [];
            
            for (let d = 0; d < state.decks; d++) {
                for (const suit of suits) {
                    for (const rank of ranks) {
                        state.deck.push(rank + suit);
                    }
                }
            }
        }
        
        function shuffleDeck() {
            for (let i = state.deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [state.deck[i], state.deck[j]] = [state.deck[j], state.deck[i]];
            }
        }
        
        function dealCard(isHidden = false, isDealer = false) {
            if (state.deck.length === 0) {
                createDeck();
                shuffleDeck();
            }
            
            const card = state.deck.pop();
            
            // Create card element
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            if (isDealer) {
                cardElement.classList.add('dealer-card');
            }
            
            const cardImage = document.createElement('img');
            cardImage.src = isHidden ? cardImagePaths['back'] : cardImagePaths[card];
            cardImage.alt = isHidden ? 'Hidden card' : card;
            cardElement.appendChild(cardImage);
            
            if (isHidden) {
                cardElement.dataset.hiddenCard = card;
            }
            
            return { card, element: cardElement };
        }
        
        function deal() {
            // Reset for new hand
            state.playerHands = [[]];
            state.dealerHand = [];
            state.currentHandIndex = 0;
            state.gamePhase = 'dealing';
            state.doubledHands.clear();
            state.splitHands = [];
            
            // Clear the table
            document.getElementById('player-cards').innerHTML = '';
            document.getElementById('dealer-cards').innerHTML = '';
            
            // Deal initial cards
            const playerCard1 = dealCard(false, false);
            const dealerCard1 = dealCard(false, true);
            const playerCard2 = dealCard(false, false);
            const dealerCard2 = dealCard(true, true); // Hidden card
            
            state.playerHands[0] = [playerCard1.card, playerCard2.card];
            state.dealerHand = [dealerCard1.card, dealerCard2.card];
            
            // Display cards
            const playerCardsDiv = document.getElementById('player-cards');
            const dealerCardsDiv = document.getElementById('dealer-cards');
            
            playerCardsDiv.appendChild(playerCard1.element);
            playerCardsDiv.appendChild(playerCard2.element);
            dealerCardsDiv.appendChild(dealerCard1.element);
            dealerCardsDiv.appendChild(dealerCard2.element);
            
            // Update game phase
            state.gamePhase = 'playerTurn';
            
            // Check for blackjack
            const playerValue = getHandValue(state.playerHands[0]);
            const dealerValue = getHandValue(state.dealerHand);
            
            if (playerValue === 21 || dealerValue === 21) {
                // Handle blackjack
                state.gamePhase = 'evaluating';
                revealDealerCards();
                setTimeout(evaluateHands, 1000);
            } else {
                // Start decision timer for speed mode
                if (state.isSpeedMode) {
                    startDecisionTimer();
                }
            }
            
            updateControls();
            
            // Track hand for speed mode
            if (state.isSpeedMode && state.performance) {
                state.performance.handsPlayed++;
                updateSpeedProgress();
            }
        }
        
        function playerHit() {
            const currentHand = state.playerHands[state.currentHandIndex];
            const newCard = dealCard(false, false);
            currentHand.push(newCard.card);
            
            // Add card to display
            const playerCardsDiv = document.getElementById('player-cards');
            playerCardsDiv.appendChild(newCard.element);
            
            // Check if busted
            const handValue = getHandValue(currentHand);
            if (handValue > 21) {
                // Busted - move to dealer turn or next hand
                if (state.currentHandIndex < state.playerHands.length - 1) {
                    state.currentHandIndex++;
                    if (state.isSpeedMode) {
                        startDecisionTimer();
                    }
                } else {
                    state.gamePhase = 'dealerTurn';
                    setTimeout(dealerTurn, 1000);
                }
            } else if (state.isSpeedMode) {
                // Continue with timer for next decision
                startDecisionTimer();
            }
            
            updateControls();
        }
        
        function playerStand() {
            // Move to next hand or dealer turn
            if (state.currentHandIndex < state.playerHands.length - 1) {
                state.currentHandIndex++;
                if (state.isSpeedMode) {
                    startDecisionTimer();
                }
                updateControls();
            } else {
                state.gamePhase = 'dealerTurn';
                updateControls();
                setTimeout(dealerTurn, 500);
            }
        }
        
        function playerDouble() {
            const currentHand = state.playerHands[state.currentHandIndex];
            
            // Mark this hand as doubled
            state.doubledHands.add(state.currentHandIndex);
            
            // Deal one card and stand
            const newCard = dealCard(false, false);
            currentHand.push(newCard.card);
            
            // Add card to display
            const playerCardsDiv = document.getElementById('player-cards');
            playerCardsDiv.appendChild(newCard.element);
            
            // Automatically stand after double
            playerStand();
        }
        
        function playerSplit() {
            const currentHand = state.playerHands[state.currentHandIndex];
            
            if (currentHand.length !== 2) return;
            
            const card1 = currentHand[0];
            const card2 = currentHand[1];
            
            // Create two new hands
            state.playerHands[state.currentHandIndex] = [card1];
            state.playerHands.splice(state.currentHandIndex + 1, 0, [card2]);
            state.splitHands.push(state.currentHandIndex, state.currentHandIndex + 1);
            
            // Deal a card to each hand
            const newCard1 = dealCard(false, false);
            const newCard2 = dealCard(false, false);
            
            state.playerHands[state.currentHandIndex].push(newCard1.card);
            state.playerHands[state.currentHandIndex + 1].push(newCard2.card);
            
            // Update display
            renderCards();
            
            // Continue with first hand
            if (state.isSpeedMode) {
                startDecisionTimer();
            }
            
            updateControls();
        }
        
        function dealerTurn() {
            state.gamePhase = 'dealerTurn';
            revealDealerCards();
            
            function dealNextCard() {
                if (shouldDealerHit()) {
                    const newCard = dealCard(false, true);
                    state.dealerHand.push(newCard.card);
                    
                    const dealerCardsDiv = document.getElementById('dealer-cards');
                    dealerCardsDiv.appendChild(newCard.element);
                    
                    setTimeout(dealNextCard, 500);
                } else {
                    // Dealer done, evaluate hands
                    state.gamePhase = 'evaluating';
                    setTimeout(evaluateHands, 500);
                }
            }
            
            setTimeout(dealNextCard, 500);
        }
        
        function shouldDealerHit() {
            const value = getHandValue(state.dealerHand);
            
            if (value < 17) return true;
            if (value > 17) return false;
            
            // Value is 17
            if (!state.hitSoft17) return false;
            
            // Check if it's soft 17
            return isSoftHand(state.dealerHand) && value === 17;
        }
        
        function revealDealerCards() {
            const dealerCardsDiv = document.getElementById('dealer-cards');
            const hiddenCard = dealerCardsDiv.querySelector('[data-hidden-card]');
            
            if (hiddenCard) {
                const cardValue = hiddenCard.dataset.hiddenCard;
                const img = hiddenCard.querySelector('img');
                img.src = cardImagePaths[cardValue];
                img.alt = cardValue;
                hiddenCard.removeAttribute('data-hidden-card');
            }
        }
        
        function evaluateHands() {
            state.gamePhase = 'gameOver';
            
            // Evaluate each player hand
            const dealerValue = getHandValue(state.dealerHand);
            const dealerBusted = dealerValue > 21;
            
            state.playerHands.forEach((hand, index) => {
                const playerValue = getHandValue(hand);
                const playerBusted = playerValue > 21;
                
                let result;
                if (playerBusted) {
                    result = 'lose';
                } else if (dealerBusted) {
                    result = 'win';
                } else if (playerValue > dealerValue) {
                    result = 'win';
                } else if (playerValue < dealerValue) {
                    result = 'lose';
                } else {
                    result = 'push';
                }
                
                // Display result (implement visual feedback as needed)
                console.log(`Hand ${index + 1}: ${result}`);
            });
            
            updateControls();
        }
        
        function getCardValue(card) {
            const rank = card.slice(0, -1);
            if (rank === 'A') return 11;
            if (['K', 'Q', 'J'].includes(rank)) return 10;
            return parseInt(rank);
        }
        
        function getHandValue(hand) {
            let value = 0;
            let aces = 0;
            
            for (const card of hand) {
                const cardValue = getCardValue(card);
                value += cardValue;
                if (cardValue === 11) aces++;
            }
            
            // Adjust for aces
            while (value > 21 && aces > 0) {
                value -= 10;
                aces--;
            }
            
            return value;
        }
        
        function isSoftHand(hand) {
            let value = 0;
            let aces = 0;
            
            for (const card of hand) {
                const cardValue = getCardValue(card);
                value += cardValue;
                if (cardValue === 11) aces++;
            }
            
            // If we can reduce an ace and stay under 21, it's soft
            return aces > 0 && value <= 21;
        }
        
        function updateControls() {
            const dealing = state.gamePhase === 'dealing';
            const playerTurn = state.gamePhase === 'playerTurn';
            const gameOver = state.gamePhase === 'gameOver';
            
            dealButton.disabled = !gameOver;
            hitButton.disabled = !playerTurn;
            standButton.disabled = !playerTurn;
            
            // Double only on first two cards
            const currentHand = state.playerHands[state.currentHandIndex];
            doubleButton.disabled = !playerTurn || !currentHand || currentHand.length !== 2;
            
            // Split only on pairs
            const canSplit = playerTurn && currentHand && currentHand.length === 2 && 
                           getCardValue(currentHand[0]) === getCardValue(currentHand[1]);
            splitButton.disabled = !canSplit;
        }
        
        function renderCards() {
            // Re-render all cards (used after split)
            const playerCardsDiv = document.getElementById('player-cards');
            playerCardsDiv.innerHTML = '';
            
            state.playerHands.forEach((hand, handIndex) => {
                const handDiv = document.createElement('div');
                handDiv.className = 'player-hand';
                if (handIndex === state.currentHandIndex) {
                    handDiv.classList.add('active');
                }
                
                hand.forEach(card => {
                    const cardElement = document.createElement('div');
                    cardElement.className = 'card';
                    
                    const cardImage = document.createElement('img');
                    cardImage.src = cardImagePaths[card];
                    cardImage.alt = card;
                    cardElement.appendChild(cardImage);
                    
                    handDiv.appendChild(cardElement);
                });
                
                playerCardsDiv.appendChild(handDiv);
            });
        }
        
        // Basic Strategy Implementation
        function getBasicStrategyAdvice() {
            if (state.gamePhase !== 'playerTurn') return '';
            
            const playerHand = state.playerHands[state.currentHandIndex];
            const dealerUpCard = state.dealerHand[0];
            const dealerValue = getCardValue(dealerUpCard);
            const playerValue = getHandValue(playerHand);
            
            // Check for pairs first
            if (playerHand.length === 2 && getCardValue(playerHand[0]) === getCardValue(playerHand[1])) {
                const pairCard = getCardValue(playerHand[0]);
                return getPairAdvice(pairCard, dealerValue);
            }
            
            // Check for soft hands
            if (isSoftHand(playerHand)) {
                return getSoftHandAdvice(playerValue, dealerValue);
            }
            
            // Hard hands
            return getHardHandAdvice(playerValue, dealerValue);
        }
        
        function getPairAdvice(pairValue, dealerValue) {
            const splitMatrix = {
                11: 'split',  // Always split aces
                10: 'stand',  // Never split tens
                9: dealerValue === 7 || dealerValue >= 10 ? 'stand' : 'split',
                8: 'split',   // Always split eights
                7: dealerValue <= 7 ? 'split' : 'hit',
                6: dealerValue <= 6 ? 'split' : 'hit',
                5: 'double',  // Never split fives, double like 10
                4: dealerValue === 5 || dealerValue === 6 ? 'split' : 'hit',
                3: dealerValue <= 7 ? 'split' : 'hit',
                2: dealerValue <= 7 ? 'split' : 'hit'
            };
            
            return splitMatrix[pairValue] || 'stand';
        }
        
        function getSoftHandAdvice(playerValue, dealerValue) {
            if (playerValue >= 19) return 'stand';
            if (playerValue === 18) {
                if (dealerValue >= 9) return 'hit';
                if (dealerValue >= 7) return 'stand';
                return state.doubleAfterSplit ? 'double' : 'stand';
            }
            if (playerValue === 17) {
                return dealerValue <= 6 ? 'double' : 'hit';
            }
            if (playerValue <= 16) {
                return dealerValue <= 6 ? 'double' : 'hit';
            }
            return 'hit';
        }
        
        function getHardHandAdvice(playerValue, dealerValue) {
            if (playerValue >= 17) return 'stand';
            if (playerValue >= 13 && playerValue <= 16) {
                return dealerValue <= 6 ? 'stand' : 'hit';
            }
            if (playerValue === 12) {
                return dealerValue >= 4 && dealerValue <= 6 ? 'stand' : 'hit';
            }
            if (playerValue === 11) {
                return 'double';
            }
            if (playerValue === 10) {
                return dealerValue <= 9 ? 'double' : 'hit';
            }
            if (playerValue === 9) {
                return dealerValue >= 3 && dealerValue <= 6 ? 'double' : 'hit';
            }
            return 'hit';
        }
        
        // Initialize the trainer
        init();
    }
}); 