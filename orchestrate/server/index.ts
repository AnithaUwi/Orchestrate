import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`[BACKEND REQUEST] ${req.method} ${req.url}`);
    next();
});

// Routes will be imported here
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/projects.routes';
import taskRoutes from './routes/tasks.routes';
import bookingRoutes from './routes/bookings.routes';
import userRoutes from './routes/users.routes';

app.get('/', (req: Request, res: Response) => {
    res.send('Orchestrate API is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
