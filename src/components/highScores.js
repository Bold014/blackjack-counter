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
            
            // Create new score entry with compact field names and essential data only
            const newScore = {
                id: Date.now().toString(),
                ts: new Date().toISOString(),
                t: testResult.testType === 'speed' ? 's' : 'p', // 'p' for performance, 's' for speed
                os: Math.round(testResult.overallScore), // overall score
                sa: Math.round(testResult.strategyAccuracy), // strategy accuracy
                ba: Math.round(testResult.bettingAccuracy || 0), // betting accuracy
                th: testResult.totalHands, // total hands
                td: testResult.testDuration, // test duration
                adt: Math.round((testResult.avgDecisionTime || 0) * 100) / 100, // avg decision time
                nb: (testResult.finalBalance || 0) - (testResult.startingBalance || 0), // net balance (gain/loss)
                // Speed training specific fields (only store if speed test)
                ...(testResult.testType === 'speed' && {
                    cd: testResult.correctDecisions || 0, // correct decisions
                    tde: testResult.totalDecisions || 0, // total decisions
                    to: testResult.timeouts || 0 // timeouts
                })
            };

            // Add to scores array
            currentScores.push(newScore);

            // Keep only the last 20 scores to prevent metadata from getting too large (reduced from 50)
            if (currentScores.length > 20) {
                currentScores.splice(0, currentScores.length - 20);
            }

            // Debug: Log data size for monitoring
            const dataString = JSON.stringify(currentScores);
            const dataSize = new Blob([dataString]).size;
            console.log(`High scores data size: ${dataSize} bytes (${(dataSize/1024).toFixed(1)}KB)`);
            
            if (dataSize > 7000) { // Warn if approaching 8KB limit
                console.warn('High scores data approaching 8KB limit');
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
            // Averages for percentage-based metrics
            averageOverallScore: Math.round(scores.reduce((sum, s) => sum + s.os, 0) / scores.length),
            averageStrategyAccuracy: Math.round(scores.reduce((sum, s) => sum + s.sa, 0) / scores.length),
            averageBettingAccuracy: Math.round(scores.reduce((sum, s) => sum + s.ba, 0) / scores.length),
            
            // Keep personal bests for other metrics
            highestOverallScore: Math.max(...scores.map(s => s.os)),
            highestStrategyAccuracy: Math.max(...scores.map(s => s.sa)),
            highestBettingAccuracy: Math.max(...scores.map(s => s.ba)),
            mostHandsPlayed: Math.max(...scores.map(s => s.th)),
            longestTestDuration: Math.max(...scores.map(s => s.td)),
            fastestAvgDecisionTime: Math.min(...scores.filter(s => s.adt > 0).map(s => s.adt)),
            highestNetGain: Math.max(...scores.map(s => s.nb)),
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
        scores.sort((a, b) => new Date(a.ts) - new Date(b.ts));

        // Calculate trends for the last 10 tests vs first 10 tests
        const recentTests = scores.slice(-10);
        const earlyTests = scores.slice(0, 10);

        const calculateAverage = (testArray, field) => {
            return testArray.reduce((sum, test) => sum + test[field], 0) / testArray.length;
        };

        const trends = {
            overallScoreImprovement: calculateAverage(recentTests, 'os') - calculateAverage(earlyTests, 'os'),
            strategyAccuracyImprovement: calculateAverage(recentTests, 'sa') - calculateAverage(earlyTests, 'sa'),
            bettingAccuracyImprovement: calculateAverage(recentTests, 'ba') - calculateAverage(earlyTests, 'ba'),
            decisionTimeImprovement: calculateAverage(earlyTests, 'adt') - calculateAverage(recentTests, 'adt'), // Lower is better
            recentAvgScore: calculateAverage(recentTests, 'os'),
            earlyAvgScore: calculateAverage(earlyTests, 'os'),
            totalTestsCount: scores.length
        };

        return trends;
    }

    // Get recent test history (last 10 tests)
    async getRecentHistory() {
        const scores = await this.getHighScores();
        
        // Sort by timestamp (newest first)
        scores.sort((a, b) => new Date(b.ts) - new Date(a.ts));
        
        // Return expanded scores for compatibility
        return scores.slice(0, 10).map(score => this.expandScore(score));
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
        
        if (Math.round(testResult.bettingAccuracy || 0) > personalBests.highestBettingAccuracy) {
            improvements.push('bettingAccuracy');
        }
        
        if (testResult.totalHands > personalBests.mostHandsPlayed) {
            improvements.push('handsPlayed');
        }
        
        const netGain = (testResult.finalBalance || 0) - (testResult.startingBalance || 0);
        if (netGain > personalBests.highestNetGain) {
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
        return allScores.filter(score => score.t === 'p' || !score.t);
    }

    // Get speed training results only
    async getSpeedTrainingResults() {
        const allScores = await this.getHighScores();
        return allScores.filter(score => score.t === 's');
    }

    // Get personal bests for speed training
    async getSpeedTrainingBests() {
        const speedScores = await this.getSpeedTrainingResults();
        
        if (speedScores.length === 0) return null;

        return {
            bestAccuracy: Math.max(...speedScores.map(s => s.os)),
            fastestAvgDecisionTime: Math.min(...speedScores.map(s => s.adt)),
            mostHandsPlayed: Math.max(...speedScores.map(s => s.th)),
            fewestTimeouts: Math.min(...speedScores.map(s => s.to)),
            averageTimeouts: speedScores.reduce((sum, s) => sum + s.to, 0) / speedScores.length,
            averageAccuracy: speedScores.reduce((sum, s) => sum + s.os, 0) / speedScores.length,
            totalSpeedTests: speedScores.length
        };
    }

    // Get speed training improvement trends
    async getSpeedTrainingTrends() {
        const speedScores = await this.getSpeedTrainingResults();
        
        if (speedScores.length < 5) return null; // Need at least 5 tests for trends

        // Sort by timestamp
        speedScores.sort((a, b) => new Date(a.ts) - new Date(b.ts));

        const recent = speedScores.slice(-5);
        const older = speedScores.slice(0, -5);

        if (older.length === 0) return null;

        const recentAvg = {
            accuracy: recent.reduce((sum, s) => sum + s.os, 0) / recent.length,
            decisionTime: recent.reduce((sum, s) => sum + s.adt, 0) / recent.length,
            timeouts: recent.reduce((sum, s) => sum + s.to, 0) / recent.length
        };

        const olderAvg = {
            accuracy: older.reduce((sum, s) => sum + s.os, 0) / older.length,
            decisionTime: older.reduce((sum, s) => sum + s.adt, 0) / older.length,
            timeouts: older.reduce((sum, s) => sum + s.to, 0) / older.length
        };

        return {
            accuracyImprovement: recentAvg.accuracy - olderAvg.accuracy,
            decisionTimeImprovement: olderAvg.decisionTime - recentAvg.decisionTime, // Positive = faster
            timeoutImprovement: olderAvg.timeouts - recentAvg.timeouts, // Positive = fewer timeouts
            totalSpeedTests: speedScores.length
        };
    }

    // Convert compact score format back to readable format for display
    expandScore(score) {
        return {
            id: score.id,
            timestamp: score.ts,
            testType: score.t === 's' ? 'speed' : 'performance',
            overallScore: score.os,
            strategyAccuracy: score.sa,
            bettingAccuracy: score.ba,
            totalHands: score.th,
            testDuration: score.td,
            avgDecisionTime: score.adt,
            netGain: score.nb,
            // Speed training specific fields
            correctDecisions: score.cd,
            totalDecisions: score.tde,
            timeouts: score.to
        };
    }
}

// Export singleton instance
window.highScoresManager = new HighScoresManager(); 