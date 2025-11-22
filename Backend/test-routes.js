import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
let accessToken = '';
let refreshToken = '';

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

const log = (title, status, data) => {
  const emoji = status === 200 || status === 201 ? '✅' : '❌';
  console.log(`${emoji} ${title} (${status})`);
  if (status !== 200 && status !== 201) {
    try {
      console.log('  Error:', data?.error?.message || data?.message || JSON.stringify(data).substring(0, 100));
    } catch (e) {
      console.log('  Error: Response received');
    }
  }
};

async function testRoutes() {
  console.log('\n🚀 TESTING STOCKMASTER BACKEND ROUTES\n');
  console.log('=' .repeat(60));

  const testEmail = 'yasark8850@gmail.com';
  const testPassword = 'TestUser@123';

  // 1. HEALTH CHECK
  console.log('\n📋 HEALTH CHECK');
  console.log('-'.repeat(60));
  let res = await api.get('/health');
  log('GET /health', res.status, res.data);

  // 2. AUTHENTICATION
  console.log('\n🔐 AUTHENTICATION');
  console.log('-'.repeat(60));

  // Signup
  res = await api.post('/auth/signup', {
    email: testEmail,
    password: testPassword,
    firstName: 'Yasar',
    lastName: 'Khan',
  });
  log('POST /auth/signup', res.status, res.data);

  // If signup fails due to existing user, try login directly
  if (res.status !== 201) {
    console.log('  (User already exists, attempting login...)');
  }

  // Login
  res = await api.post('/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  log('POST /auth/login', res.status, res.data);
  if (res.status === 200) {
    accessToken = res.data.data.accessToken;
    refreshToken = res.data.data.refreshToken;
    console.log(`  User role: ${res.data.data.user.role}`);
  }

  // Get Current User
  if (accessToken) {
    res = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    log('GET /auth/me', res.status, res.data);
  }

  // Refresh Token
  if (refreshToken) {
    res = await api.post('/auth/refresh', {
      refreshToken: refreshToken,
    });
    log('POST /auth/refresh', res.status, res.data);
    if (res.status === 200) {
      accessToken = res.data.data.accessToken;
    }
  }

  // Request OTP
  res = await api.post('/auth/request-otp', {
    email: testEmail,
  });
  log('POST /auth/request-otp', res.status, res.data);

  // 3. PRODUCTS
  console.log('\n📦 PRODUCTS');
  console.log('-'.repeat(60));

  // Get Products
  res = await api.get('/products', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /products', res.status, res.data);

  // Create Product
  res = await api.post(
    '/products',
    {
      sku: 'TEST001',
      name: 'Test Product',
      description: 'Test Description',
      minStockLevel: 5,
      maxStockLevel: 100,
      unitPrice: 99.99,
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  log('POST /products', res.status, res.data);
  const productId = res.data.data?.id;

  // Get Product by ID
  if (productId) {
    res = await api.get(`/products/${productId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    log(`GET /products/:id`, res.status, res.data);
  }

  // 4. LOCATIONS
  console.log('\n🏭 LOCATIONS');
  console.log('-'.repeat(60));

  // Get Locations
  res = await api.get('/locations', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /locations', res.status, res.data);

  // Create Location
  res = await api.post(
    '/locations',
    {
      code: 'TEST001',
      name: 'Test Location',
      type: 'WAREHOUSE',
      capacity: 5000,
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  log('POST /locations', res.status, res.data);
  const locationId = res.data.data?.id;

  // 5. SUPPLIERS
  console.log('\n🏢 SUPPLIERS');
  console.log('-'.repeat(60));

  // Get Suppliers
  res = await api.get('/suppliers', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /suppliers', res.status, res.data);

  // Create Supplier
  res = await api.post(
    '/suppliers',
    {
      name: 'Test Supplier',
      email: 'supplier@test.com',
      phone: '555-1234',
      address: '123 Test St',
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  log('POST /suppliers', res.status, res.data);
  const supplierId = res.data.data?.id;

  // 6. STOCK MOVEMENTS
  console.log('\n🚚 STOCK MOVEMENTS');
  console.log('-'.repeat(60));

  // Get Movements
  res = await api.get('/movements', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /movements', res.status, res.data);

  // Create Receipt
  if (productId && locationId && supplierId) {
    res = await api.post(
      '/movements/receipts',
      {
        toLocationId: locationId,
        supplierId: supplierId,
        productId: productId,
        lines: [{ productId: productId, quantity: 10 }],
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    log('POST /movements/receipts', res.status, res.data);
    const movementId = res.data.data?.id;

    // Update Movement Status
    if (movementId) {
      res = await api.put(
        `/movements/${movementId}/status`,
        { status: 'WAITING' },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      log('PUT /movements/:id/status', res.status, res.data);
    }
  }

  // 7. STAFF
  console.log('\n👥 STAFF');
  console.log('-'.repeat(60));

  // Get Staff
  res = await api.get('/staff', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /staff', res.status, res.data);

  // Create Staff
  res = await api.post(
    '/staff',
    {
      email: 'newstaff@example.com',
      password: 'NewStaff@123',
      firstName: 'New',
      lastName: 'Staff',
      role: 'WAREHOUSE_STAFF',
    },
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  log('POST /staff', res.status, res.data);

  // 8. INVENTORY COUNTS
  console.log('\n📊 INVENTORY COUNTS');
  console.log('-'.repeat(60));

  // Get Counts
  res = await api.get('/counts', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /counts', res.status, res.data);

  // Create Count
  if (locationId && productId) {
    res = await api.post(
      '/counts',
      {
        locationId: locationId,
        lines: [{ productId: productId, expectedQuantity: 10 }],
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    log('POST /counts', res.status, res.data);
  }

  // 9. REPORTS
  console.log('\n📈 REPORTS');
  console.log('-'.repeat(60));

  // Stock Valuation
  res = await api.get('/reports/stock-val', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /reports/stock-val', res.status, res.data);

  // Movements Report
  res = await api.get('/reports/movements', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /reports/movements', res.status, res.data);

  // ABC Analysis
  res = await api.get('/reports/abc-analysis', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /reports/abc-analysis', res.status, res.data);

  // 10. SEARCH
  console.log('\n🔍 SEARCH');
  console.log('-'.repeat(60));

  // Search Products
  res = await api.get('/search/products?q=laptop', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /search/products', res.status, res.data);

  // Search Suppliers
  res = await api.get('/search/suppliers?q=tech', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /search/suppliers', res.status, res.data);

  // 11. NOTIFICATIONS
  console.log('\n🔔 NOTIFICATIONS');
  console.log('-'.repeat(60));

  // Get Notifications
  res = await api.get('/notifications', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /notifications', res.status, res.data);

  // 12. AUDIT LOG
  console.log('\n📝 AUDIT LOG');
  console.log('-'.repeat(60));

  // Get Audit Logs (StockMaster only)
  res = await api.get('/audit-log', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /audit-log', res.status, res.data);

  console.log('\n' + '='.repeat(60));
  console.log('✅ ROUTE TESTING COMPLETE\n');
}

testRoutes().catch((error) => {
  console.error('❌ Test Error:', error?.message || error);
  process.exit(0);
});
