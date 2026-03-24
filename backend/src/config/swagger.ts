import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Libros',
      version: '1.0.0',
      description: `
API REST para la gestión de libros en línea.
Permite crear, editar, eliminar y consultar libros,
así como gestionar préstamos y reservas.

## Autenticación
La API utiliza JWT (JSON Web Tokens). Para acceder a los endpoints protegidos,
haz login y luego haz clic en el botón "Authorize" e ingresa: **Bearer tu_token**

## Estados de libros
- **disponible**: Listo para préstamo o reserva
- **reservado**: Reservado por un usuario (3 días para recoger)
- **prestado**: En préstamo activo (14 días para devolver)
      `,
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`,
        description: 'Servidor de desarrollo',
      },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Ingresa tu token JWT (sin la palabra Bearer)',
        },
      },
    },
  },

  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;