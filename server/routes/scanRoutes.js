import express from 'express';
import {
  scanURLController,
  scanEmailController,
  scanFileController,
  scanIdentityController
} from '../controllers/scanController.js';

const router = express.Router();

router.post('/scan-url', scanURLController);
router.post('/scan-email', scanEmailController);
router.post('/scan-file', scanFileController);
router.post('/scan-identity', scanIdentityController);

export default router;
