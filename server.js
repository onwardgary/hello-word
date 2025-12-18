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
  const tokenFromAuthHeader = authHeader?.replace('Bearer ', '');
  const tokenFromCustomHeader = req.headers['token']; // Sobot custom token header
  const tokenFromQuery = req.query.token;
  const tokenFromBody = req.body?.token; // Token in request body
  const token = tokenFromAuthHeader || tokenFromCustomHeader || tokenFromQuery || tokenFromBody;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Missing authentication token',
      message: 'Please provide token via Authorization header (Bearer <token>), custom token header, query parameter (?token=<token>), or request body'
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

// Mock customer/order data - 50 orders with diverse scenarios
const mockOrders = {
  'ORD001': { orderId: 'ORD001', customerName: 'John Doe', email: 'john.doe@example.com', phone: '+1-555-0101', deliveryStatus: '已發貨', deliveryDate: '2024-12-01', trackingNumber: 'TRK123456789', shippingAddress: '123 Main St, New York, NY 10001', items: [{ name: 'Wireless Headphones', quantity: 1, price: 99.99 }], totalAmount: 99.99, orderDate: '2024-11-25', lastUpdated: new Date().toISOString() },
  'ORD002': { orderId: 'ORD002', customerName: 'Jane Smith', email: 'jane.smith@example.com', phone: '+1-555-0102', deliveryStatus: '已送達', deliveryDate: '2024-11-20', trackingNumber: 'TRK987654321', shippingAddress: '456 Oak Ave, Los Angeles, CA 90001', items: [{ name: 'Laptop Stand', quantity: 1, price: 49.99 }], totalAmount: 49.99, orderDate: '2024-11-15', lastUpdated: new Date().toISOString() },
  'ORD003': { orderId: 'ORD003', customerName: 'Bob Wilson', email: 'bob.wilson@example.com', phone: '+1-555-0103', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '789 Pine Rd, Chicago, IL 60601', items: [{ name: 'USB-C Hub', quantity: 1, price: 79.99 }], totalAmount: 79.99, orderDate: '2024-11-26', lastUpdated: new Date().toISOString() },
  'ORD004': { orderId: 'ORD004', customerName: 'Alice Johnson', email: 'alice.j@example.com', phone: '+1-555-0104', deliveryStatus: '已送達', deliveryDate: '2024-11-18', trackingNumber: 'TRK111222333', shippingAddress: '321 Elm St, Boston, MA 02101', items: [{ name: 'Mechanical Keyboard', quantity: 1, price: 159.99 }], totalAmount: 159.99, orderDate: '2024-11-10', lastUpdated: new Date().toISOString() },
  'ORD005': { orderId: 'ORD005', customerName: 'Carlos Martinez', email: 'carlos.m@example.com', phone: '+1-555-0105', deliveryStatus: '已發貨', deliveryDate: '2024-12-02', trackingNumber: 'TRK444555666', shippingAddress: '567 Cedar Ln, Miami, FL 33101', items: [{ name: 'Gaming Mouse', quantity: 2, price: 89.99 }], totalAmount: 179.98, orderDate: '2024-11-27', lastUpdated: new Date().toISOString() },
  'ORD006': { orderId: 'ORD006', customerName: 'Diana Chen', email: 'diana.chen@example.com', phone: '+1-555-0106', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '890 Maple Dr, Seattle, WA 98101', items: [{ name: 'Monitor 27"', quantity: 1, price: 349.99 }], totalAmount: 349.99, orderDate: '2024-11-28', lastUpdated: new Date().toISOString() },
  'ORD007': { orderId: 'ORD007', customerName: 'Edward Lee', email: 'edward.lee@example.com', phone: '+1-555-0107', deliveryStatus: '已送達', deliveryDate: '2024-11-22', trackingNumber: 'TRK777888999', shippingAddress: '234 Birch Ave, Portland, OR 97201', items: [{ name: 'Desk Lamp', quantity: 1, price: 45.99 }], totalAmount: 45.99, orderDate: '2024-11-16', lastUpdated: new Date().toISOString() },
  'ORD008': { orderId: 'ORD008', customerName: 'Fiona Garcia', email: 'fiona.g@example.com', phone: '+1-555-0108', deliveryStatus: '已發貨', deliveryDate: '2024-12-03', trackingNumber: 'TRK101112131', shippingAddress: '678 Spruce St, Austin, TX 78701', items: [{ name: 'Ergonomic Chair', quantity: 1, price: 299.99 }], totalAmount: 299.99, orderDate: '2024-11-26', lastUpdated: new Date().toISOString() },
  'ORD009': { orderId: 'ORD009', customerName: 'George Park', email: 'george.park@example.com', phone: '+1-555-0109', deliveryStatus: '已送達', deliveryDate: '2024-11-19', trackingNumber: 'TRK141516171', shippingAddress: '912 Walnut Blvd, Denver, CO 80201', items: [{ name: 'Wireless Mouse', quantity: 3, price: 29.99 }], totalAmount: 89.97, orderDate: '2024-11-12', lastUpdated: new Date().toISOString() },
  'ORD010': { orderId: 'ORD010', customerName: 'Hannah Kim', email: 'hannah.kim@example.com', phone: '+1-555-0110', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '345 Ash Ct, Phoenix, AZ 85001', items: [{ name: 'Laptop Sleeve', quantity: 1, price: 34.99 }], totalAmount: 34.99, orderDate: '2024-11-28', lastUpdated: new Date().toISOString() },
  'ORD011': { orderId: 'ORD011', customerName: 'Ivan Petrov', email: 'ivan.p@example.com', phone: '+1-555-0111', deliveryStatus: '已發貨', deliveryDate: '2024-12-04', trackingNumber: 'TRK181920212', shippingAddress: '789 Cypress Way, Atlanta, GA 30301', items: [{ name: 'USB Cable 6ft', quantity: 5, price: 12.99 }], totalAmount: 64.95, orderDate: '2024-11-27', lastUpdated: new Date().toISOString() },
  'ORD012': { orderId: 'ORD012', customerName: 'Julia Brown', email: 'julia.brown@example.com', phone: '+1-555-0112', deliveryStatus: '已送達', deliveryDate: '2024-11-21', trackingNumber: 'TRK222324252', shippingAddress: '123 Redwood Ln, San Diego, CA 92101', items: [{ name: 'Phone Charger', quantity: 2, price: 24.99 }], totalAmount: 49.98, orderDate: '2024-11-14', lastUpdated: new Date().toISOString() },
  'ORD013': { orderId: 'ORD013', customerName: 'Kevin O\'Brien', email: 'kevin.ob@example.com', phone: '+1-555-0113', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '456 Sequoia Dr, Nashville, TN 37201', items: [{ name: 'Bluetooth Speaker', quantity: 1, price: 79.99 }], totalAmount: 79.99, orderDate: '2024-11-29', lastUpdated: new Date().toISOString() },
  'ORD014': { orderId: 'ORD014', customerName: 'Laura Davis', email: 'laura.davis@example.com', phone: '+1-555-0114', deliveryStatus: '已發貨', deliveryDate: '2024-12-05', trackingNumber: 'TRK262728293', shippingAddress: '789 Magnolia St, Charlotte, NC 28201', items: [{ name: 'Tablet Case', quantity: 1, price: 39.99 }], totalAmount: 39.99, orderDate: '2024-11-28', lastUpdated: new Date().toISOString() },
  'ORD015': { orderId: 'ORD015', customerName: 'Michael Wong', email: 'michael.w@example.com', phone: '+1-555-0115', deliveryStatus: '已送達', deliveryDate: '2024-11-23', trackingNumber: 'TRK303132333', shippingAddress: '234 Willow Rd, Detroit, MI 48201', items: [{ name: 'Screen Protector', quantity: 3, price: 9.99 }], totalAmount: 29.97, orderDate: '2024-11-17', lastUpdated: new Date().toISOString() },
  'ORD016': { orderId: 'ORD016', customerName: 'Nina Patel', email: 'nina.patel@example.com', phone: '+1-555-0116', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '567 Palm Ave, Las Vegas, NV 89101', items: [{ name: 'Power Bank 20000mAh', quantity: 1, price: 54.99 }], totalAmount: 54.99, orderDate: '2024-11-29', lastUpdated: new Date().toISOString() },
  'ORD017': { orderId: 'ORD017', customerName: 'Oscar Silva', email: 'oscar.silva@example.com', phone: '+1-555-0117', deliveryStatus: '已發貨', deliveryDate: '2024-12-06', trackingNumber: 'TRK343536373', shippingAddress: '890 Juniper Ln, Baltimore, MD 21201', items: [{ name: 'HDMI Cable 10ft', quantity: 2, price: 15.99 }], totalAmount: 31.98, orderDate: '2024-11-29', lastUpdated: new Date().toISOString() },
  'ORD018': { orderId: 'ORD018', customerName: 'Patricia Moore', email: 'patricia.m@example.com', phone: '+1-555-0118', deliveryStatus: '已送達', deliveryDate: '2024-11-24', trackingNumber: 'TRK383940414', shippingAddress: '321 Hickory Ct, Indianapolis, IN 46201', items: [{ name: 'Laptop Cooling Pad', quantity: 1, price: 44.99 }], totalAmount: 44.99, orderDate: '2024-11-18', lastUpdated: new Date().toISOString() },
  'ORD019': { orderId: 'ORD019', customerName: 'Quinn Taylor', email: 'quinn.taylor@example.com', phone: '+1-555-0119', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '654 Sycamore Blvd, Columbus, OH 43201', items: [{ name: 'External SSD 1TB', quantity: 1, price: 129.99 }], totalAmount: 129.99, orderDate: '2024-11-30', lastUpdated: new Date().toISOString() },
  'ORD020': { orderId: 'ORD020', customerName: 'Rachel Green', email: 'rachel.green@example.com', phone: '+1-555-0120', deliveryStatus: '已發貨', deliveryDate: '2024-12-07', trackingNumber: 'TRK424344454', shippingAddress: '987 Poplar St, Memphis, TN 38101', items: [{ name: 'Webcam HD', quantity: 1, price: 89.99 }], totalAmount: 89.99, orderDate: '2024-11-30', lastUpdated: new Date().toISOString() },
  'ORD021': { orderId: 'ORD021', customerName: 'Samuel Anderson', email: 'samuel.a@example.com', phone: '+1-555-0121', deliveryStatus: '已送達', deliveryDate: '2024-11-25', trackingNumber: 'TRK464748495', shippingAddress: '135 Beech Dr, Milwaukee, WI 53201', items: [{ name: 'Microphone USB', quantity: 1, price: 69.99 }], totalAmount: 69.99, orderDate: '2024-11-19', lastUpdated: new Date().toISOString() },
  'ORD022': { orderId: 'ORD022', customerName: 'Tina Jackson', email: 'tina.jackson@example.com', phone: '+1-555-0122', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '246 Chestnut Ave, Louisville, KY 40201', items: [{ name: 'Gaming Headset', quantity: 1, price: 119.99 }], totalAmount: 119.99, orderDate: '2024-12-01', lastUpdated: new Date().toISOString() },
  'ORD023': { orderId: 'ORD023', customerName: 'Ulysses Grant', email: 'ulysses.g@example.com', phone: '+1-555-0123', deliveryStatus: '已發貨', deliveryDate: '2024-12-08', trackingNumber: 'TRK505152535', shippingAddress: '369 Dogwood Ln, Albuquerque, NM 87101', items: [{ name: 'Smart Watch', quantity: 1, price: 249.99 }], totalAmount: 249.99, orderDate: '2024-12-01', lastUpdated: new Date().toISOString() },
  'ORD024': { orderId: 'ORD024', customerName: 'Vanessa White', email: 'vanessa.w@example.com', phone: '+1-555-0124', deliveryStatus: '已送達', deliveryDate: '2024-11-26', trackingNumber: 'TRK545556575', shippingAddress: '482 Fir St, Tucson, AZ 85701', items: [{ name: 'Fitness Tracker', quantity: 2, price: 79.99 }], totalAmount: 159.98, orderDate: '2024-11-20', lastUpdated: new Date().toISOString() },
  'ORD025': { orderId: 'ORD025', customerName: 'Walter Scott', email: 'walter.scott@example.com', phone: '+1-555-0125', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '795 Hemlock Rd, Fresno, CA 93701', items: [{ name: 'Wireless Earbuds', quantity: 1, price: 149.99 }], totalAmount: 149.99, orderDate: '2024-12-02', lastUpdated: new Date().toISOString() },
  'ORD026': { orderId: 'ORD026', customerName: 'Xena Warrior', email: 'xena.w@example.com', phone: '+1-555-0126', deliveryStatus: '已發貨', deliveryDate: '2024-12-09', trackingNumber: 'TRK585960616', shippingAddress: '108 Larch Ct, Sacramento, CA 95814', items: [{ name: 'Portable Charger', quantity: 1, price: 39.99 }], totalAmount: 39.99, orderDate: '2024-12-02', lastUpdated: new Date().toISOString() },
  'ORD027': { orderId: 'ORD027', customerName: 'Yuri Volkov', email: 'yuri.v@example.com', phone: '+1-555-0127', deliveryStatus: '已送達', deliveryDate: '2024-11-27', trackingNumber: 'TRK626364656', shippingAddress: '321 Alder Way, Kansas City, MO 64101', items: [{ name: 'Keyboard Cover', quantity: 1, price: 19.99 }], totalAmount: 19.99, orderDate: '2024-11-21', lastUpdated: new Date().toISOString() },
  'ORD028': { orderId: 'ORD028', customerName: 'Zara Khan', email: 'zara.khan@example.com', phone: '+1-555-0128', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '654 Cottonwood Blvd, Mesa, AZ 85201', items: [{ name: 'Monitor Arm', quantity: 1, price: 99.99 }], totalAmount: 99.99, orderDate: '2024-12-03', lastUpdated: new Date().toISOString() },
  'ORD029': { orderId: 'ORD029', customerName: 'Aaron Hughes', email: 'aaron.h@example.com', phone: '+1-555-0129', deliveryStatus: '已發貨', deliveryDate: '2024-12-10', trackingNumber: 'TRK666768697', shippingAddress: '987 Buttonwood Dr, Atlanta, GA 30303', items: [{ name: 'Desk Organizer', quantity: 1, price: 29.99 }], totalAmount: 29.99, orderDate: '2024-12-03', lastUpdated: new Date().toISOString() },
  'ORD030': { orderId: 'ORD030', customerName: 'Bella Ross', email: 'bella.ross@example.com', phone: '+1-555-0130', deliveryStatus: '已送達', deliveryDate: '2024-11-28', trackingNumber: 'TRK707172737', shippingAddress: '135 Buckeye Ln, Colorado Springs, CO 80901', items: [{ name: 'Phone Stand', quantity: 2, price: 14.99 }], totalAmount: 29.98, orderDate: '2024-11-22', lastUpdated: new Date().toISOString() },
  'ORD031': { orderId: 'ORD031', customerName: 'Carter Evans', email: 'carter.e@example.com', phone: '+1-555-0131', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '246 Ironwood St, Raleigh, NC 27601', items: [{ name: 'Laptop Bag', quantity: 1, price: 59.99 }], totalAmount: 59.99, orderDate: '2024-12-04', lastUpdated: new Date().toISOString() },
  'ORD032': { orderId: 'ORD032', customerName: 'Daisy Miller', email: 'daisy.m@example.com', phone: '+1-555-0132', deliveryStatus: '已發貨', deliveryDate: '2024-12-11', trackingNumber: 'TRK747576777', shippingAddress: '369 Basswood Ave, Omaha, NE 68101', items: [{ name: 'Cable Management Box', quantity: 1, price: 24.99 }], totalAmount: 24.99, orderDate: '2024-12-04', lastUpdated: new Date().toISOString() },
  'ORD033': { orderId: 'ORD033', customerName: 'Ethan Cooper', email: 'ethan.c@example.com', phone: '+1-555-0133', deliveryStatus: '已送達', deliveryDate: '2024-11-29', trackingNumber: 'TRK787980818', shippingAddress: '482 Locust Ct, Miami, FL 33130', items: [{ name: 'Surge Protector', quantity: 1, price: 34.99 }], totalAmount: 34.99, orderDate: '2024-11-23', lastUpdated: new Date().toISOString() },
  'ORD034': { orderId: 'ORD034', customerName: 'Faith Turner', email: 'faith.t@example.com', phone: '+1-555-0134', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '795 Magnolia Blvd, Oakland, CA 94601', items: [{ name: 'Ring Light', quantity: 1, price: 49.99 }], totalAmount: 49.99, orderDate: '2024-12-05', lastUpdated: new Date().toISOString() },
  'ORD035': { orderId: 'ORD035', customerName: 'Gabriel Martin', email: 'gabriel.m@example.com', phone: '+1-555-0135', deliveryStatus: '已發貨', deliveryDate: '2024-12-12', trackingNumber: 'TRK828384858', shippingAddress: '108 Persimmon Dr, Minneapolis, MN 55401', items: [{ name: 'Green Screen', quantity: 1, price: 79.99 }], totalAmount: 79.99, orderDate: '2024-12-05', lastUpdated: new Date().toISOString() },
  'ORD036': { orderId: 'ORD036', customerName: 'Holly Nelson', email: 'holly.n@example.com', phone: '+1-555-0136', deliveryStatus: '已送達', deliveryDate: '2024-11-30', trackingNumber: 'TRK868788899', shippingAddress: '321 Catalpa Way, Tulsa, OK 74101', items: [{ name: 'Tripod Stand', quantity: 1, price: 44.99 }], totalAmount: 44.99, orderDate: '2024-11-24', lastUpdated: new Date().toISOString() },
  'ORD037': { orderId: 'ORD037', customerName: 'Isaac Brooks', email: 'isaac.b@example.com', phone: '+1-555-0137', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '654 Mulberry Ln, Wichita, KS 67201', items: [{ name: 'Drawing Tablet', quantity: 1, price: 199.99 }], totalAmount: 199.99, orderDate: '2024-12-06', lastUpdated: new Date().toISOString() },
  'ORD038': { orderId: 'ORD038', customerName: 'Jasmine Reed', email: 'jasmine.r@example.com', phone: '+1-555-0138', deliveryStatus: '已發貨', deliveryDate: '2024-12-13', trackingNumber: 'TRK909192939', shippingAddress: '987 Hackberry St, New Orleans, LA 70112', items: [{ name: 'Graphics Card', quantity: 1, price: 599.99 }], totalAmount: 599.99, orderDate: '2024-12-06', lastUpdated: new Date().toISOString() },
  'ORD039': { orderId: 'ORD039', customerName: 'Kyle Foster', email: 'kyle.f@example.com', phone: '+1-555-0139', deliveryStatus: '已送達', deliveryDate: '2024-12-01', trackingNumber: 'TRK949596979', shippingAddress: '135 Laurel Ct, Cleveland, OH 44101', items: [{ name: 'RAM 16GB', quantity: 2, price: 89.99 }], totalAmount: 179.98, orderDate: '2024-11-25', lastUpdated: new Date().toISOString() },
  'ORD040': { orderId: 'ORD040', customerName: 'Lily Campbell', email: 'lily.c@example.com', phone: '+1-555-0140', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '246 Pecan Ave, Tampa, FL 33601', items: [{ name: 'SSD 500GB', quantity: 1, price: 79.99 }], totalAmount: 79.99, orderDate: '2024-12-07', lastUpdated: new Date().toISOString() },
  'ORD041': { orderId: 'ORD041', customerName: 'Mason Powell', email: 'mason.p@example.com', phone: '+1-555-0141', deliveryStatus: '已發貨', deliveryDate: '2024-12-14', trackingNumber: 'TRK989900010', shippingAddress: '369 Sweetgum Dr, Honolulu, HI 96801', items: [{ name: 'Cooling Fan 120mm', quantity: 3, price: 19.99 }], totalAmount: 59.97, orderDate: '2024-12-07', lastUpdated: new Date().toISOString() },
  'ORD042': { orderId: 'ORD042', customerName: 'Nora Hughes', email: 'nora.hughes@example.com', phone: '+1-555-0142', deliveryStatus: '已送達', deliveryDate: '2024-12-02', trackingNumber: 'TRK020304050', shippingAddress: '482 Redbud Ln, Anaheim, CA 92801', items: [{ name: 'Motherboard', quantity: 1, price: 249.99 }], totalAmount: 249.99, orderDate: '2024-11-26', lastUpdated: new Date().toISOString() },
  'ORD043': { orderId: 'ORD043', customerName: 'Owen Bailey', email: 'owen.b@example.com', phone: '+1-555-0143', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '795 Hawthorn Blvd, St. Louis, MO 63101', items: [{ name: 'Power Supply 750W', quantity: 1, price: 129.99 }], totalAmount: 129.99, orderDate: '2024-12-08', lastUpdated: new Date().toISOString() },
  'ORD044': { orderId: 'ORD044', customerName: 'Penelope Gray', email: 'penelope.g@example.com', phone: '+1-555-0144', deliveryStatus: '已發貨', deliveryDate: '2024-12-15', trackingNumber: 'TRK060708091', shippingAddress: '108 Redcedar Way, Corpus Christi, TX 78401', items: [{ name: 'PC Case', quantity: 1, price: 89.99 }], totalAmount: 89.99, orderDate: '2024-12-08', lastUpdated: new Date().toISOString() },
  'ORD045': { orderId: 'ORD045', customerName: 'Quincy Rivera', email: 'quincy.r@example.com', phone: '+1-555-0145', deliveryStatus: '已送達', deliveryDate: '2024-12-03', trackingNumber: 'TRK101112131', shippingAddress: '321 Tamarack Ct, Riverside, CA 92501', items: [{ name: 'CPU Cooler', quantity: 1, price: 64.99 }], totalAmount: 64.99, orderDate: '2024-11-27', lastUpdated: new Date().toISOString() },
  'ORD046': { orderId: 'ORD046', customerName: 'Ruby Sanders', email: 'ruby.s@example.com', phone: '+1-555-0146', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '654 Serviceberry St, Lexington, KY 40501', items: [{ name: 'Thermal Paste', quantity: 2, price: 12.99 }], totalAmount: 25.98, orderDate: '2024-12-09', lastUpdated: new Date().toISOString() },
  'ORD047': { orderId: 'ORD047', customerName: 'Sebastian Cole', email: 'sebastian.c@example.com', phone: '+1-555-0147', deliveryStatus: '已發貨', deliveryDate: '2024-12-16', trackingNumber: 'TRK141516171', shippingAddress: '987 Silverbark Dr, Anchorage, AK 99501', items: [{ name: 'Wi-Fi Card', quantity: 1, price: 39.99 }], totalAmount: 39.99, orderDate: '2024-12-09', lastUpdated: new Date().toISOString() },
  'ORD048': { orderId: 'ORD048', customerName: 'Tessa Wood', email: 'tessa.w@example.com', phone: '+1-555-0148', deliveryStatus: '已送達', deliveryDate: '2024-12-04', trackingNumber: 'TRK181920212', shippingAddress: '135 Boxwood Ave, Stockton, CA 95201', items: [{ name: 'Sound Card', quantity: 1, price: 79.99 }], totalAmount: 79.99, orderDate: '2024-11-28', lastUpdated: new Date().toISOString() },
  'ORD049': { orderId: 'ORD049', customerName: 'Uriel Barnes', email: 'uriel.b@example.com', phone: '+1-555-0149', deliveryStatus: '處理中', deliveryDate: null, trackingNumber: null, shippingAddress: '246 Sourwood Ln, Henderson, NV 89001', items: [{ name: 'RGB Lighting Kit', quantity: 1, price: 54.99 }], totalAmount: 54.99, orderDate: '2024-12-10', lastUpdated: new Date().toISOString() },
  'ORD050': { orderId: 'ORD050', customerName: 'Violet Fisher', email: 'violet.f@example.com', phone: '+1-555-0150', deliveryStatus: '已發貨', deliveryDate: '2024-12-17', trackingNumber: 'TRK222324252', shippingAddress: '369 Bitternut Ct, Lincoln, NE 68501', items: [{ name: 'LED Strip Lights', quantity: 2, price: 29.99 }], totalAmount: 59.98, orderDate: '2024-12-10', lastUpdated: new Date().toISOString() }
};

