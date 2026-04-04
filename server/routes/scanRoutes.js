import express from 'express';
import {
  scanURLController,
  scanEmailController,
  scanFileController,
  scanIdentityController,
  scanFootprintController
} from '../controllers/scanController.js';

const router = express.Router();

router.post('/scan-url', scanURLController);
router.post('/scan-email', scanEmailController);
router.post('/scan-file', scanFileController);
router.post('/scan-identity', scanIdentityController);
router.post('/scan-footprint', scanFootprintController);

export default router;
