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
                testType: testResult.testType || 'performance', // 'performance' or 'speed'
                overallScore: Math.round(testResult.overallScore),
                strategyAccuracy: Math.round(testResult.strategyAccuracy),
                bettingAccuracy: Math.round(testResult.bettingAccuracy || 0),
                totalHands: testResult.totalHands,
                testDuration: testResult.testDuration,
                avgDecisionTime: testResult.avgDecisionTime,
                finalBalance: testResult.finalBalance || 0,
                startingBalance: testResult.startingBalance || 0,
                netGain: (testResult.finalBalance || 0) - (testResult.startingBalance || 0),
                correctHits: testResult.correctHits || 0,
                correctStands: testResult.correctStands || 0,
                correctDoubles: testResult.correctDoubles || 0,
                correctSplits: testResult.correctSplits || 0,
                bettingDecisions: testResult.bettingDecisions || 0,
                // Speed training specific fields
                correctDecisions: testResult.correctDecisions || 0,
                totalDecisions: testResult.totalDecisions || 0,
                timeouts: testResult.timeouts || 0,
                finalAccuracy: testResult.finalAccuracy || 0
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

            // Process achievements and gamification (if available)
            if (window.achievementsService?.initialized) {
                try {
                    const gamificationResult = await window.achievementsService.processTestResult(newScore);
                    console.log('Gamification processed:', gamificationResult);
                    
                    // Show achievement toasts for newly unlocked achievements
                    if (gamificationResult.newAchievements && gamificationResult.newAchievements.length > 0) {
                        gamificationResult.newAchievements.forEach((achievement, index) => {
                            setTimeout(() => {
                                if (typeof window.showAchievementToast === 'function') {
                                    window.showAchievementToast(achievement);
                                }
                            }, index * 500); // Stagger toasts
                        });
                    }
                } catch (achievementError) {
                    console.error('Error processing achievements:', achievementError);
                    // Don't fail the save if achievements fail
                }
            }

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
        const decisionTimes = scores.filter(s => s.avgDecisionTime > 0).map(s => s.avgDecisionTime);
        const personalBests = {
            // Averages for percentage-based metrics
            averageOverallScore: Math.round(scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length),
            averageStrategyAccuracy: Math.round(scores.reduce((sum, s) => sum + s.strategyAccuracy, 0) / scores.length),
            averageBettingAccuracy: Math.round(scores.reduce((sum, s) => sum + s.bettingAccuracy, 0) / scores.length),
            
            // Keep personal bests for other metrics
            highestOverallScore: Math.max(...scores.map(s => s.overallScore)),
            highestStrategyAccuracy: Math.max(...scores.map(s => s.strategyAccuracy)),
            highestBettingAccuracy: Math.max(...scores.map(s => s.bettingAccuracy)),
            mostHandsPlayed: Math.max(...scores.map(s => s.totalHands)),
            longestTestDuration: Math.max(...scores.map(s => s.testDuration)),
            fastestAvgDecisionTime: decisionTimes.length > 0 ? Math.min(...decisionTimes) : 0,
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
        return `${minutes}m ${remainingSeconds}s`;
    }

    // Get performance test results only
    async getPerformanceTestResults() {
        const allScores = await this.getHighScores();
        return allScores.filter(score => score.testType === 'performance' || !score.testType);
    }

    // Get speed training results only
    async getSpeedTrainingResults() {
        const allScores = await this.getHighScores();
        return allScores.filter(score => score.testType === 'speed');
    }

    // Get personal bests for speed training
    async getSpeedTrainingBests() {
        const speedScores = await this.getSpeedTrainingResults();
        
        if (speedScores.length === 0) return null;

        const decisionTimes = speedScores.filter(s => s.avgDecisionTime > 0).map(s => s.avgDecisionTime);
        const timeouts = speedScores.map(s => s.timeouts || 0);

        return {
            bestAccuracy: Math.max(...speedScores.map(s => s.finalAccuracy || s.overallScore || 0)),
            fastestAvgDecisionTime: decisionTimes.length > 0 ? Math.min(...decisionTimes) : 0,
            mostHandsPlayed: Math.max(...speedScores.map(s => s.totalHands || 0)),
            fewestTimeouts: timeouts.length > 0 ? Math.min(...timeouts) : 0,
            averageTimeouts: timeouts.reduce((sum, val) => sum + val, 0) / speedScores.length,
            averageAccuracy: speedScores.reduce((sum, s) => sum + (s.finalAccuracy || s.overallScore || 0), 0) / speedScores.length,
            totalSpeedTests: speedScores.length
        };
    }

    // Get speed training improvement trends
    async getSpeedTrainingTrends() {
        const speedScores = await this.getSpeedTrainingResults();
        
        if (speedScores.length < 5) return null; // Need at least 5 tests for trends

        // Sort by timestamp
        speedScores.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        const recent = speedScores.slice(-5);
        const older = speedScores.slice(0, -5);

        if (older.length === 0) return null;

        const recentAvg = {
            accuracy: recent.reduce((sum, s) => sum + (s.finalAccuracy || s.overallScore), 0) / recent.length,
            decisionTime: recent.reduce((sum, s) => sum + s.avgDecisionTime, 0) / recent.length,
            timeouts: recent.reduce((sum, s) => sum + s.timeouts, 0) / recent.length
        };

        const olderAvg = {
            accuracy: older.reduce((sum, s) => sum + (s.finalAccuracy || s.overallScore), 0) / older.length,
            decisionTime: older.reduce((sum, s) => sum + s.avgDecisionTime, 0) / older.length,
            timeouts: older.reduce((sum, s) => sum + s.timeouts, 0) / older.length
        };

        return {
            accuracyImprovement: recentAvg.accuracy - olderAvg.accuracy,
            decisionTimeImprovement: olderAvg.decisionTime - recentAvg.decisionTime, // Positive = faster
            timeoutImprovement: olderAvg.timeouts - recentAvg.timeouts, // Positive = fewer timeouts
            totalSpeedTests: speedScores.length
        };
    }
}

// Export singleton instance
window.highScoresManager = new HighScoresManager(); 