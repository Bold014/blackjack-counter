document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const deckSelect = document.getElementById('decks');
    const resetBtn = document.getElementById('reset-btn');
    const runningCountDisplay = document.getElementById('running-count');
    const trueCountDisplay = document.getElementById('true-count');
    const historyList = document.getElementById('history-list');
    const playerCard1 = document.getElementById('player-card1');
    const playerCard2 = document.getElementById('player-card2');
    const dealerCard = document.getElementById('dealer-card');
    const adviseBtn = document.getElementById('advise-btn');
    const adviceDisplay = document.getElementById('advice');
    const hitCardButtons = document.querySelectorAll('.hit-card-btn');
    const dealerHitCardButtons = document.querySelectorAll('.dealer-hit-card-btn');
    const additionalCardsContainer = document.getElementById('additional-cards');
    const dealerAdditionalCardsContainer = document.getElementById('dealer-additional-cards');
    const playerTotalValue = document.getElementById('player-total-value');
    const dealerTotalValue = document.getElementById('dealer-total-value');
    const resetHandBtn = document.getElementById('reset-hand-btn');

    // Card counting state
    let state = {
        runningCount: 0,
        trueCount: 0,
        cardsDealt: 0,
        cardHistory: [],
        additionalCards: [], // Track cards added after initial hand
        dealerAdditionalCards: [], // Track dealer additional cards
        currentHandCards: {
            player1: '',
            player2: '',
            dealer: '',
            additional: [],
            dealerAdditional: []
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

    // Card numerical values for hand calculation
    const cardNumericalValues = {
        '2': 2,
        '3': 3,
        '4': 4,
        '5': 5,
        '6': 6,
        '7': 7,
        '8': 8,
        '9': 9,
        '10': 10,
        'J': 10,
        'Q': 10,
        'K': 10,
        'A': 11
    };

    // Initialize the app
    function init() {
        updateCountDisplay();
        bindEvents();
    }

    // Bind event listeners
    function bindEvents() {
        // Reset button
        resetBtn.addEventListener('click', resetCount);

        // Deck select
        deckSelect.addEventListener('change', updateTrueCount);

        // Advice button
        adviseBtn.addEventListener('click', provideAdvice);
        
        // Player hit card buttons
        hitCardButtons.forEach(button => {
            button.addEventListener('click', () => {
                const card = button.getAttribute('data-value');
                addHitCard(card);
            });
        });
        
        // Dealer hit card buttons
        dealerHitCardButtons.forEach(button => {
            button.addEventListener('click', () => {
                const card = button.getAttribute('data-value');
                addDealerHitCard(card);
            });
        });
        
        // Reset hand button
        resetHandBtn.addEventListener('click', resetHand);
        
        // Card selection changes - adding to count
        playerCard1.addEventListener('change', () => {
            updateCardSelection('player1', playerCard1.value);
            updateDisplays();
        });
        
        playerCard2.addEventListener('change', () => {
            updateCardSelection('player2', playerCard2.value);
            updateDisplays();
        });
        
        dealerCard.addEventListener('change', () => {
            updateCardSelection('dealer', dealerCard.value);
            updateDisplays();
        });
    }
    
    // Update card selection and adjust count
    function updateCardSelection(position, newCard) {
        const oldCard = state.currentHandCards[position];
        
        // We're only removing the UI association between position and card
        // Don't remove the card from count or history when changing selection
        
        // Add new card to count if it's valid
        if (newCard) {
            const countValue = cardValues[newCard];
            state.runningCount += countValue;
            state.cardsDealt++;
            
            // Add to history
            state.cardHistory.unshift({
                card: newCard,
                value: countValue,
                position: position,
                timestamp: new Date().toLocaleTimeString()
            });
        }
        
        // Store the current card
        state.currentHandCards[position] = newCard;
        
        // Update displays
        updateCountDisplay();
        updateCardHistory();
    }

    // Add a hit card to the player's hand
    function addHitCard(card) {
        // Add card to additional cards array
        state.additionalCards.push(card);
        
        // Add the card to the count
        const countValue = cardValues[card];
        state.runningCount += countValue;
        state.cardsDealt++;
        
        // Generate a unique position ID for this additional card
        const position = `additional_${Date.now()}`;
        
        // Add to history
        state.cardHistory.unshift({
            card: card,
            value: countValue,
            position: position,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Store in current hand cards
        state.currentHandCards.additional.push({
            card: card,
            position: position
        });
        
        // Display the new card
        updateAdditionalCards();
        
        // Update player's hand total
        updatePlayerTotal();
        
        // Update count displays
        updateCountDisplay();
        updateCardHistory();
        
        // Automatically update advice
        provideAdvice();
    }
    
    // Add a hit card to the dealer's hand
    function addDealerHitCard(card) {
        // Check if dealer upcard is set
        if (!dealerCard.value) {
            alert('Please select a dealer upcard first');
            return;
        }
        
        // Add card to dealer's additional cards array
        state.dealerAdditionalCards.push(card);
        
        // Add the card to the count
        const countValue = cardValues[card];
        state.runningCount += countValue;
        state.cardsDealt++;
        
        // Generate a unique position ID for this dealer additional card
        const position = `dealer_additional_${Date.now()}`;
        
        // Add to history
        state.cardHistory.unshift({
            card: card,
            value: countValue,
            position: position,
            timestamp: new Date().toLocaleTimeString()
        });
        
        // Store in current hand cards
        state.currentHandCards.dealerAdditional.push({
            card: card,
            position: position
        });
        
        // Display the new card
        updateDealerAdditionalCards();
        
        // Update dealer's hand total
        updateDealerTotal();
        
        // Update count displays
        updateCountDisplay();
        updateCardHistory();
    }
    
    // Update dealer's additional cards display
    function updateDealerAdditionalCards() {
        dealerAdditionalCardsContainer.innerHTML = '';
        
        state.dealerAdditionalCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card-display');
            cardElement.textContent = card;
            dealerAdditionalCardsContainer.appendChild(cardElement);
        });
    }
    
    // Calculate dealer's hand value
    function calculateDealerHandValue() {
        const dealerCards = [dealerCard.value, ...state.dealerAdditionalCards].filter(Boolean);
        return calculateHandValue(dealerCards);
    }
    
    // Update dealer's hand total value display
    function updateDealerTotal() {
        const total = calculateDealerHandValue();
        dealerTotalValue.textContent = total;
        
        // Add color based on hand value
        if (total === 21) {
            dealerTotalValue.style.color = 'var(--success-color)';
        } else if (total > 21) {
            dealerTotalValue.style.color = 'var(--warning-color)';
        } else {
            dealerTotalValue.style.color = 'var(--secondary-color)';
        }
    }
    
    // Update additional cards display
    function updateAdditionalCards() {
        additionalCardsContainer.innerHTML = '';
        
        state.additionalCards.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('card-display');
            cardElement.textContent = card;
            additionalCardsContainer.appendChild(cardElement);
        });
    }
    
    // Update player's hand total value display
    function updatePlayerTotal() {
        const card1 = playerCard1.value;
        const card2 = playerCard2.value;
        
        if (card1 && card2) {
            const allCards = [card1, card2, ...state.additionalCards];
            const total = calculateHandValue(allCards);
            playerTotalValue.textContent = total;
            
            // Add color based on hand value
            if (total === 21) {
                playerTotalValue.style.color = 'var(--success-color)';
            } else if (total > 21) {
                playerTotalValue.style.color = 'var(--warning-color)';
            } else {
                playerTotalValue.style.color = 'var(--secondary-color)';
            }
        } else {
            playerTotalValue.textContent = '0';
            playerTotalValue.style.color = 'var(--secondary-color)';
        }
    }
    
    // Reset the current hand but keep the count
    function resetHand() {
        // DO NOT remove cards from count or history
        // Just clear the visual display and state for the next hand
        
        // Clear additional cards arrays (but don't change count)
        state.additionalCards = [];
        state.currentHandCards.additional = [];
        state.dealerAdditionalCards = [];
        state.currentHandCards.dealerAdditional = [];
        
        // Reset current hand cards (but don't change count)
        state.currentHandCards.player1 = '';
        state.currentHandCards.player2 = '';
        state.currentHandCards.dealer = '';
        
        // Reset dropdowns
        playerCard1.value = '';
        playerCard2.value = '';
        dealerCard.value = '';
        
        // Clear display of additional cards
        additionalCardsContainer.innerHTML = '';
        dealerAdditionalCardsContainer.innerHTML = '';
        
        // Reset advice
        adviceDisplay.textContent = 'Waiting for input...';
        adviceDisplay.className = 'advice';
        
        // Reset player total
        playerTotalValue.textContent = '0';
        playerTotalValue.style.color = 'var(--secondary-color)';
        
        // Reset dealer total
        dealerTotalValue.textContent = '0';
        dealerTotalValue.style.color = 'var(--secondary-color)';
    }
    
    // Update all displays
    function updateDisplays() {
        updatePlayerTotal();
        updateDealerTotal();
    }

    // Update the count displays
    function updateCountDisplay() {
        runningCountDisplay.textContent = state.runningCount;
        updateTrueCount();
        
        // Add color based on count
        if (state.runningCount > 0) {
            runningCountDisplay.style.color = 'var(--success-color)';
        } else if (state.runningCount < 0) {
            runningCountDisplay.style.color = 'var(--warning-color)';
        } else {
            runningCountDisplay.style.color = 'var(--light-color)';
        }
        
        if (state.trueCount > 0) {
            trueCountDisplay.style.color = 'var(--success-color)';
        } else if (state.trueCount < 0) {
            trueCountDisplay.style.color = 'var(--warning-color)';
        } else {
            trueCountDisplay.style.color = 'var(--light-color)';
        }
    }

    // Update the true count
    function updateTrueCount() {
        const decks = parseInt(deckSelect.value);
        const remainingDecks = Math.max(decks - (state.cardsDealt / 52), 0.5);
        state.trueCount = Math.round((state.runningCount / remainingDecks) * 10) / 10;
        trueCountDisplay.textContent = state.trueCount.toFixed(1);
    }

    // Update the card history display
    function updateCardHistory() {
        historyList.innerHTML = '';
        
        // Show only the last 20 cards
        const recentHistory = state.cardHistory.slice(0, 20);
        
        recentHistory.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            
            const cardSpan = document.createElement('span');
            cardSpan.textContent = `Card: ${item.card}`;
            
            const valueSpan = document.createElement('span');
            valueSpan.textContent = `Count: ${item.value > 0 ? '+' + item.value : item.value}`;
            
            const timeSpan = document.createElement('span');
            timeSpan.textContent = item.timestamp;
            
            historyItem.appendChild(cardSpan);
            historyItem.appendChild(valueSpan);
            historyItem.appendChild(timeSpan);
            
            historyList.appendChild(historyItem);
        });
    }

    // Reset the count (full reset of everything)
    function resetCount() {
        // Reset all state values to initial
        state = {
            runningCount: 0,
            trueCount: 0,
            cardsDealt: 0,
            cardHistory: [],
            additionalCards: [],
            dealerAdditionalCards: [],
            currentHandCards: {
                player1: '',
                player2: '',
                dealer: '',
                additional: [],
                dealerAdditional: []
            }
        };
        
        // Clear UI elements
        playerCard1.value = '';
        playerCard2.value = '';
        dealerCard.value = '';
        additionalCardsContainer.innerHTML = '';
        dealerAdditionalCardsContainer.innerHTML = '';
        
        // Reset player and dealer totals
        playerTotalValue.textContent = '0';
        playerTotalValue.style.color = 'var(--secondary-color)';
        dealerTotalValue.textContent = '0';
        dealerTotalValue.style.color = 'var(--secondary-color)';
        
        // Reset advice
        adviceDisplay.textContent = 'Waiting for input...';
        adviceDisplay.className = 'advice';
        
        // Update displays
        updateCountDisplay();
        updateCardHistory();
    }

    // Calculate hand value
    function calculateHandValue(cards) {
        let sum = 0;
        let aceCount = 0;
        
        cards.forEach(card => {
            if (card === 'A') {
                aceCount++;
            }
            sum += cardNumericalValues[card];
        });
        
        // Adjust for aces
        while (sum > 21 && aceCount > 0) {
            sum -= 10;
            aceCount--;
        }
        
        return sum;
    }

    // Check if the hand is a pair
    function isPair(cards) {
        return cards.length === 2 && cards[0] === cards[1];
    }

    // Check if the hand is soft (contains an Ace counted as 11)
    function isSoft(cards) {
        return cards.includes('A') && calculateHandValue(cards) <= 21;
    }

    // Provide advice based on basic strategy and count
    function provideAdvice() {
        const player1 = playerCard1.value;
        const player2 = playerCard2.value;
        const dealer = dealerCard.value;
        
        // Validate input
        if (!player1 || !player2 || !dealer) {
            adviceDisplay.textContent = 'Please select all cards';
            adviceDisplay.className = 'advice';
            return;
        }
        
        // All cards in the player's hand
        const playerCards = [player1, player2, ...state.additionalCards];
        const playerValue = calculateHandValue(playerCards);
        
        let advice = '';
        
        // Check for bust
        if (playerValue > 21) {
            advice = 'Bust!';
            adviceDisplay.className = 'advice stand';
            adviceDisplay.textContent = advice;
            return;
        }
        
        // Check for blackjack with exactly 2 cards
        if (playerValue === 21 && playerCards.length === 2) {
            advice = 'Blackjack! Stand';
            adviceDisplay.className = 'advice stand';
            adviceDisplay.textContent = advice;
            return;
        }
        
        // Check for 21 with more than 2 cards
        if (playerValue === 21) {
            advice = 'You have 21! Stand';
            adviceDisplay.className = 'advice stand';
            adviceDisplay.textContent = advice;
            return;
        }
        
        // If we have more than 2 cards, we're in the middle of a hand
        if (playerCards.length > 2) {
            advice = getHitAdvice(playerValue, dealer);
        } 
        // Initial hand with exactly 2 cards
        else {
            // Check for pair
            if (isPair(playerCards)) {
                advice = getPairAdvice(player1, dealer);
            } 
            // Check for soft hand
            else if (isSoft(playerCards)) {
                advice = getSoftHandAdvice(playerValue, dealer);
            } 
            // Hard hand
            else {
                advice = getHardHandAdvice(playerValue, dealer);
            }
        }
        
        // Modify advice based on true count if relevant
        advice = adjustAdviceBasedOnCount(advice, state.trueCount);
        
        // Display advice
        adviceDisplay.textContent = advice;
        
        // Apply styling
        adviceDisplay.className = 'advice';
        if (advice.includes('Hit')) {
            adviceDisplay.classList.add('hit');
        } else if (advice.includes('Stand')) {
            adviceDisplay.classList.add('stand');
        } else if (advice.includes('Double')) {
            adviceDisplay.classList.add('double');
        } else if (advice.includes('Split')) {
            adviceDisplay.classList.add('split');
        }
    }
    
    // Get advice for hands in progress (after hitting)
    function getHitAdvice(playerValue, dealerCard) {
        const dealerValue = cardNumericalValues[dealerCard];
        
        // Simplified strategy for hands after hitting
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
        } else {
            return 'Hit';
        }
    }

    // Get advice for pair hands
    function getPairAdvice(card, dealerCard) {
        const dealerValue = cardNumericalValues[dealerCard];
        
        switch(card) {
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

    // Get advice for soft hands (hands with an Ace)
    function getSoftHandAdvice(playerValue, dealerCard) {
        const dealerValue = cardNumericalValues[dealerCard];
        
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
    function getHardHandAdvice(playerValue, dealerCard) {
        const dealerValue = cardNumericalValues[dealerCard];
        
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

    // Adjust advice based on the true count
    function adjustAdviceBasedOnCount(advice, trueCount) {
        // If the player has more than 2 cards, don't apply most count-based adjustments
        const hasAdditionalCards = state.additionalCards.length > 0;
        
        // Insurance is always relevant
        if (dealerCard.value === 'A' && trueCount >= 3) {
            return 'Take Insurance, ' + advice;
        }
        
        // After hitting, use more conservative adjustments
        if (hasAdditionalCards) {
            return advice;
        }
        
        // These apply only to initial 2-card hands
        const playerCards = [playerCard1.value, playerCard2.value];
        const playerValue = calculateHandValue(playerCards);
        
        // Stand on 16 vs 10 if count is high
        if (playerValue === 16 && 
            cardNumericalValues[dealerCard.value] === 10 && 
            trueCount >= 0) {
            return 'Stand (due to count)';
        }
        
        // Stand on 15 vs 10 if count is very high
        if (playerValue === 15 && 
            cardNumericalValues[dealerCard.value] === 10 && 
            trueCount >= 4) {
            return 'Stand (due to count)';
        }
        
        // More aggressive doubling when count is high
        if (advice.includes('Hit') && 
            playerValue >= 9 && 
            playerValue <= 11 && 
            trueCount >= 3) {
            return 'Double if allowed (due to count), otherwise ' + advice;
        }
        
        return advice;
    }

    // Initialize the app
    init();
}); 