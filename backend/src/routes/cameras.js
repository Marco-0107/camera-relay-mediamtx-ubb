import { Router } from 'express';
import * as camerasController from '../controllers/camerasController.js';

const router = Router();

router.get('/', camerasController.list);
router.post('/', camerasController.create);
router.delete('/:id', camerasController.remove);
router.get('/:id/status', camerasController.status);

export default router;
