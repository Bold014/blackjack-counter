# Stripe Coupon Integration Guide

This guide explains how to use the coupon functionality that has been added to your Stripe checkout system.

## Overview

The application now supports Stripe coupons for your Premium subscription checkout. Users can enter coupon codes on the pricing page, validate them in real-time, and apply discounts to their subscription.

## Features Added

✅ **Coupon Input Field**: Added to the Premium plan section on the pricing page
✅ **Real-time Validation**: Validates coupons with Stripe before checkout
✅ **Discount Display**: Shows the discount amount/percentage when a coupon is applied
✅ **Remove Coupon**: Users can remove an applied coupon before checkout
✅ **Backend Integration**: Secure coupon validation through your server
✅ **Checkout Integration**: Applied coupons are automatically included in the Stripe checkout session

## How It Works

### Frontend (User Experience)
1. User enters a coupon code in the input field on the pricing page
2. User clicks "Apply" or presses Enter
3. The system validates the coupon with Stripe in real-time
4. If valid, shows success message with discount details
5. When user clicks "Upgrade to Premium", the coupon is applied to checkout

### Backend Integration
- **New API Endpoint**: `/api/validate-coupon` - Validates coupons with Stripe
- **Modified Endpoint**: `/api/create-checkout-session` - Now accepts optional `couponId` parameter
- **Stripe Integration**: Uses Stripe's `discounts` parameter in checkout session creation

## Creating Coupons in Stripe

1. Log into your Stripe Dashboard
2. Go to "Products" → "Coupons"
3. Click "Create coupon"
4. Configure your coupon:
   - **ID**: Custom coupon code (e.g., "SAVE20", "WELCOME50")
   - **Type**: Percentage or Fixed amount discount
   - **Duration**: Once, Forever, or Repeating
   - **Restrictions**: Optional (minimum amount, first-time customers, etc.)

### Example Coupons
- `WELCOME50`: 50% off first month
- `SAVE20`: 20% off forever
- `STUDENT10`: $10 off first month
- `BLACKFRIDAY`: 30% off for 3 months

## Testing Coupons

### Test Mode Coupons
1. In Stripe test mode, create test coupons
2. Use the coupon codes on your pricing page
3. Complete test checkouts to verify functionality

### Example Test Process
1. Create a test coupon "TEST50" for 50% off
2. Go to your pricing page
3. Enter "TEST50" in the coupon field
4. Click "Apply" - should show "50% discount applied!"
5. Click "Upgrade to Premium"
6. Verify discount is applied in Stripe checkout

## Code Changes Made

### Backend (`server.js`)
```javascript
// Modified create-checkout-session to accept couponId
const { priceId, userId, userEmail, couponId } = req.body;

// Add discounts if coupon provided
if (couponId) {
    sessionConfig.discounts = [{ coupon: couponId }];
}

// New validate-coupon endpoint
app.post('/api/validate-coupon', async (req, res) => {
    // Validates coupon with Stripe API
});
```

### Frontend (`subscriptionManager.js`)
```javascript
// Modified to accept optional couponId
async createCheckoutSession(priceId, couponId = null) {
    // Includes couponId in request if provided
}
```

### UI (`pricing.html` & `pricing.css`)
- Added coupon input section to Premium plan
- Added validation and success/error messaging
- Added remove coupon functionality
- Styled coupon section to match existing design

## Troubleshooting

### Common Issues
1. **"Invalid coupon code"**: Ensure the coupon exists in your Stripe account and is active
2. **Coupon not applying**: Check that the coupon is valid for subscriptions (not one-time payments)
3. **Network errors**: Verify your server endpoints are accessible

### Stripe Requirements
- Coupons must be created in the same Stripe account as your products
- Coupon IDs are case-sensitive
- Coupons must be active and not expired
- Some coupons may have usage limits or restrictions

## Best Practices

1. **Test thoroughly**: Always test coupons in Stripe test mode first
2. **Monitor usage**: Track coupon usage in Stripe Dashboard
3. **Set expiration dates**: Prevent indefinite coupon usage
4. **Use clear naming**: Make coupon codes easy to remember and type
5. **Track conversion**: Monitor how coupons affect your conversion rates

## Security Notes

- Coupon validation is done server-side for security
- Invalid coupons are rejected before reaching Stripe checkout
- No sensitive coupon data is stored client-side
- All coupon operations use your secure Stripe API keys

## Support

If you encounter any issues with the coupon functionality:
1. Check the browser console for JavaScript errors
2. Check your server logs for API errors
3. Verify coupon configuration in Stripe Dashboard
4. Test with known valid coupons first 