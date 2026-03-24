import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  getAllReservationsService,
  getMyReservationsService,
  createReservationService,
  cancelReservationService,
  completeReservationService,
} from '../services/reservation.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      status: req.query.status as string | undefined,
    };

    const result = await getAllReservationsService(filters);

    res.status(200).json({
      message: 'Reservas obtenidas exitosamente',
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyReservations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservations = await getMyReservationsService(req.user!.id);

    res.status(200).json({
      message: 'Mis reservas obtenidas exitosamente',
      data: reservations,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      res.status(400).json({
        error: 'El campo bookId es obligatorio',
      });
      return;
    }

    const reservation = await createReservationService(Number(bookId), req.user!.id);

    res.status(201).json({
      message: 'Reserva creada exitosamente. Tienes 3 días para recoger el libro.',
      data: reservation,
    });
  } catch (error: any) {
    let statusCode = 400;
    if (error.message === 'Libro no encontrado') statusCode = 404;

    res.status(statusCode).json({ error: error.message });
  }
};

export const cancelReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservationId = Number(req.params.id);

    if (isNaN(reservationId)) {
      res.status(400).json({ error: 'ID de reserva inválido' });
      return;
    }

    const reservation = await cancelReservationService(reservationId, req.user!.id);

    res.status(200).json({
      message: 'Reserva cancelada exitosamente. El libro está disponible nuevamente.',
      data: reservation,
    });
  } catch (error: any) {
    let statusCode = 400;
    if (error.message === 'Reserva no encontrada') statusCode = 404;

    res.status(statusCode).json({ error: error.message });
  }
};

export const completeReservation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reservationId = Number(req.params.id);

    if (isNaN(reservationId)) {
      res.status(400).json({ error: 'ID de reserva inválido' });
      return;
    }

    const result = await completeReservationService(reservationId, req.user!.id);

    res.status(200).json({
      message: 'Reserva completada. Se ha creado un préstamo automáticamente (14 días).',
      data: result,
    });
  } catch (error: any) {
    let statusCode = 400;
    if (error.message === 'Reserva no encontrada') statusCode = 404;

    res.status(statusCode).json({ error: error.message });
  }
};