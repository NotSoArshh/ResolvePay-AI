# ResolvePay AI

> **"Turn payment disputes into quick, intelligent resolutions."**

ResolvePay AI is an AI-powered payment dispute resolution platform designed specifically for small and medium-sized online merchants. It bridges customer payment complaints, genuine **PayPal Sandbox** transaction data, and merchant refund policies using **Gemini 3.8 Flash** structured reasoning.

---

## 🌟 Key Features

1. **Intelligent Complaint Classification**
   - Parses unstructured customer narratives into 6 core payment dispute vectors:
     - Payment not received
     - Duplicate payment / double capture
     - Direct refund request
     - Order not confirmed / payment deducted
     - Incorrect transaction amount
     - General payment & fulfillment issues

2. **Verified PayPal Sandbox Integration**
   - Direct OAuth2 token generation and REST capture verification.
   - Cross-checks capture status (`COMPLETED`, `REFUNDED`, `PENDING`), payer details, transaction fees, and timestamps before any resolution is proposed.
   - Zero-hallucination policy: claims are evaluated strictly against verified PayPal records.

3. **Merchant Policy Guardrails**
   - Configurable merchant parameters:
     - Return window days (default: 30 days)
     - Duplicate charge detection interval (default: 60 minutes)
     - High-value auto-escalation thresholds ($250+)
     - Warehouse return receipt requirements

4. **Human-in-the-Loop Merchant Governance**
   - **Zero automated rogue refunds**. Gemini recommends actions with explicit confidence scores and evidence summaries; the merchant administrator must explicitly authorize execution.
   - Idempotent PayPal refund execution preventing accidental double-credits.

5. **Customer-Facing Portal & Real-Time Tracking**
   - Public dispute submission portal generating tracking IDs (e.g., `RPC-84920`).
   - Transparent customer updates and progress monitoring.

6. **Automated Verification Test Suite**
   - In-app test runner executing 9 automated verification checks (idempotency, classification, policy boundaries, PayPal fallback, and schema conformance).

---

## 🚀 Quick Start

### 1. Installation & Local Development

```bash
# Install dependencies
npm install

# Start the full-stack server (Vite + Express)
npm run dev
```

Visit `http://localhost:3000` in your browser.

### 2. Environment Variables (`.env`)

```ini
# Gemini API Key (Automatically configured in AI Studio)
GEMINI_API_KEY="your_gemini_api_key"

# Optional: Real PayPal Sandbox Credentials (Demo mode works out of the box)
PAYPAL_CLIENT_ID="your_sandbox_client_id"
PAYPAL_CLIENT_SECRET="your_sandbox_client_secret"
PAYPAL_BASE_URL="https://api-m.sandbox.paypal.com"
```

---

## 🧪 Built-In Demo Scenarios

Click the quick scenario buttons in the dashboard header to test these live:

- **Scenario 1: Order Not Confirmed ($50.00)**
  Customer paid $50.00, capture completed in PayPal Sandbox, but OMS order confirmation failed. AI recommends order verification and fulfillment push or refund.
- **Scenario 2: Verified Merchandise Return ($149.99)**
  Customer returned apparel within the 30-day window; warehouse logged intake. AI recommends immediate approval of $149.99 PayPal refund.
- **Scenario 3: Duplicate Checkout Charge ($28.50)**
  Checkout lag caused double submission within 3 minutes. AI verifies two captures, preserves primary order, and recommends refunding the second duplicate capture.
- **Scenario 4: Out-of-Policy Dispute ($320.00)**
  Customer requests refund 65 days after delivery. Exceeds 30-day window and $250 auto-escalation limit. AI recommends claim rejection with clear policy rationale.

---

## 📚 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/complaints` | `GET` | List complaints with status, category, or search filters |
| `/api/complaints` | `POST` | Customer submit dispute (creates tracking ID & runs AI analysis) |
| `/api/complaints/:id` | `GET` | Detailed dispute view with transaction & audit logs |
| `/api/complaints/:id/analyze` | `POST` | Re-analyze dispute with Gemini 3.8 Flash |
| `/api/complaints/:id/approve` | `POST` | Merchant approves resolution (executes PayPal refund if applicable) |
| `/api/complaints/:id/reject` | `POST` | Merchant rejects dispute with rationale |
| `/api/complaints/:id/escalate`| `POST` | Merchant escalates case to Tier-2 Operations |
| `/api/transactions` | `GET` | List recorded PayPal transactions |
| `/api/paypal/status` | `GET` | Retrieve PayPal integration connectivity state |
| `/api/paypal/transaction/:id`| `GET` | Inspect live PayPal Sandbox capture |
| `/api/analytics` | `GET` | Compute live metrics from verified dispute records |
| `/api/demo/seed` | `POST` | Reset demo state to clean fixtures |
