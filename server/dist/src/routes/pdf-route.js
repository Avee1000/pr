"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pdf_controller_1 = require("../controllers/pdf-controller");
const pdf_controller_2 = require("../controllers/pdf-controller");
const router = (0, express_1.Router)();
// Endpoint protected via Express app.use('/api', requireSupabaseAuth)
router.get('/download-receipt/:quoteId', pdf_controller_2.generateReceipt);
router.get('/all', pdf_controller_1.generateAll);
exports.default = router;
