# Paystack Integration Guide

This document explains how to set up and use the Paystack payment integration in the Email Outreach Bot application.

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
PAYSTACK_BASE_URL=https://api.paystack.co

# Frontend URL (for callback)
FRONTEND_URL=http://localhost:3000
```

## Subscription Pricing

The application uses the following pricing structure:

### Pro Plan
- Monthly: ₦15,000
- Yearly: ₦150,000 (2 months free - 17% savings)

### Enterprise Plan
- Monthly: ₦50,000
- Yearly: ₦500,000 (2 months free - 17% savings)

## API Endpoints

### Initialize Payment
```
POST /api/payment/initialize
```

**Request Body:**
```json
{
  "subscriptionTier": "pro" | "enterprise",
  "billingCycle": "monthly" | "yearly",
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "reference": "FHG_1234567890_ABC123",
    "accessCode": "access_code_here"
  }
}
```

### Verify Payment
```
POST /api/payment/verify
```

**Request Body:**
```json
{
  "reference": "FHG_1234567890_ABC123"
}
```

### Get Payment History
```
GET /api/payment/history
```

### Get Subscription Pricing
```
GET /api/payment/pricing
```

### Get Payment Statistics (Admin Only)
```
GET /api/payment/stats
```

## Database Models

### Payment Model
The `Payment` model stores all payment transactions with the following key fields:
- `userId`: User who made the payment
- `subscriptionTier`: Pro or Enterprise
- `billingCycle`: Monthly or Yearly
- `amount`: Payment amount in NGN
- `status`: Payment status (pending, completed, failed, etc.)
- `reference`: Unique payment reference
- `paystackReference`: Paystack transaction reference
- `authorizationUrl`: Paystack checkout URL
- `transactionId`: Paystack transaction ID
- `paidAt`: Payment completion timestamp

## Frontend Integration

### Payment Page
- Located at `/payment`
- Shows subscription plans with pricing
- Handles payment initialization
- Redirects to Paystack checkout

### Payment Callback
- Located at `/payment/callback`
- Handles return from Paystack
- Verifies payment status
- Updates user subscription

### User Payment History
- Located at `/dashboard/payments`
- Shows user's payment history
- Displays current subscription status

### Admin Payment Management
- Located at `/dashboard/admin/payments`
- Admin-only access
- Shows all payment transactions
- Displays payment statistics

## Security Considerations

1. **Webhook Verification**: Implement proper webhook signature verification for production
2. **Environment Variables**: Keep Paystack keys secure and use different keys for test/production
3. **User Authentication**: All payment endpoints require user authentication
4. **Admin Access**: Payment statistics endpoint requires admin privileges

## Testing

### Test Cards (Paystack Test Mode)
- **Successful Payment**: 4084084084084081
- **Failed Payment**: 4084084084084085
- **Insufficient Funds**: 4084084084084086

### Test Flow
1. Use test Paystack keys
2. Use test card numbers
3. Verify payment flow works correctly
4. Check database records are created
5. Confirm user subscription is updated

## Production Deployment

1. **Update Environment Variables**: Use production Paystack keys
2. **Webhook Configuration**: Set up Paystack webhooks to point to your production URL
3. **SSL Certificate**: Ensure your production site has SSL
4. **Database Backup**: Regular backups of payment data
5. **Monitoring**: Set up monitoring for payment failures

## Troubleshooting

### Common Issues

1. **Payment Initialization Fails**
   - Check Paystack secret key
   - Verify environment variables
   - Check network connectivity

2. **Payment Verification Fails**
   - Verify reference exists in database
   - Check Paystack API response
   - Ensure proper error handling

3. **User Subscription Not Updated**
   - Check user model update logic
   - Verify database connection
   - Check for transaction rollbacks

### Logs
Check application logs for detailed error messages:
- Payment initialization errors
- Verification failures
- Database update issues

## Support

For Paystack-specific issues, refer to:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/contact)

For application-specific issues, check the application logs and database records.
