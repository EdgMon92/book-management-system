import prisma from '../utils/prisma';
import logger from '../utils/logger';

interface BookFilters {
  page?: number;
  limit?: number;
  search?: string;      
  author?: string;      
  status?: string;      
  year?: number;        
  sortBy?: string;      
  sortOrder?: 'asc' | 'desc'; 
}

export const getAllBooksService = async (filters: BookFilters) => {
  const {
    page = 1,
    limit = 10,
    search,
    author,
    status,
    year,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const where: any = {};

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { author: { contains: search } },
    ];
  }

  if (author) where.author = { contains: author };
  if (status) where.status = status;
  if (year) where.publicationYear = year;

  const skip = (page - 1) * limit;

  const validSortFields = ['title', 'author', 'publicationYear', 'status', 'createdAt'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const orderDir = sortOrder === 'asc' ? 'asc' : 'desc';

  const [books, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [orderField]: orderDir },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    data: books,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getBookByIdService = async (id: number) => {
  const book = await prisma.book.findUnique({
    where: { id },
  });

  if (!book) {
    throw new Error('Libro no encontrado');
  }

  return book;
};

export const createBookService = async (data: {
  title: string;
  author: string;
  publicationYear: number;
}) => {
  const book = await prisma.book.create({
    data: {
      title: data.title,
      author: data.author,
      publicationYear: data.publicationYear,
      status: 'disponible', 
    },
  });
  logger.info('Libro creado', { bookId: book.id, title: book.title, author: book.author });

  return book;
};

export const updateBookService = async (
  id: number,
  data: {
    title?: string;
    author?: string;
    publicationYear?: number;
    status?: string;
  }
) => {

  const existingBook = await prisma.book.findUnique({
    where: { id },
  });

  if (!existingBook) {
    throw new Error('Libro no encontrado');
  }

  const updatedBook = await prisma.book.update({
    where: { id },
    data,
  });
  logger.info('Libro actualizado', { bookId: updatedBook.id, title: updatedBook.title });

  return updatedBook;
};

export const deleteBookService = async (id: number) => {
  const existingBook = await prisma.book.findUnique({
    where: { id },
  });

  if (!existingBook) {
    throw new Error('Libro no encontrado');
  }

  if (existingBook.status === 'prestado') {
    throw new Error('No se puede eliminar un libro que está en préstamo');
  }

  if (existingBook.status === 'reservado') {
    throw new Error('No se puede eliminar un libro que tiene una reserva activa');
  }

  await prisma.$transaction(async (tx) => {
    await tx.loan.deleteMany({
      where: { bookId: id },
    });

    await tx.reservation.deleteMany({
      where: { bookId: id },
    });

    await tx.book.delete({
      where: { id },
    });
  });

  logger.info('Libro eliminado', { bookId: id, title: existingBook.title });

  return existingBook;
};