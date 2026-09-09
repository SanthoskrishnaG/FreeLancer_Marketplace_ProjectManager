import PDFDocument from 'pdfkit';

export async function generateInvoicePdf(invoice) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Header
      doc
        .fillColor('#0f172a')
        .fontSize(24)
        .font('Helvetica-Bold')
        .text('INVOICE', 50, 50);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 80)
        .text(`Date Issued: ${new Date(invoice.issueDate).toLocaleDateString()}`, 50, 95)
        .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 50, 110)
        .text(`Status: ${invoice.status}`, 50, 125);

      // Client & Freelancer Info
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('Billed To (Client):', 350, 80);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#334155')
        .text(invoice.client?.companyName || 'Valued Client', 350, 98)
        .text(`${invoice.client?.user?.firstName || ''} ${invoice.client?.user?.lastName || ''}`, 350, 113)
        .text(invoice.client?.user?.email || '', 350, 128);

      // Divider
      doc
        .moveTo(50, 160)
        .lineTo(550, 160)
        .strokeColor('#cbd5e1')
        .stroke();

      // Project context
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .fillColor('#0f172a')
        .text('Project Deliverables', 50, 180);

      doc
        .fontSize(10)
        .font('Helvetica')
        .fillColor('#475569')
        .text(`Project Title: ${invoice.project?.title || 'Contract Project'}`, 50, 200);

      // Table Header
      let y = 230;
      doc
        .rect(50, y, 500, 25)
        .fillColor('#f1f5f9')
        .fill();

      doc
        .fillColor('#1e293b')
        .font('Helvetica-Bold')
        .fontSize(10)
        .text('Description / Milestone', 60, y + 7)
        .text('Amount ($ USD)', 450, y + 7, { align: 'right', width: 90 });

      y += 35;

      // Line items
      const items = invoice.items && invoice.items.length > 0
        ? invoice.items
        : [{ description: invoice.milestone?.title || 'Project Milestone Settlement', amount: invoice.total }];

      items.forEach((item) => {
        doc
          .font('Helvetica')
          .fontSize(10)
          .fillColor('#334155')
          .text(item.description, 60, y)
          .text(`$${Number(item.amount).toFixed(2)}`, 450, y, { align: 'right', width: 90 });
        y += 25;
      });

      // Total summary
      y += 20;
      doc
        .moveTo(350, y)
        .lineTo(550, y)
        .strokeColor('#cbd5e1')
        .stroke();

      y += 10;
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#64748b')
        .text('Subtotal:', 350, y)
        .text(`$${Number(invoice.subtotal).toFixed(2)}`, 450, y, { align: 'right', width: 90 });

      y += 20;
      doc
        .text('Tax (0%):', 350, y)
        .text(`$${Number(invoice.tax || 0).toFixed(2)}`, 450, y, { align: 'right', width: 90 });

      y += 20;
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#0f172a')
        .text('Total Paid / Due:', 350, y)
        .text(`$${Number(invoice.total).toFixed(2)}`, 450, y, { align: 'right', width: 90 });

      // Footer
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#94a3b8')
        .text(
          'Thank you for your business. For any invoice or escrow billing inquiries, contact billing@marketplace.io.',
          50,
          700,
          { align: 'center', width: 500 }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
