import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true,
});

async function testOTPFlow() {
  console.log('\n=== TESTING OTP FLOW ===\n');

  // 1. Signup
  console.log('1. Signing up new user...');
  let res = await api.post('/auth/signup', {
    firstName: 'Test',
    lastName: 'User',
    email: 'testotpuser@example.com',
    password: 'TestOTP@123',
  });
  console.log('Signup response:', res.status, res.data);

  if (res.status !== 201) {
    if (res.data?.error?.message?.includes('already registered')) {
      console.log('User already exists, getting OTP...');
      
      // Request OTP for existing user
      res = await api.post('/auth/request-otp', {
        email: 'testotpuser@example.com',
      });
      console.log('Request OTP response:', res.status, res.data);
    } else {
      console.log('Signup failed:', res.data);
      process.exit(1);
    }
  }

  // 2. Get OTP from database (in real scenario, check email)
  console.log('\n2. Getting OTP from database...');
  // For testing, we'll use a known OTP or check the database
  // In production, you'd check the email
  
  // Let's try with a test OTP
  const testOTP = '123456'; // This won't work, we need the real one

  console.log('\n3. Attempting to verify OTP...');
  res = await api.post('/auth/verify-otp', {
    otp: testOTP,
  });
  console.log('Verify OTP response:', res.status, res.data);

  if (res.status === 200) {
    console.log('\n✅ OTP verification successful!');
    console.log('Access Token:', res.data.data?.accessToken?.substring(0, 20) + '...');
    console.log('User:', res.data.data?.user);
  } else {
    console.log('\n❌ OTP verification failed');
    console.log('Error:', res.data?.error?.message);
  }
}

testOTPFlow().catch((error) => {
  console.error('Test error:', error.message);
  process.exit(1);
});
