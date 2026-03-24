import { Router } from 'express';
import { getAll, getById, create, update, remove } from '../controllers/book.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Libros
 *   description: CRUD de libros con paginación, filtros y ordenamiento
 */

/**
 * @swagger
 * /books:
 *   get:
 *     summary: Listar libros con paginación, filtros y ordenamiento
 *     tags: [Libros]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en título y autor
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filtrar por autor
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [disponible, reservado, prestado]
 *         description: Filtrar por estado
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Filtrar por año de publicación
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, author, publicationYear, status, createdAt]
 *           default: createdAt
 *         description: Campo de ordenamiento
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Dirección del ordenamiento
 *     responses:
 *       200:
 *         description: Lista paginada de libros
 */
router.get('/', getAll);

/**
 * @swagger
 * /books/{id}:
 *   get:
 *     summary: Obtener detalle de un libro
 *     tags: [Libros]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del libro
 *     responses:
 *       200:
 *         description: Detalle del libro
 *       404:
 *         description: Libro no encontrado
 */
router.get('/:id', getById);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Crear un nuevo libro
 *     tags: [Libros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, author, publicationYear]
 *             properties:
 *               title:
 *                 type: string
 *                 example: Cien años de soledad
 *               author:
 *                 type: string
 *                 example: Gabriel García Márquez
 *               publicationYear:
 *                 type: integer
 *                 example: 1967
 *     responses:
 *       201:
 *         description: Libro creado exitosamente
 *       401:
 *         description: No autenticado
 */
router.post('/', authMiddleware, create);

/**
 * @swagger
 * /books/{id}:
 *   put:
 *     summary: Actualizar un libro
 *     tags: [Libros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               author:
 *                 type: string
 *               publicationYear:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [disponible, reservado, prestado]
 *     responses:
 *       200:
 *         description: Libro actualizado
 *       404:
 *         description: Libro no encontrado
 */
router.put('/:id', authMiddleware, update);

/**
 * @swagger
 * /books/{id}:
 *   delete:
 *     summary: Eliminar un libro
 *     tags: [Libros]
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
 *         description: Libro eliminado
 *       400:
 *         description: No se puede eliminar (está prestado o reservado)
 *       404:
 *         description: Libro no encontrado
 */
router.delete('/:id', authMiddleware, remove);

export default router;