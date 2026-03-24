import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import bookRoutes from './routes/book.routes';
import loanRoutes from './routes/loan.routes';
import reservationRoutes from './routes/reservation.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Gestión de Libros - Documentación',
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/reservations', reservationRoutes);

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: '¡El motor del Book Management System está encendido y funcionando! 🚀',
  });
});

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`Documentación Swagger: http://localhost:${PORT}/api/docs`);
  logger.info(`Entorno: ${process.env.NODE_ENV || 'development'}`);
});
