import cors from 'cors';
import express from 'express';

import routes from './api/routes/index.js';
import path from 'path';

const app = express();

app.use('/uploads', express.static('uploads'));
app.enable('json spaces');
app.enable('strict routing');
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend origin
    credentials: true,
}));

app.use(express.json());
app.use(routes);

export default app;