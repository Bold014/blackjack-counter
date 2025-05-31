const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Debug logging for environment variables
console.log('Environment check:');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length);
console.log('STRIPE_SECRET_KEY starts with sk_:', process.env.STRIPE_SECRET_KEY?.startsWith('sk_'));

// Initialize Stripe with your secret key
if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY environment variable is not set!');
    process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Configure CORS to allow requests from your frontend domain
const corsOptions = {
    origin: [
        'https://hitorstandtrainer.com',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static('src'));

// Serve static files from src directory
app.use(express.static(path.join(__dirname, 'src')));

// API Routes for Stripe integration

// Create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { priceId, userId, userEmail } = req.body;

        console.log('Checkout session request:', { priceId, userId, userEmail });

        if (!priceId || !userId || !userEmail) {
            console.error('Missing required parameters:', { priceId: !!priceId, userId: !!userId, userEmail: !!userEmail });
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        console.log('Creating Stripe checkout session...');
        
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
            success_url: `${req.headers.origin}/src/public/pricing.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.headers.origin}/src/public/pricing.html?canceled=true`,
        });

        console.log('Checkout session created successfully:', session.id);
        res.json({ id: session.id });
    } catch (error) {
        console.error('Detailed error creating checkout session:', {
            message: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode,
            requestId: error.requestId
        });
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message 
        });
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
            
            // Use Stripe's actual subscription period end (in milliseconds)
            const expiresAt = subscription.current_period_end * 1000;

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

// Stripe webhook endpoint (for handling subscription events)
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

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'src', 'public', 'index.html'));
});

app.get('*', (req, res) => {
    // Check if it's an API route that doesn't exist
    if (req.path.startsWith('/api/')) {
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