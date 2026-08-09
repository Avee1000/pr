import { Request, Response } from 'express';
import PDFDocument from 'pdfkit';

export const generateReceipt = (req: Request, res: Response): void => {
  // 1. Create a new PDF document canvas
  const doc = new PDFDocument();

  // 2. Set HTTP headers so the browser triggers an unprotected download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="receipt.pdf"');

  // 3. Pipe the document output stream directly to the HTTP response
  doc.pipe(res);

  // 4. Draw content onto the PDF canvas
  doc.fontSize(20).text('Order Receipt', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Item: Wireless Headphones');
  doc.text('Amount Paid: $99.99');
  doc.text('Status: Paid');

  // 5. Finalize the PDF file
  doc.end();
};