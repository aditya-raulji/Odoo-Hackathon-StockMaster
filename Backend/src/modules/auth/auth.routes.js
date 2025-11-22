import express from 'express';
import authService from './auth.service.js';
import { authMiddleware } from '../../common/middleware/auth.js';
import { validateRequest, signupSchema, loginSchema, requestOtpSchema, verifyOtpSchema, refreshTokenSchema } from '../../common/utils/validators.js';
import { logger } from '../../common/logger/logger.js';

const router = express.Router();

router.post('/signup', validateRequest(signupSchema), async (req, res, next) => {
  try {
    const ipAddress = req.ip;
    const result = await authService.signup(req.validatedBody, ipAddress);
    res.status(201).json(result);
  } catch (error) {
    logger.error('Signup route error', error);
    const status = error.message.includes('already registered') ? 409 : 400;
    res.status(status).json({
      ok: false,
      error: {
        code: status,
        message: error.message,
      },
    });
  }
});

router.post('/login', validateRequest(loginSchema), async (req, res, next) => {
  try {
    const ipAddress = req.ip;
    const result = await authService.login(req.validatedBody, ipAddress);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Login route error', error);
    const status = error.message.includes('Invalid credentials') ? 401 : 400;
    res.status(status).json({
      ok: false,
      error: {
        code: status,
        message: error.message,
      },
    });
  }
});

router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.logout(req.user.sub);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Logout route error', error);
    res.status(400).json({
      ok: false,
      error: {
        code: 400,
        message: error.message,
      },
    });
  }
});

router.post('/request-otp', validateRequest(requestOtpSchema), async (req, res, next) => {
  try {
    const result = await authService.requestOtp(req.validatedBody);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Request OTP route error', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({
      ok: false,
      error: {
        code: status,
        message: error.message,
      },
    });
  }
});

router.post('/verify-otp', validateRequest(verifyOtpSchema), async (req, res, next) => {
  try {
    const result = await authService.verifyOtp(req.validatedBody);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Verify OTP route error', error);
    const status = error.message.includes('Invalid or expired') ? 400 : 400;
    res.status(status).json({
      ok: false,
      error: {
        code: status,
        message: error.message,
      },
    });
  }
});

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.getCurrentUser(req.user.sub);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Get current user route error', error);
    res.status(400).json({
      ok: false,
      error: {
        code: 400,
        message: error.message,
      },
    });
  }
});

router.post('/refresh', validateRequest(refreshTokenSchema), async (req, res, next) => {
  try {
    const result = await authService.refreshToken(req.validatedBody);
    res.status(200).json(result);
  } catch (error) {
    logger.error('Refresh token route error', error);
    const status = error.message.includes('Invalid or expired') ? 401 : 400;
    res.status(status).json({
      ok: false,
      error: {
        code: status,
        message: error.message,
      },
    });
  }
});

export default router;
