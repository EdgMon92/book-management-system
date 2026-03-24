import prisma from '../utils/prisma';
import logger from '../utils/logger';

export const getAllReservationsService = async (filters: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const { page = 1, limit = 10, status } = filters;

  const where: any = {};
  if (status) where.status = status;

  const skip = (page - 1) * limit;

  const [reservations, total] = await Promise.all([
    prisma.reservation.findMany({
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
    prisma.reservation.count({ where }),
  ]);

  return {
    data: reservations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMyReservationsService = async (userId: number) => {
  const reservations = await prisma.reservation.findMany({
    where: {
      userId,
      status: 'activa',
    },
    include: {
      book: {
        select: { id: true, title: true, author: true, publicationYear: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return reservations;
};

export const createReservationService = async (bookId: number, userId: number) => {
  const result = await prisma.$transaction(async (tx) => {
    const book = await tx.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new Error('Libro no encontrado');
    }

    if (book.status !== 'disponible') {
      throw new Error(
        `El libro no está disponible para reserva. Estado actual: ${book.status}`
      );
    }

    const activeReservation = await tx.reservation.findFirst({
      where: { bookId, status: 'activa' },
    });

    if (activeReservation) {
      throw new Error('Este libro ya tiene una reserva activa');
    }

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 3);

    const reservation = await tx.reservation.create({
      data: {
        bookId,
        userId,
        reservationDate: new Date(),
        expirationDate,
        status: 'activa',
      },
    });

    await tx.book.update({
      where: { id: bookId },
      data: { status: 'reservado' },
    });

    return reservation;
  });

  logger.info('Reserva creada', {
    reservationId: result.id,
    bookId,
    userId,
  });

  return result;
};

export const cancelReservationService = async (reservationId: number, userId: number) => {
  const result = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (reservation.status !== 'activa') {
      throw new Error('Esta reserva no está activa');
    }

    const updatedReservation = await tx.reservation.update({
      where: { id: reservationId },
      data: { status: 'cancelada' },
    });

    await tx.book.update({
      where: { id: reservation.bookId },
      data: { status: 'disponible' },
    });

    return updatedReservation;
  });

  logger.info('Reserva cancelada', {
    reservationId,
    bookId: result.bookId,
    userId,
  });

  return result;
};

export const completeReservationService = async (reservationId: number, userId: number) => {
  const result = await prisma.$transaction(async (tx) => {
    const reservation = await tx.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new Error('Reserva no encontrada');
    }

    if (reservation.status !== 'activa') {
      throw new Error('Esta reserva no está activa');
    }

    await tx.reservation.update({
      where: { id: reservationId },
      data: { status: 'completada' },
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const loan = await tx.loan.create({
      data: {
        bookId: reservation.bookId,
        userId: reservation.userId,
        loanDate: new Date(),
        dueDate,
        status: 'activo',
      },
    });

    await tx.book.update({
      where: { id: reservation.bookId },
      data: { status: 'prestado' },
    });

    return { reservation, loan };
  });

  logger.info('Reserva completada → Préstamo creado', {
    reservationId,
    loanId: result.loan.id,
    bookId: result.reservation.bookId,
    userId,
  });

  return result;
};