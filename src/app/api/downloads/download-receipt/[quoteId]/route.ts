import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';
import { createClient } from '@/lib/supabase/server';
import { getQuoteByQuoteId } from '@/lib/models/pdf-model';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    // 1. Authenticate user session
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Resolve parameters & fetch quote data
    const { quoteId } = await params;

    if (!quoteId) {
      return NextResponse.json({ error: 'Missing quoteId parameter' }, { status: 400 });
    }

    const quote = await getQuoteByQuoteId(quoteId);

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 });
    }

    // 3. Initialize PDFKit document and buffer collection
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    // 🎨 Brand Color Tokens
    const COLOR = {
      BRAND: '#FFC200',
      ACTION: '#FF4A3C',
      INK: '#1A1A1A',
      TEXT_MUTED: '#64748B',
      TEXT_LIGHT: '#94A3B8',
      BG_LIGHT: '#F8FAFC',
      BORDER: '#E2E8F0',
      APPROVED_BG: '#DCFCE7',
      APPROVED_TEXT: '#16A34A',
      PENDING_BG: '#FEF08A',
      PENDING_TEXT: '#1A1A1A',
    };

    const startX = 50;
    const pageWidth = 495;
    const endX = startX + pageWidth;
    let currentY = 0;

    // -----------------------------------------------------------------
    // TOP BRAND ACCENT BAR
    // -----------------------------------------------------------------
    doc.rect(0, 0, 595.28, 6).fill(COLOR.BRAND);
    currentY = 45;

    // -----------------------------------------------------------------
    // HEADER ROW
    // -----------------------------------------------------------------
    const headerY = currentY;
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');

    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, startX, headerY, { fit: [140, 42] });
    } else {
      doc.fontSize(16).font('Helvetica-Bold').fillColor(COLOR.INK).text('PRICERIGHT', startX, headerY);
    }

    doc.fontSize(22).font('Helvetica-Bold').fillColor(COLOR.INK).text('QUOTE', startX, headerY, {
      width: pageWidth,
      align: 'right',
    });

    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR.TEXT_MUTED).text(`#${quote.quoteId}`, startX, headerY + 26, {
      width: pageWidth,
      align: 'right',
    });

    currentY = headerY + 60;
    doc.moveTo(startX, currentY).lineTo(endX, currentY).strokeColor(COLOR.BORDER).lineWidth(1).stroke();
    currentY += 25;

    // -----------------------------------------------------------------
    // METADATA GRID CARD
    // -----------------------------------------------------------------
    const metaCardY = currentY;
    const col1X = startX + 16;
    const col1Width = 190;
    const col2X = startX + 220;
    const col2Width = 110;
    const badgeWidth = 84;
    const badgeHeight = 22;
    const badgeX = endX - 16 - badgeWidth;

    doc.fontSize(14).font('Helvetica-Bold');
    const customerNameText = quote.customerName || 'Valued Customer';
    const nameTextHeight = doc.heightOfString(customerNameText, { width: col1Width });

    const col1Height = 7 + 3 + nameTextHeight;
    const col2Height = 7 + 3 + 10;
    const hasApprovedDate = Boolean(quote.approvedAt && !isNaN(new Date(quote.approvedAt).getTime()));
    const col3Height = hasApprovedDate ? badgeHeight + 3 + 9 : badgeHeight;

    const paddingY = 16;
    const maxContentHeight = Math.max(col1Height, col2Height, col3Height);
    const metaCardHeight = Math.max(72, maxContentHeight + paddingY * 2);
    const cardCenterY = metaCardY + metaCardHeight / 2;

    doc.roundedRect(startX, metaCardY, pageWidth, metaCardHeight, 8).fillAndStroke(COLOR.BG_LIGHT, COLOR.BORDER);

    // Col 1
    const col1StartY = cardCenterY - col1Height / 2;
    doc.fontSize(7).font('Helvetica-Bold').fillColor(COLOR.TEXT_LIGHT).text('PREPARED FOR', col1X, col1StartY);
    doc.fontSize(14).font('Helvetica-Bold').fillColor(COLOR.INK).text(customerNameText, col1X, col1StartY + 10, {
      width: col1Width,
      lineGap: 2,
    });

    // Col 2
    const col2StartY = cardCenterY - col2Height / 2;
    doc.fontSize(7).font('Helvetica-Bold').fillColor(COLOR.TEXT_LIGHT).text('DUE DATE', col2X, col2StartY);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLOR.INK).text(quote.dueDate || 'Upon Receipt', col2X, col2StartY + 10, {
      width: col2Width,
    });

    // Col 3
    const col3StartY = cardCenterY - col3Height / 2;
    const isApproved = quote.quoteStatus === 'approved';
    const badgeBg = isApproved ? COLOR.APPROVED_BG : COLOR.PENDING_BG;
    const badgeText = isApproved ? COLOR.APPROVED_TEXT : COLOR.PENDING_TEXT;
    const statusLabel = isApproved ? 'APPROVED' : 'PENDING';

    doc.roundedRect(badgeX, col3StartY, badgeWidth, badgeHeight, badgeHeight / 2).fill(badgeBg);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(badgeText).text(statusLabel, badgeX, col3StartY + badgeHeight / 1.8, {
      width: badgeWidth,
      align: 'center',
      baseline: 'middle',
    });

    if (hasApprovedDate) {
      const formattedApprovedDate = new Date(quote.approvedAt as string).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      doc.fontSize(7).font('Helvetica').fillColor(COLOR.TEXT_MUTED).text(`Approved ${formattedApprovedDate}`, badgeX - 10, col3StartY + badgeHeight + 4, {
        width: badgeWidth + 20,
        align: 'center',
      });
    }

    currentY = metaCardY + metaCardHeight + 24;

    // -----------------------------------------------------------------
    // WORK DESCRIPTION CARD
    // -----------------------------------------------------------------
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.TEXT_LIGHT).text('WORK DESCRIPTION', startX, currentY);
    currentY += 12;

    const descPadding = 16;
    const descTextWidth = pageWidth - descPadding * 2 - 4;
    doc.fontSize(9.5).font('Helvetica').fillColor(COLOR.INK).lineGap(4);
    const descriptionText = quote.orderDescription || 'No description provided.';
    const descTextHeight = doc.heightOfString(descriptionText, { width: descTextWidth, lineGap: 4 });
    const descCardHeight = descTextHeight + descPadding * 2;

    doc.roundedRect(startX, currentY, pageWidth, descCardHeight, 6).fillAndStroke(COLOR.BG_LIGHT, COLOR.BORDER);
    doc.roundedRect(startX, currentY, 4, descCardHeight, 2).fill(COLOR.BRAND);
    doc.fontSize(9.5).font('Helvetica').fillColor(COLOR.INK).lineGap(4);
    doc.text(descriptionText, startX + descPadding + 4, currentY + descPadding, {
      width: descTextWidth,
      align: 'left',
    });

    currentY += descCardHeight + 25;

    if (currentY + 180 > 780) {
      doc.addPage();
      currentY = 45;
    }

    // -----------------------------------------------------------------
    // QUOTE TOTAL CARD
    // -----------------------------------------------------------------
    const totalCardHeight = 60;
    const totalCardCenterY = currentY + totalCardHeight / 2;

    doc.roundedRect(startX, currentY, pageWidth, totalCardHeight, 8).fill(COLOR.INK);

    const numericPrice = Number(quote.price) || 0;
    const formattedPrice = `$${numericPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR.BRAND).text('QUOTE TOTAL', startX + 20, currentY + 17);
    doc.fontSize(8).font('Helvetica').fillColor(COLOR.TEXT_LIGHT).text('Estimated total based on quote terms', startX + 20, currentY + 33);

    const priceBoxX = startX + 220;
    const priceBoxWidth = pageWidth - 240;

    doc.fontSize(20).font('Helvetica-Bold').fillColor('#FFFFFF').text(formattedPrice, priceBoxX, totalCardCenterY, {
      width: priceBoxWidth,
      align: 'right',
      baseline: 'middle',
    });

    currentY += totalCardHeight + 40;

    // -----------------------------------------------------------------
    // FOOTER
    // -----------------------------------------------------------------
    const footerY = 750;
    doc.moveTo(startX, footerY).lineTo(endX, footerY).strokeColor(COLOR.BORDER).lineWidth(0.5).stroke();
    doc.fontSize(8).font('Helvetica').fillColor(COLOR.TEXT_LIGHT).text('Generated via PriceRight & QuoteEasy', startX, footerY + 12, {
      width: pageWidth,
      align: 'center',
    });

    // 4. Wrap PDF stream execution in Promise
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);
      doc.end();
    });

    // 5. Return PDF Response
return new NextResponse(new Uint8Array(pdfBuffer), {
  status: 200,
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `inline; filename="quote-${quote.quoteId}.pdf"`,
  },
});
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}