import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiration: process.env.JWT_EXPIRATION || '15m',
    refreshSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh-secret',
    refreshExpiration: process.env.REFRESH_TOKEN_EXPIRATION || '7d',
  },
  email: {
    senderEmail: process.env.SENDER_EMAIL || 'noreply@stockmaster.com',
    sendgridApiKey: process.env.SENDGRID_API_KEY,
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
