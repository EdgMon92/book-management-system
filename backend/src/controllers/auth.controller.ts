import { Request, Response } from 'express';
import {
  registerUserService,
  loginUserService,
  getProfileService,
} from '../services/auth.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        error: 'Todos los campos son obligatorios: name, email, password',
      });
      return;
    }

    const result = await registerUserService(name, email, password);

    res.status(201).json({
      message: '¡Usuario registrado exitosamente!',
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Email y contraseña son obligatorios',
      });
      return;
    }

    const result = await loginUserService(email, password);

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const getProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await getProfileService(userId);

    res.status(200).json({
      message: 'Perfil obtenido exitosamente',
      user,
    });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};