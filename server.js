require('dotenv').config();
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const API_TOKEN = process.env.API_TOKEN || 'your-secret-token-here';

// Middleware to parse JSON bodies
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Token verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader?.replace('Bearer ', '');
  const tokenFromQuery = req.query.token;
  const token = tokenFromHeader || tokenFromQuery;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Missing authentication token',
      message: 'Please provide token via Authorization header (Bearer <token>) or query parameter (?token=<token>)'
    });
  }

  if (token !== API_TOKEN) {
    return res.status(403).json({
      success: false,
      error: 'Invalid token',
      message: 'The provided token is not valid'
    });
  }

  next();
};

// Mock customer/order data
const mockOrders = {
  'ORD001': {
    orderId: 'ORD001',
    customerName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0101',
    deliveryStatus: 'shipped',
    deliveryDate: '2024-12-01',
    trackingNumber: 'TRK123456789',
    shippingAddress: '123 Main St, New York, NY 10001',
    items: [
      { name: 'Wireless Headphones', quantity: 1, price: 99.99 },
      { name: 'Phone Case', quantity: 2, price: 19.99 }
    ],
    totalAmount: 139.97,
    orderDate: '2024-11-25',
    lastUpdated: new Date().toISOString()
  },
  'ORD002': {
    orderId: 'ORD002',
    customerName: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0102',
    deliveryStatus: 'delivered',
    deliveryDate: '2024-11-20',
    trackingNumber: 'TRK987654321',
    shippingAddress: '456 Oak Ave, Los Angeles, CA 90001',
    items: [
      { name: 'Laptop Stand', quantity: 1, price: 49.99 }
    ],
    totalAmount: 49.99,
    orderDate: '2024-11-15',
    lastUpdated: new Date().toISOString()
  },
  'ORD003': {
    orderId: 'ORD003',
    customerName: 'Bob Wilson',
    email: 'bob.wilson@example.com',
    phone: '+1-555-0103',
    deliveryStatus: 'processing',
    deliveryDate: null,
    trackingNumber: null,
    shippingAddress: '789 Pine Rd, Chicago, IL 60601',
    items: [
      { name: 'USB-C Hub', quantity: 1, price: 79.99 },
      { name: 'Webcam', quantity: 1, price: 129.99 },
      { name: 'Mouse Pad', quantity: 1, price: 24.99 }
    ],
    totalAmount: 234.97,
    orderDate: '2024-11-26',
    lastUpdated: new Date().toISOString()
  }
};

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Mock API Server'
  });
});

// Get order by ID (protected endpoint)
app.get('/api/order/:orderId', verifyToken, (req, res) => {
  const { orderId } = req.params;
  const order = mockOrders[orderId.toUpperCase()];

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
      message: `No order found with ID: ${orderId}`
    });
  }

  res.json({
    success: true,
    data: order
  });
});

// POST endpoint for order lookup (alternative for Sobot integration)
app.post('/api/order/lookup', verifyToken, (req, res) => {
  const { orderId, orderNumber } = req.body;
  const id = orderId || orderNumber;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Missing order ID',
      message: 'Please provide orderId or orderNumber in request body'
    });
  }

  const order = mockOrders[id.toUpperCase()];

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
      message: `No order found with ID: ${id}`
    });
  }

  // Flat response structure for Sobot compatibility (no nested 'data' object)
  res.json({
    success: true,
    orderId: order.orderId,
    customerName: order.customerName,
    email: order.email,
    phone: order.phone,
    deliveryStatus: order.deliveryStatus,
    deliveryDate: order.deliveryDate,
    trackingNumber: order.trackingNumber,
    shippingAddress: order.shippingAddress,
    totalAmount: order.totalAmount,
    orderDate: order.orderDate,
    lastUpdated: order.lastUpdated
  });
});

// Get customer info by order ID
app.get('/api/customer/:orderId', verifyToken, (req, res) => {
  const { orderId } = req.params;
  const order = mockOrders[orderId.toUpperCase()];

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
      message: `No order found with ID: ${orderId}`
    });
  }

  // Return only customer-related info
  res.json({
    success: true,
    data: {
      orderId: order.orderId,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      shippingAddress: order.shippingAddress
    }
  });
});

// Get delivery status by order ID
app.get('/api/delivery/:orderId', verifyToken, (req, res) => {
  const { orderId } = req.params;
  const order = mockOrders[orderId.toUpperCase()];

  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found',
      message: `No order found with ID: ${orderId}`
    });
  }

  res.json({
    success: true,
    data: {
      orderId: order.orderId,
      deliveryStatus: order.deliveryStatus,
      deliveryDate: order.deliveryDate,
      trackingNumber: order.trackingNumber,
      shippingAddress: order.shippingAddress,
      lastUpdated: order.lastUpdated
    }
  });
});

// List all orders (for testing)
app.get('/api/orders', verifyToken, (req, res) => {
  const orders = Object.values(mockOrders).map(order => ({
    orderId: order.orderId,
    customerName: order.customerName,
    deliveryStatus: order.deliveryStatus,
    totalAmount: order.totalAmount,
    orderDate: order.orderDate
  }));

  res.json({
    success: true,
    count: orders.length,
    data: orders
  });
});

// Catch-all for undefined routes (Express 5 syntax)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health - Health check (no auth)',
      'GET /api/orders - List all orders',
      'GET /api/order/:orderId - Get full order details',
      'POST /api/order/lookup - Lookup order by ID in body',
      'GET /api/customer/:orderId - Get customer info',
      'GET /api/delivery/:orderId - Get delivery status'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║              Mock API Server Started                       ║
╠════════════════════════════════════════════════════════════╣
║  Local URL:    http://localhost:${PORT}                       ║
║  API Token:    ${API_TOKEN.substring(0, 10)}...                            ║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║    GET  /health              - Health check (no auth)      ║
║    GET  /api/orders          - List all orders             ║
║    GET  /api/order/:id       - Get order details           ║
║    POST /api/order/lookup    - Lookup order by ID          ║
║    GET  /api/customer/:id    - Get customer info           ║
║    GET  /api/delivery/:id    - Get delivery status         ║
╠════════════════════════════════════════════════════════════╣
║  Test Order IDs: ORD001, ORD002, ORD003                    ║
╚════════════════════════════════════════════════════════════╝
  `);
});
