import { AuthJwtPayload } from '../utils/jwt.util.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthJwtPayload;
    }
  }
}
