// Gamification & Achievements Service
// Handles XP, levels, badges, streaks, and player progression

class AchievementsService {
    constructor() {
        this.clerk = null;
        this.initialized = false;
        
        // XP and Level Configuration
        this.xpPerLevel = 100; // Base XP needed for level 1
        this.levelMultiplier = 1.5; // Each level requires 1.5x more XP
        this.maxLevel = 50;
        
        // XP Rewards
        this.xpRewards = {
            performanceTest: 20,
            speedTest: 15,
            perfectHand: 5,
            correctDecision: 1,
            dailyLogin: 10,
            weeklyGoalComplete: 50,
            badgeUnlock: 25
        };
        
        // Define all achievements/badges
        this.achievements = this.defineAchievements();
    }

    async initialize(clerkInstance) {
        this.clerk = clerkInstance;
        this.initialized = true;
        
        // Check and update daily streak
        await this.updateDailyStreak();
    }

    // Define all available achievements
    defineAchievements() {
        return [
            // Speed achievements
            {
                id: 'speed_demon_bronze',
                name: 'Speed Demon',
                tier: 'Bronze',
                description: '52 cards under 60 seconds',
                icon: 'fa-bolt',
                category: 'speed',
                requirement: { type: 'speed_time', value: 60, hands: 52 },
                color: '#CD7F32'
            },
            {
                id: 'speed_demon_silver',
                name: 'Speed Demon',
                tier: 'Silver',
                description: '52 cards under 45 seconds',
                icon: 'fa-bolt',
                category: 'speed',
                requirement: { type: 'speed_time', value: 45, hands: 52 },
                color: '#C0C0C0'
            },
            {
                id: 'speed_demon_gold',
                name: 'Speed Demon',
                tier: 'Gold',
                description: '52 cards under 35 seconds',
                icon: 'fa-bolt',
                category: 'speed',
                requirement: { type: 'speed_time', value: 35, hands: 52 },
                color: '#FFD700'
            },
            
            // Accuracy achievements
            {
                id: 'accuracy_ace_bronze',
                name: 'Accuracy Ace',
                tier: 'Bronze',
                description: '98% accuracy over 200+ cards',
                icon: 'fa-bullseye',
                category: 'accuracy',
                requirement: { type: 'accuracy', value: 98, minDecisions: 200 },
                color: '#CD7F32'
            },
            {
                id: 'accuracy_ace_silver',
                name: 'Accuracy Ace',
                tier: 'Silver',
                description: '99% accuracy over 200+ cards',
                icon: 'fa-bullseye',
                category: 'accuracy',
                requirement: { type: 'accuracy', value: 99, minDecisions: 200 },
                color: '#C0C0C0'
            },
            {
                id: 'accuracy_ace_gold',
                name: 'Accuracy Ace',
                tier: 'Gold',
                description: '99.5% accuracy over 200+ cards',
                icon: 'fa-bullseye',
                category: 'accuracy',
                requirement: { type: 'accuracy', value: 99.5, minDecisions: 200 },
                color: '#FFD700'
            },
            
            // Streak achievements
            {
                id: 'stone_cold_bronze',
                name: 'Stone Cold',
                tier: 'Bronze',
                description: '100 correct decisions in a row',
                icon: 'fa-fire',
                category: 'streak',
                requirement: { type: 'correct_streak', value: 100 },
                color: '#CD7F32'
            },
            {
                id: 'stone_cold_silver',
                name: 'Stone Cold',
                tier: 'Silver',
                description: '250 correct decisions in a row',
                icon: 'fa-fire',
                category: 'streak',
                requirement: { type: 'correct_streak', value: 250 },
                color: '#C0C0C0'
            },
            {
                id: 'stone_cold_gold',
                name: 'Stone Cold',
                tier: 'Gold',
                description: '500 correct decisions in a row',
                icon: 'fa-fire',
                category: 'streak',
                requirement: { type: 'correct_streak', value: 500 },
                color: '#FFD700'
            },
            
            // Endurance achievements
            {
                id: 'endurer_bronze',
                name: 'Endurer',
                tier: 'Bronze',
                description: '15 min session, ≤3 errors every 10 min',
                icon: 'fa-dumbbell',
                category: 'endurance',
                requirement: { type: 'session_duration', value: 900, maxErrorRate: 0.3 },
                color: '#CD7F32'
            },
            {
                id: 'endurer_silver',
                name: 'Endurer',
                tier: 'Silver',
                description: '30 min session, ≤3 errors every 10 min',
                icon: 'fa-dumbbell',
                category: 'endurance',
                requirement: { type: 'session_duration', value: 1800, maxErrorRate: 0.3 },
                color: '#C0C0C0'
            },
            {
                id: 'endurer_gold',
                name: 'Endurer',
                tier: 'Gold',
                description: '60 min session, ≤3 errors every 10 min',
                icon: 'fa-dumbbell',
                category: 'endurance',
                requirement: { type: 'session_duration', value: 3600, maxErrorRate: 0.3 },
                color: '#FFD700'
            },
            
            // Session achievements
            {
                id: 'perfect_session',
                name: 'Perfect Session',
                tier: 'Special',
                description: 'Complete a session with no errors',
                icon: 'fa-star',
                category: 'special',
                requirement: { type: 'perfect_session', value: 1 },
                color: '#FF69B4'
            },
            {
                id: 'comeback_kid',
                name: 'Comeback Kid',
                tier: 'Special',
                description: 'Recover from an error with 30 perfect after',
                icon: 'fa-phoenix-squadron',
                category: 'special',
                requirement: { type: 'comeback', value: 30 },
                color: '#FF6B6B'
            },
            
            // Consistency achievements
            {
                id: 'weekly_warrior_bronze',
                name: 'Weekly Warrior',
                tier: 'Bronze',
                description: 'Complete all weekly goals once',
                icon: 'fa-trophy',
                category: 'consistency',
                requirement: { type: 'weekly_goals', value: 1 },
                color: '#CD7F32'
            },
            {
                id: 'weekly_warrior_silver',
                name: 'Weekly Warrior',
                tier: 'Silver',
                description: 'Complete all weekly goals 4 times',
                icon: 'fa-trophy',
                category: 'consistency',
                requirement: { type: 'weekly_goals', value: 4 },
                color: '#C0C0C0'
            },
            {
                id: 'weekly_warrior_gold',
                name: 'Weekly Warrior',
                tier: 'Gold',
                description: 'Complete all weekly goals 12 times',
                icon: 'fa-trophy',
                category: 'consistency',
                requirement: { type: 'weekly_goals', value: 12 },
                color: '#FFD700'
            },
            
            // Daily streak achievements
            {
                id: 'dedication_week',
                name: 'Dedicated',
                tier: 'Bronze',
                description: '7 day login streak',
                icon: 'fa-calendar-check',
                category: 'streak',
                requirement: { type: 'daily_streak', value: 7 },
                color: '#CD7F32'
            },
            {
                id: 'dedication_fortnight',
                name: 'Committed',
                tier: 'Silver',
                description: '14 day login streak',
                icon: 'fa-calendar-check',
                category: 'streak',
                requirement: { type: 'daily_streak', value: 14 },
                color: '#C0C0C0'
            },
            {
                id: 'dedication_month',
                name: 'Unstoppable',
                tier: 'Gold',
                description: '30 day login streak',
                icon: 'fa-calendar-check',
                category: 'streak',
                requirement: { type: 'daily_streak', value: 30 },
                color: '#FFD700'
            }
        ];
    }

