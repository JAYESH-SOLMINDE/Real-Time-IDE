import { Router } from 'express';
import { getAISuggestion } from '../controllers/aiController';

const router = Router();
router.post('/suggest', getAISuggestion);
export default router;
