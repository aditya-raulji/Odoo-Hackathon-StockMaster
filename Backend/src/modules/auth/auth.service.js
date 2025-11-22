import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../prisma/prisma.js';
import { logger } from '../../common/logger/logger.js';
import { sendOtpEmail } from '../../common/utils/email.js';

export class AuthService {
  generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async signup(data, ipAddress) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('Email already registered');
      }

      const passwordHash = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          passwordHash,
          role: 'WAREHOUSE_STAFF',
        },
      });

      const otp = this.generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.otpRequest.create({
        data: {
          userId: user.id,
          otp,
          type: 'SIGNUP',
          expiresAt,
        },
      });

      await sendOtpEmail(user.email, otp, 'signup');
      await this.logAudit(user.id, 'User', user.id, 'CREATE', null, user, ipAddress);

      logger.info(`User signup initiated: ${user.email}`);

      return {
        ok: true,
        data: {
          userId: user.id,
          email: user.email,
          message: 'Signup successful. Please verify OTP sent to your email.',
        },
      };
    } catch (error) {
      logger.error('Signup error', error);
      throw error;
    }
  }

  async login(data, ipAddress) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.passwordHash,
      );

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      const refreshToken = jwt.sign(
        { sub: user.id, email: user.email },
        process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' },
      );

      await prisma.session.create({
        data: {
          userId: user.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          ipAddress,
        },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
        },
      });

      const accessToken = jwt.sign(
        {
          sub: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRATION || '15m' },
      );

      await this.logAudit(user.id, 'User', user.id, 'CREATE', null, user, ipAddress);

      logger.info(`User login: ${user.email}`);

      return {
        ok: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      };
    } catch (error) {
      logger.error('Login error', error);
      throw error;
    }
  }

  async logout(userId) {
    try {
      await prisma.session.deleteMany({
        where: { userId },
      });

      logger.info(`User logout: ${userId}`);

      return {
        ok: true,
        data: { message: 'Logged out successfully' },
      };
    } catch (error) {
      logger.error('Logout error', error);
      throw error;
    }
  }

  async requestOtp(data) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const otp = this.generateOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.otpRequest.create({
        data: {
          userId: user.id,
          otp,
          type: 'PASSWORD_RESET',
          expiresAt,
        },
      });

      await sendOtpEmail(user.email, otp, 'password_reset');

      logger.info(`OTP requested for: ${user.email}`);

      return {
        ok: true,
        data: { message: 'OTP sent to your email' },
      };
    } catch (error) {
      logger.error('Request OTP error', error);
      throw error;
    }
  }

  async verifyOtp(data) {
    try {
      const otpRequest = await prisma.otpRequest.findFirst({
        where: {
          otp: data.otp,
          isUsed: false,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });

      if (!otpRequest) {
        throw new Error('Invalid or expired OTP');
      }

      await prisma.otpRequest.update({
        where: { id: otpRequest.id },
        data: { isUsed: true },
      });

      const accessToken = jwt.sign(
        {
          sub: otpRequest.user.id,
          email: otpRequest.user.email,
          role: otpRequest.user.role,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRATION || '15m' },
      );

      const refreshToken = jwt.sign(
        { sub: otpRequest.user.id, email: otpRequest.user.email },
        process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' },
      );

      await prisma.session.create({
        data: {
          userId: otpRequest.user.id,
          refreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      logger.info(`OTP verified for: ${otpRequest.user.email}`);

      return {
        ok: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: otpRequest.user.id,
            email: otpRequest.user.email,
            firstName: otpRequest.user.firstName,
            lastName: otpRequest.user.lastName,
            role: otpRequest.user.role,
          },
        },
      };
    } catch (error) {
      logger.error('Verify OTP error', error);
      throw error;
    }
  }

  async refreshToken(data) {
    try {
      const decoded = jwt.verify(
        data.refreshToken,
        process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
      );

      const session = await prisma.session.findUnique({
        where: { refreshToken: data.refreshToken },
        include: { user: true },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
      }

      const accessToken = jwt.sign(
        {
          sub: session.user.id,
          email: session.user.email,
          role: session.user.role,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRATION || '15m' },
      );

      return {
        ok: true,
        data: { accessToken },
      };
    } catch (error) {
      logger.error('Refresh token error', error);
      throw error;
    }
  }

  async getCurrentUser(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return {
        ok: true,
        data: user,
      };
    } catch (error) {
      logger.error('Get current user error', error);
      throw error;
    }
  }

  async logAudit(userId, entity, entityId, action, before, after, ipAddress) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          entity,
          entityId,
          action,
          before,
          after,
          ipAddress,
        },
      });
    } catch (error) {
      logger.error('Audit log error', error);
    }
  }
}

export default new AuthService();
