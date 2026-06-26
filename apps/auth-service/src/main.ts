import express from 'express';
import cors from 'cors';
import router from './routes/auth.router';
import swaggerUi from 'swagger-ui-express';
import { errorMiddleware } from '@packages/error-handler/error-middleware';
import cookieParser from 'cookie-parser';

const swaggerDocument = require('./swagger-output.json');

const app = express();

app.use(
  cors({
    origin: ['https://localhost:3000'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send({ message: 'Hello API' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/docs-json', (req, res) => {
  res.json(swaggerDocument);
});

//Routes
app.use('/api', router);

// Error handlings
app.use(errorMiddleware);

const port = process.env.PORT || 6001;
const server = app.listen(port, () => {
  console.log(`Auth service is running on port ${port}`);
  console.log(`Swagger Docs is available at http://localhost:${port}/api-docs`);
  console.log(
    `Swagger JSON is available at http://localhost:${port}/docs-json`,
  );
});

server.on('error', (error) => {
  console.log('Server Error', error);
});
