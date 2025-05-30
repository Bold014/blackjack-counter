// High Scores Management System
// This module handles saving, retrieving, and analyzing player performance data

class HighScoresManager {
    constructor() {
        this.clerk = null;
        this.initialized = false;
    }

    async initialize(clerkInstance) {
        this.clerk = clerkInstance;
        this.initialized = true;
    }

    // Save a new test result as a high score
    async saveTestResult(testResult) {
        if (!this.initialized || !this.clerk?.user) {
            console.error('HighScoresManager not initialized or user not authenticated');
            return false;
        }

        try {
            // Get current high scores from user metadata
            const currentScores = await this.getHighScores();
            
            // Create new score entry
            const newScore = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                overallScore: Math.round(testResult.overallScore),
                strategyAccuracy: Math.round(testResult.strategyAccuracy),
                bettingAccuracy: Math.round(testResult.bettingAccuracy),
                totalHands: testResult.totalHands,
                testDuration: testResult.testDuration,
                avgDecisionTime: testResult.avgDecisionTime,
                finalBalance: testResult.finalBalance,
                startingBalance: testResult.startingBalance,
                netGain: testResult.finalBalance - testResult.startingBalance,
                correctHits: testResult.correctHits,
                correctStands: testResult.correctStands,
                correctDoubles: testResult.correctDoubles,
                correctSplits: testResult.correctSplits,
                bettingDecisions: testResult.bettingDecisions
            };

            // Add to scores array
            currentScores.push(newScore);

            // Keep only the last 50 scores to prevent metadata from getting too large
            if (currentScores.length > 50) {
                currentScores.splice(0, currentScores.length - 50);
            }

            // Update user metadata
            await this.clerk.user.update({
                unsafeMetadata: {
                    ...this.clerk.user.unsafeMetadata,
                    highScores: currentScores
                }
            });

            return true;
        } catch (error) {
            console.error('Error saving test result:', error);
            return false;
        }
    }

    // Get all high scores for the current user
    async getHighScores() {
        if (!this.initialized || !this.clerk?.user) {
            return [];
        }

        try {
            const metadata = this.clerk.user.unsafeMetadata;
            return metadata?.highScores || [];
        } catch (error) {
            console.error('Error retrieving high scores:', error);
            return [];
        }
    }

    // Get user's personal best scores
    async getPersonalBests() {
        const scores = await this.getHighScores();
        
        if (scores.length === 0) {
            return null;
        }

        // Calculate personal bests
        const personalBests = {
            highestOverallScore: Math.max(...scores.map(s => s.overallScore)),
            highestStrategyAccuracy: Math.max(...scores.map(s => s.strategyAccuracy)),
            highestBettingAccuracy: Math.max(...scores.map(s => s.bettingAccuracy)),
            mostHandsPlayed: Math.max(...scores.map(s => s.totalHands)),
            longestTestDuration: Math.max(...scores.map(s => s.testDuration)),
            fastestAvgDecisionTime: Math.min(...scores.filter(s => s.avgDecisionTime > 0).map(s => s.avgDecisionTime)),
            highestNetGain: Math.max(...scores.map(s => s.netGain)),
            totalTestsCompleted: scores.length
        };

        return personalBests;
    }

    // Get improvement trends
    async getImprovementTrends() {
        const scores = await this.getHighScores();
        
        if (scores.length < 2) {
            return null;
        }

        // Sort by timestamp
        scores.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Calculate trends for the last 10 tests vs first 10 tests
        const recentTests = scores.slice(-10);
        const earlyTests = scores.slice(0, 10);

        const calculateAverage = (testArray, field) => {
            return testArray.reduce((sum, test) => sum + test[field], 0) / testArray.length;
        };

        const trends = {
            overallScoreImprovement: calculateAverage(recentTests, 'overallScore') - calculateAverage(earlyTests, 'overallScore'),
            strategyAccuracyImprovement: calculateAverage(recentTests, 'strategyAccuracy') - calculateAverage(earlyTests, 'strategyAccuracy'),
            bettingAccuracyImprovement: calculateAverage(recentTests, 'bettingAccuracy') - calculateAverage(earlyTests, 'bettingAccuracy'),
            decisionTimeImprovement: calculateAverage(earlyTests, 'avgDecisionTime') - calculateAverage(recentTests, 'avgDecisionTime'), // Lower is better
            recentAvgScore: calculateAverage(recentTests, 'overallScore'),
            earlyAvgScore: calculateAverage(earlyTests, 'overallScore'),
            totalTestsCount: scores.length
        };

        return trends;
    }

    // Get recent test history (last 10 tests)
    async getRecentHistory() {
        const scores = await this.getHighScores();
        
        // Sort by timestamp (newest first)
        scores.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        return scores.slice(0, 10);
    }

    // Check if current score is a new personal best
    async isNewPersonalBest(testResult) {
        const personalBests = await this.getPersonalBests();
        
        if (!personalBests) {
            return {
                isNewBest: true,
                improvements: ['firstTest']
            };
        }

        const improvements = [];
        
        if (Math.round(testResult.overallScore) > personalBests.highestOverallScore) {
            improvements.push('overallScore');
        }
        
        if (Math.round(testResult.strategyAccuracy) > personalBests.highestStrategyAccuracy) {
            improvements.push('strategyAccuracy');
        }
        
        if (Math.round(testResult.bettingAccuracy) > personalBests.highestBettingAccuracy) {
            improvements.push('bettingAccuracy');
        }
        
        if (testResult.totalHands > personalBests.mostHandsPlayed) {
            improvements.push('handsPlayed');
        }
        
        if (testResult.finalBalance - testResult.startingBalance > personalBests.highestNetGain) {
            improvements.push('netGain');
        }

        if (testResult.avgDecisionTime > 0 && testResult.avgDecisionTime < personalBests.fastestAvgDecisionTime) {
            improvements.push('decisionTime');
        }

        return {
            isNewBest: improvements.length > 0,
            improvements
        };
    }

    // Format timestamp for display
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    // Format duration for display
    formatDuration(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
}

// Export singleton instance
window.highScoresManager = new HighScoresManager(); 