# Project Documentation

## Overview
Mock API server for Sobot chatbot integration, with plans for Shopify order lookup.

## Quick Start

```bash
# Start the server
node server.js

# Start ngrok tunnel (in separate terminal)
ngrok http 3000
```

## Sobot Integration

### Preferred API URL

```
https://<ngrok-url>/api/order/lookup
```

> **Note:** Free ngrok URLs change on each restart. Update Sobot config accordingly.

**Current ngrok URL:**
```
https://abrasively-unliquefiable-lucinda.ngrok-free.dev/api/order/lookup
```

### Why `/api/order/lookup`?

- **POST method** — matches Sobot's request style
- **Accepts orderId in body** — Sobot sends variables in JSON body
- **Flat JSON response** — Sobot cannot parse nested paths like `orders[0].name`
- **Flexible auth** — accepts token in header or body

### Sobot Header Configuration

| Parameter Name | Value |
|----------------|-------|
| Authorization | Bearer ET9GT8WTUI45LUE53TPW1QLXXVZNA11V |
| Content-Type | application/json |

### Sobot Request Parameters

Add: `orderId` — Order ID variable from chatbot flow

### Sobot Output Parameters

All flat (Sobot-compatible):
- `orderId`, `customerName`, `email`, `phone`
- `deliveryStatus`, `deliveryDate`, `trackingNumber`
- `shippingAddress`, `totalAmount`, `orderDate`

## All API Endpoints

### Order Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | No | Health check |
| `/api/order/lookup` | POST | Yes | **Preferred for Sobot** |
| `/api/orders` | GET | Yes | List all orders |
| `/api/order/:id` | GET | Yes | Get order by ID |
| `/api/customer/:id` | GET | Yes | Get customer info |
| `/api/delivery/:id` | GET | Yes | Get delivery status |

### Loan Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/loan/verify` | POST | Yes | **Verify identity & get loan info** |
| `/api/loans` | GET | Yes | List all loans (testing only) |

## Authentication

Token stored in `.env` as `API_TOKEN`

Server accepts token via (in priority order):
1. Header: `Authorization: Bearer <token>` (best practice)
2. Header: `token: <token>`
3. Query: `?token=<token>`
4. Body: `{ "token": "<token>" }`

## Sobot Platform Notes

- Sends token in BOTH header AND body (redundant but works)
- Adds metadata fields: `robotNo`, `docId`, `partnerId`, `source`, `multiParams`, `bsn`
- Cannot parse nested JSON — requires flat responses
- Origin IP: `13.215.102.22` (AWS Singapore)

## Shopify Integration (Planned)

Sobot cannot call Shopify directly because:
- Shopify uses `X-Shopify-Access-Token` header
- Shopify returns nested JSON
- Shopify moving to GraphQL API

**Solution:** Middleware endpoint `/api/shopify/order` to translate requests.

**Shopify Store:** `bobs-asia-v1`

**Token:** Create via Settings > Apps > Develop apps (needs `shpat_` prefix)

## Loan Verification Integration

### API URL

```
https://<ngrok-url>/api/loan/verify
```

### Flow

1. Chatbot collects: Account ID, Full Name, Birthdate, HKID
2. All 4 fields sent in single POST request
3. If ALL fields match → return loan data
4. If ANY field mismatches → return error (no partial info)

### Sobot Request Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `accountId` | string | Loan account number | `LN001` |
| `fullName` | string | Full name in English | `Chan Tai Man` |
| `birthdate` | string | Date of birth (YYYY-MM-DD) | `1985-03-15` |
| `hkid` | string | Hong Kong ID card number | `A123456(7)` |

### Sobot Output Parameters

All flat (Sobot-compatible):
- `accountId`, `fullName`, `loanType`
- `principalAmount`, `remainingBalance`, `interestRate`
- `monthlyPayment`, `nextPaymentDate`, `nextPaymentAmount`
- `loanStatus`, `startDate`, `endDate`
- `totalPayments`, `paymentsMade`
- `phone`, `email`

### Loan Status Values

- `正常` — Active, payments on track
- `逾期` — Overdue (nextPaymentAmount includes arrears)
- `已清還` — Fully paid off

### Test Accounts

| Account ID | Name | Birthdate | HKID | Status |
|------------|------|-----------|------|--------|
| LN001 | Chan Tai Man | 1985-03-15 | A123456(7) | 正常 |
| LN002 | Wong Siu Ming | 1990-07-22 | B987654(3) | 正常 |
| LN009 | Tsang Siu Fung | 1987-04-25 | J456012(8) | 已清還 |
| LN016 | Siu Man Kit | 1986-07-14 | S567123(1) | 逾期 |

Full list: LN001 through LN030

## Development

```bash
# Check ngrok status
curl -s http://127.0.0.1:4040/api/tunnels | jq '.tunnels[0].public_url'

# Test orders: ORD001 through ORD050
# Test loans: LN001 through LN030
```
