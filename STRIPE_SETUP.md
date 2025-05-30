# Stripe Subscription Setup Guide

This guide explains how to complete the Stripe integration for the HitOrStand freemium model.

## Overview

The application now has a freemium model with:
- **Free Plan**: 3 performance tests per day
- **Premium Plan ($9/month)**: Unlimited performance tests + Speed Training mode

## Frontend Implementation (Complete)

The frontend code is ready with:
- ✅ Subscription manager component (`src/components/subscriptionManager.js`)
- ✅ Pricing page (`src/public/pricing.html`)
- ✅ Performance test daily limit checking
- ✅ Speed training premium gate
- ✅ User interface updates showing subscription status

## Backend Implementation (Required)

You need to implement the backend API endpoints. See `api-example/stripe-endpoints.js` for reference.

### Step 1: Set Up Stripe Account

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard:
   - Publishable key (starts with `pk_`)
   - Secret key (starts with `sk_`)

### Step 2: Create Stripe Products

1. In Stripe Dashboard, go to Products
2. Create a new product called "HitOrStand Premium"
3. Add a price: $9.00/month (recurring)
4. Note the Price ID (starts with `price_`)

### Step 3: Update Configuration

1. Update `src/components/subscriptionManager.js`:
   ```javascript
   this.STRIPE_PUBLISHABLE_KEY = 'pk_live_YOUR_ACTUAL_KEY';
   ```

2. Update `src/public/pricing.html`:
   ```javascript
   const priceId = 'price_YOUR_ACTUAL_PRICE_ID';
   ```

### Step 4: Implement Backend Endpoints

Create these endpoints on your server:

1. **POST /api/create-checkout-session**
   - Creates a Stripe Checkout session
   - Accepts: `{ priceId, userId, userEmail }`
   - Returns: `{ id: sessionId }`

2. **POST /api/verify-subscription**
   - Verifies payment completion
   - Accepts: `{ sessionId, userId }`
   - Returns: subscription details

3. **POST /api/cancel-subscription**
   - Cancels subscription at period end
   - Accepts: `{ subscriptionId, userId }`
   - Returns: success status

4. **POST /api/stripe-webhook**
   - Handles Stripe webhooks
   - Updates user subscription status

### Step 5: Deploy Backend

1. Deploy your backend to a server (Heroku, AWS, etc.)
2. Update frontend API URLs to point to your backend
3. Set up Stripe webhook endpoint in Dashboard

### Step 6: Test the Integration

1. Use Stripe test mode first
2. Test card: 4242 4242 4242 4242
3. Verify:
   - Checkout flow works
   - Subscription status updates
   - Daily limits enforce correctly
   - Speed training access control

## Security Considerations

1. **Never expose your secret key** - keep it on backend only
2. **Validate webhook signatures** to prevent fraud
3. **Use HTTPS** for all API calls
4. **Implement rate limiting** on your endpoints

## User Flow

1. User signs up/logs in via Clerk
2. Free users get 3 performance tests daily
3. When limit reached, upgrade prompt appears
4. User clicks upgrade → Stripe Checkout
5. After payment, user metadata updates
6. Premium features unlock immediately

## Troubleshooting

- **Stripe not loading**: Check if Stripe.js is loaded before initializing
- **Subscription not updating**: Verify webhook is receiving events
- **Daily limits not resetting**: Check date comparison logic
- **Speed training still locked**: Ensure subscription status is checked

## Support

For Stripe integration help:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

For Clerk integration:
- Clerk Documentation: https://clerk.com/docs 