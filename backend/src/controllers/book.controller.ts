import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import {
  getAllBooksService,
  getBookByIdService,
  createBookService,
  updateBookService,
  deleteBookService,
} from '../services/book.service';

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
  try {

    const filters = {
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 10,
      search: req.query.search as string | undefined,
      author: req.query.author as string | undefined,
      status: req.query.status as string | undefined,
      year: req.query.year ? Number(req.query.year) : undefined,
      sortBy: (req.query.sortBy as string) || 'createdAt',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await getAllBooksService(filters);

    res.status(200).json({
      message: 'Libros obtenidos exitosamente',
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const book = await getBookByIdService(id);

    res.status(200).json({
      message: 'Libro obtenido exitosamente',
      data: book,
    });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, author, publicationYear } = req.body;

    if (!title || !author || !publicationYear) {
      res.status(400).json({
        error: 'Todos los campos son obligatorios: title, author, publicationYear',
      });
      return;
    }

    const year = Number(publicationYear);
    if (isNaN(year) || year < 1000 || year > new Date().getFullYear()) {
      res.status(400).json({
        error: `El año debe estar entre 1000 y ${new Date().getFullYear()}`,
      });
      return;
    }

    const book = await createBookService({ title, author, publicationYear: year });

    res.status(201).json({
      message: 'Libro creado exitosamente',
      data: book,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const { title, author, publicationYear, status } = req.body;
    const data: any = {};

    if (title !== undefined) data.title = title;
    if (author !== undefined) data.author = author;
    if (publicationYear !== undefined) data.publicationYear = Number(publicationYear);
    if (status !== undefined) {

      const validStatuses = ['disponible', 'reservado', 'prestado'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({
          error: 'Estado inválido. Valores permitidos: disponible, reservado, prestado',
        });
        return;
      }
      data.status = status;
    }

    if (Object.keys(data).length === 0) {
      res.status(400).json({
        error: 'Debes enviar al menos un campo para actualizar',
      });
      return;
    }

    const book = await updateBookService(id, data);

    res.status(200).json({
      message: 'Libro actualizado exitosamente',
      data: book,
    });
  } catch (error: any) {
    const statusCode = error.message === 'Libro no encontrado' ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};

export const remove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({ error: 'ID inválido' });
      return;
    }

    const deletedBook = await deleteBookService(id);

    res.status(200).json({
      message: 'Libro eliminado exitosamente',
      data: deletedBook,
    });
  } catch (error: any) {
    const statusCode = error.message === 'Libro no encontrado' ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
};