import { Router } from 'express';
import { getAlerts, createAlert, deleteAlert, toggleAlert } from '../controllers/alert.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);
router.get('/', getAlerts);
router.post('/', createAlert);
router.delete('/:id', deleteAlert);
router.patch('/:id/toggle', toggleAlert);

export default router;