// Mock loan account data - 30 accounts with Hong Kong ID format
// Verification requires: accountId + fullName + birthdate + hkid (all must match)
const mockLoans = {
  'LN001': { accountId: 'LN001', fullName: 'Chan Tai Man', birthdate: '1985-03-15', hkid: 'A123456(7)', loanType: '個人貸款', principalAmount: 100000, remainingBalance: 75000, interestRate: 5.5, monthlyPayment: 2500, nextPaymentDate: '2025-01-15', nextPaymentAmount: 2500, loanStatus: '正常', startDate: '2024-01-15', endDate: '2028-01-15', totalPayments: 48, paymentsMade: 12, phone: '+852-9123-4567', email: 'taiman.chan@email.com' },
  'LN002': { accountId: 'LN002', fullName: 'Wong Siu Ming', birthdate: '1990-07-22', hkid: 'B987654(3)', loanType: '汽車貸款', principalAmount: 250000, remainingBalance: 180000, interestRate: 4.8, monthlyPayment: 5200, nextPaymentDate: '2025-01-08', nextPaymentAmount: 5200, loanStatus: '正常', startDate: '2023-07-08', endDate: '2028-07-08', totalPayments: 60, paymentsMade: 18, phone: '+852-9234-5678', email: 'siuming.wong@email.com' },
  'LN003': { accountId: 'LN003', fullName: 'Lee Ka Yan', birthdate: '1988-11-30', hkid: 'C456789(1)', loanType: '房屋貸款', principalAmount: 5000000, remainingBalance: 4500000, interestRate: 3.2, monthlyPayment: 22000, nextPaymentDate: '2025-01-01', nextPaymentAmount: 22000, loanStatus: '正常', startDate: '2022-01-01', endDate: '2047-01-01', totalPayments: 300, paymentsMade: 36, phone: '+852-9345-6789', email: 'kayan.lee@email.com' },
  'LN004': { accountId: 'LN004', fullName: 'Ng Chi Wai', birthdate: '1975-05-08', hkid: 'D789012(5)', loanType: '個人貸款', principalAmount: 50000, remainingBalance: 12000, interestRate: 6.0, monthlyPayment: 1800, nextPaymentDate: '2025-01-20', nextPaymentAmount: 1800, loanStatus: '正常', startDate: '2023-04-20', endDate: '2025-10-20', totalPayments: 30, paymentsMade: 21, phone: '+852-9456-7890', email: 'chiwai.ng@email.com' },
  'LN005': { accountId: 'LN005', fullName: 'Lam Mei Ling', birthdate: '1992-09-14', hkid: 'E234567(9)', loanType: '教育貸款', principalAmount: 200000, remainingBalance: 160000, interestRate: 4.0, monthlyPayment: 3500, nextPaymentDate: '2025-01-25', nextPaymentAmount: 3500, loanStatus: '正常', startDate: '2023-09-25', endDate: '2028-09-25', totalPayments: 60, paymentsMade: 16, phone: '+852-9567-8901', email: 'meiling.lam@email.com' },
  'LN006': { accountId: 'LN006', fullName: 'Ho Wing Kei', birthdate: '1983-12-03', hkid: 'F567890(2)', loanType: '個人貸款', principalAmount: 80000, remainingBalance: 45000, interestRate: 5.8, monthlyPayment: 2200, nextPaymentDate: '2025-01-10', nextPaymentAmount: 2200, loanStatus: '正常', startDate: '2023-06-10', endDate: '2026-06-10', totalPayments: 36, paymentsMade: 19, phone: '+852-9678-9012', email: 'wingkei.ho@email.com' },
  'LN007': { accountId: 'LN007', fullName: 'Cheung Hoi Lam', birthdate: '1995-02-28', hkid: 'G890123(6)', loanType: '汽車貸款', principalAmount: 180000, remainingBalance: 120000, interestRate: 4.5, monthlyPayment: 4000, nextPaymentDate: '2025-01-05', nextPaymentAmount: 4000, loanStatus: '正常', startDate: '2023-11-05', endDate: '2027-11-05', totalPayments: 48, paymentsMade: 14, phone: '+852-9789-0123', email: 'hoilam.cheung@email.com' },
  'LN008': { accountId: 'LN008', fullName: 'Yip Wai Man', birthdate: '1980-06-17', hkid: 'H123789(4)', loanType: '房屋貸款', principalAmount: 3500000, remainingBalance: 2800000, interestRate: 3.5, monthlyPayment: 18000, nextPaymentDate: '2025-01-12', nextPaymentAmount: 18000, loanStatus: '正常', startDate: '2020-07-12', endDate: '2045-07-12', totalPayments: 300, paymentsMade: 54, phone: '+852-9890-1234', email: 'waiman.yip@email.com' },
  'LN009': { accountId: 'LN009', fullName: 'Tsang Siu Fung', birthdate: '1987-04-25', hkid: 'J456012(8)', loanType: '個人貸款', principalAmount: 120000, remainingBalance: 0, interestRate: 5.2, monthlyPayment: 0, nextPaymentDate: null, nextPaymentAmount: 0, loanStatus: '已清還', startDate: '2022-04-25', endDate: '2024-10-25', totalPayments: 30, paymentsMade: 30, phone: '+852-9901-2345', email: 'siufung.tsang@email.com' },
  'LN010': { accountId: 'LN010', fullName: 'Fung Yat Ming', birthdate: '1978-10-09', hkid: 'K789345(0)', loanType: '商業貸款', principalAmount: 500000, remainingBalance: 380000, interestRate: 6.5, monthlyPayment: 12000, nextPaymentDate: '2025-01-18', nextPaymentAmount: 12000, loanStatus: '正常', startDate: '2023-03-18', endDate: '2027-03-18', totalPayments: 48, paymentsMade: 22, phone: '+852-9012-3456', email: 'yatming.fung@email.com' },
  'LN011': { accountId: 'LN011', fullName: 'Kwok Lai Ping', birthdate: '1991-01-11', hkid: 'L012678(A)', loanType: '個人貸款', principalAmount: 60000, remainingBalance: 35000, interestRate: 5.5, monthlyPayment: 1600, nextPaymentDate: '2025-01-22', nextPaymentAmount: 1600, loanStatus: '正常', startDate: '2023-10-22', endDate: '2027-04-22', totalPayments: 42, paymentsMade: 15, phone: '+852-6123-4567', email: 'laiping.kwok@email.com' },
  'LN012': { accountId: 'LN012', fullName: 'Leung Chi Hung', birthdate: '1982-08-05', hkid: 'M345901(2)', loanType: '房屋貸款', principalAmount: 6500000, remainingBalance: 6200000, interestRate: 3.0, monthlyPayment: 25000, nextPaymentDate: '2025-01-03', nextPaymentAmount: 25000, loanStatus: '正常', startDate: '2024-03-03', endDate: '2049-03-03', totalPayments: 300, paymentsMade: 10, phone: '+852-6234-5678', email: 'chihung.leung@email.com' },
  'LN013': { accountId: 'LN013', fullName: 'Au Yeung Wai Yin', birthdate: '1993-06-20', hkid: 'N678234(5)', loanType: '汽車貸款', principalAmount: 320000, remainingBalance: 280000, interestRate: 4.2, monthlyPayment: 6500, nextPaymentDate: '2025-01-28', nextPaymentAmount: 6500, loanStatus: '正常', startDate: '2024-05-28', endDate: '2028-11-28', totalPayments: 54, paymentsMade: 8, phone: '+852-6345-6789', email: 'waiyin.auyeung@email.com' },
  'LN014': { accountId: 'LN014', fullName: 'Mak Kam Fai', birthdate: '1970-12-30', hkid: 'P901567(7)', loanType: '個人貸款', principalAmount: 150000, remainingBalance: 20000, interestRate: 5.0, monthlyPayment: 4200, nextPaymentDate: '2025-01-07', nextPaymentAmount: 4200, loanStatus: '正常', startDate: '2022-01-07', endDate: '2025-06-07', totalPayments: 42, paymentsMade: 36, phone: '+852-6456-7890', email: 'kamfai.mak@email.com' },
  'LN015': { accountId: 'LN015', fullName: 'Tam Hiu Tung', birthdate: '1996-03-08', hkid: 'R234890(9)', loanType: '教育貸款', principalAmount: 300000, remainingBalance: 290000, interestRate: 3.8, monthlyPayment: 4500, nextPaymentDate: '2025-01-30', nextPaymentAmount: 4500, loanStatus: '正常', startDate: '2024-09-30', endDate: '2030-09-30', totalPayments: 72, paymentsMade: 4, phone: '+852-6567-8901', email: 'hiutung.tam@email.com' },
  'LN016': { accountId: 'LN016', fullName: 'Siu Man Kit', birthdate: '1986-07-14', hkid: 'S567123(1)', loanType: '個人貸款', principalAmount: 90000, remainingBalance: 65000, interestRate: 5.9, monthlyPayment: 2800, nextPaymentDate: '2025-01-14', nextPaymentAmount: 5600, loanStatus: '逾期', startDate: '2023-08-14', endDate: '2026-08-14', totalPayments: 36, paymentsMade: 15, phone: '+852-6678-9012', email: 'mankit.siu@email.com' },
  'LN017': { accountId: 'LN017', fullName: 'Poon Sze Wan', birthdate: '1989-11-02', hkid: 'T890456(3)', loanType: '房屋貸款', principalAmount: 4200000, remainingBalance: 3600000, interestRate: 3.3, monthlyPayment: 19500, nextPaymentDate: '2025-01-16', nextPaymentAmount: 19500, loanStatus: '正常', startDate: '2021-09-16', endDate: '2046-09-16', totalPayments: 300, paymentsMade: 40, phone: '+852-6789-0123', email: 'szewan.poon@email.com' },
  'LN018': { accountId: 'LN018', fullName: 'Chow Pak Yin', birthdate: '1977-02-19', hkid: 'U123789(6)', loanType: '商業貸款', principalAmount: 800000, remainingBalance: 550000, interestRate: 7.0, monthlyPayment: 18000, nextPaymentDate: '2025-01-19', nextPaymentAmount: 18000, loanStatus: '正常', startDate: '2022-07-19', endDate: '2026-07-19', totalPayments: 48, paymentsMade: 30, phone: '+852-6890-1234', email: 'pakyin.chow@email.com' },
  'LN019': { accountId: 'LN019', fullName: 'Tse Ka Lok', birthdate: '1994-09-27', hkid: 'V456012(8)', loanType: '汽車貸款', principalAmount: 150000, remainingBalance: 0, interestRate: 4.6, monthlyPayment: 0, nextPaymentDate: null, nextPaymentAmount: 0, loanStatus: '已清還', startDate: '2021-09-27', endDate: '2024-09-27', totalPayments: 36, paymentsMade: 36, phone: '+852-6901-2345', email: 'kalok.tse@email.com' },
  'LN020': { accountId: 'LN020', fullName: 'Hui Wing Shan', birthdate: '1984-04-12', hkid: 'W789345(0)', loanType: '個人貸款', principalAmount: 200000, remainingBalance: 145000, interestRate: 5.3, monthlyPayment: 5000, nextPaymentDate: '2025-01-12', nextPaymentAmount: 5000, loanStatus: '正常', startDate: '2023-12-12', endDate: '2027-06-12', totalPayments: 42, paymentsMade: 13, phone: '+852-5123-4567', email: 'wingshan.hui@email.com' },
  'LN021': { accountId: 'LN021', fullName: 'Luk Yuen Ting', birthdate: '1998-12-25', hkid: 'X012678(2)', loanType: '教育貸款', principalAmount: 180000, remainingBalance: 175000, interestRate: 3.5, monthlyPayment: 3000, nextPaymentDate: '2025-01-25', nextPaymentAmount: 3000, loanStatus: '正常', startDate: '2024-10-25', endDate: '2030-04-25', totalPayments: 66, paymentsMade: 3, phone: '+852-5234-5678', email: 'yuenting.luk@email.com' },
  'LN022': { accountId: 'LN022', fullName: 'So Wai Hung', birthdate: '1981-05-31', hkid: 'Y345901(4)', loanType: '房屋貸款', principalAmount: 7000000, remainingBalance: 5800000, interestRate: 3.1, monthlyPayment: 28000, nextPaymentDate: '2025-01-06', nextPaymentAmount: 28000, loanStatus: '正常', startDate: '2019-11-06', endDate: '2044-11-06', totalPayments: 300, paymentsMade: 62, phone: '+852-5345-6789', email: 'waihung.so@email.com' },
  'LN023': { accountId: 'LN023', fullName: 'Tang Mei Yee', birthdate: '1990-08-18', hkid: 'Z678234(7)', loanType: '個人貸款', principalAmount: 70000, remainingBalance: 50000, interestRate: 5.7, monthlyPayment: 2000, nextPaymentDate: '2025-01-18', nextPaymentAmount: 4000, loanStatus: '逾期', startDate: '2023-11-18', endDate: '2027-05-18', totalPayments: 42, paymentsMade: 12, phone: '+852-5456-7890', email: 'meiyee.tang@email.com' },
  'LN024': { accountId: 'LN024', fullName: 'Yeung Tsz Kin', birthdate: '1973-01-07', hkid: 'AA901567(9)', loanType: '商業貸款', principalAmount: 1200000, remainingBalance: 900000, interestRate: 6.8, monthlyPayment: 25000, nextPaymentDate: '2025-01-07', nextPaymentAmount: 25000, loanStatus: '正常', startDate: '2022-10-07', endDate: '2026-10-07', totalPayments: 48, paymentsMade: 27, phone: '+852-5567-8901', email: 'tszkin.yeung@email.com' },
  'LN025': { accountId: 'LN025', fullName: 'Cheng Hoi Yan', birthdate: '1997-06-04', hkid: 'AB234890(1)', loanType: '汽車貸款', principalAmount: 220000, remainingBalance: 200000, interestRate: 4.3, monthlyPayment: 4800, nextPaymentDate: '2025-01-04', nextPaymentAmount: 4800, loanStatus: '正常', startDate: '2024-08-04', endDate: '2028-08-04', totalPayments: 48, paymentsMade: 5, phone: '+852-5678-9012', email: 'hoiyan.cheng@email.com' },
  'LN026': { accountId: 'LN026', fullName: 'Ip Kai Ming', birthdate: '1985-10-22', hkid: 'AC567123(3)', loanType: '個人貸款', principalAmount: 45000, remainingBalance: 8000, interestRate: 6.2, monthlyPayment: 1500, nextPaymentDate: '2025-01-22', nextPaymentAmount: 1500, loanStatus: '正常', startDate: '2022-07-22', endDate: '2025-04-22', totalPayments: 33, paymentsMade: 30, phone: '+852-5789-0123', email: 'kaiming.ip@email.com' },
  'LN027': { accountId: 'LN027', fullName: 'Yau Lok Yin', birthdate: '1992-03-16', hkid: 'AD890456(5)', loanType: '教育貸款', principalAmount: 250000, remainingBalance: 220000, interestRate: 3.9, monthlyPayment: 4200, nextPaymentDate: '2025-01-16', nextPaymentAmount: 4200, loanStatus: '正常', startDate: '2024-02-16', endDate: '2029-08-16', totalPayments: 66, paymentsMade: 11, phone: '+852-5890-1234', email: 'lokyin.yau@email.com' },
  'LN028': { accountId: 'LN028', fullName: 'Chu Siu Kei', birthdate: '1979-07-29', hkid: 'AE123789(8)', loanType: '房屋貸款', principalAmount: 4800000, remainingBalance: 4100000, interestRate: 3.4, monthlyPayment: 21000, nextPaymentDate: '2025-01-29', nextPaymentAmount: 21000, loanStatus: '正常', startDate: '2021-05-29', endDate: '2046-05-29', totalPayments: 300, paymentsMade: 44, phone: '+852-5901-2345', email: 'siukei.chu@email.com' },
  'LN029': { accountId: 'LN029', fullName: 'Ma Kin Wah', birthdate: '1988-02-11', hkid: 'AF456012(0)', loanType: '個人貸款', principalAmount: 100000, remainingBalance: 85000, interestRate: 5.4, monthlyPayment: 2600, nextPaymentDate: '2025-01-11', nextPaymentAmount: 7800, loanStatus: '逾期', startDate: '2024-01-11', endDate: '2027-07-11', totalPayments: 42, paymentsMade: 9, phone: '+852-5012-3456', email: 'kinwah.ma@email.com' },
  'LN030': { accountId: 'LN030', fullName: 'Lo Hei Man', birthdate: '1999-11-08', hkid: 'AG789345(A)', loanType: '汽車貸款', principalAmount: 280000, remainingBalance: 260000, interestRate: 4.4, monthlyPayment: 5800, nextPaymentDate: '2025-01-08', nextPaymentAmount: 5800, loanStatus: '正常', startDate: '2024-09-08', endDate: '2028-09-08', totalPayments: 48, paymentsMade: 4, phone: '+852-5123-6789', email: 'heiman.lo@email.com' }
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

// Loan verification and lookup endpoint (single step - verify + return data)
// Sobot collects: accountId, fullName, birthdate, hkid → sends all in one request
app.post('/api/loan/verify', verifyToken, (req, res) => {
  // Accept both accountId and accountID (Sobot sends capital D)
  const { accountId, accountID, fullName, birthdate, hkid } = req.body;
  const acctId = accountId || accountID;

  // Check all required fields are provided
  if (!acctId || !fullName || !birthdate || !hkid) {
    return res.status(400).json({
      success: false,
      error: '缺少必填欄位',
      message: '請提供 accountId、fullName、birthdate 及 hkid'
    });
  }

  // Find account by ID (case-insensitive)
  const loan = mockLoans[acctId.toUpperCase()];

  if (!loan) {
    return res.status(404).json({
      success: false,
      error: '找不到帳戶',
      message: `找不到帳戶編號: ${acctId}`
    });
  }

  // Verify all fields match (case-insensitive for name and hkid)
  const nameMatch = loan.fullName.toLowerCase() === fullName.toLowerCase();
  const birthdateMatch = loan.birthdate === birthdate;
  const hkidMatch = loan.hkid.toLowerCase() === hkid.toLowerCase();

  if (!nameMatch || !birthdateMatch || !hkidMatch) {
    return res.status(401).json({
      success: false,
      error: '驗證失敗',
      message: '提供的資料與帳戶記錄不符'
    });
  }

  // All verified - return flat loan data for Sobot compatibility
  res.json({
    success: true,
    accountId: loan.accountId,
    fullName: loan.fullName,
    loanType: loan.loanType,
    principalAmount: loan.principalAmount,
    remainingBalance: loan.remainingBalance,
    interestRate: loan.interestRate,
    monthlyPayment: loan.monthlyPayment,
    nextPaymentDate: loan.nextPaymentDate,
    nextPaymentAmount: loan.nextPaymentAmount,
    loanStatus: loan.loanStatus,
    startDate: loan.startDate,
    endDate: loan.endDate,
    totalPayments: loan.totalPayments,
    paymentsMade: loan.paymentsMade,
    phone: loan.phone,
    email: loan.email
  });
});

// List all loans (for testing - no verification required, just auth token)
app.get('/api/loans', verifyToken, (req, res) => {
  const loans = Object.values(mockLoans).map(loan => ({
    accountId: loan.accountId,
    fullName: loan.fullName,
    loanType: loan.loanType,
    remainingBalance: loan.remainingBalance,
    loanStatus: loan.loanStatus
  }));

  res.json({
    success: true,
    count: loans.length,
    data: loans
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
      'GET  /health - Health check (no auth)',
      'POST /api/loan/verify - Verify identity & get loan info',
      'GET  /api/loans - List all loans (testing)',
      'GET  /api/orders - List all orders',
      'GET  /api/order/:orderId - Get full order details',
      'POST /api/order/lookup - Lookup order by ID in body',
      'GET  /api/customer/:orderId - Get customer info',
      'GET  /api/delivery/:orderId - Get delivery status'
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
║  Order Endpoints:                                          ║
║    GET  /health              - Health check (no auth)      ║
║    GET  /api/orders          - List all orders             ║
║    GET  /api/order/:id       - Get order details           ║
║    POST /api/order/lookup    - Lookup order by ID          ║
║    GET  /api/customer/:id    - Get customer info           ║
║    GET  /api/delivery/:id    - Get delivery status         ║
╠════════════════════════════════════════════════════════════╣
║  Loan Endpoints:                                           ║
║    POST /api/loan/verify     - Verify & get loan info      ║
║    GET  /api/loans           - List all loans (testing)    ║
╠════════════════════════════════════════════════════════════╣
║  Test IDs:                                                 ║
║    Orders: ORD001 - ORD050                                 ║
║    Loans:  LN001 - LN030                                   ║
╚════════════════════════════════════════════════════════════╝
  `);
});
