import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
let accessToken = '';
let stockmasterToken = '';

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

const log = (title, status) => {
  const result = status === 200 || status === 201 ? 'PASS' : 'FAIL';
  console.log(`[${result}] ${title} (${status})`);
};

async function testRoutes() {
  console.log('\n=== TESTING STOCKMASTER BACKEND ROUTES ===\n');

  // 1. HEALTH CHECK
  console.log('HEALTH CHECK');
  let res = await api.get('/health');
  log('GET /health', res.status);

  // 2. AUTHENTICATION
  console.log('\nAUTHENTICATION');
  
  res = await api.post('/auth/login', {
    email: 'yasark8850@gmail.com',
    password: 'TestUser@123',
  });
  log('POST /auth/login', res.status);
  if (res.status === 200) {
    accessToken = res.data.data.accessToken;
  }

  // Login as STOCKMASTER for audit log
  res = await api.post('/auth/login', {
    email: 'stockmaster@example.com',
    password: 'StockMaster@123',
  });
  if (res.status === 200) {
    stockmasterToken = res.data.data.accessToken;
  }

  res = await api.get('/auth/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /auth/me', res.status);

  res = await api.post('/auth/request-otp', {
    email: 'yasark8850@gmail.com',
  });
  log('POST /auth/request-otp', res.status);

  // 3. PRODUCTS
  console.log('\nPRODUCTS');
  res = await api.get('/products', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /products', res.status);

  // 4. LOCATIONS
  console.log('\nLOCATIONS');
  res = await api.get('/locations', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /locations', res.status);

  // 5. SUPPLIERS
  console.log('\nSUPPLIERS');
  res = await api.get('/suppliers', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /suppliers', res.status);

  res = await api.get('/search/suppliers?q=test', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /search/suppliers', res.status);

  // 6. MOVEMENTS
  console.log('\nMOVEMENTS');
  res = await api.get('/movements', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /movements', res.status);

  // 7. STAFF
  console.log('\nSTAFF');
  res = await api.get('/staff', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /staff', res.status);

  // 8. COUNTS
  console.log('\nINVENTORY COUNTS');
  res = await api.get('/counts', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /counts', res.status);

  // 9. REPORTS
  console.log('\nREPORTS');
  res = await api.get('/reports/stock-val', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /reports/stock-val', res.status);

  res = await api.get('/reports/movements', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /reports/movements', res.status);

  res = await api.get('/reports/abc-analysis', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /reports/abc-analysis', res.status);

  // 10. SEARCH
  console.log('\nSEARCH');
  res = await api.get('/search/products?q=test', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /search/products', res.status);

  // 11. NOTIFICATIONS
  console.log('\nNOTIFICATIONS');
  res = await api.get('/notifications', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  log('GET /notifications', res.status);

  // 12. AUDIT LOG (needs STOCKMASTER role)
  console.log('\nAUDIT LOG');
  res = await api.get('/audit-log', {
    headers: { Authorization: `Bearer ${stockmasterToken}` },
  });
  log('GET /audit-log', res.status);

  console.log('\n=== TEST COMPLETE ===\n');
}

testRoutes().catch((error) => {
  console.error('ERROR:', error?.message || error);
  process.exit(1);
});
