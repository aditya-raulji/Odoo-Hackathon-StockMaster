import authService from './auth.service.js';

describe('Auth Service', () => {
  describe('generateOtp', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = authService.generateOtp();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });
  });

  describe('signup', () => {
    it('should create a new user', async () => {
      const data = {
        email: 'test@example.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = await authService.signup(data, '127.0.0.1');
      expect(result.ok).toBe(true);
      expect(result.data.email).toBe(data.email);
    });

    it('should reject duplicate email', async () => {
      const data = {
        email: 'duplicate@example.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'User',
      };

      await authService.signup(data, '127.0.0.1');

      try {
        await authService.signup(data, '127.0.0.1');
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain('already registered');
      }
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const signupData = {
        email: 'login@example.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'User',
      };

      await authService.signup(signupData, '127.0.0.1');

      const loginData = {
        email: signupData.email,
        password: signupData.password,
      };

      const result = await authService.login(loginData, '127.0.0.1');
      expect(result.ok).toBe(true);
      expect(result.data.accessToken).toBeDefined();
      expect(result.data.refreshToken).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const data = {
        email: 'invalid@example.com',
        password: 'WrongPassword123',
      };

      try {
        await authService.login(data, '127.0.0.1');
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toContain('Invalid credentials');
      }
    });
  });

  describe('verifyOtp', () => {
    it('should verify valid OTP', async () => {
      const signupData = {
        email: 'otp@example.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'User',
      };

      const signupResult = await authService.signup(signupData, '127.0.0.1');

      const otpData = {
        otp: '123456',
        email: signupData.email,
      };

      try {
        const result = await authService.verifyOtp(otpData);
        expect(result.ok).toBe(true);
      } catch (error) {
        expect(error.message).toContain('Invalid or expired OTP');
      }
    });
  });

  describe('refreshToken', () => {
    it('should refresh access token', async () => {
      const signupData = {
        email: 'refresh@example.com',
        password: 'Test@123456',
        firstName: 'Test',
        lastName: 'User',
      };

      await authService.signup(signupData, '127.0.0.1');

      const loginData = {
        email: signupData.email,
        password: signupData.password,
      };

      const loginResult = await authService.login(loginData, '127.0.0.1');

      const refreshData = {
        refreshToken: loginResult.data.refreshToken,
      };

      const result = await authService.refreshToken(refreshData);
      expect(result.ok).toBe(true);
      expect(result.data.accessToken).toBeDefined();
    });
  });
});
