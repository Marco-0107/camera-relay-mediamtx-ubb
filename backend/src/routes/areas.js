import { Router } from 'express';
import * as areasController from '../controllers/areasController.js';

const router = Router({ mergeParams: true });

router.get('/', areasController.list);
router.post('/', areasController.create);
router.delete('/:areaId', areasController.remove);

export default router;
