//server/src/routes/pdf-route.ts
import { Router } from 'express';
import { generateReceipt } from '../controllers/pdf-controller';
import { requireSupabaseAuth } from '../middleware/auth';

const router = Router();

// Protect ALL routes defined in this router
router.use(requireSupabaseAuth);

router.get('/download-receipt', generateReceipt)

export default router;