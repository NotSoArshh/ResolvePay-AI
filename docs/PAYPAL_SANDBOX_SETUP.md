# PayPal Sandbox Setup Guide for ResolvePay AI

This guide walks you through connecting genuine PayPal Sandbox credentials to ResolvePay AI.

## 1. Access the PayPal Developer Dashboard

1. Navigate to [https://developer.paypal.com](https://developer.paypal.com) and log in with your PayPal account.
2. In the dashboard menu, go to **Apps & Credentials**.
3. Toggle the environment switch to **Sandbox**.
4. Click **Create App**.
   - App Name: `ResolvePay AI Dispute Integration`
   - App Type: `Merchant`
5. Copy your **Client ID** and click "Show" to copy your **Secret Key**.

## 2. Set Up Sandbox Test Accounts

1. Under **Testing Tools** > **Sandbox Accounts**, note the generated:
   - Personal (Buyer) account: `buyer-XXXX@personal.example.com`
   - Business (Merchant) account: `merchant-XXXX@business.example.com`

## 3. Configure ResolvePay AI

Create or update `.env` in the root of your project:

```bash
PAYPAL_CLIENT_ID="your_sandbox_client_id_here"
PAYPAL_CLIENT_SECRET="your_sandbox_client_secret_here"
PAYPAL_BASE_URL="https://api-m.sandbox.paypal.com"
```

## 4. Supported PayPal REST APIs

ResolvePay AI interacts with the following official PayPal REST v2 endpoints:

- **OAuth 2.0 Token Generation**: `POST /v1/oauth2/token`
- **Capture Details Verification**: `GET /v2/payments/captures/{capture_id}`
- **Checkout Order Details**: `GET /v2/checkout/orders/{order_id}`
- **Idempotent Refund Execution**: `POST /v2/payments/captures/{capture_id}/refund`
  - Header: `PayPal-Request-Id: {idempotency_key}`
- **Refund Status Retrieval**: `GET /v2/payments/refunds/{refund_id}`

## 5. Testing Refund Execution

When a dispute is approved with action `approve_full_refund`:
1. ResolvePay AI attaches the `PayPal-Request-Id` (idempotency key derived from tracking reference).
2. Sends the refund instruction to the PayPal Sandbox capture endpoint.
3. Records the returned PayPal Refund ID (e.g. `RF-8829104KK`) in the immutable audit log.
4. Marks the transaction as `REFUNDED` and updates the customer tracking view.
