import express from 'express';
import {
  scanURLController,
  scanEmailController,
  scanFileController,
  scanIdentityController,
  scanFootprintController,
  getResultsController,
  getResultByIdController,
  getStatsController
} from '../controllers/scanController.js';

const router = express.Router();

router.post('/scan-url', scanURLController);
router.post('/scan-email', scanEmailController);
router.post('/scan-file', scanFileController);
router.post('/scan-identity', scanIdentityController);
router.post('/scan-footprint', scanFootprintController);

router.get('/results', getResultsController);
router.get('/results/:id', getResultByIdController);
router.get('/stats', getStatsController);

export default router;
