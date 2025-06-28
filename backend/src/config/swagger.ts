import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Options } from "swagger-jsdoc";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Class Manager API",
      version: "1.0.0",
      description: "API documentation for Class Manager",
      contact: {
        name: "Teknik Elektro",
        // email: "email@example.com",
        url: "https://github.com/lauvinfox/class-manager",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Development Server",
      },
      {
        url: "TBA",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: 'Masukkan token JWT (misalnya, "Bearer YOUR_TOKEN")',
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string", description: "ID pengguna" },
            name: { type: "string", description: "Nama pengguna" },
            email: { type: "string", description: "Email pengguna" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string", description: "Pesan kesalahan" },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "./src/routes/**/*.ts",
    "./src/controllers/**/*.ts",
    "./src/models/**/*.ts",
  ],
};
export const swaggerSpec = swaggerJSDoc(swaggerOptions);
export { swaggerUi };
