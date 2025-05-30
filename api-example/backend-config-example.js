// Backend Configuration Example
// IMPORTANT: This file should NEVER be committed to version control with real keys!

// For production, use environment variables:
// Example .env file (add to .gitignore):
/*
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
*/

// In your backend code:
require('dotenv').config();

const config = {
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        // Your live publishable key (this one is safe to expose)
        publishableKey: 'pk_live_51RUXJLGVWYSvQ1J3i7wpOacw7RSedlO2Kx0Gn7I8PL2ItX3N1gtvRfKrLpVHm0DlGVrFYkGE0oNrYu8elxiiAbFi00tgeaVgsJ'
    },
    clerk: {
        secretKey: process.env.CLERK_SECRET_KEY
    }
};

// Example usage in your backend:
const stripe = require('stripe')(config.stripe.secretKey);

module.exports = config; 