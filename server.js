const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Stripe with your secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Handle OPTIONS requests FIRST before anything else
app.options('*', (req, res) => {
    console.log('OPTIONS request for:', req.path);
    res.header('Access-Control-Allow-Origin', 'https://hitorstandtrainer.com');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(204).end();
});

// Debug logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.headers.origin}`);
    next();
});

// CORS headers for all non-OPTIONS requests
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin === 'https://hitorstandtrainer.com' || origin === 'http://localhost:3000') {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
});

// Stripe webhook endpoint MUST come before body parsing middleware
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed.`, err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
            console.log('Subscription event:', event.type, event.data.object);
            break;
        case 'invoice.payment_succeeded':
            console.log('Payment succeeded:', event.data.object);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({received: true});
});

// Parse JSON bodies
app.use(express.json());

// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

// API Routes for Stripe integration

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
    console.log('CREATE CHECKOUT SESSION called with:', req.body);
    
    try {
        const { priceId, userId, userEmail } = req.body;

        if (!priceId || !userId || !userEmail) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            customer_email: userEmail,
            metadata: {
                userId: userId,
            },
            success_url: `https://hitorstandtrainer.com/src/public/pricing.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `https://hitorstandtrainer.com/src/public/pricing.html?canceled=true`,
        });

        console.log('Checkout session created:', session.id);
        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: 'Failed to create checkout session', details: error.message });
    }
});

// Verify subscription after successful payment
app.post('/api/verify-subscription', async (req, res) => {
    try {
        const { sessionId, userId } = req.body;

        if (!sessionId || !userId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Retrieve the checkout session
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
            // Get the subscription
            const subscription = await stripe.subscriptions.retrieve(session.subscription);
            
            // Calculate expiry date (30 days from now for monthly subscription)
            const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);

            res.json({
                plan: 'premium',
                expiresAt: expiresAt,
                customerId: session.customer,
                subscriptionId: session.subscription,
                status: subscription.status
            });
        } else {
            res.status(400).json({ error: 'Payment not completed' });
        }
    } catch (error) {
        console.error('Error verifying subscription:', error);
        res.status(500).json({ error: 'Failed to verify subscription' });
    }
});

// Cancel subscription
app.post('/api/cancel-subscription', async (req, res) => {
    try {
        const { subscriptionId, userId } = req.body;

        if (!subscriptionId || !userId) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        // Cancel the subscription at period end
        const subscription = await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        res.json({ 
            success: true, 
            subscription: {
                id: subscription.id,
                status: subscription.status,
                cancel_at_period_end: subscription.cancel_at_period_end,
                current_period_end: subscription.current_period_end
            }
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

// Catch all other routes
app.get('*', (req, res) => {
    // Check if it's an API route that doesn't exist
    if (req.path.startsWith('/api/')) {
        console.log('404 for API route:', req.path);
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // For all other routes, try to serve the file or default to index
    const filePath = path.join(__dirname, 'src', 'public', req.path === '/' ? 'index.html' : req.path);
    res.sendFile(filePath, (err) => {
        if (err) {
            res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 