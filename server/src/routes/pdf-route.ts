import { Router } from 'express';
import { generateAll } from '../controllers/pdf-controller';
import { generateReceipt } from '../controllers/pdf-controller';

const router = Router();

// Endpoint protected via Express app.use('/api', requireSupabaseAuth)
router.get('/download-receipt/:quoteId', generateReceipt);

router.get('/all', generateAll);
export default router;