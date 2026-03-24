import { Router } from 'express';
import {
  getAll,
  getMyReservations,
  createReservation,
  cancelReservation,
  completeReservation,
} from '../controllers/reservation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Gestión de reservas de libros (3 días para recoger)
 */

/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Listar todas las reservas
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [activa, cancelada, completada]
 *     responses:
 *       200:
 *         description: Lista paginada de reservas
 */
router.get('/', authMiddleware, getAll);

/**
 * @swagger
 * /reservations/my:
 *   get:
 *     summary: Ver mis reservas activas
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reservas activas del usuario autenticado
 */
router.get('/my', authMiddleware, getMyReservations);

/**
 * @swagger
 * /reservations:
 *   post:
 *     summary: Reservar un libro
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookId]
 *             properties:
 *               bookId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Reserva creada (3 días para recoger)
 *       400:
 *         description: Libro no disponible para reserva
 */
router.post('/', authMiddleware, createReservation);

/**
 * @swagger
 * /reservations/{id}/cancel:
 *   patch:
 *     summary: Cancelar una reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva cancelada, libro disponible nuevamente
 */
router.patch('/:id/cancel', authMiddleware, cancelReservation);

/**
 * @swagger
 * /reservations/{id}/complete:
 *   patch:
 *     summary: Completar reserva (convertir a préstamo)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Reserva completada, préstamo creado automáticamente
 */
router.patch('/:id/complete', authMiddleware, completeReservation);

export default router;
