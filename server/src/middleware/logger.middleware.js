import morgan from 'morgan';

export const requestLogger = morgan(
  process.env.NODE_ENV === 'production'
    ? 'combined'
    : ':method :url :status :res[content-length] - :response-time ms'
);
