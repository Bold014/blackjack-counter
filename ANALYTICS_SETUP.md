# Vercel Analytics Implementation

This document outlines the Vercel Analytics implementation for the HitOrStand blackjack trainer application.

## Overview

Vercel Analytics has been implemented across all HTML pages in the application to track user behavior, page views, and custom events.

## Implementation Details

### 1. Analytics Script
- **Location**: `src/components/analytics/vercel-analytics.js`
- **Purpose**: Centralized analytics initialization and event tracking
- **Features**:
  - Automatic page view tracking
  - Custom event tracking utility
  - Development environment detection (skips analytics on localhost)
  - SPA navigation tracking (for programmatic navigation)

### 2. Pages with Analytics

The following pages have Vercel Analytics integrated:

- `src/public/index.html` - Main landing page
- `src/public/trainer.html` - Training mode selection
- `src/public/performance-test.html` - Performance test interface
- `src/public/card-counter-trainer.html` - Card counting trainer
- `src/public/speed-training.html` - Speed training mode
- `src/public/progress.html` - User progress dashboard
- `src/public/pricing.html` - Pricing and subscription page
- `src/public/test-results.html` - Performance test results
- `src/public/speed-results.html` - Speed training results
- `src/public/subscription-info.html` - Subscription management

### 3. Custom Events Tracked

The following custom events are tracked throughout the application:

#### Authentication Events
- `user_signed_in` - When a user signs in (with method: 'existing_session')
- `user_signed_up` - When a user completes signup (with method: 'clerk_signup')
- `user_signed_out` - When a user signs out
- `auth_button_clicked` - When signup/signin buttons are clicked (with type: 'signup'/'signin')

#### Training Events
- Additional events can be added in individual training modules for:
  - Training session starts
  - Training session completions
  - Performance test results
  - Speed training results
  - Subscription upgrades

### 4. Analytics Configuration

The analytics script automatically:
- Loads the Vercel Analytics library from CDN
- Tracks initial page views
- Provides a global `window.trackEvent()` function for custom events
- Handles navigation tracking for single-page app behavior

### 5. Environment Handling

- **Production**: Full analytics tracking enabled
- **Development**: Analytics disabled on localhost/127.0.0.1
- **Staging**: Analytics will work on any deployed environment

## Usage

### Tracking Custom Events

To track custom events in your JavaScript code:

```javascript
// Basic event
window.trackEvent('button_clicked');

// Event with properties
window.trackEvent('training_completed', {
    mode: 'performance_test',
    score: 85,
    duration: 300
});
```

### Adding Analytics to New Pages

1. Add the analytics script tag to the `<head>` section:
```html
<!-- Vercel Analytics -->
<script src="../components/analytics/vercel-analytics.js"></script>
```

2. The script will automatically track page views
3. Add custom event tracking as needed using `window.trackEvent()`

## Vercel Dashboard

Analytics data can be viewed in the Vercel dashboard:
1. Go to your project in Vercel
2. Navigate to the "Analytics" tab
3. View page views, custom events, and user behavior data

## Dependencies

- `@vercel/analytics` package (already installed in package.json)
- Vercel hosting (analytics only works on Vercel-deployed sites)

## Notes

- Analytics data may take a few minutes to appear in the Vercel dashboard
- Custom events are useful for tracking user engagement and conversion funnels
- The implementation is privacy-focused and GDPR compliant by default
- No personal data is collected without explicit user consent 