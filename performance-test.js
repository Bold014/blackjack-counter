// Performance Test Page Component
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the performance test page
    initPerformanceTest();
    
    // Main initialization function
    function initPerformanceTest() {
        // Initialize navigation system
        initNavigation();
        
        // Show settings by default
        showTestRunSettings();
    }
    
    // Navigation system for different screens
    function initNavigation() {
        // Settings screen handlers
        const startTestBtn = document.getElementById('start-test-run');
        
        if (startTestBtn) {
            startTestBtn.addEventListener('click', startTestRun);
        }
        
        // Game screen handlers
        const endTestBtn = document.getElementById('end-test-early');
        if (endTestBtn) {
            endTestBtn.addEventListener('click', endTestRun);
        }
    }
    
    // Show test run settings screen
    function showTestRunSettings() {
        hideAllScreens();
        document.getElementById('test-run-settings').classList.add('active');
    }
    
    // Show test run game screen
    function showTestRunGame() {
        hideAllScreens();
        document.getElementById('test-run-game').classList.add('active');
    }
    
    // Hide all screens
    function hideAllScreens() {
        const screens = ['test-run-settings', 'test-run-game'];
        screens.forEach(screenId => {
            const screen = document.getElementById(screenId);
            if (screen) {
                screen.classList.remove('active');
            }
        });
    }
    
    // Start a test run with subscription checking
    async function startTestRun() {
        try {
            // Check if subscription manager is initialized
            if (!window.subscriptionManager || !window.subscriptionManager.initialized) {
                showSubscriptionError('Subscription service is not available. Please try again later.');
                return;
            }
            
            // Get subscription status
            const status = await window.subscriptionManager.getSubscriptionStatus();
            
            // Check if user can run a test
            if (!status.isSubscribed && status.dailyTestsRemaining <= 0) {
                showUpgradeModal(status);
                return;
            }
            
            // Track the test usage for free users
            if (!status.isSubscribed) {
                const tracked = await window.subscriptionManager.trackPerformanceTest();
                if (!tracked) {
                    showSubscriptionError('Failed to track test usage. Please try again.');
                    return;
                }
                
                // Update UI to show remaining tests for free users
                updateRemainingTestsDisplay(status.dailyTestsRemaining - 1, false);
            } else {
                // Update UI to show premium status
                updateRemainingTestsDisplay(0, true);
            }
            
            // Get settings
            const settings = getTestSettings();
            
            // Initialize test run
            initTestRun(settings);
            
            // Show game screen
            showTestRunGame();
            
        } catch (error) {
            console.error('Error starting test run:', error);
            showSubscriptionError('An error occurred. Please try again.');
        }
    }
    
    // Show upgrade modal when daily limit is reached
    function showUpgradeModal(status) {
        const modal = document.createElement('div');
        modal.className = 'subscription-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <h2>Daily Limit Reached</h2>
                <p>You've used all ${window.subscriptionManager.DAILY_FREE_LIMIT} of your free performance tests for today.</p>
                <p>Upgrade to Premium for unlimited tests and access to Speed Training mode!</p>
                <div class="modal-features">
                    <div class="feature">
                        <i class="fas fa-infinity"></i>
                        <span>Unlimited Performance Tests</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Speed Training Mode</span>
                    </div>
                    <div class="feature">
                        <i class="fas fa-chart-line"></i>
                        <span>Advanced Analytics</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="closeSubscriptionModal()">Maybe Later</button>
                    <button class="btn-primary" onclick="window.location.href='pricing.html'">
                        <i class="fas fa-crown"></i> Upgrade to Premium
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .subscription-modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
            }
            
            .modal-content {
                position: relative;
                background: #1a1f2e;
                border-radius: 20px;
                padding: 40px;
                max-width: 500px;
                width: 90%;
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
            }
            
            .modal-content h2 {
                font-size: 2rem;
                margin-bottom: 20px;
                color: white;
            }
            
            .modal-content p {
                color: #94a3b8;
                margin-bottom: 20px;
                line-height: 1.6;
            }
            
            .modal-features {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin: 30px 0;
            }
            
            .modal-features .feature {
                display: flex;
                align-items: center;
                gap: 15px;
                color: white;
            }
            
            .modal-features i {
                font-size: 1.5rem;
                color: #667eea;
            }
            
            .modal-actions {
                display: flex;
                gap: 15px;
                margin-top: 30px;
            }
            
            .modal-actions button {
                flex: 1;
                padding: 16px 24px;
                border-radius: 12px;
                font-size: 1.1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                border: none;
            }
            
            .btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .btn-secondary:hover {
                background: rgba(255, 255, 255, 0.15);
            }
            
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }
            
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Close subscription modal
    window.closeSubscriptionModal = function() {
        const modal = document.querySelector('.subscription-modal');
        if (modal) {
            modal.remove();
        }
    };
    
    // Show subscription error
    function showSubscriptionError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'subscription-error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }
    
    // Update remaining tests display
    function updateRemainingTestsDisplay(remainingTests, isPremium = false) {
        const existingDisplay = document.querySelector('.remaining-tests-display');
        if (existingDisplay) {
            existingDisplay.remove();
        }
        
        const display = document.createElement('div');
        display.className = 'remaining-tests-display';
        
        if (isPremium) {
            display.innerHTML = `
                <i class="fas fa-crown"></i>
                <span>Premium Member - Unlimited Tests</span>
            `;
            display.style.background = 'rgba(102, 126, 234, 0.1)';
            display.style.borderColor = 'rgba(102, 126, 234, 0.3)';
            display.style.color = '#818cf8';
        } else {
            display.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>${remainingTests} free tests remaining today</span>
                <a href="pricing.html">Upgrade for unlimited</a>
            `;
        }
        
        const container = document.querySelector('.test-progress');
        if (container) {
            container.appendChild(display);
        }
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .remaining-tests-display {
                background: rgba(251, 191, 36, 0.1);
                border: 1px solid rgba(251, 191, 36, 0.3);
                color: #fbbf24;
                padding: 10px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                margin-top: 15px;
                font-size: 0.9rem;
            }
            
            .remaining-tests-display a {
                color: #fbbf24;
                text-decoration: underline;
                margin-left: auto;
            }
            
            .remaining-tests-display a:hover {
                color: #f59e0b;
            }
            
            .subscription-error {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                color: #ef4444;
                padding: 15px 20px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        
        if (!document.querySelector('style[data-subscription-styles]')) {
            style.setAttribute('data-subscription-styles', 'true');
            document.head.appendChild(style);
        }
    }
    
    // Get test settings from the form
    function getTestSettings() {
        return {
            decks: parseInt(document.getElementById('test-decks')?.value || 6),
            hitSoft17: document.getElementById('test-hit-soft-17')?.value === 'yes',
            doubleAfterSplit: document.getElementById('test-double-after-split')?.value === 'yes',
            resplitAces: document.getElementById('test-resplit-aces')?.value === 'yes',
            bettingEnabled: document.getElementById('test-enable-betting')?.value === 'yes',
            startingBalance: parseInt(document.getElementById('test-starting-balance')?.value || 1000)
        };
    }
    
    // Initialize test run with performance tracking
    function initTestRun(settings) {
        // Initialize the actual trainer with performance tracking
        initTrainer(settings, true);
    }
    
    // End test run early
    function endTestRun() {
        // Calculate final results and redirect to results page
        calculateAndShowResults();
    }
    
    // Calculate and display test results
    function calculateAndShowResults() {
        // Finalize performance data calculation
        if (window.trainerState && window.trainerState.isTestMode) {
            // Call the finalization function from the trainer
            if (typeof finalizePerformanceData === 'function') {
                finalizePerformanceData();
            }
        }
        
        // Get performance data from the trainer
        const results = getPerformanceResults();
        
        // Store results in localStorage for the results page
        localStorage.setItem('testResults', JSON.stringify(results));
        
        // Redirect to results page
        window.location.href = 'test-results.html';
    }
    
    // Get performance results from the trainer
    function getPerformanceResults() {
        // This will be populated by the trainer
        return window.trainerPerformance || {
            overallScore: 0,
            strategyAccuracy: 0,
            bettingAccuracy: 0,
            correctHits: { correct: 0, total: 0 },
            correctStands: { correct: 0, total: 0 },
            correctDoubles: { correct: 0, total: 0 },
            correctSplits: { correct: 0, total: 0 },
            bettingDecisions: { correct: 0, total: 0 },
            startingBalance: 1000,
            finalBalance: 1000,
            totalHands: 0,
            testDuration: 0,
            avgDecisionTime: 0
        };
    }
    


    
    // Display results on the results screen
    function displayResults(results) {
        // Update overall score
        const finalScoreEl = document.getElementById('final-score');
        if (finalScoreEl) {
            finalScoreEl.textContent = `${Math.round(results.overallScore)}%`;
        }
        
        // Update strategy accuracy
        const strategyAccuracyEl = document.getElementById('strategy-accuracy');
        if (strategyAccuracyEl) {
            strategyAccuracyEl.textContent = `${Math.round(results.strategyAccuracy)}%`;
        }
        
        // Update individual strategy stats
        document.getElementById('correct-hits').textContent = `${results.correctHits.correct}/${results.correctHits.total}`;
        document.getElementById('correct-stands').textContent = `${results.correctStands.correct}/${results.correctStands.total}`;
        document.getElementById('correct-doubles').textContent = `${results.correctDoubles.correct}/${results.correctDoubles.total}`;
        document.getElementById('correct-splits').textContent = `${results.correctSplits.correct}/${results.correctSplits.total}`;
        
        // Update betting performance
        const bettingAccuracyEl = document.getElementById('betting-accuracy');
        if (bettingAccuracyEl) {
            bettingAccuracyEl.textContent = `${Math.round(results.bettingAccuracy)}%`;
        }
        
        document.getElementById('starting-balance').textContent = `$${results.startingBalance}`;
        document.getElementById('final-balance').textContent = `$${results.finalBalance}`;
        
        const netResult = results.finalBalance - results.startingBalance;
        const netResultEl = document.getElementById('net-result');
        if (netResultEl) {
            netResultEl.textContent = `${netResult >= 0 ? '+' : ''}$${netResult}`;
            netResultEl.style.color = netResult >= 0 ? 'var(--success-color)' : 'var(--warning-color)';
        }
        
        // Update counting performance
        const countingAccuracyEl = document.getElementById('counting-accuracy');
        if (countingAccuracyEl) {
            countingAccuracyEl.textContent = `${Math.round(results.countingAccuracy)}%`;
        }
        
        document.getElementById('total-hands').textContent = results.totalHands.toString();
        document.getElementById('avg-true-count').textContent = results.avgTrueCount.toFixed(1);
    }
    
    // Separate function to initialize the actual trainer
    function initTrainer(settings = null, isTestMode = false) {
        // DOM Elements
        const trainerContainer = document.querySelector('.trainer-container');
        const deckSelect = document.getElementById('test-decks');
        const hitSoft17Select = document.getElementById('test-hit-soft-17');
        const doubleAfterSplitSelect = document.getElementById('test-double-after-split');
        const resplitAcesSelect = document.getElementById('test-resplit-aces');
        const enableBettingSelect = document.getElementById('test-enable-betting');
        const dealButton = document.getElementById('deal-button');
        const hitButton = document.getElementById('hit-button');
        const standButton = document.getElementById('stand-button');
        const doubleButton = document.getElementById('double-button');
        const splitButton = document.getElementById('split-button');
        const betInput = document.getElementById('bet-amount');
        const balanceDisplay = document.getElementById('balance');
        const runningCountDisplay = document.getElementById('help-running-count');
        const trueCountDisplay = document.getElementById('help-true-count');
        const helpAdviceDisplay = document.getElementById('help-advice');
        const historyList = document.getElementById('help-history-list');
        
        // Game state
        const state = {
            // Settings (use provided settings or defaults)
            decks: settings?.decks || 6,
            hitSoft17: settings?.hitSoft17 !== undefined ? settings.hitSoft17 : true,
            doubleAfterSplit: settings?.doubleAfterSplit !== undefined ? settings.doubleAfterSplit : true,
            resplitAces: settings?.resplitAces !== undefined ? settings.resplitAces : false,
            bettingEnabled: settings?.bettingEnabled !== undefined ? settings.bettingEnabled : true,
            
            // Test mode settings
            isTestMode: isTestMode,
            testStartTime: isTestMode ? Date.now() : null,
            
            // Game state
            deck: [],
            playerHands: [[]],
            dealerHand: [],
            currentHandIndex: 0,
            gamePhase: 'betting', // betting, playerTurn, dealerTurn, evaluating, gameOver
            balance: settings?.startingBalance || 1000,
            currentBet: 0,
            doubledHands: new Set(),
            splitHands: [],
            
            // Card counting
            runningCount: 0,
            cardsDealt: 0,
            cardHistory: [],
            
            // Shoe tracking
            cardCounts: {}, // Will store count of each rank remaining in the shoe
            
            // Betting strategy
            bettingStrategy: {
                // Define the betting spread (true count → betting units)
                betSpread: {
                    '-5': 1, '-4': 1, '-3': 1, '-2': 1, '-1': 1, '0': 1, // Minimum bet for non-positive counts
                    '1': 1, // True count 1 = 1 unit
                    '2': 2, // True count 2 = 2 units
                    '3': 4, // True count 3 = 4 units
                    '4': 8, // True count 4 = 8 units
                    '5': 12, // True count 5 = 12 units
                    '6': 15, // True count 6+ = 15 units (maximum)
                },
                minBet: 10, // Minimum bet amount (1 unit)
                currentRecommendation: 0 // Current recommended bet
            },
            
            // Performance tracking (only for test mode)
            performance: isTestMode ? {
                startingBalance: settings?.startingBalance || 1000,
                handsPlayed: 0,
                decisions: {
                    hits: { correct: 0, total: 0 },
                    stands: { correct: 0, total: 0 },
                    doubles: { correct: 0, total: 0 },
                    splits: { correct: 0, total: 0 }
                },
                bettingDecisions: { correct: 0, total: 0 },
                countingAccuracy: { correct: 0, total: 0 },
                trueCountHistory: [],
                handStartTimes: [],
                totalTestTime: 0
            } : null
        };
        
        // Card values for Hi-Lo counting system
        const cardValues = {
            '2': 1,
            '3': 1,
            '4': 1,
            '5': 1,
            '6': 1,
            '7': 0,
            '8': 0,
            '9': 0,
            '10': -1,
            'J': -1,
            'Q': -1,
            'K': -1,
            'A': -1
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
        
        // Update the CSS with a new shake animation
        const styleSheet = document.createElement("style");
        styleSheet.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        `;
        document.head.appendChild(styleSheet);
        
        // Performance tracking functions
        function trackDecision(action, isCorrect) {
            if (!state.isTestMode || !state.performance) return;
            
            const decisions = state.performance.decisions;
            if (decisions[action]) {
                decisions[action].total++;
                if (isCorrect) {
                    decisions[action].correct++;
                }
            }
            
            updateTestProgress();
        }
        
        function trackBettingDecision(isCorrect) {
            if (!state.isTestMode || !state.performance) return;
            
            state.performance.bettingDecisions.total++;
            if (isCorrect) {
                state.performance.bettingDecisions.correct++;
            }
        }
        
        function updateTestProgress() {
            if (!state.isTestMode) return;
            
            // Update hands played
            const handsPlayedEl = document.getElementById('hands-played');
            if (handsPlayedEl && state.performance) {
                handsPlayedEl.textContent = state.performance.handsPlayed.toString();
            }
            
            // Update cards remaining
            const cardsRemainingEl = document.getElementById('test-cards-remaining');
            if (cardsRemainingEl) {
                cardsRemainingEl.textContent = state.deck.length.toString();
            }
            
            // Update current score
            const currentScoreEl = document.getElementById('current-score');
            if (currentScoreEl && state.performance) {
                const score = calculateCurrentScore();
                currentScoreEl.textContent = `${Math.round(score)}%`;
            }
            
                    // Check if shoe is complete (less than 20% of cards remaining)
        const totalCards = state.decks * 52;
        const cardsRemaining = state.deck.length;
        if (cardsRemaining < totalCards * 0.2) {
            // Shoe is nearly complete, end test
            setTimeout(() => {
                calculateAndShowResults();
            }, 1000);
        }
        }
        
        function calculateCurrentScore() {
            if (!state.performance) return 0;
            
            const decisions = state.performance.decisions;
            let totalDecisions = 0;
            let correctDecisions = 0;
            
            Object.values(decisions).forEach(decision => {
                totalDecisions += decision.total;
                correctDecisions += decision.correct;
            });
            
            if (totalDecisions === 0) return 0;
            return (correctDecisions / totalDecisions) * 100;
        }
        
        function finalizePerformanceData() {
            if (!state.isTestMode || !state.performance) return;
            
            // Calculate final metrics
            const performance = state.performance;
            const decisions = performance.decisions;
            
            // Strategy accuracy
            let totalStrategyDecisions = 0;
            let correctStrategyDecisions = 0;
            
            Object.values(decisions).forEach(decision => {
                totalStrategyDecisions += decision.total;
                correctStrategyDecisions += decision.correct;
            });
            
            const strategyAccuracy = totalStrategyDecisions > 0 ? 
                (correctStrategyDecisions / totalStrategyDecisions) * 100 : 0;
            
            // Betting accuracy (based on Hi-Lo count system recommendations)
            const bettingAccuracy = performance.bettingDecisions.total > 0 ? 
                (performance.bettingDecisions.correct / performance.bettingDecisions.total) * 100 : 0;
            
            // Overall score (weighted average: 70% strategy, 30% betting)
            const overallScore = (strategyAccuracy * 0.7) + (bettingAccuracy * 0.3);
            
            // Calculate session metrics
            const testDuration = state.testStartTime ? (Date.now() - state.testStartTime) / 1000 : 0;
            const avgDecisionTime = performance.handStartTimes.length > 0 ? 
                testDuration / totalStrategyDecisions : 0;
            
            // Store results globally for access
            window.trainerPerformance = {
                overallScore,
                strategyAccuracy,
                bettingAccuracy,
                correctHits: decisions.hits,
                correctStands: decisions.stands,
                correctDoubles: decisions.doubles,
                correctSplits: decisions.splits,
                bettingDecisions: performance.bettingDecisions,
                startingBalance: performance.startingBalance,
                finalBalance: state.balance,
                totalHands: performance.handsPlayed,
                testDuration,
                avgDecisionTime
            };
        }
        
        // Initialize the game
        function init() {
            loadSettings();
            createDeck();
            shuffleDeck();
            updateBalanceDisplay();
            updateBetDisplay();
            bindEvents();
            updateControls();
            
            // Initialize test progress if in test mode
            if (state.isTestMode) {
                updateTestProgress();
                
                            // Expose state and functions globally for test mode
            window.trainerState = state;
            window.finalizePerformanceData = finalizePerformanceData;
            }
        }
        
        // Load settings from selects
        function loadSettings() {
            state.decks = parseInt(deckSelect?.value || 6);
            state.hitSoft17 = hitSoft17Select?.value === 'yes';
            state.doubleAfterSplit = doubleAfterSplitSelect?.value === 'yes';
            state.resplitAces = resplitAcesSelect?.value === 'yes';
            state.bettingEnabled = enableBettingSelect?.value === 'yes';
            
            // Update UI based on betting being enabled/disabled
            if (betInput) {
                betInput.disabled = !state.bettingEnabled;
                if (!state.bettingEnabled) {
                    state.currentBet = 0; // Default bet
                    if (betInput) betInput.value = state.currentBet;
                    updateBetDisplay();
                }
            }
        }
        
        // Bind event listeners
        function bindEvents() {
            // Settings change events
            if (deckSelect) deckSelect.addEventListener('change', () => {
                state.decks = parseInt(deckSelect.value);
                resetGame();
            });
            
            if (hitSoft17Select) hitSoft17Select.addEventListener('change', () => {
                state.hitSoft17 = hitSoft17Select.value === 'yes';
            });
            
            if (doubleAfterSplitSelect) doubleAfterSplitSelect.addEventListener('change', () => {
                state.doubleAfterSplit = doubleAfterSplitSelect.value === 'yes';
            });
            
            if (resplitAcesSelect) resplitAcesSelect.addEventListener('change', () => {
                state.resplitAces = resplitAcesSelect.value === 'yes';
            });
            
            if (enableBettingSelect) enableBettingSelect.addEventListener('change', () => {
                state.bettingEnabled = enableBettingSelect.value === 'yes';
                if (betInput) {
                    betInput.disabled = !state.bettingEnabled;
                    if (!state.bettingEnabled) {
                        state.currentBet = 0; // Default bet
                        if (betInput) betInput.value = state.currentBet;
                        updateBetDisplay();
                    }
                }
            });
            
            // Game buttons
            if (dealButton) dealButton.addEventListener('click', startNewHand);
            if (hitButton) hitButton.addEventListener('click', playerHit);
            if (standButton) standButton.addEventListener('click', playerStand);
            if (doubleButton) doubleButton.addEventListener('click', playerDouble);
            if (splitButton) splitButton.addEventListener('click', playerSplit);
            
            // Chip betting functionality
            const chips = document.querySelectorAll('.chip');
            const clearBetBtn = document.getElementById('clear-bet-btn');
            const confirmBetBtn = document.getElementById('confirm-bet-btn');
            
            if (chips) {
                chips.forEach(chip => {
                    chip.addEventListener('click', () => {
                        if (!state.bettingEnabled || state.gamePhase !== 'betting' && state.gamePhase !== 'gameOver') {
                            return;
                        }
                        
                        const chipValue = parseInt(chip.getAttribute('data-value'));
                        
                        // Only add chip if player has enough balance
                        if (state.balance >= chipValue) {
                            addChipToBet(chipValue, chip.classList.contains('white') ? 'white' : 
                                                  chip.classList.contains('red') ? 'red' : 
                                                  chip.classList.contains('blue') ? 'blue' : 
                                                  chip.classList.contains('green') ? 'green' : 'black');
                        } else {
                            // Shake the chip to indicate not enough balance
                            chip.classList.add('shake');
                            setTimeout(() => {
                                chip.classList.remove('shake');
                            }, 500);
                        }
                    });
                });
            }
            
            if (clearBetBtn) {
                clearBetBtn.addEventListener('click', () => {
                    clearBet();
                });
            }
            
            if (confirmBetBtn) {
                confirmBetBtn.addEventListener('click', () => {
                    if (state.gamePhase === 'betting' || state.gamePhase === 'gameOver') {
                        state.currentBet = parseInt(betInput.value);
                        startNewHand();
                    }
                });
            }
        }
        
        // Create and shuffle the deck
        function createDeck() {
            state.deck = [];
            const suits = ['♠', '♥', '♦', '♣'];
            const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            
            // Reset card counts
            state.cardCounts = {};
            for (let value of values) {
                // Each deck has 4 cards of each rank (one for each suit)
                state.cardCounts[value] = 4 * state.decks;
            }
            
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
            // Reset counting when deck is shuffled
            state.runningCount = 0;
            state.cardsDealt = 0;
            state.cardHistory = [];
            
            // Reset card counts for all ranks
            const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            for (let value of values) {
                state.cardCounts[value] = 4 * state.decks;
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
        
        // Deal a card
        function dealCard(isHidden = false, isDealer = false) {
            if (state.deck.length === 0) {
                createDeck();
                shuffleDeck();
            }
            
            const card = state.deck.pop();
            card.isHidden = isHidden;
            
            if (!isHidden) {
                // Update count
                const countValue = cardValues[card.value];
                state.runningCount += countValue;
                state.cardsDealt++;
                
                // Update card counts for the shoe
                if (state.cardCounts[card.value] > 0) {
                    state.cardCounts[card.value]--;
                }
                
                // Add to history with information about who received the card
                state.cardHistory.unshift({
                    card: `${card.value}${card.suit}`,
                    value: countValue,
                    timestamp: new Date().toLocaleTimeString(),
                    player: isDealer ? 'Dealer' : 'Player'
                });
            }
            
            return card;
        }
        
        // Start a new hand
        function startNewHand() {
            // Track hand start time for performance analysis
            if (state.isTestMode && state.performance) {
                state.performance.handStartTimes.push(Date.now());
            }

            // Track betting decision if betting is enabled and we're in test mode
            if (state.isTestMode && state.bettingEnabled && state.performance) {
                const { recommendedBet } = calculateRecommendedBet();
                const actualBet = state.currentBet;
                // Require exact match with recommended bet amount
                const isCorrectBet = actualBet === recommendedBet;
                trackBettingDecision(isCorrectBet);
            }
            
            // Check if betting is enabled and valid bet is placed
            if (state.bettingEnabled) {
                if (state.currentBet <= 0 || state.currentBet > state.balance) {
                    displayErrorMessage('Please enter a valid bet amount');
                    return;
                }
                state.balance -= state.currentBet;
            }
            
            // Reset hands
            state.playerHands = [[]];
            state.dealerHand = [];
            state.currentHandIndex = 0;
            state.doubledHands = new Set();
            state.splitHands = [];
            
            // Set a special flag for sequential animation dealing
            state.sequentialDealing = true;
            state.dealingStage = 0; // Track which card is being dealt
            
            // Update game phase
            state.gamePhase = 'dealing'; // New phase for dealing animation
            
            // Start the sequential dealing animation
            dealNextCard();
            
            // Update controls early to disable buttons during dealing
            updateControls();
            updateBalanceDisplay();
        }
        
        // Helper function to deal cards sequentially with animation
        function dealNextCard() {
            const dealingDelay = 700; // Delay between dealing cards (milliseconds)
            
            switch (state.dealingStage) {
                case 0: // Player's first card
                    state.playerHands[0].push(dealCard(false, false));
                    state.dealingStage++;
                    updateGameDisplay();
                    setTimeout(dealNextCard, dealingDelay);
                    break;
                
                case 1: // Dealer's first card (face up)
                    state.dealerHand.push(dealCard(false, true));
                    state.dealingStage++;
                    updateGameDisplay();
                    setTimeout(dealNextCard, dealingDelay);
                    break;
                
                case 2: // Player's second card
                    state.playerHands[0].push(dealCard(false, false));
                    state.dealingStage++;
                    updateGameDisplay();
                    setTimeout(dealNextCard, dealingDelay);
                    break;
                
                case 3: // Dealer's second card (face down)
                    state.dealerHand.push(dealCard(true, true));
                    state.dealingStage++;
                    updateGameDisplay();
                    setTimeout(dealNextCard, dealingDelay);
                    break;
                
                case 4: // Dealing complete, check for blackjack and transition to player turn
                    state.sequentialDealing = false;
                    state.gamePhase = 'playerTurn';
                    
                    // Check for natural blackjacks
                    if (getHandValue(state.playerHands[0]) === 21) {
                        // Always reveal dealer's hole card when player has blackjack
                        revealDealerCards();
                        updateGameDisplay();
                        
                        if (getCardValue(state.dealerHand[0]) === 10 || getCardValue(state.dealerHand[0]) === 11) {
                            // Possible dealer blackjack, need to check
                            if (getHandValue(state.dealerHand) === 21) {
                                // Push (tie)
                                state.balance += state.currentBet;
                                state.gamePhase = 'gameOver';
                                setTimeout(() => {
                                    displayOutcomeMessage('Push! Both have Blackjack.', 'push');
                                }, 500);
                            } else {
                                // Player wins with Blackjack
                                state.balance += state.currentBet * 2.5;
                                state.gamePhase = 'gameOver';
                                setTimeout(() => {
                                    displayOutcomeMessage('Blackjack! You win!', 'blackjack');
                                }, 500);
                            }
                        } else {
                            // Player wins with Blackjack
                            state.balance += state.currentBet * 2.5;
                            state.gamePhase = 'gameOver';
                            setTimeout(() => {
                                displayOutcomeMessage('Blackjack! You win!', 'blackjack');
                            }, 500);
                        }
                    }
                    
                    updateControls();
                    break;
            }
        }
        
        // Player hits (takes a card)
        function playerHit() {
            if (state.gamePhase !== 'playerTurn') return;
            
            // Track decision for performance analysis
            if (state.isTestMode) {
                const correctAction = getBasicStrategyAdvice();
                const isCorrect = correctAction.toLowerCase().includes('hit');
                
                // Show immediate feedback
                showDecisionFeedback('hit', isCorrect, correctAction);
                
                trackDecision('hits', isCorrect);
            }
            
            const currentHand = state.playerHands[state.currentHandIndex];
            currentHand.push(dealCard(false, false)); // Player card
            
            const handValue = getHandValue(currentHand);
            
            // Check if player busts
            if (handValue > 21) {
                if (state.currentHandIndex < state.playerHands.length - 1) {
                    // Move to next hand if split
                    state.currentHandIndex++;
                } else {
                    // Player turn ends
                    // Reveal dealer's hole card immediately when player busts
                    revealDealerCards();
                    updateGameDisplay();
                    
                    state.gamePhase = 'evaluating';
                    setTimeout(dealerTurn, 500);
                }
            }
            
            updateGameDisplay();
            updateControls();

        }
        
        // Player stands (ends turn)
        function playerStand() {
            if (state.gamePhase !== 'playerTurn') return;
            
            // Track decision for performance analysis
            if (state.isTestMode) {
                const correctAction = getBasicStrategyAdvice();
                const isCorrect = correctAction.toLowerCase().includes('stand');
                
                // Show immediate feedback
                showDecisionFeedback('stand', isCorrect, correctAction);
                
                trackDecision('stands', isCorrect);
            }
            
            if (state.currentHandIndex < state.playerHands.length - 1) {
                // Move to next hand if split
                state.currentHandIndex++;
            } else {
                // Player turn ends
                state.gamePhase = 'dealerTurn';
                setTimeout(dealerTurn, 500);
            }
            
            updateGameDisplay();
            updateControls();
        }
        
        // Player doubles down
        function playerDouble() {
            if (state.gamePhase !== 'playerTurn') return;
            
            // Can't double if insufficient funds
            if (state.bettingEnabled && state.balance < state.currentBet) {
                displayErrorMessage('Insufficient funds to double');
                return;
            }
            
            // Check if hand is eligible for doubling
            const currentHand = state.playerHands[state.currentHandIndex];
            if (currentHand.length > 2 && !state.doubleAfterSplit) {
                displayErrorMessage('Cannot double after hitting');
                return;
            }
            
            // Track decision for performance analysis
            if (state.isTestMode) {
                const correctAction = getBasicStrategyAdvice();
                const isCorrect = correctAction.toLowerCase().includes('double');
                
                // Show immediate feedback
                showDecisionFeedback('double', isCorrect, correctAction);
                
                trackDecision('doubles', isCorrect);
            }
            
            // Double the bet
            if (state.bettingEnabled) {
                state.balance -= state.currentBet;
                state.currentBet *= 2;
            }
            
            // Mark this hand as doubled
            state.doubledHands.add(state.currentHandIndex);
            
            // Deal one card and end turn for this hand
            currentHand.push(dealCard(false, false)); // Player card
            
            if (state.currentHandIndex < state.playerHands.length - 1) {
                // Move to next hand if split
                state.currentHandIndex++;
            } else {
                // Player turn ends
                state.gamePhase = 'dealerTurn';
                setTimeout(dealerTurn, 500);
            }
            
            updateGameDisplay();
            updateControls();
            updateBalanceDisplay();

        }
        
        // Player splits hand
        function playerSplit() {
            if (state.gamePhase !== 'playerTurn') return;
            
            const currentHand = state.playerHands[state.currentHandIndex];
            
            // Check if hand is eligible for splitting
            if (currentHand.length !== 2 || getCardValue(currentHand[0]) !== getCardValue(currentHand[1])) {
                displayErrorMessage('Can only split a pair');
                return;
            }
            
            // Can't split if insufficient funds
            if (state.bettingEnabled && state.balance < state.currentBet) {
                displayErrorMessage('Insufficient funds to split');
                return;
            }
            
            // Track decision for performance analysis
            if (state.isTestMode) {
                const correctAction = getBasicStrategyAdvice();
                const isCorrect = correctAction.toLowerCase().includes('split');
                
                // Show immediate feedback
                showDecisionFeedback('split', isCorrect, correctAction);
                
                trackDecision('splits', isCorrect);
            }
            
            // Special handling for Aces
            const isAces = currentHand[0].value === 'A';
            
            // Set a flag to indicate we're processing a split
            state.isSplitting = true;
            
            // Create new hand
            const newHand = [currentHand.pop()];
            
            // Update display to show the cards being split
            updateGameDisplay();
            
            // Deal a new card to each hand with delays for better visualization
            setTimeout(() => {
                // Deal to first hand
                currentHand.push(dealCard(false, false));
                updateGameDisplay();
                
                // Deal to second hand after a delay
                setTimeout(() => {
                    newHand.push(dealCard(false, false));
                    
                    // Add the new hand to player hands
                    state.playerHands.splice(state.currentHandIndex + 1, 0, newHand);
                    
                    // Adjust bet
                    if (state.bettingEnabled) {
                        state.balance -= state.currentBet;
                    }
                    
                    // Track this split for special handling
                    state.splitHands.push({
                        index: state.currentHandIndex,
                        isAces: isAces
                    });
                    
                    // Special rules for Aces
                    if (isAces && !state.resplitAces) {
                        // Only one card each and auto-stand
                        if (state.currentHandIndex < state.playerHands.length - 1) {
                            state.currentHandIndex++;
                        } else {
                            state.gamePhase = 'dealerTurn';
                            setTimeout(dealerTurn, 500);
                        }
                    }
                    
                    state.isSplitting = false;
                    updateGameDisplay();
                    updateControls();
                    updateBalanceDisplay();

                    
                }, 500); // Delay for second hand card
            }, 500); // Delay for first hand card
        }
        
        // Dealer's turn
        function dealerTurn() {
            if (state.gamePhase !== 'dealerTurn' && state.gamePhase !== 'evaluating') return;
            
            // Only reveal dealer's hole card if not already revealed
            if (state.dealerHand.some(card => card.isHidden)) {
                revealDealerCards();
                // Add a short delay after revealing the hole card before dealing more cards
                setTimeout(() => {
                    continueDealing();
                }, 800);
            } else {
                continueDealing();
            }
            
            function continueDealing() {
                // Check if all player hands busted
                let allBusted = true;
                for (let hand of state.playerHands) {
                    if (getHandValue(hand) <= 21) {
                        allBusted = false;
                        break;
                    }
                }
                
                if (!allBusted) {
                    // Dealer draws until 17 or higher
                    dealNextCard();
                } else {
                    // Skip drawing cards if all players busted
                    state.gamePhase = 'evaluating';
                    setTimeout(evaluateHands, 500);
                }
            }
            
            // Recursive function to deal cards one at a time with animation delays
            function dealNextCard() {
                if (shouldDealerHit()) {
                    // Add a new card to dealer's hand
                    const newCard = dealCard(false, true); // Dealer card
                    state.dealerHand.push(newCard);
                    
                    // Update game display
                    updateGameDisplay();
                    
                    // Update the help panel to show the new card in history

                    
                    // Log the dealer hit for debugging
                    console.log(`Dealer hit: ${newCard.value}${newCard.suit}, current total: ${getHandValue(state.dealerHand)}`);
                    
                    // Wait for animation to complete before dealing next card
                    setTimeout(() => {
                        dealNextCard();
                    }, 700);
                } else {
                    // Dealer is done drawing cards
                    state.gamePhase = 'evaluating';
                    setTimeout(evaluateHands, 500);
                }
            }
        }
        
        // Determine if dealer should hit based on rules
        function shouldDealerHit() {
            const dealerValue = getHandValue(state.dealerHand);
            
            // Dealer always stands on hard 17 or higher
            if (dealerValue >= 18) return false;
            
            // Dealer always hits on 16 or lower
            if (dealerValue <= 16) return true;
            
            // For soft 17, depends on rule setting
            if (dealerValue === 17) {
                if (state.hitSoft17 && isSoftHand(state.dealerHand)) {
                    return true;
                }
                return false;
            }
            
            return false;
        }
        
        // Reveal dealer's face down cards
        function revealDealerCards() {
            const dealerCardArea = document.getElementById('dealer-cards');
            
            state.dealerHand.forEach((card, index) => {
                if (card.isHidden) {
                    card.isHidden = false;
                    
                    // Update count for revealed card
                    const countValue = cardValues[card.value];
                    state.runningCount += countValue;
                    state.cardsDealt++;
                    
                    // Update card counts for the shoe
                    if (state.cardCounts[card.value] > 0) {
                        state.cardCounts[card.value]--;
                    }
                    
                    // Add to history
                    state.cardHistory.unshift({
                        card: `${card.value}${card.suit}`,
                        value: countValue,
                        timestamp: new Date().toLocaleTimeString(),
                        player: 'Dealer'
                    });
                    
                    // The card flip animation is now handled in renderCards
                    // We no longer add the card-flip class here to avoid redundancy
                }
            });
            
            // Update the display to show the flipped card
            updateGameDisplay();

        }
        
        // Evaluate all hands and determine winners
        function evaluateHands() {
            if (state.gamePhase !== 'evaluating') return;
            
            const dealerValue = getHandValue(state.dealerHand);
            const dealerBusted = dealerValue > 21;
            
            // Track results for message display
            let results = {
                wins: 0,
                losses: 0,
                pushes: 0,
                blackjacks: 0,
                handResults: [] // Track result for each hand
            };
            
            // Store original balance and total winnings for animation
            const originalBalance = state.balance;
            let totalWinnings = 0;
            
            for (let i = 0; i < state.playerHands.length; i++) {
                const playerHand = state.playerHands[i];
                const playerValue = getHandValue(playerHand);
                const isDoubled = state.doubledHands.has(i);
                const isBlackjack = playerValue === 21 && playerHand.length === 2;
                
                // Calculate win amount based on the outcome
                let winAmount = 0;
                let handResult = '';
                
                // Player busted
                if (playerValue > 21) {
                    // Player loses
                    handResult = 'bust';
                    results.losses++;
                } 
                // Dealer busted
                else if (dealerBusted) {
                    // Player wins
                    if (isDoubled) {
                        winAmount = state.currentBet * 2;
                    } else {
                        winAmount = state.currentBet * 2;
                    }
                    totalWinnings += winAmount;
                    handResult = 'win';
                    results.wins++;
                } 
                // Compare values
                else if (playerValue > dealerValue) {
                    // Player wins
                    if (isDoubled) {
                        winAmount = state.currentBet * 2;
                        handResult = 'win';
                    } else if (isBlackjack) {
                        winAmount = state.currentBet * 2.5;
                        handResult = 'blackjack';
                        results.blackjacks++;
                    } else {
                        winAmount = state.currentBet * 2;
                        handResult = 'win';
                    }
                    totalWinnings += winAmount;
                    if (!isBlackjack) results.wins++;
                } 
                else if (playerValue === dealerValue) {
                    // Push (tie)
                    if (isDoubled) {
                        winAmount = state.currentBet;
                    } else {
                        winAmount = state.currentBet;
                    }
                    totalWinnings += winAmount;
                    handResult = 'push';
                    results.pushes++;
                } else {
                    // Dealer wins
                    handResult = 'lose';
                    results.losses++;
                }
                
                // Update the actual balance state
                state.balance += winAmount;
                
                // Store the result for this hand
                results.handResults.push({
                    index: i,
                    result: handResult,
                    win: winAmount
                });
            }
            
            // Change game phase
            state.gamePhase = 'gameOver';
            
            // Track hand completion for test mode
            if (state.isTestMode && state.performance) {
                state.performance.handsPlayed++;
                
                // Track true count for this hand
                const trueCount = parseFloat(calculateTrueCount());
                state.performance.trueCountHistory.push(trueCount);
            }
            
            // Perform the winning animation if there are winnings
            if (totalWinnings > 0) {
                animateWinningChips(totalWinnings, originalBalance);
            } else {
                // No winnings, just update the display normally
                updateBalanceDisplay();
            }
            
            updateGameDisplay();
            updateControls();
            
            // Show outcome messages for each hand
            // Start by clearing any existing messages
            const existingMessages = document.querySelectorAll('.outcome-message');
            existingMessages.forEach(msg => msg.remove());
            
            // For single hand, display as normal
            if (state.playerHands.length === 1) {
                const handResult = results.handResults[0];
                if (handResult) {
                    if (handResult.result === 'blackjack') {
                        displayOutcomeMessage('Blackjack!', 'blackjack');
                    } else if (handResult.result === 'bust') {
                        displayOutcomeMessage('Bust!', 'bust');
                    } else if (handResult.result === 'win') {
                        displayOutcomeMessage('You Win!', 'win');
                    } else if (handResult.result === 'push') {
                        displayOutcomeMessage('Push', 'push');
                    } else {
                        displayOutcomeMessage('Dealer Wins', 'lose');
                    }
                }
            } 
            // For split hands, display multiple messages
            else if (state.playerHands.length > 1) {
                // Display overall result summary
                let summaryText = '';
                if (results.wins > 0 || results.blackjacks > 0) {
                    let winCount = results.wins + results.blackjacks;
                    let totalHands = state.playerHands.length;
                    summaryText = `${winCount}/${totalHands} Hands Won`;
                    displayOutcomeMessage(summaryText, 'win');
                } else if (results.pushes > 0) {
                    displayOutcomeMessage('All Hands Push', 'push');
                } else {
                    displayOutcomeMessage('All Hands Lost', 'lose');
                }
                
                // Then display individual results for each hand with a positioned indicator
                results.handResults.forEach((handResult, index) => {
                    setTimeout(() => {
                        displayHandOutcomeIndicator(handResult.result, index);
                    }, 300 * (index + 1)); // Stagger the displays
                });
            }
        }
        
        // Function to display a hand-specific outcome indicator
        function displayHandOutcomeIndicator(result, handIndex) {
            // Find the corresponding hand element
            const handElements = document.querySelectorAll('.player-cards .hand');
            if (!handElements || handElements.length <= handIndex) return;
            
            const handEl = handElements[handIndex];
            
            // Create a smaller indicator that will appear above the hand
            const indicator = document.createElement('div');
            indicator.className = `hand-indicator ${result}`;
            
            // Set content based on result
            switch(result) {
                case 'blackjack':
                    indicator.textContent = 'Blackjack!';
                    break;
                case 'win':
                    indicator.textContent = 'Win!';
                    break;
                case 'push':
                    indicator.textContent = 'Push';
                    break;
                case 'bust':
                    indicator.textContent = 'Bust';
                    break;
                case 'lose':
                    indicator.textContent = 'Lose';
                    break;
            }
            
            // Position the indicator
            handEl.appendChild(indicator);
            
            // Show the indicator
            setTimeout(() => {
                indicator.classList.add('show');
            }, 100);
            
            // Keep indicators visible longer for split hands
            // They will be removed when a new hand is dealt
        }
        
        // Function to animate winning chips and update balance
        function animateWinningChips(winAmount, startBalance) {
            // Get the table and balance display elements
            const table = document.querySelector('.blackjack-table');
            const balanceDisplayElement = document.getElementById('balance');
            
            if (!table || !balanceDisplayElement) return;
            
            // Create a container for the flying chips
            const chipsContainer = document.createElement('div');
            chipsContainer.className = 'flying-chips-container';
            table.appendChild(chipsContainer);
            
            // Determine how many chips to animate based on win amount
            const chipTypes = [
                { value: 100, class: 'black' },
                { value: 25, class: 'green' },
                { value: 10, class: 'blue' },
                { value: 5, class: 'red' },
                { value: 1, class: 'white' }
            ];
            
            // Calculate chips to display (max 10 for performance)
            const chipsToShow = [];
            let remainingAmount = winAmount;
            
            // First pass: try to represent the exact amount with minimal chips
            for (const chipType of chipTypes) {
                while (remainingAmount >= chipType.value) {
                    chipsToShow.push(chipType);
                    remainingAmount -= chipType.value;
                    
                    // Limit to max 10 chips for performance
                    if (chipsToShow.length >= 10) break;
                }
                
                if (chipsToShow.length >= 10) break;
            }
            
            // If we couldn't fit all chips, simplify and just show representation
            if (remainingAmount > 0 && chipsToShow.length < 10) {
                // Add a chip for the remainder
                const smallestChipType = chipTypes.find(chip => chip.value <= remainingAmount);
                if (smallestChipType) {
                    chipsToShow.push(smallestChipType);
                }
            }
            
            // Create and animate each chip
            chipsToShow.forEach((chipType, index) => {
                const chip = document.createElement('div');
                chip.className = `flying-chip ${chipType.class}`;
                chip.textContent = chipType.value;
                chipsContainer.appendChild(chip);
                
                // Get dealer position as starting point
                const dealerArea = document.querySelector('.dealer-area');
                const balanceElement = document.querySelector('.balance-display');
                
                if (dealerArea && balanceElement) {
                    const dealerRect = dealerArea.getBoundingClientRect();
                    const balanceRect = balanceElement.getBoundingClientRect();
                    const tableRect = table.getBoundingClientRect();
                    
                    // Position the chip initially at a random position near the dealer cards
                    const startX = dealerRect.left - tableRect.left + (Math.random() * 100 - 50);
                    const startY = dealerRect.top - tableRect.top + (Math.random() * 30);
                    
                    // Calculate the target position (user's balance)
                    const targetX = balanceRect.left - tableRect.left + (balanceRect.width / 2);
                    const targetY = balanceRect.top - tableRect.top + (balanceRect.height / 2);
                    
                    // Apply initial position
                    chip.style.left = `${startX}px`;
                    chip.style.top = `${startY}px`;
                    
                    // Trigger animation with a slight delay based on index
                    setTimeout(() => {
                        chip.style.left = `${targetX}px`;
                        chip.style.top = `${targetY}px`;
                        chip.classList.add('flying');
                        
                        // After animation completes, remove the chip
                        setTimeout(() => {
                            chip.classList.add('absorbed');
                            setTimeout(() => {
                                if (chip.parentNode) {
                                    chip.parentNode.removeChild(chip);
                                }
                                
                                // When last chip is removed, remove the container
                                if (index === chipsToShow.length - 1) {
                                    if (chipsContainer.parentNode) {
                                        chipsContainer.parentNode.removeChild(chipsContainer);
                                    }
                                }
                            }, 300);
                        }, 700);
                    }, index * 100);
                }
            });
            
            // Animate the balance counting up
            const endBalance = startBalance + winAmount;
            animateBalanceCount(startBalance, endBalance);
        }
        
        // Function to display error message with animation
        function displayErrorMessage(message) {
            // Create message element
            const messageEl = document.createElement('div');
            messageEl.className = 'error-message';
            messageEl.textContent = message;
            
            // Find the blackjack table and append message
            const table = document.querySelector('.blackjack-table');
            if (table) {
                table.appendChild(messageEl);
                
                // Animate in
                setTimeout(() => {
                    messageEl.classList.add('show');
                }, 100);
                
                // Remove after delay
                setTimeout(() => {
                    messageEl.classList.remove('show');
                    setTimeout(() => {
                        messageEl.remove();
                    }, 500);
                }, 2500);
            }
        }
        
        // Show immediate feedback for decisions
        function showDecisionFeedback(playerAction, isCorrect, correctAction) {
            const gameArea = document.querySelector('.blackjack-table') || document.querySelector('#test-run-game');
            if (!gameArea) return;
            
            // Create feedback element
            const feedback = document.createElement('div');
            feedback.className = `decision-feedback ${isCorrect ? 'correct' : 'incorrect'}`;
            
            // Get current hand information for explanation
            const currentHand = state.playerHands[state.currentHandIndex];
            const playerValue = getHandValue(currentHand);
            const dealerUpcard = state.dealerHand[0]?.value;
            const dealerValue = getCardValue(state.dealerHand[0]);
            const isSoft = isSoftHand(currentHand);
            const isPair = currentHand.length === 2 && currentHand[0].value === currentHand[1].value;
            
            // Generate explanation
            let explanation = '';
            if (isCorrect) {
                explanation = `<strong>✓ Correct!</strong><br>`;
                explanation += `${playerAction.toUpperCase()} was the right choice.`;
            } else {
                explanation = `<strong>✗ Incorrect</strong><br>`;
                explanation += `You chose ${playerAction.toUpperCase()}, but ${correctAction} was better.`;
            }
            
            // Add strategy explanation
            explanation += '<br><br>';
            if (isPair) {
                explanation += getPairExplanation(currentHand[0].value, dealerValue);
            } else if (isSoft) {
                explanation += getSoftHandExplanation(playerValue, dealerValue);
            } else {
                explanation += getHardHandExplanation(playerValue, dealerValue);
            }
            
            feedback.innerHTML = `
                <div class="feedback-content">
                    <div class="feedback-header">
                        ${explanation}
                    </div>
                </div>
            `;
            
            gameArea.appendChild(feedback);
            
            // Show with animation
            setTimeout(() => feedback.classList.add('show'), 50);
            
            // Remove after delay
            setTimeout(() => {
                feedback.classList.remove('show');
                setTimeout(() => {
                    if (feedback.parentNode) {
                        feedback.parentNode.removeChild(feedback);
                    }
                }, 300);
            }, 3000); // Slightly longer for performance test
        }
        
        // Get explanation for pair decisions
        function getPairExplanation(cardValue, dealerValue) {
            switch(cardValue) {
                case 'A':
                    return `<strong>Always split Aces!</strong> Two 11s = 22 (bust), but split gives two chances at blackjack.`;
                case '8':
                    return `<strong>Always split 8s!</strong> 16 is the worst hand, splitting gives much better chances.`;
                case 'K': case 'Q': case 'J': case '10':
                    return `<strong>Never split 10s!</strong> 20 is excellent - splitting would waste a winning hand.`;
                case '9':
                    if ([7, 10, 11].includes(dealerValue)) {
                        return `<strong>Stand with 18 vs ${dealerValue}:</strong> 18 is strong against dealer's upcard.`;
                    }
                    return `<strong>Split vs weak dealer (${dealerValue}):</strong> Get more money on table when dealer is vulnerable.`;
                case '7':
                    if (dealerValue <= 7) {
                        return `<strong>Split vs ${dealerValue}:</strong> Two 7s can make 17+ against weak dealer.`;
                    }
                    return `<strong>Hit vs ${dealerValue}:</strong> Don't split weak hands against strong dealer.`;
                case '6':
                    if (dealerValue <= 6) {
                        return `<strong>Split vs ${dealerValue}:</strong> Dealer has bust card, take advantage.`;
                    }
                    return `<strong>Hit vs ${dealerValue}:</strong> 12 vs strong dealer needs improvement.`;
                case '5':
                    return `<strong>Double (don't split):</strong> 10 is great for doubling, 5s make terrible starts.`;
                case '4':
                    if (dealerValue === 5 || dealerValue === 6) {
                        return `<strong>Split vs ${dealerValue}:</strong> Dealer very weak, worth the risk.`;
                    }
                    return `<strong>Hit:</strong> 8 vs strong dealer, don't create two weak hands.`;
                case '3': case '2':
                    if (dealerValue <= 7) {
                        return `<strong>Split vs ${dealerValue}:</strong> Small pairs need dealer weakness to split.`;
                    }
                    return `<strong>Hit:</strong> Small pair vs strong dealer - keep as one hand.`;
                default:
                    return `Standard pair strategy applies.`;
            }
        }
        
        // Get explanation for soft hand decisions  
        function getSoftHandExplanation(playerValue, dealerValue) {
            switch(playerValue) {
                case 20: // A,9
                    return `<strong>A,9 = 20:</strong> Excellent hand, always stand.`;
                case 19: // A,8
                    if (dealerValue === 6) {
                        return `<strong>A,8 vs 6:</strong> Double to maximize profit against dealer's weak card.`;
                    }
                    return `<strong>A,8 = 19:</strong> Strong hand, stand against most dealer cards.`;
                case 18: // A,7
                    if (dealerValue <= 6) {
                        return `<strong>A,7 vs ${dealerValue}:</strong> Double against weak dealer - improve or stay strong.`;
                    } else if (dealerValue <= 8) {
                        return `<strong>A,7 vs ${dealerValue}:</strong> 18 is competitive, stand.`;
                    } else {
                        return `<strong>A,7 vs ${dealerValue}:</strong> 18 vs strong dealer needs improvement, hit.`;
                    }
                case 17: // A,6
                    if (dealerValue <= 6) {
                        return `<strong>A,6 vs ${dealerValue}:</strong> Double against weak dealer for improvement.`;
                    }
                    return `<strong>A,6 = 17:</strong> Weak soft hand needs improvement, hit.`;
                case 16: case 15: // A,5 / A,4
                    if (dealerValue >= 4 && dealerValue <= 6) {
                        return `<strong>A,${playerValue-11} vs ${dealerValue}:</strong> Double against dealer's bust cards.`;
                    }
                    return `<strong>A,${playerValue-11}:</strong> Weak soft hand, hit to improve.`;
                case 14: case 13: // A,3 / A,2
                    if (dealerValue === 5 || dealerValue === 6) {
                        return `<strong>A,${playerValue-11} vs ${dealerValue}:</strong> Double against dealer's weakest cards.`;
                    }
                    return `<strong>A,${playerValue-11}:</strong> Very weak soft hand, hit to improve.`;
                default:
                    return `<strong>Soft hand:</strong> Ace flexibility allows aggressive play.`;
            }
        }
        
        // Get explanation for hard hand decisions
        function getHardHandExplanation(playerValue, dealerValue) {
            if (playerValue >= 17) {
                return `<strong>${playerValue}:</strong> Always stand - risk of busting is too high.`;
            } else if (playerValue >= 13 && playerValue <= 16) {
                if (dealerValue <= 6) {
                    return `<strong>${playerValue} vs ${dealerValue}:</strong> Stand and let dealer bust (~40% chance).`;
                } else {
                    return `<strong>${playerValue} vs ${dealerValue}:</strong> Hit - dealer likely makes 17+ (74% chance).`;
                }
            } else if (playerValue === 12) {
                if (dealerValue >= 4 && dealerValue <= 6) {
                    return `<strong>12 vs ${dealerValue}:</strong> Stand, dealer has bust card.`;
                } else {
                    return `<strong>12 vs ${dealerValue}:</strong> Hit, need improvement against strong dealer.`;
                }
            } else if (playerValue === 11) {
                return `<strong>11:</strong> Double if allowed - excellent chance for 21.`;
            } else if (playerValue === 10) {
                if (dealerValue <= 9) {
                    return `<strong>10:</strong> Double if allowed - great chance for 20.`;
                }
                return `<strong>10 vs ${dealerValue}:</strong> Hit, doubling too risky against strong dealer.`;
            } else if (playerValue === 9) {
                if (dealerValue >= 3 && dealerValue <= 6) {
                    return `<strong>9 vs ${dealerValue}:</strong> Double against weak dealer.`;
                }
                return `<strong>9:</strong> Hit to improve total.`;
            } else {
                return `<strong>${playerValue}:</strong> Always hit low totals to improve.`;
            }
        }
        
        // Adjust advice based on the true count
        function adjustAdviceBasedOnCount(advice, playerValue, dealerValue, currentHand) {
            // Calculate the true count
            const trueCount = parseFloat(calculateTrueCount());
            
            // Check if this is a soft hand
            const isSoft = isSoftHand(currentHand);
            
            // Check if this is a pair
            const isPair = currentHand.length === 2 && currentHand[0].value === currentHand[1].value;
            
            // If we've already hit beyond the initial 2 cards, apply more conservative adjustments
            if (currentHand.length > 2) {
                // Limited set of deviations after hitting
                // 16 vs 10
                if (playerValue === 16 && dealerValue === 10 && !isSoft) {
                    if (trueCount >= 0) {
                        return 'Stand (due to count)';
                    }
                }
                
                // 15 vs 10
                if (playerValue === 15 && dealerValue === 10 && !isSoft) {
                    if (trueCount >= 4) {
                        return 'Stand (due to count)';
                    }
                }
                
                return advice;
            }
            
            // ====== INSURANCE ======
            // Insurance is always relevant regardless of how many cards the player has
            if (dealerValue === 11 && trueCount >= 3) {
                return 'Take Insurance, ' + advice;
            }
            
            // ====== ILLUSTRIOUS 18 AND OTHER IMPORTANT DEVIATIONS ======
            
            // 1. 16 vs 10
            if (playerValue === 16 && dealerValue === 10 && !isSoft) {
                if (trueCount >= 0) {
                    return 'Stand (due to count)';
                }
            }
            
            // 2. 15 vs 10
            if (playerValue === 15 && dealerValue === 10 && !isSoft) {
                if (trueCount >= 4) {
                    return 'Stand (due to count)';
                }
            }
            
            // 3. 10 vs Ace
            if (playerValue === 10 && dealerValue === 11 && !isSoft) {
                if (trueCount >= 4) {
                    return 'Double if allowed (due to count), otherwise Hit';
                }
            }
            
            // 4. 12 vs 3
            if (playerValue === 12 && dealerValue === 3 && !isSoft) {
                if (trueCount >= 2) {
                    return 'Stand (due to count)';
                }
            }
            
            // 5. 12 vs 2
            if (playerValue === 12 && dealerValue === 2 && !isSoft) {
                if (trueCount >= 3) {
                    return 'Stand (due to count)';
                }
            }
            
            // 6. 11 vs Ace
            if (playerValue === 11 && dealerValue === 11 && !isSoft) {
                if (trueCount >= 1) {
                    return 'Double if allowed (due to count), otherwise Hit';
                }
            }
            
            // 7. 9 vs 2
            if (playerValue === 9 && dealerValue === 2 && !isSoft) {
                if (trueCount >= 1) {
                    return 'Double if allowed (due to count), otherwise Hit';
                }
            }
            
            // 8. 10 vs 10
            if (playerValue === 10 && dealerValue === 10 && !isSoft) {
                if (trueCount >= 4) {
                    return 'Double if allowed (due to count), otherwise Hit';
                }
            }
            
            // 9. 9 vs 7
            if (playerValue === 9 && dealerValue === 7 && !isSoft) {
                if (trueCount >= 3) {
                    return 'Double if allowed (due to count), otherwise Hit';
                }
            }
            
            // 10. 16 vs 9
            if (playerValue === 16 && dealerValue === 9 && !isSoft) {
                if (trueCount >= 5) {
                    return 'Stand (due to count)';
                }
            }
            
            // 11. 13 vs 2
            if (playerValue === 13 && dealerValue === 2 && !isSoft) {
                if (trueCount <= -1) {
                    return 'Hit (due to count)';
                }
            }
            
            // 12. 12 vs 4
            if (playerValue === 12 && dealerValue === 4 && !isSoft) {
                if (trueCount < 0) {
                    return 'Hit (due to count)';
                }
            }
            
            // 13. 12 vs 5
            if (playerValue === 12 && dealerValue === 5 && !isSoft) {
                if (trueCount <= -1) {
                    return 'Hit (due to count)';
                }
            }
            
            // 14. 12 vs 6
            if (playerValue === 12 && dealerValue === 6 && !isSoft) {
                if (trueCount <= -1) {
                    return 'Hit (due to count)';
                }
            }
            
            // 15. 13 vs 3
            if (playerValue === 13 && dealerValue === 3 && !isSoft) {
                if (trueCount <= -1) {
                    return 'Hit (due to count)';
                }
            }
            
            // 16. 14 vs 10
            if (playerValue === 14 && dealerValue === 10 && !isSoft) {
                if (trueCount >= 8) {
                    return 'Stand (due to count)';
                }
            }
            
            // 17. 15 vs 9
            if (playerValue === 15 && dealerValue === 9 && !isSoft) {
                if (trueCount >= 8) {
                    return 'Stand (due to count)';
                }
            }
            
            // 18. A,8 vs 6
            if (playerValue === 19 && isSoft && dealerValue === 6) {
                if (trueCount >= 1) {
                    return 'Double if allowed (due to count), otherwise Stand';
                }
            }
            
            // ====== ADDITIONAL IMPORTANT DEVIATIONS ======
            
            // Surrender 15 vs 10
            if (playerValue === 15 && dealerValue === 10 && !isSoft) {
                if (trueCount >= 0) {
                    return 'Surrender if allowed (due to count), otherwise Hit';
                }
            }
            
            // Surrender 15 vs Ace
            if (playerValue === 15 && dealerValue === 11 && !isSoft) {
                if (trueCount >= 1) {
                    return 'Surrender if allowed (due to count), otherwise Hit';
                }
            }
            
            // A,7 vs 2
            if (playerValue === 18 && isSoft && dealerValue === 2) {
                if (trueCount >= 1) {
                    return 'Double if allowed (due to count), otherwise Stand';
                }
            }
            
            // A,6 vs 2
            if (playerValue === 17 && isSoft && dealerValue === 2) {
                if (trueCount >= 1) {
                    return 'Double if allowed (due to count), otherwise Hit';
                }
            }
            
            // ====== PAIR SPLITTING DEVIATIONS ======
            if (isPair) {
                const cardValue = currentHand[0].value;
                
                // 10,10 vs 5
                if ((cardValue === '10' || cardValue === 'J' || cardValue === 'Q' || cardValue === 'K') && dealerValue === 5) {
                    if (trueCount >= 5) {
                        return 'Split (due to count)';
                    }
                }
                
                // 10,10 vs 6
                if ((cardValue === '10' || cardValue === 'J' || cardValue === 'Q' || cardValue === 'K') && dealerValue === 6) {
                    if (trueCount >= 4) {
                        return 'Split (due to count)';
                    }
                }
                
                // 9,9 vs 9
                if (cardValue === '9' && dealerValue === 9) {
                    if (trueCount >= 3) {
                        return 'Split (due to count)';
                    }
                }
            }
            
            return advice;
        }
        
        // Update the bet recommendation in the UI
        function updateBettingRecommendation() {
            // Get the recommended bet multiplier and amount
            const trueCount = parseFloat(calculateTrueCount());
            const { betMultiplier, recommendedBet } = calculateRecommendedBet();
            
            // Skip UI updates for performance test
            // The calculation is still performed and can be used for performance tracking
            return;
            
            // Get or create the betting recommendation element
            let recommendationEl = document.getElementById('betting-recommendation');
            
            if (!recommendationEl) {
                // Find the shoe progress section
                const shoeProgressSection = document.querySelector('.help-section:nth-child(2)');
                
                if (!shoeProgressSection) return;
                
                // Create a new section for betting recommendation
                const betSection = document.createElement('div');
                betSection.className = 'help-section';
                
                // Create the header for the section
                const betSectionHeader = document.createElement('h3');
                betSectionHeader.textContent = 'Betting Strategy';
                betSection.appendChild(betSectionHeader);
                
                // Create the container for the recommendation
                const betRecommendationContainer = document.createElement('div');
                betRecommendationContainer.className = 'bet-recommendation-container';
                
                // Create the recommendation display
                recommendationEl = document.createElement('div');
                recommendationEl.id = 'betting-recommendation';
                recommendationEl.className = 'bet-recommendation';
                
                // Create label
                const recommendationLabel = document.createElement('span');
                recommendationLabel.className = 'bet-recommendation-label';
                recommendationLabel.textContent = 'Recommended Bet:';
                
                // Create value
                const recommendationValue = document.createElement('span');
                recommendationValue.id = 'bet-recommendation-value';
                recommendationValue.className = 'bet-recommendation-value';
                
                // Append elements
                recommendationEl.appendChild(recommendationLabel);
                recommendationEl.appendChild(recommendationValue);
                betRecommendationContainer.appendChild(recommendationEl);
                betSection.appendChild(betRecommendationContainer);
                
                // Add a note explaining the betting spread
                const betSpreadNote = document.createElement('div');
                betSpreadNote.className = 'bet-spread-note';
                betSpreadNote.innerHTML = 'Based on Hi-Lo count system:<br>TC ≤ 0: 1x | TC +1: 1x | TC +2: 2x | TC +3: 4x | TC +4: 8x | TC +5: 12x | TC ≥+6: 15x';
                betSection.appendChild(betSpreadNote);
                
                // Insert after the shoe progress section
                shoeProgressSection.parentNode.insertBefore(betSection, shoeProgressSection.nextSibling);
            }
            
            // Update the recommendation value with the multiplier
            const recommendationValueEl = document.getElementById('bet-recommendation-value');
            if (recommendationValueEl) {
                // Check if the recommendation has changed
                const previousValue = recommendationValueEl.textContent;
                const currentValue = `${betMultiplier}x`;
                const hasChanged = previousValue !== currentValue;
                
                // Update the value
                recommendationValueEl.textContent = currentValue;
                
                // Add animation if the value has changed
                if (hasChanged) {
                    // Remove existing animation class
                    recommendationValueEl.classList.remove('updated');
                    
                    // Force a reflow to restart the animation
                    void recommendationValueEl.offsetWidth;
                    
                    // Add the animation class back
                    recommendationValueEl.classList.add('updated');
                }
                
                // Add color based on bet size
                if (betMultiplier > 4) {
                    recommendationValueEl.style.color = 'var(--success-color)';
                } else if (betMultiplier > 1) {
                    recommendationValueEl.style.color = 'var(--secondary-color)';
                } else {
                    recommendationValueEl.style.color = 'var(--light-color)';
                }
                
                // Add a "Set Bet" button if in betting phase
                let setBetBtn = document.getElementById('set-recommended-bet');
                
                if (!setBetBtn && (state.gamePhase === 'betting' || state.gamePhase === 'gameOver')) {
                    setBetBtn = document.createElement('button');
                    setBetBtn.id = 'set-recommended-bet';
                    setBetBtn.className = 'set-bet-btn';
                    setBetBtn.textContent = 'Use Recommended Bet';
                    setBetBtn.addEventListener('click', () => {
                        if (betInput && (state.gamePhase === 'betting' || state.gamePhase === 'gameOver')) {
                            // Make sure recommended bet doesn't exceed balance
                            const safeBet = Math.min(recommendedBet, state.balance);
                            betInput.value = safeBet;
                            updateBetDisplay();
                            
                            // Clear and recreate the bet chip stack
                            clearBet();
                            
                            // Add chips to visually represent the bet
                            // (simplified version, just adding the total amount)
                            if (safeBet > 0) {
                                let remainingAmount = safeBet;
                                
                                // Try to add larger denomination chips first
                                if (remainingAmount >= 100) {
                                    const blackChips = Math.floor(remainingAmount / 100);
                                    for (let i = 0; i < blackChips; i++) {
                                        addChipToBet(100, 'black');
                                    }
                                    remainingAmount -= blackChips * 100;
                                }
                                
                                if (remainingAmount >= 25) {
                                    const greenChips = Math.floor(remainingAmount / 25);
                                    for (let i = 0; i < greenChips; i++) {
                                        addChipToBet(25, 'green');
                                    }
                                    remainingAmount -= greenChips * 25;
                                }
                                
                                if (remainingAmount >= 10) {
                                    const blueChips = Math.floor(remainingAmount / 10);
                                    for (let i = 0; i < blueChips; i++) {
                                        addChipToBet(10, 'blue');
                                    }
                                    remainingAmount -= blueChips * 10;
                                }
                                
                                if (remainingAmount >= 5) {
                                    const redChips = Math.floor(remainingAmount / 5);
                                    for (let i = 0; i < redChips; i++) {
                                        addChipToBet(5, 'red');
                                    }
                                    remainingAmount -= redChips * 5;
                                }
                                
                                // Add white chips for any remaining amount
                                for (let i = 0; i < remainingAmount; i++) {
                                    addChipToBet(1, 'white');
                                }
                            }
                        }
                    });
                    
                    recommendationEl.appendChild(setBetBtn);
                } else if (setBetBtn && state.gamePhase !== 'betting' && state.gamePhase !== 'gameOver') {
                    // Remove the button when not in betting phase
                    setBetBtn.remove();
                }
            }
        }
        
        // Calculate the recommended bet based on the true count
        function calculateRecommendedBet() {
            const trueCount = parseFloat(calculateTrueCount());
            
            // Floor the true count to handle decimal values, but keep negatives as is
            const flooredCount = trueCount >= 0 ? Math.floor(trueCount) : Math.ceil(trueCount);
            
            // Cap the true count at 6 for betting purposes (maximum spread)
            const cappedCount = Math.min(Math.max(flooredCount, -5), 6);
            
            // Get bet multiplier from the spread table
            const betMultiplier = state.bettingStrategy.betSpread[cappedCount.toString()];
            
            // Calculate the actual bet amount
            const recommendedBet = betMultiplier * state.bettingStrategy.minBet;
            
            // Store the recommendation
            state.bettingStrategy.currentRecommendation = recommendedBet;
            
            return { betMultiplier, recommendedBet };
        }
        
        // Add a chip to the current bet
        function addChipToBet(value, colorClass) {
            const currentBet = parseInt(betInput.value) || 0;
            const newBet = currentBet + value;
            
            if (newBet > state.balance) {
                return; // Cannot bet more than balance
            }
            
            betInput.value = newBet;
            updateBetDisplay();
            
            // Add visual chip to stack
            const chipStack = document.getElementById('bet-chip-stack');
            if (chipStack) {
                const chip = document.createElement('div');
                chip.className = `stacked-chip ${colorClass}`;
                chip.setAttribute('data-value', value);
                
                // Add animation
                chip.style.transform = 'translateY(-20px)';
                chip.style.opacity = '0';
                chipStack.appendChild(chip);
                
                // Trigger animation
                setTimeout(() => {
                    chip.style.transition = 'all 0.3s ease';
                    chip.style.transform = 'translateY(0)';
                    chip.style.opacity = '1';
                }, 10);
            }
        }
        
        // Clear the current bet
        function clearBet() {
            if (state.gamePhase !== 'betting' && state.gamePhase !== 'gameOver') {
                return;
            }
            
            betInput.value = 0;
            updateBetDisplay();
            
            // Clear bet chip stack
            const chipStack = document.getElementById('bet-chip-stack');
            if (chipStack) {
                chipStack.innerHTML = '';
            }
        }
        
        // Update the bet display
        function updateBetDisplay() {
            const betAmountDisplay = document.getElementById('bet-amount-display');
            if (betAmountDisplay) {
                betAmountDisplay.textContent = betInput.value;
            }
        }
        
        // Function to display error message with animation
        function displayErrorMessage(message) {
            // Create message element
            const messageEl = document.createElement('div');
            messageEl.className = 'error-message';
            messageEl.textContent = message;
            
            // Find the blackjack table and append message
            const table = document.querySelector('.blackjack-table');
            if (table) {
                table.appendChild(messageEl);
                
                // Animate in
                setTimeout(() => {
                    messageEl.classList.add('show');
                }, 100);
                
                // Remove after delay
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
