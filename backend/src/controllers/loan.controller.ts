import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  getAllLoansService,
  getMyLoansService,
  createLoanService,
  returnBookService,
} from '../services/loan.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      status: req.query.status as string | undefined,
    };

    const result = await getAllLoansService(filters);

    res.status(200).json({
      message: 'Préstamos obtenidos exitosamente',
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loans = await getMyLoansService(req.user!.id);

    res.status(200).json({
      message: 'Mis préstamos obtenidos exitosamente',
      data: loans,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createLoan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      res.status(400).json({
        error: 'El campo bookId es obligatorio',
      });
      return;
    }

    const loan = await createLoanService(Number(bookId), req.user!.id);

    res.status(201).json({
      message: 'Préstamo creado exitosamente. Tienes 14 días para devolver el libro.',
      data: loan,
    });
  } catch (error: any) {

    let statusCode = 400;
    if (error.message === 'Libro no encontrado') statusCode = 404;

    res.status(statusCode).json({ error: error.message });
  }
};

export const returnBook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loanId = Number(req.params.id);

    if (isNaN(loanId)) {
      res.status(400).json({ error: 'ID de préstamo inválido' });
      return;
    }

    const loan = await returnBookService(loanId, req.user!.id);

    res.status(200).json({
      message: 'Libro devuelto exitosamente',
      data: loan,
    });
  } catch (error: any) {
    let statusCode = 400;
    if (error.message === 'Préstamo no encontrado') statusCode = 404;

    res.status(statusCode).json({ error: error.message });
  }
};