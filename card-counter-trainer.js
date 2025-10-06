// Card Counter Trainer - Reusing performance test game logic
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the card counter trainer using the same game logic as performance test
    initCardCounterTrainer();
    
    function initCardCounterTrainer() {
        // Initialize the trainer with card counting help always visible
        initTrainer();
    }
    
    // Main trainer function adapted from performance-test.js
    function initTrainer() {
        // DOM Elements
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
        const suggestedBetDisplay = document.getElementById('suggested-bet');
        const cardsRemainingDisplay = document.getElementById('cards-remaining');
        const deckCountDisplay = document.getElementById('deck-count');
        
        // Game state - same as performance test but without test mode
        const state = {
            // Settings - fixed for card counter trainer
            decks: 6,
            hitSoft17: true,
            doubleAfterSplit: true,
            resplitAces: false,
            bettingEnabled: true,
            
            // Game state
            deck: [],
            playerHands: [[]],
            dealerHand: [],
            currentHandIndex: 0,
            gamePhase: 'betting', // betting, playerTurn, dealerTurn, evaluating, gameOver
            balance: 1000,
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
            }
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
            'A♥': '/assets/cards/ace_of_hearts.svg',
            '2♥': '/assets/cards/2_of_hearts.svg',
            '3♥': '/assets/cards/3_of_hearts.svg',
            '4♥': '/assets/cards/4_of_hearts.svg',
            '5♥': '/assets/cards/5_of_hearts.svg',
            '6♥': '/assets/cards/6_of_hearts.svg',
            '7♥': '/assets/cards/7_of_hearts.svg',
            '8♥': '/assets/cards/8_of_hearts.svg',
            '9♥': '/assets/cards/9_of_hearts.svg',
            '10♥': '/assets/cards/10_of_hearts.svg',
            'J♥': '/assets/cards/jack_of_hearts.svg',
            'Q♥': '/assets/cards/queen_of_hearts.svg',
            'K♥': '/assets/cards/king_of_hearts.svg',
            
            // Diamonds
            'A♦': '/assets/cards/ace_of_diamonds.svg',
            '2♦': '/assets/cards/2_of_diamonds.svg',
            '3♦': '/assets/cards/3_of_diamonds.svg',
            '4♦': '/assets/cards/4_of_diamonds.svg',
            '5♦': '/assets/cards/5_of_diamonds.svg',
            '6♦': '/assets/cards/6_of_diamonds.svg',
            '7♦': '/assets/cards/7_of_diamonds.svg',
            '8♦': '/assets/cards/8_of_diamonds.svg',
            '9♦': '/assets/cards/9_of_diamonds.svg',
            '10♦': '/assets/cards/10_of_diamonds.svg',
            'J♦': '/assets/cards/jack_of_diamonds.svg',
            'Q♦': '/assets/cards/queen_of_diamonds.svg',
            'K♦': '/assets/cards/king_of_diamonds.svg',
            
            // Clubs
            'A♣': '/assets/cards/ace_of_clubs.svg',
            '2♣': '/assets/cards/2_of_clubs.svg',
            '3♣': '/assets/cards/3_of_clubs.svg',
            '4♣': '/assets/cards/4_of_clubs.svg',
            '5♣': '/assets/cards/5_of_clubs.svg',
            '6♣': '/assets/cards/6_of_clubs.svg',
            '7♣': '/assets/cards/7_of_clubs.svg',
            '8♣': '/assets/cards/8_of_clubs.svg',
            '9♣': '/assets/cards/9_of_clubs.svg',
            '10♣': '/assets/cards/10_of_clubs.svg',
            'J♣': '/assets/cards/jack_of_clubs.svg',
            'Q♣': '/assets/cards/queen_of_clubs.svg',
            'K♣': '/assets/cards/king_of_clubs.svg',
            
            // Spades
            'A♠': '/assets/cards/ace_of_spades.svg',
            '2♠': '/assets/cards/2_of_spades.svg',
            '3♠': '/assets/cards/3_of_spades.svg',
            '4♠': '/assets/cards/4_of_spades.svg',
            '5♠': '/assets/cards/5_of_spades.svg',
            '6♠': '/assets/cards/6_of_spades.svg',
            '7♠': '/assets/cards/7_of_spades.svg',
            '8♠': '/assets/cards/8_of_spades.svg',
            '9♠': '/assets/cards/9_of_spades.svg',
            '10♠': '/assets/cards/10_of_spades.svg',
            'J♠': '/assets/cards/jack_of_spades.svg',
            'Q♠': '/assets/cards/queen_of_spades.svg',
            'K♠': '/assets/cards/king_of_spades.svg',
            
            // Back of card
            'back': '/assets/cards/BACKOFCARD.svg'
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
        
        // Initialize the game
        function init() {
            createDeck();
            shuffleDeck();
            updateBalanceDisplay();
            bindEvents();
            updateControls();
            updateHelpPanel();
            updateCardsRemaining();
        }
        
        // Bind event listeners
        function bindEvents() {
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
            
            // Update help panel after shuffling
            updateHelpPanel();
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
                
                // Update help panel after dealing a visible card
                updateHelpPanel();
            }
            
            // Update cards remaining after dealing any card (visible or hidden)
            updateCardsRemaining();
            
            return card;
        }
        
        // Start a new hand
        function startNewHand() {
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
            
            // Update displays before dealing starts
            updateBalanceDisplay();
            updateCardsRemaining();
            
            // Start the sequential dealing animation
            dealNextCard();
            
            // Update controls early to disable buttons during dealing
            updateControls();
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
                    updateHelpPanel(); // Update help panel after dealing is complete
                    break;
            }
        }
        
        // Player hits (takes a card)
        function playerHit() {
            if (state.gamePhase !== 'playerTurn') return;
            
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
            updateHelpPanel();
        }
        
        // Player stands (ends turn)
        function playerStand() {
            if (state.gamePhase !== 'playerTurn') return;
            
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
            updateHelpPanel();
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
                    updateHelpPanel();
                    
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
                    updateHelpPanel();
                    
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
            updateHelpPanel();
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
            
            // Update help panel to reflect game over state
            updateHelpPanel();
            
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
            
            // Check if need to reshuffle
            const totalCards = state.decks * 52;
            const cardsRemaining = state.deck.length;
            if (cardsRemaining < totalCards * 0.25) {
                setTimeout(() => {
                    displayOutcomeMessage('Shuffling deck...', 'info');
                    createDeck();
                    shuffleDeck();
                    updateCardsRemaining();
                }, 2000);
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
        
        // Function to animate balance counting up
        function animateBalanceCount(startValue, endValue) {
            const balanceDisplay = document.getElementById('balance');
            if (!balanceDisplay) return;
            
            const duration = 1000; // 1 second
            const frameDuration = 1000 / 60; // 60fps
            const totalFrames = Math.round(duration / frameDuration);
            const valueIncrement = (endValue - startValue) / totalFrames;
            
            let currentFrame = 0;
            let currentValue = startValue;
            
            // Highlight the balance display
            balanceDisplay.classList.add('balance-updated');
            
            const animate = () => {
                currentFrame++;
                currentValue += valueIncrement;
                
                if (currentFrame === totalFrames) {
                    currentValue = endValue;
                }
                
                balanceDisplay.textContent = Math.floor(currentValue).toFixed(0);
                
                if (currentFrame < totalFrames) {
                    requestAnimationFrame(animate);
                } else {
                    // Animation complete, remove highlight class after a short delay
                    setTimeout(() => {
                        balanceDisplay.classList.remove('balance-updated');
                    }, 500);
                }
            };
            
            requestAnimationFrame(animate);
        }
        
        // Function to display outcome message
        function displayOutcomeMessage(message, outcomeType) {
            // Create message element
            const messageEl = document.createElement('div');
            messageEl.className = `outcome-message ${outcomeType}`;
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
        
        // Reset the game
        function resetGame() {
            state.playerHands = [[]];
            state.dealerHand = [];
            state.currentHandIndex = 0;
            state.gamePhase = 'betting';
            state.doubledHands = new Set();
            state.splitHands = [];
            
            createDeck();
            shuffleDeck();
            
            updateGameDisplay();
            updateControls();
            updateHelpPanel();
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
            
            // If there's at least one Ace and it's not being counted as 1
            return aceCount > 0 && sum <= 21;
        }
        
        // Update game display with current state
        function updateGameDisplay() {
            renderCards();
        }
        
        // Render all cards on the table
        function renderCards() {
            // Clear dealer and player card areas
            const dealerCardArea = document.getElementById('dealer-cards');
            const playerCardArea = document.getElementById('player-cards');
            
            const previousDealerCardCount = dealerCardArea ? dealerCardArea.childElementCount : 0;
            
            if (dealerCardArea) dealerCardArea.innerHTML = '';
            if (playerCardArea) playerCardArea.innerHTML = '';
            
            // Determine if this is an initial deal animation
            const isSequentialDealing = state.sequentialDealing === true;
            
            // Flag to track if dealer is currently hitting
            const isDealerHitting = state.gamePhase === 'dealerTurn';
            
            // Flag to track if player is currently hitting
            const isPlayerHitting = state.gamePhase === 'playerTurn' && !isSequentialDealing;
            
            // Flag to check if we're in the process of splitting
            const isSplitting = state.isSplitting === true;
            
            // Flag to check if we're just revealing the dealer's hole card (not dealing a new card)
            const isRevealingHoleCard = state.gamePhase === 'dealerTurn' && state.dealerHand.length === 2;
            
            // Render dealer cards
            if (dealerCardArea) {
                // Track if we're adding a new dealer card to apply special animation
                const isNewDealerCard = state.dealerHand.length > previousDealerCardCount && previousDealerCardCount > 0;
                
                // Create a container for dealer hand to match player hand structure
                const dealerHandEl = document.createElement('div');
                dealerHandEl.className = 'hand';
                
                state.dealerHand.forEach((card, index) => {
                    const cardEl = document.createElement('div');
                    cardEl.className = 'card';
                    
                    const cardImage = document.createElement('img');
                    cardImage.className = 'card-img';
                    cardImage.alt = card.isHidden ? '?' : `${card.value}${card.suit}`;
                    cardImage.src = getCardImagePath(card);
                    
                    if (card.isHidden) {
                        cardEl.classList.add('hidden');
                    }
                    
                    cardEl.appendChild(cardImage);
                    dealerHandEl.appendChild(cardEl);
                    
                    // Determine card animation based on context
                    if (isSequentialDealing) {
                        // For sequential dealing, only animate the current card being dealt
                        if ((state.dealingStage === 2 && index === 0) || // Dealer's first card when it's shown
                            (state.dealingStage === 4 && index === 1)) { // Dealer's second card when it's shown
                            cardEl.classList.add('card-dealt');
                        }
                    } else if (isDealerHitting && isNewDealerCard && index === state.dealerHand.length - 1 && !isRevealingHoleCard) {
                        // For dealer hit during play, use dealer hit animation ONLY if dealer is currently hitting
                        // and only if we're not just revealing the hole card
                        cardEl.classList.add('dealer-hit-card');
                        cardEl.style.zIndex = '10';
                        setTimeout(() => {
                            cardEl.style.zIndex = '1';
                        }, 700);
                    } else if (isRevealingHoleCard && index === 1 && !card.isHidden) {
                        // When revealing the dealer's hole card after player stands, just add the flip class
                        cardEl.classList.add('card-flip');
                    }
                });
                
                // Display dealer hand value (only visible total if no hidden cards)
                const dealerValueEl = document.createElement('div');
                dealerValueEl.className = 'hand-value';
                
                // Only show total if all cards are face up or we're in gameOver phase
                if (!state.dealerHand.some(card => card.isHidden) || state.gamePhase === 'gameOver') {
                    dealerValueEl.textContent = getHandValue(state.dealerHand);
                    
                    // Add color indication based on value
                    const dealerValue = getHandValue(state.dealerHand);
                    if (dealerValue > 21) {
                        dealerValueEl.classList.add('busted');
                    } else if (dealerValue === 21 && state.dealerHand.length === 2) {
                        dealerValueEl.classList.add('blackjack');
                    }
                } else {
                    dealerValueEl.textContent = '?';
                }
                
                dealerHandEl.appendChild(dealerValueEl);
                dealerCardArea.appendChild(dealerHandEl);
            }
            
            // Track if this is a regular initial deal (not used during sequential dealing)
            const isInitialDeal = !isSequentialDealing && 
                                 state.gamePhase === 'playerTurn' && 
                                 state.playerHands[0].length === 2 && 
                                 state.playerHands.length === 1 &&
                                 !state.splitHands.length;
            
            // Render player hands
            if (playerCardArea) {
                // Remove any existing hand indicators if starting a new hand
                if (state.gamePhase === 'dealing' || state.gamePhase === 'betting') {
                    const existingIndicators = document.querySelectorAll('.hand-indicator');
                    existingIndicators.forEach(indicator => indicator.remove());
                }
                
                state.playerHands.forEach((hand, handIndex) => {
                    const handEl = document.createElement('div');
                    handEl.className = 'hand';
                    
                    // Add appropriate classes for multi-hand display
                    if (state.playerHands.length > 1) {
                        handEl.classList.add('split-hand');
                        handEl.classList.add(`split-hand-${handIndex + 1}`);
                        
                        // Add transformation to visually separate split hands
                        if (isSplitting) {
                            // During split animation, apply transition for smooth movement
                            handEl.style.transition = 'transform 0.5s ease';
                            
                            if (handIndex === 0) {
                                // First hand moves left
                                handEl.style.transform = 'translateX(-50px)';
                            } else {
                                // Second hand moves right
                                handEl.style.transform = 'translateX(50px)';
                            }
                        } else {
                            // After split is complete, position is maintained but without transition
                            if (handIndex === 0) {
                                handEl.style.transform = 'translateX(-50px)';
                            } else {
                                handEl.style.transform = 'translateX(50px)';
                            }
                        }
                    }
                    
                    if (handIndex === state.currentHandIndex && state.gamePhase === 'playerTurn') {
                        handEl.classList.add('active');
                    }
                    
                    // Add hand outcome class if the game is over
                    if (state.gamePhase === 'gameOver') {
                        const playerValue = getHandValue(hand);
                        const dealerValue = getHandValue(state.dealerHand);
                        
                        if (playerValue > 21) {
                            handEl.classList.add('outcome-lose', 'outcome-bust');
                        } else if (dealerValue > 21) {
                            handEl.classList.add('outcome-win', 'outcome-dealer-bust');
                        } else if (playerValue > dealerValue) {
                            handEl.classList.add('outcome-win');
                        } else if (playerValue === dealerValue) {
                            handEl.classList.add('outcome-push');
                        } else {
                            handEl.classList.add('outcome-lose');
                        }
                        
                        // Check for blackjack
                        if (playerValue === 21 && hand.length === 2) {
                            handEl.classList.add('outcome-blackjack');
                        }
                    }
                    
                    // Track the last card in the current hand (the newly added one)
                    const lastCardIndex = hand.length - 1;
                    const isCurrentHand = handIndex === state.currentHandIndex;
                    
                    hand.forEach((card, cardIndex) => {
                        const cardEl = document.createElement('div');
                        cardEl.className = 'card';
                        
                        // Determine animation based on dealing context
                        if (isSequentialDealing) {
                            // Only animate the player card that was just dealt
                            if ((state.dealingStage === 1 && cardIndex === 0) || // First player card when it's shown
                                (state.dealingStage === 3 && cardIndex === 1)) { // Second player card when it's shown
                                cardEl.classList.add('card-dealt');
                            }
                        } else if (isSplitting) {
                            // For split hands, animate the newly dealt cards
                            if (cardIndex === hand.length - 1) {
                                cardEl.classList.add('card-dealt');
                            } else {
                                // The original card (not the new one) gets a split animation
                                cardEl.classList.add('card-split');
                            }
                        } else if (isInitialDeal) {
                            // This is for regular initial deal (not sequential)
                            setTimeout(() => {
                                cardEl.classList.add('card-dealt');
                            }, (handIndex * hand.length + cardIndex) * 200 + 400);
                        } else if (isPlayerHitting && isCurrentHand && cardIndex === lastCardIndex && hand.length > 2) {
                            // For hit during play, animate only the newest card AND only if player is currently hitting
                            cardEl.classList.add('card-dealt');
                        }
                        
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
                    
                    // Add color indication based on value
                    const handValue = getHandValue(hand);
                    if (handValue > 21) {
                        valueEl.classList.add('busted');
                    } else if (handValue === 21 && hand.length === 2) {
                        valueEl.classList.add('blackjack');
                    }
                    
                    handEl.appendChild(valueEl);
                    playerCardArea.appendChild(handEl);
                });
            }
        }
        
        // Update controls based on game state
        function updateControls() {
            // Implementation will depend on your HTML structure
            // This function should enable/disable buttons based on game state
            
            // Disable all action buttons during dealing phase
            const isDealingPhase = state.gamePhase === 'dealing';
            
            if (dealButton) dealButton.disabled = (state.gamePhase !== 'betting' && state.gamePhase !== 'gameOver') || isDealingPhase;
            if (hitButton) hitButton.disabled = state.gamePhase !== 'playerTurn' || isDealingPhase;
            if (standButton) standButton.disabled = state.gamePhase !== 'playerTurn' || isDealingPhase;
            if (doubleButton) {
                // Can double only on first two cards of a hand
                const canDouble = state.gamePhase === 'playerTurn' && 
                                  state.playerHands[state.currentHandIndex].length === 2 &&
                                  (!state.bettingEnabled || state.balance >= state.currentBet);
                doubleButton.disabled = !canDouble || isDealingPhase;
            }
            if (splitButton) {
                // Can split only if you have a pair
                const currentHand = state.playerHands[state.currentHandIndex] || [];
                const canSplit = state.gamePhase === 'playerTurn' && 
                                 currentHand.length === 2 && 
                                 currentHand[0]?.value === currentHand[1]?.value &&
                                 (!state.bettingEnabled || state.balance >= state.currentBet);
                splitButton.disabled = !canSplit || isDealingPhase;
            }
            if (betInput) betInput.disabled = (state.gamePhase !== 'betting' && state.gamePhase !== 'gameOver') || 
                                              !state.bettingEnabled || 
                                              isDealingPhase;
        }
        
        // Update balance display
        function updateBalanceDisplay() {
            if (balanceDisplay) {
                balanceDisplay.textContent = state.balance.toFixed(0);
            }
        }
        
        // Update cards remaining display
        function updateCardsRemaining() {
            if (cardsRemainingDisplay) {
                cardsRemainingDisplay.textContent = state.deck.length;
            }
            if (deckCountDisplay) {
                deckCountDisplay.textContent = state.decks;
            }
        }
        
        // Calculate true count
        function calculateTrueCount() {
            const decksRemaining = Math.max((state.decks * 52 - state.cardsDealt) / 52, 0.5);
            return (state.runningCount / decksRemaining).toFixed(1);
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
            
            let baseAdvice = '';
            
            // Check for pair
            if (currentHand.length === 2 && currentHand[0].value === currentHand[1].value) {
                baseAdvice = getPairAdvice(currentHand[0].value, dealerValue);
            }
            // Check for soft hand
            else if (isSoftHand(currentHand)) {
                baseAdvice = getSoftHandAdvice(playerValue, dealerValue);
            }
            // Hard hand
            else {
                baseAdvice = getHardHandAdvice(playerValue, dealerValue);
            }
            
            // Now adjust based on the count
            return adjustAdviceBasedOnCount(baseAdvice, playerValue, dealerValue, currentHand);
        }
        
        // Get detailed explanation for the recommended action
        function getStrategyExplanation() {
            if (state.gamePhase !== 'playerTurn') return 'Game not in progress. Deal cards to see strategy explanations.';
            
            const currentHand = state.playerHands[state.currentHandIndex];
            if (!currentHand || currentHand.length === 0) return 'Waiting for cards to be dealt...';
            
            const playerValue = getHandValue(currentHand);
            const dealerUpcard = state.dealerHand[0]?.value;
            if (!dealerUpcard) return 'Waiting for dealer upcard...';
            
            const dealerValue = getCardValue(state.dealerHand[0]);
            const trueCount = parseFloat(calculateTrueCount());
            const isSoft = isSoftHand(currentHand);
            const isPair = currentHand.length === 2 && currentHand[0].value === currentHand[1].value;
            
            let explanation = '';
            
            // Start with the basic situation description
            explanation += `<div class="explanation-header">Current Situation:</div>`;
            explanation += `<div class="situation-details">`;
            explanation += `• Your hand: ${currentHand.map(card => `${card.value}${card.suit}`).join(', ')} (${playerValue}${isSoft ? ' soft' : ''})`;
            explanation += `<br>• Dealer showing: ${dealerUpcard} (${dealerValue})`;
            explanation += `<br>• True count: ${trueCount}`;
            explanation += `</div><br>`;
            
            // Get the basic strategy explanation
            if (isPair) {
                explanation += getPairExplanation(currentHand[0].value, dealerValue, trueCount);
            } else if (isSoft) {
                explanation += getSoftHandExplanation(playerValue, dealerValue, trueCount);
            } else {
                explanation += getHardHandExplanation(playerValue, dealerValue, trueCount);
            }
            
            // Add count-specific explanation if the count significantly affects the decision
            if (Math.abs(trueCount) >= 1) {
                explanation += getCountExplanation(playerValue, dealerValue, trueCount, isSoft, isPair);
            }
            
            return explanation;
        }
        
        // Get explanation for pair decisions
        function getPairExplanation(cardValue, dealerValue, trueCount) {
            let explanation = `<div class="explanation-header">Pair Strategy Explanation:</div>`;
            
            switch(cardValue) {
                case 'A':
                    explanation += `<strong>Always split Aces!</strong><br>`;
                    explanation += `• Two 11s give you terrible hands (22 if you hit)<br>`;
                    explanation += `• Split Aces give you two chances at blackjack<br>`;
                    explanation += `• Even with just one card each, this is highly profitable`;
                    break;
                    
                case '8':
                    explanation += `<strong>Always split 8s!</strong><br>`;
                    explanation += `• 16 is the worst possible hand in blackjack<br>`;
                    explanation += `• Splitting gives you two hands starting with 8 (much better)<br>`;
                    explanation += `• Even against strong dealer cards, splitting minimizes losses`;
                    break;
                    
                case 'K':
                case 'Q':
                case 'J':
                case '10':
                    explanation += `<strong>Never split 10s!</strong><br>`;
                    explanation += `• 20 is an excellent hand that wins most of the time<br>`;
                    explanation += `• Splitting would create two hands starting with 10<br>`;
                    explanation += `• The chance of improving on 20 is very low`;
                    if (trueCount >= 4 && (dealerValue === 5 || dealerValue === 6)) {
                        explanation += `<br><br><strong>Count Exception:</strong><br>`;
                        explanation += `• With high count (${trueCount}), many 10s remain<br>`;
                        explanation += `• Dealer likely to bust with ${dealerValue}<br>`;
                        explanation += `• Advanced players might split here for extra profit`;
                    }
                    break;
                    
                case '9':
                    if ([7, 10, 11].includes(dealerValue)) {
                        explanation += `<strong>Stand against ${dealerValue}:</strong><br>`;
                        explanation += `• 18 is a strong hand<br>`;
                        explanation += `• Dealer has strong upcard - splitting risks worse hands<br>`;
                        explanation += `• Against 7: dealer makes 17, you win with 18<br>`;
                        explanation += `• Against 10/A: dealer likely has strong hand`;
                    } else {
                        explanation += `<strong>Split against ${dealerValue}:</strong><br>`;
                        explanation += `• Dealer has weak upcard (likely to bust)<br>`;
                        explanation += `• Two hands starting with 9 have good potential<br>`;
                        explanation += `• More money on table when dealer is vulnerable`;
                    }
                    break;
                    
                case '7':
                    if (dealerValue <= 7) {
                        explanation += `<strong>Split against ${dealerValue}:</strong><br>`;
                        explanation += `• Dealer upcard is weak or equal to yours<br>`;
                        explanation += `• Two hands starting with 7 can make 17+<br>`;
                        explanation += `• Good opportunity to get more money on table`;
                    } else {
                        explanation += `<strong>Hit against ${dealerValue}:</strong><br>`;
                        explanation += `• 14 is a weak hand<br>`;
                        explanation += `• Dealer has strong upcard<br>`;
                        explanation += `• Splitting creates two weak hands against strength`;
                    }
                    break;
                    
                case '6':
                    if (dealerValue <= 6) {
                        explanation += `<strong>Split against ${dealerValue}:</strong><br>`;
                        explanation += `• Dealer has weak upcard (bust card)<br>`;
                        explanation += `• 12 is not a great hand anyway<br>`;
                        explanation += `• Get more money out when dealer is likely to bust`;
                    } else {
                        explanation += `<strong>Hit against ${dealerValue}:</strong><br>`;
                        explanation += `• 12 is already marginal<br>`;
                        explanation += `• Dealer has strong upcard<br>`;
                        explanation += `• Don't create two weak hands against strength`;
                    }
                    break;
                    
                case '5':
                    explanation += `<strong>Double (don't split) against ${dealerValue}:</strong><br>`;
                    explanation += `• 10 is an excellent doubling hand<br>`;
                    explanation += `• Splitting 5s creates two terrible starting hands<br>`;
                    explanation += `• Much better to treat as hard 10 and double`;
                    break;
                    
                case '4':
                    if (dealerValue === 5 || dealerValue === 6) {
                        explanation += `<strong>Split against ${dealerValue}:</strong><br>`;
                        explanation += `• Dealer has the weakest upcards<br>`;
                        explanation += `• Starting with 4 isn't terrible (can make 14-19)<br>`;
                        explanation += `• Take advantage of dealer's weakness`;
                    } else {
                        explanation += `<strong>Hit against ${dealerValue}:</strong><br>`;
                        explanation += `• 8 is a weak hand but not terrible<br>`;
                        explanation += `• Starting two hands with 4 is worse<br>`;
                        explanation += `• Better to play one hand of 8`;
                    }
                    break;
                    
                case '3':
                case '2':
                    if (dealerValue <= 7) {
                        explanation += `<strong>Split against ${dealerValue}:</strong><br>`;
                        explanation += `• Small pairs need dealer weakness to split<br>`;
                        explanation += `• Dealer upcard gives you the advantage<br>`;
                        explanation += `• Two small starting hands can still win`;
                    } else {
                        explanation += `<strong>Hit against ${dealerValue}:</strong><br>`;
                        explanation += `• Starting hand is weak (${parseInt(cardValue) * 2})<br>`;
                        explanation += `• Dealer has strong upcard<br>`;
                        explanation += `• Don't make situation worse by splitting`;
                    }
                    break;
                    
                default:
                    explanation += `Standard pair strategy applies.`;
            }
            
            return explanation;
        }
        
        // Get explanation for soft hand decisions
        function getSoftHandExplanation(playerValue, dealerValue, trueCount) {
            let explanation = `<div class="explanation-header">Soft Hand Strategy Explanation:</div>`;
            
            switch(playerValue) {
                case 20: // A,9
                    explanation += `<strong>Always stand with soft 20!</strong><br>`;
                    explanation += `• A,9 = 20 is an excellent hand<br>`;
                    explanation += `• Only blackjack beats you<br>`;
                    explanation += `• No reason to risk this strong hand`;
                    break;
                    
                case 19: // A,8
                    if (dealerValue === 6) {
                        explanation += `<strong>Double against 6 (if allowed):</strong><br>`;
                        explanation += `• Dealer 6 is the weakest upcard (most likely to bust)<br>`;
                        explanation += `• You have a strong hand that can't bust<br>`;
                        explanation += `• Perfect opportunity for extra profit<br>`;
                        explanation += `• If doubling not allowed, 19 stands beautifully`;
                    } else {
                        explanation += `<strong>Stand with soft 19:</strong><br>`;
                        explanation += `• 19 wins against most dealer totals<br>`;
                        explanation += `• Risk vs reward doesn't favor hitting<br>`;
                        explanation += `• Strong hand - keep it`;
                    }
                    break;
                    
                case 18: // A,7
                    if (dealerValue <= 6) {
                        explanation += `<strong>Double against ${dealerValue} (if allowed):</strong><br>`;
                        explanation += `• Dealer has weak upcard<br>`;
                        explanation += `• 18 is good, but you can improve it safely<br>`;
                        explanation += `• Can't bust, and dealer likely to bust<br>`;
                        explanation += `• Great spot for extra profit`;
                    } else if (dealerValue <= 8) {
                        explanation += `<strong>Stand against ${dealerValue}:</strong><br>`;
                        explanation += `• 18 is a solid hand<br>`;
                        explanation += `• Dealer upcard is strong enough to be cautious<br>`;
                        explanation += `• Don't risk good hand against dealer strength`;
                    } else {
                        explanation += `<strong>Hit against ${dealerValue}:</strong><br>`;
                        explanation += `• Dealer has very strong upcard<br>`;
                        explanation += `• 18 often loses to 19, 20, 21<br>`;
                        explanation += `• You can't bust - safe to try improving<br>`;
                        explanation += `• A,2,3 improve you; only 4,5,6,7,8,9 hurt you`;
                    }
                    break;
                    
                case 17: // A,6
                    if (dealerValue <= 6) {
                        explanation += `<strong>Double against ${dealerValue} (if allowed):</strong><br>`;
                        explanation += `• Dealer has weak/moderate upcard<br>`;
                        explanation += `• 17 is marginal - needs improvement<br>`;
                        explanation += `• Can't bust by hitting<br>`;
                        explanation += `• Good spot to get more money out`;
                    } else {
                        explanation += `<strong>Hit against ${dealerValue}:</strong><br>`;
                        explanation += `• 17 is a weak hand<br>`;
                        explanation += `• Dealer upcard is strong<br>`;
                        explanation += `• You can't bust, so always try to improve<br>`;
                        explanation += `• A,2,3,4 all help significantly`;
                    }
                    break;
                    
                case 16: // A,5
                case 15: // A,4
                    if (dealerValue <= 6) {
                        explanation += `<strong>Double against ${dealerValue} (if allowed):</strong><br>`;
                        explanation += `• Very weak hand that needs improvement<br>`;
                        explanation += `• Dealer has weak upcard<br>`;
                        explanation += `• Can't bust - perfect doubling opportunity<br>`;
                        explanation += `• A,2,3,4,5,6 all help you significantly`;
                    } else {
                        explanation += `<strong>Hit against ${dealerValue}:</strong><br>`;
                        explanation += `• ${playerValue} is a very weak hand<br>`;
                        explanation += `• Must try to improve<br>`;
                        explanation += `• Can't bust by hitting<br>`;
                        explanation += `• Dealer upcard too strong for doubling`;
                    }
                    break;
                    
                case 14: // A,3
                case 13: // A,2
                    if (dealerValue <= 5) {
                        explanation += `<strong>Double against ${dealerValue} (if allowed):</strong><br>`;
                        explanation += `• Very weak hand that desperately needs improvement<br>`;
                        explanation += `• Dealer has very weak upcard<br>`;
                        explanation += `• Can't bust - safe to double<br>`;
                        explanation += `• Even small improvements help significantly`;
                    } else {
                        explanation += `<strong>Hit against ${dealerValue}:</strong><br>`;
                        explanation += `• ${playerValue} is very weak<br>`;
                        explanation += `• Must try to improve<br>`;
                        explanation += `• Can't bust by hitting<br>`;
                        explanation += `• Dealer upcard too strong for doubling`;
                    }
                    break;
                    
                default:
                    explanation += `<strong>Hit this soft hand:</strong><br>`;
                    explanation += `• Soft hands under 13 are very weak<br>`;
                    explanation += `• You cannot bust by hitting<br>`;
                    explanation += `• Always try to improve`;
            }
            
            explanation += `<br><br><div class="strategy-note"><strong>Soft Hand Key:</strong> You cannot bust because the Ace can count as 1 or 11.</div>`;
            
            return explanation;
        }
        
        // Get explanation for hard hand decisions
        function getHardHandExplanation(playerValue, dealerValue, trueCount) {
            let explanation = `<div class="explanation-header">Hard Hand Strategy Explanation:</div>`;
            
            if (playerValue >= 17) {
                explanation += `<strong>Always stand with ${playerValue}:</strong><br>`;
                explanation += `• Strong hand that wins most of the time<br>`;
                explanation += `• High risk of busting if you hit<br>`;
                explanation += `• Let the dealer take the risk`;
            } else if (playerValue >= 13 && playerValue <= 16) {
                if (dealerValue <= 6) {
                    explanation += `<strong>Stand against dealer ${dealerValue}:</strong><br>`;
                    explanation += `• Dealer has "bust card" (weak upcard)<br>`;
                    explanation += `• Dealer must hit and likely to bust<br>`;
                    explanation += `• Your ${playerValue} wins if dealer busts<br>`;
                    explanation += `• Don't risk busting when dealer is vulnerable`;
                    
                    // Add specific bust probabilities
                    const bustProbabilities = {
                        2: "35%", 3: "37%", 4: "40%", 5: "42%", 6: "42%"
                    };
                    explanation += `<br>• Dealer busts ~${bustProbabilities[dealerValue] || "40%"} with ${dealerValue} showing`;
                } else {
                    explanation += `<strong>Hit against dealer ${dealerValue}:</strong><br>`;
                    explanation += `• Dealer has strong upcard<br>`;
                    explanation += `• Your ${playerValue} likely loses if you stand<br>`;
                    explanation += `• Must risk busting to have a chance to win<br>`;
                    
                    // Add hit probabilities
                    if (playerValue === 16) {
                        explanation += `• ~62% chance of busting, but ${playerValue} rarely wins anyway`;
                    } else if (playerValue === 15) {
                        explanation += `• ~58% chance of busting, but must try to improve`;
                    } else if (playerValue === 14) {
                        explanation += `• ~56% chance of busting, but ${playerValue} is too weak`;
                    } else if (playerValue === 13) {
                        explanation += `• ~54% chance of busting, but must improve against strength`;
                    }
                }
            } else if (playerValue === 12) {
                if (dealerValue >= 4 && dealerValue <= 6) {
                    explanation += `<strong>Stand against dealer ${dealerValue}:</strong><br>`;
                    explanation += `• Dealer has weak upcard (likely to bust)<br>`;
                    explanation += `• 12 is on the borderline<br>`;
                    explanation += `• Slight edge to standing and hoping dealer busts<br>`;
                    explanation += `• Only ~31% chance of busting if you hit, but still better to stand`;
                } else {
                    explanation += `<strong>Hit against dealer ${dealerValue}:</strong><br>`;
                    explanation += `• 12 is a weak hand<br>`;
                    explanation += `• Dealer upcard is strong<br>`;
                    explanation += `• Only ~31% chance of busting (relatively safe)<br>`;
                    explanation += `• Need to improve to compete`;
                }
            } else if (playerValue === 11) {
                explanation += `<strong>Double down against dealer ${dealerValue}:</strong><br>`;
                explanation += `• 11 is the best doubling hand<br>`;
                explanation += `• ~31% chance of getting 10-value card for 21<br>`;
                explanation += `• Can't bust on next card<br>`;
                explanation += `• Even if you don't get 21, likely to improve significantly`;
                if (dealerValue === 11) {
                    explanation += `<br>• Against dealer Ace: still favorable due to your flexibility`;
                }
            } else if (playerValue === 10) {
                if (dealerValue <= 9) {
                    explanation += `<strong>Double down against dealer ${dealerValue}:</strong><br>`;
                    explanation += `• Excellent doubling opportunity<br>`;
                    explanation += `• ~31% chance of making 20 with 10-value card<br>`;
                    explanation += `• Dealer upcard is weak enough to exploit<br>`;
                    explanation += `• Get more money out in favorable situation`;
                } else {
                    explanation += `<strong>Hit against dealer ${dealerValue}:</strong><br>`;
                    explanation += `• 10 is a good hand but needs improvement<br>`;
                    explanation += `• Dealer has strong upcard<br>`;
                    explanation += `• Don't double into dealer strength<br>`;
                    explanation += `• Still try to improve, but risk less money`;
                }
            } else if (playerValue === 9) {
                if (dealerValue >= 3 && dealerValue <= 6) {
                    explanation += `<strong>Double down against dealer ${dealerValue}:</strong><br>`;
                    explanation += `• Dealer has weak/moderate upcard<br>`;
                    explanation += `• 9 has good potential for improvement<br>`;
                    explanation += `• A,2,3,4,5,6,7,8,9,10,J,Q,K all help (only A hurts)<br>`;
                    explanation += `• Good spot to increase bet when advantageous`;
                } else {
                    explanation += `<strong>Hit against dealer ${dealerValue}:</strong><br>`;
                    explanation += `• 9 needs improvement<br>`;
                    explanation += `• Dealer upcard too strong for doubling<br>`;
                    explanation += `• Try to improve without risking extra money`;
                }
            } else {
                explanation += `<strong>Hit this weak hand:</strong><br>`;
                explanation += `• ${playerValue} is too weak to stand<br>`;
                explanation += `• Very low risk of busting<br>`;
                explanation += `• Must try to improve`;
            }
            
            return explanation;
        }
        
        // Get explanation for count-based deviations
        function getCountExplanation(playerValue, dealerValue, trueCount, isSoft, isPair) {
            if (Math.abs(trueCount) < 1) return '';
            
            let explanation = `<br><div class="explanation-header">Card Counting Consideration:</div>`;
            
            if (trueCount > 0) {
                explanation += `<strong>Positive Count (+${trueCount}):</strong><br>`;
                explanation += `• More 10s and Aces remaining in deck<br>`;
                explanation += `• Dealer more likely to bust<br>`;
                explanation += `• You more likely to get good cards<br>`;
                
                // Specific count deviations
                if (playerValue === 16 && dealerValue === 10 && !isSoft && trueCount >= 0) {
                    explanation += `• 16 vs 10: Usually hit, but stand with positive count<br>`;
                    explanation += `• Dealer more likely to bust with excess 10s`;
                } else if (playerValue === 15 && dealerValue === 10 && !isSoft && trueCount >= 4) {
                    explanation += `• 15 vs 10: Stand instead of hit with high count<br>`;
                    explanation += `• Dealer bust probability increases significantly`;
                } else if (playerValue === 12 && [2,3].includes(dealerValue) && !isSoft && trueCount >= 2) {
                    explanation += `• 12 vs ${dealerValue}: Stand instead of hit with positive count<br>`;
                    explanation += `• Extra 10s make hitting more dangerous`;
                }
            } else {
                explanation += `<strong>Negative Count (${trueCount}):</strong><br>`;
                explanation += `• Fewer 10s and Aces remaining<br>`;
                explanation += `• Dealer less likely to bust<br>`;
                explanation += `• Small cards more common<br>`;
                
                // Negative count considerations
                if (playerValue >= 12 && playerValue <= 16 && dealerValue <= 6 && !isSoft) {
                    explanation += `• Consider hitting weak hands more aggressively<br>`;
                    explanation += `• Dealer less likely to bust with few 10s left`;
                }
            }
            
            return explanation;
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
                if (trueCount <= 0) {
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
        
        // Get advice for pair hands
        function getPairAdvice(cardValue, dealerValue) {
            switch(cardValue) {
                case 'A':
                    return 'Split';
                case 'K':
                case 'Q':
                case 'J':
                case '10':
                    return 'Stand';
                case '9':
                    if ([7, 10, 11].includes(dealerValue)) {
                        return 'Stand';
                    }
                    return 'Split';
                case '8':
                    return 'Split';
                case '7':
                    if (dealerValue <= 7) {
                        return 'Split';
                    }
                    return 'Hit';
                case '6':
                    if (dealerValue <= 6) {
                        return 'Split';
                    }
                    return 'Hit';
                case '5':
                    if (dealerValue <= 9) {
                        return 'Double';
                    }
                    return 'Hit';
                case '4':
                    if (dealerValue === 5 || dealerValue === 6) {
                        return 'Split';
                    }
                    return 'Hit';
                case '3':
                case '2':
                    if (dealerValue <= 7) {
                        return 'Split';
                    }
                    return 'Hit';
                default:
                    return 'Hit';
            }
        }
        
        // Get advice for soft hands
        function getSoftHandAdvice(playerValue, dealerValue) {
            switch(playerValue) {
                case 20:
                    return 'Stand';
                case 19:
                    if (dealerValue === 6) {
                        return 'Double if allowed, otherwise Stand';
                    }
                    return 'Stand';
                case 18:
                    if (dealerValue <= 6) {
                        return 'Double if allowed, otherwise Stand';
                    }
                    if (dealerValue <= 8) {
                        return 'Stand';
                    }
                    return 'Hit';
                case 17:
                    if (dealerValue <= 6) {
                        return 'Double if allowed, otherwise Hit';
                    }
                    return 'Hit';
                case 16:
                case 15:
                    if (dealerValue <= 6) {
                        return 'Double if allowed, otherwise Hit';
                    }
                    return 'Hit';
                case 14:
                case 13:
                    if (dealerValue <= 5) {
                        return 'Double if allowed, otherwise Hit';
                    }
                    return 'Hit';
                default:
                    return 'Hit';
            }
        }
        
        // Get advice for hard hands
        function getHardHandAdvice(playerValue, dealerValue) {
            if (playerValue >= 17) {
                return 'Stand';
            } else if (playerValue >= 13 && playerValue <= 16) {
                if (dealerValue <= 6) {
                    return 'Stand';
                }
                return 'Hit';
            } else if (playerValue === 12) {
                if (dealerValue >= 4 && dealerValue <= 6) {
                    return 'Stand';
                }
                return 'Hit';
            } else if (playerValue === 11) {
                return 'Double if allowed, otherwise Hit';
            } else if (playerValue === 10) {
                if (dealerValue <= 9) {
                    return 'Double if allowed, otherwise Hit';
                }
                return 'Hit';
            } else if (playerValue === 9) {
                if (dealerValue >= 3 && dealerValue <= 6) {
                    return 'Double if allowed, otherwise Hit';
                }
                return 'Hit';
            } else {
                return 'Hit';
            }
        }
        
        // Update help panel - in card counter trainer, this is always visible
        function updateHelpPanel() {
            if (runningCountDisplay) {
                runningCountDisplay.textContent = state.runningCount;
                
                // Add color based on count
                if (state.runningCount > 0) {
                    runningCountDisplay.style.color = '#4CAF50';
                } else if (state.runningCount < 0) {
                    runningCountDisplay.style.color = '#f44336';
                } else {
                    runningCountDisplay.style.color = '#fff';
                }
            }
            
            if (trueCountDisplay) {
                const trueCount = calculateTrueCount();
                trueCountDisplay.textContent = trueCount;
                
                // Add color based on count
                if (parseFloat(trueCount) > 0) {
                    trueCountDisplay.style.color = '#4CAF50';
                } else if (parseFloat(trueCount) < 0) {
                    trueCountDisplay.style.color = '#f44336';
                } else {
                    trueCountDisplay.style.color = '#fff';
                }
                
                // Update recommended bet based on true count
                updateBettingRecommendation();
            }
            
            // Update advice
            if (helpAdviceDisplay) {
                const advice = getBasicStrategyAdvice();
                helpAdviceDisplay.textContent = advice;
                
                // Apply styling based on advice
                helpAdviceDisplay.className = 'help-advice';
                if (advice.includes('Hit')) {
                    helpAdviceDisplay.classList.add('hit');
                } else if (advice.includes('Stand')) {
                    helpAdviceDisplay.classList.add('stand');
                } else if (advice.includes('Double')) {
                    helpAdviceDisplay.classList.add('double');
                } else if (advice.includes('Split')) {
                    helpAdviceDisplay.classList.add('split');
                } else if (advice.includes('Surrender')) {
                    helpAdviceDisplay.classList.add('surrender');
                }
            }
            
            // Update strategy explanation
            const helpExplanationDisplay = document.getElementById('help-explanation');
            if (helpExplanationDisplay) {
                const explanation = getStrategyExplanation();
                helpExplanationDisplay.innerHTML = explanation;
            }
            
            // Update card history
            if (historyList) {
                historyList.innerHTML = '';
                
                // Show only the last 10 cards
                const recentHistory = state.cardHistory.slice(0, 10);
                
                recentHistory.forEach(item => {
                    const historyItem = document.createElement('div');
                    historyItem.classList.add('history-item');
                    historyItem.style.padding = '8px';
                    historyItem.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
                    historyItem.style.fontSize = '0.9em';
                    
                    // Add dealer or player class for styling
                    if (item.player === 'Dealer') {
                        historyItem.style.background = 'rgba(244, 67, 54, 0.1)';
                    } else {
                        historyItem.style.background = 'rgba(76, 175, 80, 0.1)';
                    }
                    
                    historyItem.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-weight: bold;">${item.player}</span>
                            <span>${item.card}</span>
                            <span style="color: ${item.value > 0 ? '#4CAF50' : item.value < 0 ? '#f44336' : '#fff'}">
                                ${item.value > 0 ? '+' + item.value : item.value}
                            </span>
                        </div>
                    `;
                    
                    historyList.appendChild(historyItem);
                });
            }
        }
        
        // Update the bet recommendation in the UI
        function updateBettingRecommendation() {
            // Get the recommended bet multiplier and amount
            const trueCount = parseFloat(calculateTrueCount());
            const { betMultiplier, recommendedBet } = calculateRecommendedBet();
            
            if (suggestedBetDisplay) {
                suggestedBetDisplay.textContent = `$${recommendedBet}`;
                
                // Add color based on bet size
                if (betMultiplier > 4) {
                    suggestedBetDisplay.style.color = '#4CAF50';
                } else if (betMultiplier > 1) {
                    suggestedBetDisplay.style.color = '#2196F3';
                } else {
                    suggestedBetDisplay.style.color = '#fff';
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
        
        // Initialize help panel tab functionality
        function initHelpPanelTabs() {
            const tabButtons = document.querySelectorAll('.help-tab-btn');
            const tabPanels = document.querySelectorAll('.help-tab-panel');
            
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.getAttribute('data-tab');
                    
                    // Remove active class from all buttons and panels
                    tabButtons.forEach(btn => {
                        btn.classList.remove('active');
                        btn.style.background = 'transparent';
                        btn.style.color = '#aaa';
                    });
                    
                    tabPanels.forEach(panel => {
                        panel.classList.remove('active');
                        panel.style.display = 'none';
                    });
                    
                    // Add active class to clicked button
                    button.classList.add('active');
                    button.style.background = 'rgba(255,215,0,0.2)';
                    button.style.color = '#FFD700';
                    
                    // Show corresponding panel
                    const targetPanel = document.getElementById(`${targetTab}-tab`);
                    if (targetPanel) {
                        targetPanel.classList.add('active');
                        targetPanel.style.display = 'block';
                    }
                });
            });
        }

        // Initialize everything
        createDeck();
        shuffleDeck();
        updateGameDisplay();
        updateControls();
        updateHelpPanel();
        initHelpPanelTabs(); // Initialize the new tab functionality
        
        // Initialize the app
        init();
    }
}); 