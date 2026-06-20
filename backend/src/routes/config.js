import { Router } from 'express';
import * as configController from '../controllers/configController.js';

const router = Router();

router.get('/', configController.getConfig);

export default router;
