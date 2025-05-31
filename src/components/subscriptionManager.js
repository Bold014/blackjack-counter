// Subscription Management System
// This module handles Stripe subscriptions and tracks daily usage limits

class SubscriptionManager {
    constructor() {
        this.clerk = null;
        this.stripe = null;
        this.initialized = false;
        this.DAILY_FREE_LIMIT = 3; // Number of free performance tests per day
        this.STRIPE_PUBLISHABLE_KEY = 'pk_live_51RUXJLGVWYSvQ1J3i7wpOacw7RSedlO2Kx0Gn7I8PL2ItX3N1gtvRfKrLpVHm0DlGVrFYkGE0oNrYu8elxiiAbFi00tgeaVgsJ';
    }

    async initialize(clerkInstance) {
        this.clerk = clerkInstance;
        
        try {
            // Initialize Stripe
            if (window.Stripe) {
                this.stripe = window.Stripe(this.STRIPE_PUBLISHABLE_KEY);
                this.initialized = true;
            } else {
                console.error('Stripe is not loaded');
                this.initialized = false;
            }
        } catch (error) {
            console.error('Error initializing Stripe:', error);
            this.initialized = false;
        }
    }

    // Get the current user's subscription status
    async getSubscriptionStatus() {
        if (!this.initialized || !this.clerk?.user) {
            return {
                isSubscribed: false,
                plan: 'free',
                dailyTestsRemaining: 0
            };
        }

        try {
            const metadata = this.clerk.user.unsafeMetadata;
            const subscription = metadata?.subscription || {};
            
            // Check if user has active subscription
            if (subscription.status === 'active' && subscription.expiresAt > Date.now()) {
                return {
                    isSubscribed: true,
                    plan: subscription.plan || 'premium',
                    dailyTestsRemaining: -1, // Unlimited for subscribers
                    expiresAt: subscription.expiresAt
                };
            }

            // For free users, check daily usage
            const today = new Date().toDateString();
            const dailyUsage = metadata?.dailyUsage || {};
            
            if (dailyUsage.date !== today) {
                // Reset daily usage for new day
                await this.resetDailyUsage();
                return {
                    isSubscribed: false,
                    plan: 'free',
                    dailyTestsRemaining: this.DAILY_FREE_LIMIT
                };
            }

            const testsUsed = dailyUsage.performanceTests || 0;
            return {
                isSubscribed: false,
                plan: 'free',
                dailyTestsRemaining: Math.max(0, this.DAILY_FREE_LIMIT - testsUsed),
                testsUsedToday: testsUsed
            };
        } catch (error) {
            console.error('Error getting subscription status:', error);
            return {
                isSubscribed: false,
                plan: 'free',
                dailyTestsRemaining: 0
            };
        }
    }

    // Track a performance test usage
    async trackPerformanceTest() {
        if (!this.initialized || !this.clerk?.user) {
            return false;
        }

        try {
            const status = await this.getSubscriptionStatus();
            
            // Subscribers have unlimited tests
            if (status.isSubscribed) {
                return true;
            }

            // Check if free user has tests remaining
            if (status.dailyTestsRemaining <= 0) {
                return false;
            }

            // Update daily usage
            const today = new Date().toDateString();
            const metadata = this.clerk.user.unsafeMetadata;
            const dailyUsage = metadata?.dailyUsage || {};
            
            const updatedUsage = {
                date: today,
                performanceTests: (dailyUsage.performanceTests || 0) + 1
            };

            await this.clerk.user.update({
                unsafeMetadata: {
                    ...metadata,
                    dailyUsage: updatedUsage
                }
            });

            return true;
        } catch (error) {
            console.error('Error tracking performance test:', error);
            return false;
        }
    }

    // Reset daily usage (called when a new day starts)
    async resetDailyUsage() {
        if (!this.initialized || !this.clerk?.user) {
            return;
        }

        try {
            const today = new Date().toDateString();
            const metadata = this.clerk.user.unsafeMetadata;

            await this.clerk.user.update({
                unsafeMetadata: {
                    ...metadata,
                    dailyUsage: {
                        date: today,
                        performanceTests: 0
                    }
                }
            });
        } catch (error) {
            console.error('Error resetting daily usage:', error);
        }
    }

    // Create a checkout session for subscription
    async createCheckoutSession(priceId) {
        if (!this.initialized || !this.clerk?.user || !this.stripe) {
            throw new Error('User not authenticated or Stripe not initialized');
        }

        try {
            // Call the Heroku backend API
            const response = await fetch('https://blackjacc-counter-087b5c65a111.herokuapp.com/api/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    priceId: priceId,
                    userId: this.clerk.user.id,
                    userEmail: this.clerk.user.emailAddresses[0].emailAddress
                })
            });

            const session = await response.json();
            
            // Redirect to Stripe Checkout
            const result = await this.stripe.redirectToCheckout({
                sessionId: session.id
            });

            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error('Error creating checkout session:', error);
            throw error;
        }
    }

    // Handle successful subscription
    async handleSubscriptionSuccess(sessionId) {
        if (!this.initialized || !this.clerk?.user) {
            return;
        }

        try {
            // Verify the session with your backend
            const response = await fetch('https://blackjacc-counter-087b5c65a111.herokuapp.com/api/verify-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    userId: this.clerk.user.id
                })
            });

            const subscription = await response.json();
            
            // Update user metadata with subscription info
            const metadata = this.clerk.user.unsafeMetadata;
            
            await this.clerk.user.update({
                unsafeMetadata: {
                    ...metadata,
                    subscription: {
                        status: 'active',
                        plan: subscription.plan,
                        expiresAt: subscription.expiresAt,
                        stripeCustomerId: subscription.customerId,
                        stripeSubscriptionId: subscription.subscriptionId
                    }
                }
            });
        } catch (error) {
            console.error('Error handling subscription success:', error);
        }
    }

    // Cancel subscription
    async cancelSubscription() {
        if (!this.initialized || !this.clerk?.user) {
            return;
        }

        try {
            const metadata = this.clerk.user.unsafeMetadata;
            const subscription = metadata?.subscription;

            if (!subscription?.stripeSubscriptionId) {
                throw new Error('No active subscription found');
            }

            // Call your backend to cancel the subscription
            const response = await fetch('https://blackjacc-counter-087b5c65a111.herokuapp.com/api/cancel-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscriptionId: subscription.stripeSubscriptionId,
                    userId: this.clerk.user.id
                })
            });

            if (response.ok) {
                // Update user metadata
                await this.clerk.user.update({
                    unsafeMetadata: {
                        ...metadata,
                        subscription: {
                            ...subscription,
                            status: 'cancelled',
                            cancelledAt: Date.now()
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error cancelling subscription:', error);
            throw error;
        }
    }

    // Check if speed training is available (behind paywall)
    async canAccessSpeedTraining() {
        const status = await this.getSubscriptionStatus();
        return status.isSubscribed;
    }

    // Format subscription info for display
    formatSubscriptionInfo(status) {
        if (status.isSubscribed) {
            const expiryDate = new Date(status.expiresAt);
            return {
                title: 'Premium Member',
                description: 'Unlimited performance tests and speed training',
                expiry: `Expires ${expiryDate.toLocaleDateString()}`
            };
        } else {
            return {
                title: 'Free Plan',
                description: `${status.dailyTestsRemaining} performance tests remaining today`,
                testsUsed: status.testsUsedToday || 0
            };
        }
    }
}

// Export singleton instance
window.subscriptionManager = new SubscriptionManager(); 