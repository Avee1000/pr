"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAll = exports.generateReceipt = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const pdf_model_1 = require("../models/pdf-model");
const generateReceipt = async (req, res) => {
    let token;
    if (req.cookies && req.cookies.sb_access_token) {
        token = req.cookies.sb_access_token;
    }
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }
    const { quoteId } = req.params;
    if (!quoteId) {
        res.status(400).json({ error: "Missing quoteId parameter" });
        return;
    }
    const userId = '46b7a494-8d9e-4309-8288-cddd49354b78';
    if (!userId) {
        res.status(400).json({ error: "Missing user ID" });
        return;
    }
    try {
        const accessToken = token;
        const quote = await (0, pdf_model_1.getQuoteByQuoteId)(quoteId, token);
        console.log(quote);
        if (!quote) {
            res.status(404).json({ error: "Quote not found" });
            return;
        }
        const doc = new pdfkit_1.default({ size: 'A4', margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="quote-${quote.quoteId}.pdf"`);
        doc.pipe(res);
        // 🎨 PriceRight & QuoteEasy Brand Color Tokens
        const COLOR = {
            BRAND: '#FFC200', // Brand Yellow (Primary highlights & Pending status)
            ACTION: '#FF4A3C', // Action Red (CTAs)
            INK: '#1A1A1A', // Ink Black (Primary text & Dark containers)
            TEXT_MUTED: '#64748B', // Slate 500
            TEXT_LIGHT: '#94A3B8', // Slate 400
            BG_LIGHT: '#F8FAFC', // Slate 50
            BORDER: '#E2E8F0', // Slate 200
            APPROVED_BG: '#DCFCE7', // Emerald 100
            APPROVED_TEXT: '#16A34A', // green-600 (Spec requirement for approved/paid)
            PENDING_BG: '#FEF08A', // Brand Yellow Tint
            PENDING_TEXT: '#1A1A1A' // Ink Black (Spec requirement: text on yellow is always ink)
        };
        // Page Geometry
        const startX = 50;
        const pageWidth = 495; // 595.28 pt A4 width - 100 pt margins
        const endX = startX + pageWidth;
        let currentY = 0;
        // -----------------------------------------------------------------
        // 0. TOP BRAND ACCENT BAR
        // -----------------------------------------------------------------
        doc.rect(0, 0, 595.28, 6).fill(COLOR.BRAND);
        currentY = 45;
        // -----------------------------------------------------------------
        // 1. HEADER ROW (Logo / Business Name Left, Document Info Right)
        // -----------------------------------------------------------------
        const headerY = currentY;
        const logoPath = path_1.default.join(__dirname, '..', 'public', 'logo.png');
        if (fs_1.default.existsSync(logoPath)) {
            doc.image(logoPath, startX, headerY, { fit: [140, 42] });
        }
        else {
            doc.fontSize(16).font('Helvetica-Bold').fillColor(COLOR.INK).text('PRICERIGHT', startX, headerY);
        }
        // Right aligned Quote Header
        doc.fontSize(22).font('Helvetica-Bold').fillColor(COLOR.INK).text('QUOTE', startX, headerY, {
            width: pageWidth,
            align: 'right'
        });
        doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR.TEXT_MUTED).text(`#${quote.quoteId}`, startX, headerY + 26, {
            width: pageWidth,
            align: 'right'
        });
        currentY = headerY + 60;
        // Divider
        doc.moveTo(startX, currentY).lineTo(endX, currentY).strokeColor(COLOR.BORDER).lineWidth(1).stroke();
        currentY += 25;
        // -----------------------------------------------------------------
        // 2. METADATA GRID CARD (Flex-aligned Row)
        // -----------------------------------------------------------------
        const metaCardY = currentY;
        // Column Coordinates & Widths
        const col1X = startX + 16;
        const col1Width = 190;
        const col2X = startX + 220;
        const col2Width = 110;
        const badgeWidth = 84;
        const badgeHeight = 22;
        const badgeX = endX - 16 - badgeWidth;
        // --- 1. Measure Column Content Heights ---
        doc.fontSize(14).font('Helvetica-Bold');
        const customerNameText = quote.customerName || 'Valued Customer';
        const nameTextHeight = doc.heightOfString(customerNameText, { width: col1Width });
        // Col 1 Total Height: Label (7pt) + Gap (3pt) + Customer Name
        const col1Height = 7 + 3 + nameTextHeight;
        // Col 2 Total Height: Label (7pt) + Gap (3pt) + Due Date (10pt)
        const col2Height = 7 + 3 + 10;
        // Col 3 Total Height: Badge (22pt) + optional Approved Subtext (10pt)
        const hasApprovedDate = Boolean(quote.approvedAt && !isNaN(new Date(quote.approvedAt).getTime()));
        const col3Height = hasApprovedDate ? badgeHeight + 3 + 9 : badgeHeight;
        // --- 2. Calculate Dynamic Card Height & Vertical Center Axis ---
        const paddingY = 16;
        const maxContentHeight = Math.max(col1Height, col2Height, col3Height);
        const metaCardHeight = Math.max(72, maxContentHeight + (paddingY * 2));
        const cardCenterY = metaCardY + (metaCardHeight / 2);
        // Draw Container Card Box
        doc.roundedRect(startX, metaCardY, pageWidth, metaCardHeight, 8)
            .fillAndStroke(COLOR.BG_LIGHT, COLOR.BORDER);
        // --- 3. Render Column 1 (Prepared For) ---
        const col1StartY = cardCenterY - (col1Height / 2);
        doc.fontSize(7).font('Helvetica-Bold').fillColor(COLOR.TEXT_LIGHT)
            .text('PREPARED FOR', col1X, col1StartY);
        doc.fontSize(14).font('Helvetica-Bold').fillColor(COLOR.INK)
            .text(customerNameText, col1X, col1StartY + 10, {
            width: col1Width,
            lineGap: 2
        });
        // --- 4. Render Column 2 (Due Date) ---
        const col2StartY = cardCenterY - (col2Height / 2);
        doc.fontSize(7).font('Helvetica-Bold').fillColor(COLOR.TEXT_LIGHT)
            .text('DUE DATE', col2X, col2StartY);
        doc.fontSize(10).font('Helvetica-Bold').fillColor(COLOR.INK)
            .text(quote.dueDate || 'Upon Receipt', col2X, col2StartY + 10, {
            width: col2Width
        });
        // --- 5. Render Column 3 (Status Badge & Optional Timestamp) ---
        const col3StartY = cardCenterY - (col3Height / 2);
        const isApproved = quote.quoteStatus === 'approved';
        const badgeBg = isApproved ? COLOR.APPROVED_BG : COLOR.PENDING_BG;
        const badgeText = isApproved ? COLOR.APPROVED_TEXT : COLOR.PENDING_TEXT;
        const statusLabel = isApproved ? 'APPROVED' : 'PENDING';
        // Draw Pill Background
        doc.roundedRect(badgeX, col3StartY, badgeWidth, badgeHeight, badgeHeight / 2)
            .fill(badgeBg);
        // Centered Pill Text
        doc.fontSize(8)
            .font('Helvetica-Bold')
            .fillColor(badgeText)
            .text(statusLabel, badgeX, col3StartY + (badgeHeight / 1.8), {
            width: badgeWidth,
            align: 'center',
            baseline: 'middle'
        });
        // Render Approved Date Subtext (if applicable)
        if (hasApprovedDate) {
            const formattedApprovedDate = new Date(quote.approvedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
            doc.fontSize(7)
                .font('Helvetica')
                .fillColor(COLOR.TEXT_MUTED)
                .text(`Approved ${formattedApprovedDate}`, badgeX - 10, col3StartY + badgeHeight + 4, {
                width: badgeWidth + 20,
                align: 'center'
            });
        }
        // Update Y cursor for next block
        currentY = metaCardY + metaCardHeight + 24;
        // -----------------------------------------------------------------
        // 3. WORK DESCRIPTION CARD
        // -----------------------------------------------------------------
        doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.TEXT_LIGHT).text('WORK DESCRIPTION', startX, currentY);
        currentY += 12;
        const descPadding = 16;
        const descTextWidth = pageWidth - (descPadding * 2) - 4;
        doc.fontSize(9.5).font('Helvetica').fillColor(COLOR.INK).lineGap(4);
        const descriptionText = quote.orderDescription || 'No description provided.';
        const descTextHeight = doc.heightOfString(descriptionText, { width: descTextWidth, lineGap: 4 });
        const descCardHeight = descTextHeight + (descPadding * 2);
        doc.roundedRect(startX, currentY, pageWidth, descCardHeight, 6)
            .fillAndStroke(COLOR.BG_LIGHT, COLOR.BORDER);
        // Left Accent Line on Card (Brand Yellow)
        doc.roundedRect(startX, currentY, 4, descCardHeight, 2).fill(COLOR.BRAND);
        doc.fontSize(9.5).font('Helvetica').fillColor(COLOR.INK).lineGap(4);
        doc.text(descriptionText, startX + descPadding + 4, currentY + descPadding, {
            width: descTextWidth,
            align: 'left'
        });
        currentY += descCardHeight + 25;
        // Page overflow guard before drawing summary block
        if (currentY + 180 > 780) {
            doc.addPage();
            currentY = 45;
        }
        // -----------------------------------------------------------------
        // 4. QUOTE TOTAL CARD
        // -----------------------------------------------------------------
        const totalCardHeight = 60; // Declare totalCardHeight
        const totalCardCenterY = currentY + (totalCardHeight / 2); // Rename cardCenterY to totalCardCenterY
        // Primary Ink Background Container
        doc.roundedRect(startX, currentY, pageWidth, totalCardHeight, 8).fill(COLOR.INK);
        const numericPrice = Number(quote.price) || 0;
        const formattedPrice = `$${numericPrice.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
        // Left Column: Label Block (Vertically offset around the center axis)
        doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR.BRAND).text('QUOTE TOTAL', startX + 20, currentY + 17);
        doc.fontSize(8).font('Helvetica').fillColor(COLOR.TEXT_LIGHT).text('Estimated total based on quote terms', startX + 20, currentY + 33);
        // Right Column: Price Number (Vertically centered on the 30pt middle line)
        const priceBoxX = startX + 220;
        const priceBoxWidth = pageWidth - 240; // Restricts width to right half to prevent overlapping left text
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .fillColor('#FFFFFF')
            .text(formattedPrice, priceBoxX, totalCardCenterY, {
            width: priceBoxWidth,
            align: 'right',
            baseline: 'middle'
        });
        currentY += totalCardHeight + 40;
        // -----------------------------------------------------------------
        // 6. FOOTER
        // -----------------------------------------------------------------
        const footerY = 750;
        doc.moveTo(startX, footerY).lineTo(endX, footerY).strokeColor(COLOR.BORDER).lineWidth(0.5).stroke();
        doc.fontSize(8).font('Helvetica').fillColor(COLOR.TEXT_LIGHT).text('Generated via PriceRight & QuoteEasy', startX, footerY + 12, {
            width: pageWidth,
            align: 'center'
        });
        doc.end();
    }
    catch (error) {
        console.error('Error generating PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error', message: error });
        }
    }
};
exports.generateReceipt = generateReceipt;
const generateAll = async (req, res) => {
    let token;
    if (req.cookies && req.cookies.sb_access_token) {
        token = req.cookies.sb_access_token;
    }
    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }
    const userId = req.user?.id;
    console.log(userId);
    if (!userId) {
        res.status(400).json({ error: "Missing user ID" });
        return;
    }
    try {
        const accessToken = token;
        const customers = await (0, pdf_model_1.getAllCustomers)(userId, accessToken);
        if (!customers || customers.length === 0) {
            res.status(404).json({ error: 'No customers found' });
            return;
        }
        res.json(customers);
    }
    catch (error) {
        console.error('Error in generateAll:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
exports.generateAll = generateAll;
