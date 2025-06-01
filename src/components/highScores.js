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
            
            // Create new score entry with minimal data to stay under 8KB limit
            const newScore = {
                // Use timestamp as ID to save space (remove separate ID field)
                ts: Date.now(), // Use timestamp number instead of ISO string to save space
                t: testResult.testType === 'speed' ? 's' : 'p', // 'p' for performance, 's' for speed
                os: Math.round(testResult.overallScore), // overall score
                sa: Math.round(testResult.strategyAccuracy), // strategy accuracy
                th: testResult.totalHands, // total hands
                td: Math.round(testResult.testDuration), // test duration (rounded to save space)
                adt: Math.round(testResult.avgDecisionTime * 10) / 10, // avg decision time (1 decimal)
                // Only store net balance for performance tests, and only if significant
                ...(testResult.testType !== 'speed' && Math.abs((testResult.finalBalance || 0) - (testResult.startingBalance || 0)) > 0 && {
                    nb: Math.round((testResult.finalBalance || 0) - (testResult.startingBalance || 0)) // net balance
                }),
                // Speed training specific fields (minimal set)
                ...(testResult.testType === 'speed' && {
                    cd: testResult.correctDecisions || 0, // correct decisions
                    to: testResult.timeouts || 0 // timeouts
                })
            };

            // Add to scores array
            currentScores.push(newScore);

            // Keep only the last 10 scores to stay well under 8KB limit (reduced from 20)
            if (currentScores.length > 10) {
                currentScores.splice(0, currentScores.length - 10);
            }

            // Debug: Log data size for monitoring
            const dataString = JSON.stringify(currentScores);
            const dataSize = new Blob([dataString]).size;
            console.log(`High scores data size: ${dataSize} bytes (${(dataSize/1024).toFixed(1)}KB)`);
            
            if (dataSize > 6000) { // Warn if approaching reasonable buffer under 8KB limit
                console.warn('High scores data approaching safe limit, reducing stored scores');
                // If still too large, keep only 5 most recent scores
                if (dataSize > 7000) {
                    currentScores.splice(0, currentScores.length - 5);
                    console.log(`Reduced to 5 scores. New size: ${JSON.stringify(currentScores).length} chars`);
                }
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
            // If save fails due to size, try with even fewer scores
            if (error.message && error.message.includes('8192 bytes')) {
                console.log('Attempting emergency save with minimal data...');
                try {
                    const currentScores = await this.getHighScores();
                    // Keep only the 3 most recent scores
                    const minimalScores = currentScores.slice(-3);
                    
                    await this.clerk.user.update({
                        unsafeMetadata: {
                            ...this.clerk.user.unsafeMetadata,
                            highScores: minimalScores
                        }
                    });
                    console.log('Emergency save successful with 3 scores');
                    return true;
                } catch (emergencyError) {
                    console.error('Emergency save also failed:', emergencyError);
                    return false;
                }
            }
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

        // Calculate personal bests with safe handling of missing fields
        const personalBests = {
            // Averages for percentage-based metrics
            averageOverallScore: Math.round(scores.reduce((sum, s) => sum + s.os, 0) / scores.length),
            averageStrategyAccuracy: Math.round(scores.reduce((sum, s) => sum + s.sa, 0) / scores.length),
            averageBettingAccuracy: 0, // No longer tracking betting accuracy separately
            
            // Keep personal bests for other metrics
            highestOverallScore: Math.max(...scores.map(s => s.os)),
            highestStrategyAccuracy: Math.max(...scores.map(s => s.sa)),
            highestBettingAccuracy: 0, // No longer tracking
            mostHandsPlayed: Math.max(...scores.map(s => s.th)),
            longestTestDuration: Math.max(...scores.map(s => s.td)),
            fastestAvgDecisionTime: Math.min(...scores.filter(s => s.adt > 0).map(s => s.adt)),
            highestNetGain: Math.max(...scores.filter(s => s.nb !== undefined).map(s => s.nb)),
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
            bettingAccuracyImprovement: 0, // No longer tracking betting accuracy
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
        
        if (testResult.totalHands > personalBests.mostHandsPlayed) {
            improvements.push('handsPlayed');
        }
        
        // Only check net gain for performance tests where we track it
        if (testResult.testType !== 'speed') {
            const netGain = (testResult.finalBalance || 0) - (testResult.startingBalance || 0);
            if (netGain > personalBests.highestNetGain) {
                improvements.push('netGain');
            }
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
            id: score.ts.toString(), // Use timestamp as ID
            timestamp: new Date(score.ts).toISOString(), // Convert timestamp back to ISO string
            testType: score.t === 's' ? 'speed' : 'performance',
            overallScore: score.os,
            strategyAccuracy: score.sa,
            bettingAccuracy: 0, // No longer stored separately
            totalHands: score.th,
            testDuration: score.td,
            avgDecisionTime: score.adt,
            netGain: score.nb || 0,
            // Speed training specific fields
            correctDecisions: score.cd || 0,
            totalDecisions: score.cd || 0, // Approximate since we don't store this anymore
            timeouts: score.to || 0
        };
    }
}

// Export singleton instance
window.highScoresManager = new HighScoresManager(); 