    // Get user's gamification data
    async getGamificationData() {
        if (!this.initialized || !this.clerk?.user) {
            return this.getDefaultGamificationData();
        }

        try {
            const metadata = this.clerk.user.unsafeMetadata;
            const gamificationData = metadata?.gamification || this.getDefaultGamificationData();
            
            // Ensure all required fields exist
            return {
                ...this.getDefaultGamificationData(),
                ...gamificationData
            };
        } catch (error) {
            console.error('Error retrieving gamification data:', error);
            return this.getDefaultGamificationData();
        }
    }

    getDefaultGamificationData() {
        return {
            level: 1,
            xp: 0,
            totalXp: 0,
            streakDays: 0,
            lastActiveDate: null,
            longestStreak: 0,
            unlockedAchievements: [],
            achievementProgress: {},
            weeklyGoalsCompleted: 0,
            personalBests: {
                fastestTime: null,
                highestAccuracy: 0,
                longestStreak: 0,
                longestSession: 0
            },
            stats: {
                totalTests: 0,
                totalDecisions: 0,
                correctDecisions: 0,
                totalSessionTime: 0,
                perfectSessions: 0,
                comebacks: 0
            }
        };
    }

    // Save gamification data
    async saveGamificationData(data) {
        if (!this.initialized || !this.clerk?.user) {
            console.error('AchievementsService not initialized or user not authenticated');
            return false;
        }

        try {
            await this.clerk.user.update({
                unsafeMetadata: {
                    ...this.clerk.user.unsafeMetadata,
                    gamification: data
                }
            });
            return true;
        } catch (error) {
            console.error('Error saving gamification data:', error);
            return false;
        }
    }

