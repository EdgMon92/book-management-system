import prisma from '../utils/prisma';
import logger from '../utils/logger';

export const getAllLoansService = async (filters: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const { page = 1, limit = 10, status } = filters;

  const where: any = {};
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [loans, total] = await Promise.all([
    prisma.loan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        book: {
          select: { id: true, title: true, author: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    }),
    prisma.loan.count({ where }),
  ]);

  return {
    data: loans,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMyLoansService = async (userId: number) => {
  const loans = await prisma.loan.findMany({
    where: {
      userId,
      status: 'activo',
    },
    include: {
      book: {
        select: { id: true, title: true, author: true, publicationYear: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return loans;
};

export const createLoanService = async (bookId: number, userId: number) => {
  const result = await prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new Error('Libro no encontrado');
    }

    if (book.status !== 'disponible') {
      throw new Error(
        `El libro no está disponible para préstamo. Estado actual: ${book.status}`
      );
    }

    const activeLoan = await tx.loan.findFirst({
      where: { bookId, status: 'activo' },
    });

    if (activeLoan) {
      throw new Error('Este libro ya tiene un préstamo activo');
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const loan = await tx.loan.create({
      data: {
        bookId,
        userId,
        loanDate: new Date(),
        dueDate,
        status: 'activo',
      },
    });

    await tx.book.update({
      where: { id: bookId },
      data: { status: 'prestado' },
    });

    return loan;
  });

  logger.info('Préstamo creado', {
    loanId: result.id,
    bookId,
    userId,
  });

  return result;
};

export const returnBookService = async (loanId: number, userId: number) => {
  const result = await prisma.$transaction(async (tx) => {
    const loan = await tx.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      throw new Error('Préstamo no encontrado');
    }

    if (loan.status !== 'activo') {
      throw new Error('Este préstamo no está activo');
    }

    const updatedLoan = await tx.loan.update({
      where: { id: loanId },
      data: {
        status: 'devuelto',
        returnDate: new Date(),
      },
    });

    await tx.book.update({
      where: { id: loan.bookId },
      data: { status: 'disponible' },
    });

    return updatedLoan;
  });

  logger.info('Libro devuelto', {
    loanId,
    bookId: result.bookId,
    userId,
  });

  return result;
};