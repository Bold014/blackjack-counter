// Example backend API endpoints for Stripe integration
// This file shows the backend endpoints needed to complete the Stripe integration
// You'll need to implement these on your server using Node.js, Python, or your preferred backend

// IMPORTANT: Replace these with your actual Stripe keys
const STRIPE_SECRET_KEY = 'sk_test_YOUR_STRIPE_SECRET_KEY';
const STRIPE_WEBHOOK_SECRET = 'whsec_YOUR_WEBHOOK_SECRET';

// Example using Express.js for Node.js backend
const express = require('express');
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const app = express();

// Create checkout session endpoint
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, userId, userEmail } = req.body;
        
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: priceId,
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: 'https://yoursite.com/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'https://yoursite.com/pricing',
            customer_email: userEmail,
            metadata: {
                userId: userId
            }
        });
        
        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify subscription endpoint
app.post('/api/verify-subscription', async (req, res) => {
    try {
        const { sessionId, userId } = req.body;
        
        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['subscription', 'customer']
        });
        
        if (session.payment_status === 'paid' && session.subscription) {
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            
            res.json({
                plan: 'premium',
                expiresAt: subscription.current_period_end * 1000, // Convert to milliseconds
                customerId: session.customer,
                subscriptionId: subscription.id
            });
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Cancel subscription endpoint
app.post('/api/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId, userId } = req.body;
        
        // Cancel the subscription at period end
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true
        });
        
        res.json({ success: true, subscription });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook endpoint to handle Stripe events
app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event;
    
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    
    // Handle the event
    switch (event.type) {
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            // Update user metadata in Clerk based on subscription status
            const subscription = event.data.object;
            // You'll need to look up the user by customer ID and update their Clerk metadata
            break;
            
        case 'invoice.payment_succeeded':
            // Handle successful payment
            break;
            
        case 'invoice.payment_failed':
            // Handle failed payment
            break;
    }
    
    res.json({ received: true });
});

// SETUP INSTRUCTIONS:
// 1. Install dependencies: npm install express stripe
// 2. Replace STRIPE_SECRET_KEY with your actual Stripe secret key
// 3. Create products and prices in your Stripe dashboard
// 4. Set up webhook endpoint in Stripe dashboard pointing to /api/stripe-webhook
// 5. Deploy this backend to your server
// 6. Update the frontend URLs to point to your backend
// 7. Replace the STRIPE_PUBLISHABLE_KEY in subscriptionManager.js with your actual key 