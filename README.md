# Mock API Server for Sobot Integration

A simple mock API server that can be exposed online via ngrok/localtunnel for testing external SaaS integrations (like Sobot).

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
# Copy the example env file
cp .env.example .env

# Edit .env to set your desired API token
# API_TOKEN=your-secret-token-here
```

### 3. Start the server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

### 4. Expose to internet (choose one option)

**Option A: Using localtunnel (easiest, no signup)**
```bash
npx localtunnel --port 3000
# This will give you a URL like: https://xxx-xxx-xxx.loca.lt
```

**Option B: Using ngrok (more reliable, requires signup)**
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
# This will give you a URL like: https://xxxx.ngrok.io
```

**Option C: Using cloudflared (Cloudflare Tunnel)**
```bash
# Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
cloudflared tunnel --url http://localhost:3000
```

## API Endpoints

All endpoints (except `/health`) require authentication via:
- Header: `Authorization: Bearer <your-token>`
- OR Query parameter: `?token=<your-token>`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check (no auth required) |
| GET | `/api/orders` | List all orders |
| GET | `/api/order/:orderId` | Get full order details |
| POST | `/api/order/lookup` | Lookup order by ID in request body |
| GET | `/api/customer/:orderId` | Get customer info only |
| GET | `/api/delivery/:orderId` | Get delivery status only |

## Test Order IDs

The following test orders are available:
- `ORD001` - Shipped order (John Doe)
- `ORD002` - Delivered order (Jane Smith)
- `ORD003` - Processing order (Bob Wilson)

## Example Requests

### Using curl with header authentication:
```bash
# Get order details
curl -H "Authorization: Bearer sobot-integration-token-2024" \
  https://your-tunnel-url.loca.lt/api/order/ORD001

# Get delivery status
curl -H "Authorization: Bearer sobot-integration-token-2024" \
  https://your-tunnel-url.loca.lt/api/delivery/ORD001
```

### Using curl with query parameter:
```bash
curl "https://your-tunnel-url.loca.lt/api/order/ORD001?token=sobot-integration-token-2024"
```

### POST request for order lookup:
```bash
curl -X POST \
  -H "Authorization: Bearer sobot-integration-token-2024" \
  -H "Content-Type: application/json" \
  -d '{"orderId": "ORD001"}' \
  https://your-tunnel-url.loca.lt/api/order/lookup
```

## Example Response

```json
{
  "success": true,
  "data": {
    "orderId": "ORD001",
    "customerName": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0101",
    "deliveryStatus": "shipped",
    "deliveryDate": "2024-12-01",
    "trackingNumber": "TRK123456789",
    "shippingAddress": "123 Main St, New York, NY 10001",
    "items": [...],
    "totalAmount": 139.97,
    "orderDate": "2024-11-25"
  }
}
```

## Sobot Integration

1. Start the server and tunnel
2. Copy the public URL (e.g., `https://xxx.loca.lt`)
3. In Sobot, configure the API endpoint with:
   - URL: `https://xxx.loca.lt/api/order/lookup` (or other endpoint)
   - Method: POST (or GET depending on endpoint)
   - Header: `Authorization: Bearer sobot-integration-token-2024`
4. Sobot will send requests with order IDs and receive customer/delivery data

## Customizing Mock Data

Edit the `mockOrders` object in `server.js` to add your own test data.

---
*Originally: BojioStudio - Hello, world!*
