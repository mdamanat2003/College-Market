import { Router } from 'express';
import { getSeedNotifications } from '../controllers/debugController';

const router = Router();

router.get('/notifications', getSeedNotifications);

export default router;
