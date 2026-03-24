import { Router } from 'express';
import { getAll, getMyLoans, createLoan, returnBook } from '../controllers/loan.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Préstamos
 *   description: Gestión de préstamos de libros (14 días de duración)
 */

/**
 * @swagger
 * /loans:
 *   get:
 *     summary: Listar todos los préstamos
 *     tags: [Préstamos]
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
 *           enum: [activo, devuelto, vencido]
 *     responses:
 *       200:
 *         description: Lista paginada de préstamos
 */
router.get('/', authMiddleware, getAll);

/**
 * @swagger
 * /loans/my:
 *   get:
 *     summary: Ver mis préstamos activos
 *     tags: [Préstamos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Préstamos activos del usuario autenticado
 */
router.get('/my', authMiddleware, getMyLoans);

/**
 * @swagger
 * /loans:
 *   post:
 *     summary: Solicitar un libro en préstamo
 *     tags: [Préstamos]
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
 *         description: Préstamo creado (14 días para devolver)
 *       400:
 *         description: Libro no disponible
 */
router.post('/', authMiddleware, createLoan);

/**
 * @swagger
 * /loans/{id}/return:
 *   patch:
 *     summary: Devolver un libro prestado
 *     tags: [Préstamos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del préstamo
 *     responses:
 *       200:
 *         description: Libro devuelto exitosamente
 *       400:
 *         description: Préstamo no está activo
 */
router.patch('/:id/return', authMiddleware, returnBook);

export default router;