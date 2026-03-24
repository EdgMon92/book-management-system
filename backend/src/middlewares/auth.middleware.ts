import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Acceso denegado. No se proporcionó token de autenticación',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      email: string;
      role: string;
    };

    req.user = decoded;

    next();
  } catch (error: any) {

    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Token expirado. Por favor inicia sesión nuevamente',
      });
      return;
    }

    res.status(401).json({
      error: 'Token inválido',
    });
  }
};