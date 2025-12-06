# Paystack Webhook Configuration

## Webhook URL
Your Paystack webhook URL should be set to:
```
https://your-domain.com/api/webhooks/paystack
```

For local development with ngrok:
```
https://chemotropic-albertha-contritely.ngrok-free.dev/api/webhooks/paystack
```

## Environment Variables Required

Add the following to your `.env` file:

```
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

## Setup Instructions

1. **Get Paystack API Keys**
   - Log in to your Paystack Dashboard at https://dashboard.paystack.com
   - Navigate to Settings > API Keys & Webhooks
   - Copy your Secret Key and Public Key

2. **Configure Webhook**
   - In Paystack Dashboard, go to Settings > API Keys & Webhooks
   - Under "Webhook URL", enter your webhook endpoint URL
   - Click "Save Changes"

3. **Events to Listen For**
   The webhook automatically handles these events:
   - `charge.success` - Payment was successful
   - `charge.failed` - Payment failed

4. **Testing**
   - Use Paystack's test cards to simulate payments
   - Monitor webhook events in Paystack Dashboard under Developers > Webhooks
   - Check your application logs for webhook processing details

## Security

The webhook verifies the Paystack signature on every request to ensure authenticity. Never disable signature verification in production.

## Test Cards

Use these Paystack test cards:
- **Success**: 4084 0840 8408 4081
- **Declined**: 5060 6666 6666 6666 4055

CVV: Any 3 digits
Expiry: Any future date
PIN: 1234 (if required)
OTP: Will be displayed during test
