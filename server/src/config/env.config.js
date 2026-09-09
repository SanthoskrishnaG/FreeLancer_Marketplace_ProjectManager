import dotenv from 'dotenv';
dotenv.config();

export const envConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  PORT: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  NODE_ENV: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL || 'http://localhost:5000',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:5000',

  databaseUrl: process.env.DATABASE_URL || '',
  DATABASE_URL: process.env.DATABASE_URL || '',

  jwt: {
    accessSecret: process.env.JWT_SECRET || 'dev_jwt_access_secret_1234567890',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret_0987654321',
    accessExpiresIn: '1d',
    refreshExpiresIn: '7d',
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    from: process.env.EMAIL_FROM || 'notifications@marketplace.io',
  },
};

export const env = envConfig;
export default envConfig;
