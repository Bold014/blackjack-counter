# Gamification System - MVP Implementation

## Overview
A comprehensive gamification system has been implemented to increase player engagement and encourage users to return to the blackjack trainer. The system includes XP, levels, achievements, daily streaks, and visual feedback.

## Features Implemented

### 1. **XP & Leveling System**
- **Base XP Requirements**: Level 1 requires 100 XP, with each subsequent level requiring 1.5x more XP
- **Max Level**: 50
- **XP Rewards**:
  - Performance Test: 20 XP
  - Speed Test: 15 XP
  - Perfect Hand: 5 XP
  - Correct Decision: 1 XP
  - Daily Login: 10 XP
  - Weekly Goal Complete: 50 XP
  - Badge Unlock: 25 XP
  - High Accuracy Bonus (95%+): +10 XP
  - Perfect Accuracy Bonus (99%+): +15 XP
  - Perfect Session: +25 XP

- **Level Titles**:
  - Level 1: Card Novice
  - Level 5: Deck Apprentice
  - Level 10: Table Regular
  - Level 15: Sharp Player
  - Level 20: Card Counter
  - Level 25: Blackjack Pro
  - Level 30: Casino Veteran
  - Level 35: High Roller
  - Level 40: Blackjack Master
  - Level 45: Legend
  - Level 50: Grandmaster

### 2. **Daily Streak System**
- Tracks consecutive days of logging in
- Resets if a day is missed
- Awards 10 XP for daily login
- Displays current streak with fire icon animation
- Tracks longest streak achieved

### 3. **Achievement Badges (19 Total)**

#### Speed Achievements
- **Speed Demon** (Bronze/Silver/Gold)
  - Bronze: 52 cards under 60 seconds
  - Silver: 52 cards under 45 seconds
  - Gold: 52 cards under 35 seconds

#### Accuracy Achievements
- **Accuracy Ace** (Bronze/Silver/Gold)
  - Bronze: 98% accuracy over 200+ cards
  - Silver: 99% accuracy over 200+ cards
  - Gold: 99.5% accuracy over 200+ cards

#### Streak Achievements
- **Stone Cold** (Bronze/Silver/Gold)
  - Bronze: 100 correct decisions in a row
  - Silver: 250 correct decisions in a row
  - Gold: 500 correct decisions in a row

#### Endurance Achievements
- **Endurer** (Bronze/Silver/Gold)
  - Bronze: 15 min session, ≤3 errors every 10 min
  - Silver: 30 min session, ≤3 errors every 10 min
  - Gold: 60 min session, ≤3 errors every 10 min

#### Special Achievements
- **Perfect Session**: Complete a session with no errors
- **Comeback Kid**: Recover from an error with 30 perfect decisions after

#### Consistency Achievements
- **Weekly Warrior** (Bronze/Silver/Gold)
  - Bronze: Complete all weekly goals once
  - Silver: Complete all weekly goals 4 times
  - Gold: Complete all weekly goals 12 times

#### Daily Streak Achievements
- **Dedicated** (Bronze): 7 day login streak
- **Committed** (Silver): 14 day login streak
- **Unstoppable** (Gold): 30 day login streak

### 4. **Visual Feedback**

#### Achievement Unlock Toast
- Beautiful animated toast notifications
- Shows badge icon with tier color
- Displays XP reward
- Auto-dismisses after 5 seconds
- Stacks multiple achievements with 500ms delay between

#### Confetti Animation
- 50 colorful confetti pieces
- Falls from top of screen when achievement unlocked
- Auto-removes after 3 seconds

#### Progress UI on Progress Page
- **Gamification Header**:
  - Animated level badge with glowing effect
  - XP progress bar with shimmer animation
  - Daily streak counter with fire animation
  - Level title display

- **Achievements Tab**:
  - Filter by: All, Unlocked, Locked, Speed, Accuracy, Streaks, Special
  - Achievement cards with:
    - Tier-specific colors (Bronze: #CD7F32, Silver: #C0C0C0, Gold: #FFD700, Special: #FF69B4)
    - Lock/unlock states
    - Progress bars for trackable achievements
    - Hover animations

- **Stats Summary**:
  - Total Tests
  - Total Decisions
  - Overall Accuracy
  - Perfect Sessions
  - Longest Streak
  - Badges Unlocked

### 5. **Data Storage**
All gamification data is stored in Clerk user metadata under `gamification`:
```javascript
{
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
}
```

## Integration Points

### Automatic Tracking
1. **Test Completion**: When users finish performance tests or speed training, achievements are automatically checked and XP is awarded
2. **Daily Login**: Streak is updated on page load
3. **Achievement Unlocks**: Toasts appear immediately when criteria are met
4. **Progress Sync**: All data syncs to Clerk automatically

### Files Modified
1. `src/components/achievementsService.js` - Core gamification logic
2. `src/components/highScores.js` - Integration with achievement tracking
3. `src/styles/components/achievements.css` - Beautiful badge and UI styling
4. `src/public/progress.html` - Progress page with achievements UI
5. `src/public/test-results.html` - Achievement toasts on performance tests
6. `src/public/speed-results.html` - Achievement toasts on speed training

## Anti-Exploit Measures
- Minimum session durations required for certain badges
- Minimum decision counts for accuracy achievements
- Realistic input cadence verification (can be expanded)
- No XP for mocked/test data

## Future Enhancements (Not Implemented)
- Weekly challenge rotation system
- Global leaderboards
- Seasonal ranks and badges
- Cosmetic unlocks (card backs, table felts, chip skins)
- Social features (friends, sharing achievements)
- Quest system with micro-goals
- Event modifiers (Double XP weekends)
- Personal best tracking and notifications
- Combo multipliers for streaks

## Usage

### For Players
1. Complete tests to earn XP and level up
2. Unlock achievements by meeting specific criteria
3. Maintain daily streaks for bonus XP
4. View all achievements and progress in the "Achievements" tab on the progress page
5. Watch for achievement unlock toasts with confetti celebrations!

### For Developers
The `achievementsService` is globally available via `window.achievementsService`:

```javascript
// Initialize
await window.achievementsService.initialize(clerkInstance);

// Process test result (automatically called by highScoresManager)
const result = await window.achievementsService.processTestResult(testResult);

// Get gamification data
const data = await window.achievementsService.getGamificationData();

// Add XP manually
await window.achievementsService.addXp(50, 'Custom reward');

// Get achievements with progress
const achievements = await window.achievementsService.getAchievementsWithProgress();
```

## Testing
1. Complete a performance test → Should award XP and check for achievements
2. Complete a speed test → Should award XP and check for speed achievements
3. Visit progress page multiple days in a row → Should maintain streak
4. View Achievements tab → Should see all 19 achievements with proper filtering
5. Unlock an achievement → Should see toast notification with confetti

Enjoy the enhanced engagement!