    // Calculate XP required for a specific level
    getXpForLevel(level) {
        if (level <= 1) return 0;
        let totalXp = 0;
        for (let i = 1; i < level; i++) {
            totalXp += Math.floor(this.xpPerLevel * Math.pow(this.levelMultiplier, i - 1));
        }
        return totalXp;
    }

    // Calculate level from total XP
    getLevelFromXp(totalXp) {
        let level = 1;
        while (level < this.maxLevel && totalXp >= this.getXpForLevel(level + 1)) {
            level++;
        }
        return level;
    }

    // Add XP and check for level up
    async addXp(amount, reason = '') {
        const data = await this.getGamificationData();
        
        data.xp += amount;
        data.totalXp += amount;
        
        const oldLevel = data.level;
        const newLevel = this.getLevelFromXp(data.totalXp);
        
        const leveledUp = newLevel > oldLevel;
        if (leveledUp) {
            data.level = newLevel;
            data.xp = data.totalXp - this.getXpForLevel(newLevel);
        }
        
        await this.saveGamificationData(data);
        
        return {
            amount,
            reason,
            leveledUp,
            newLevel: data.level,
            currentXp: data.xp,
            xpForNextLevel: this.getXpForLevel(data.level + 1) - this.getXpForLevel(data.level)
        };
    }

    // Update daily streak
    async updateDailyStreak() {
        let data = await this.getGamificationData();
        const today = new Date().toDateString();
        const lastActive = data.lastActiveDate ? new Date(data.lastActiveDate).toDateString() : null;
        
        if (lastActive === today) {
            // Already logged in today
            return { streakContinued: false, currentStreak: data.streakDays };
        }
        
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        
        if (lastActive === yesterday) {
            // Streak continues
            data.streakDays++;
            if (data.streakDays > data.longestStreak) {
                data.longestStreak = data.streakDays;
            }
        } else if (lastActive !== null) {
            // Streak broken
            data.streakDays = 1;
        } else {
            // First login
            data.streakDays = 1;
        }
        
        data.lastActiveDate = new Date().toISOString();
        
        // Save streak data BEFORE awarding XP
        await this.saveGamificationData(data);
        
        // Award daily login XP (this saves internally)
        await this.addXp(this.xpRewards.dailyLogin, 'Daily login');
        
        // Get fresh data after XP was added
        data = await this.getGamificationData();
        
        // Check for streak achievements
        await this.checkAchievements(data);
        
        return { 
            streakContinued: true, 
            currentStreak: data.streakDays,
            isNewRecord: data.streakDays === data.longestStreak && data.streakDays > 1
        };
    }

    // Process test result and award XP/achievements
    async processTestResult(testResult) {
        // Get current gamification data
        let data = await this.getGamificationData();
        
        // Update stats FIRST (before any XP calculations)
        data.stats.totalTests++;
        data.stats.totalDecisions += testResult.totalDecisions || testResult.totalHands || 0;
        data.stats.correctDecisions += testResult.correctDecisions || 
            Math.floor((testResult.totalHands || 0) * (testResult.strategyAccuracy || 0) / 100);
        data.stats.totalSessionTime += testResult.testDuration || 0;
        
        // Calculate accuracy and decisions for bonuses
        const accuracy = testResult.finalAccuracy || testResult.strategyAccuracy || 0;
        const decisions = testResult.totalDecisions || testResult.totalHands || 0;
        
        // Perfect session bonus
        if (accuracy === 100 && decisions >= 10) {
            data.stats.perfectSessions++;
        }
        
        // Update personal bests
        if (testResult.testType === 'speed' && testResult.avgDecisionTime) {
            if (!data.personalBests.fastestTime || testResult.avgDecisionTime < data.personalBests.fastestTime) {
                data.personalBests.fastestTime = testResult.avgDecisionTime;
            }
        }
        
        if (accuracy > data.personalBests.highestAccuracy) {
            data.personalBests.highestAccuracy = accuracy;
        }
        
        if (testResult.testDuration > data.personalBests.longestSession) {
            data.personalBests.longestSession = testResult.testDuration;
        }
        
        // Save stats and personal bests BEFORE adding XP
        await this.saveGamificationData(data);
        
        // Calculate XP to award
        let xpEarned = 0;
        if (testResult.testType === 'speed') {
            xpEarned = this.xpRewards.speedTest;
        } else {
            xpEarned = this.xpRewards.performanceTest;
        }
        
        // Bonus XP for high accuracy
        if (accuracy >= 95) {
            xpEarned += 10;
        }
        if (accuracy >= 99) {
            xpEarned += 15;
        }
        
        // Perfect session bonus
        if (accuracy === 100 && decisions >= 10) {
            xpEarned += 25;
        }
        
        // Award XP (this will save the data internally)
        const xpResult = await this.addXp(xpEarned, 'Test completion');
        
        // Get fresh data after XP was added to check for achievements
        data = await this.getGamificationData();
        
        // Check for new achievements
        const newAchievements = await this.checkAchievements(data, testResult);
        
        return {
            xpEarned,
            newAchievements,
            data,
            leveledUp: xpResult.leveledUp,
            newLevel: xpResult.newLevel
        };
    }

