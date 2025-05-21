import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import roomsRouter from './routes/rooms.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRouter);

