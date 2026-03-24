import prisma from '../utils/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

export const registerUserService = async (
  name: string,
  email: string,
  passwordPlain: string
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    logger.warn('Intento de registro con email duplicado', { email });
    throw new Error('El correo electrónico ya está en uso');
  }

  const saltRounds = 12;
  const hashedPassword = await bcrypt.hash(passwordPlain, saltRounds);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

    logger.info('Usuario registrado exitosamente', {
      userId: newUser.id,
      email: newUser.email,
    });


  const token = generateToken(newUser.id, newUser.email, newUser.role);

  return { user: excludePassword(newUser), token };
};

export const loginUserService = async (
  email: string,
  passwordPlain: string
) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    logger.warn('Intento de login fallido: credenciales inválidas', { email });
    throw new Error('Credenciales inválidas');
  }

  const passwordMatch = await bcrypt.compare(passwordPlain, user.password);

  if (!passwordMatch) {
    logger.warn('Intento de login fallido: credenciales inválidas', { email });
    throw new Error('Credenciales inválidas');
  }

  const token = generateToken(user.id, user.email, user.role);
     logger.info('Login exitoso', {
      userId: user.id,
      email: user.email,
    });

  return { user: excludePassword(user), token };
};

export const getProfileService = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return excludePassword(user);
};

const generateToken = (id: number, email: string, role: string): string => {
  return jwt.sign(
    { id, email, role }, 
    process.env.JWT_SECRET as string, 
    { expiresIn: '24h' } 
  );
};

const excludePassword = (user: any) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};