    // Check if any achievements were unlocked
    async checkAchievements(gamificationData, testResult = null) {
        const newAchievements = [];
        
        for (const achievement of this.achievements) {
            // Skip if already unlocked
            if (gamificationData.unlockedAchievements.includes(achievement.id)) {
                continue;
            }
            
            let unlocked = false;
            const req = achievement.requirement;
            
            switch (req.type) {
                case 'daily_streak':
                    unlocked = gamificationData.streakDays >= req.value;
                    break;
                    
                case 'speed_time':
                    if (testResult?.testType === 'speed' && testResult.totalHands >= req.hands) {
                        const totalTime = testResult.testDuration || 0;
                        unlocked = totalTime <= req.value;
                    }
                    break;
                    
                case 'accuracy':
                    if (testResult && testResult.totalDecisions >= req.minDecisions) {
                        const accuracy = testResult.finalAccuracy || testResult.strategyAccuracy || 0;
                        unlocked = accuracy >= req.value;
                    }
                    break;
                    
                case 'correct_streak':
                    // This would need to be tracked separately in real-time during gameplay
                    // For now, we'll estimate from high accuracy
                    if (testResult) {
                        const decisions = testResult.totalDecisions || testResult.totalHands || 0;
                        const accuracy = testResult.finalAccuracy || testResult.strategyAccuracy || 0;
                        const estimatedStreak = Math.floor(decisions * accuracy / 100);
                        unlocked = estimatedStreak >= req.value;
                    }
                    break;
                    
                case 'session_duration':
                    if (testResult && testResult.testDuration >= req.value) {
                        const errorRate = 1 - ((testResult.finalAccuracy || testResult.strategyAccuracy || 0) / 100);
                        unlocked = errorRate <= req.maxErrorRate;
                    }
                    break;
                    
                case 'perfect_session':
                    unlocked = gamificationData.stats.perfectSessions >= req.value;
                    break;
                    
                case 'weekly_goals':
                    unlocked = gamificationData.weeklyGoalsCompleted >= req.value;
                    break;
            }
            
            if (unlocked) {
                gamificationData.unlockedAchievements.push(achievement.id);
                newAchievements.push(achievement);
                
                // Award XP for badge unlock
                await this.addXp(this.xpRewards.badgeUnlock, `Unlocked: ${achievement.name} ${achievement.tier}`);
            }
        }
        
        if (newAchievements.length > 0) {
            await this.saveGamificationData(gamificationData);
        }
        
        return newAchievements;
    }

    // Get all achievements with unlock status
    async getAchievementsWithProgress() {
        const data = await this.getGamificationData();
        
        return this.achievements.map(achievement => ({
            ...achievement,
            isUnlocked: data.unlockedAchievements.includes(achievement.id),
            progress: this.getAchievementProgress(achievement, data)
        }));
    }

    // Calculate progress towards an achievement
    getAchievementProgress(achievement, gamificationData) {
        const req = achievement.requirement;
        let current = 0;
        let target = req.value;
        
        switch (req.type) {
            case 'daily_streak':
                current = gamificationData.streakDays;
                break;
            case 'perfect_session':
                current = gamificationData.stats.perfectSessions;
                break;
            case 'weekly_goals':
                current = gamificationData.weeklyGoalsCompleted;
                break;
            default:
                // For test-specific achievements, we can't show real-time progress
                return null;
        }
        
        return {
            current,
            target,
            percentage: Math.min(100, Math.floor((current / target) * 100))
        };
    }
}

// Export singleton instance
window.achievementsService = new AchievementsService();

