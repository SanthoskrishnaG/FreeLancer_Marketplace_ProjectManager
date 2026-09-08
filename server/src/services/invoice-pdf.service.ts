import PDFDocument from 'pdfkit';

interface InvoicePdfData {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  status: string;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  paidAt?: Date | null;
  client: {
    name: string;
    companyName?: string | null;
    email: string;
    location?: string | null;
  };
  freelancer: {
    name: string;
    title?: string | null;
    email: string;
    location?: string | null;
  };
  project: {
    title: string;
  };
  contractId: string;
  items: Array<{
    description: string;
    amount: number | string;
  }>;
  payments?: Array<{
    transactionId: string;
    provider: string;
    amount: number | string;
    createdAt: Date;
  }>;
}

export class InvoicePdfService {
  public static async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 40,
          info: {
            Title: `Invoice ${data.invoiceNumber}`,
            Author: 'Freelancer Marketplace Platform',
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        // 1. Header Banner
        doc
          .rect(0, 0, doc.page.width, 100)
          .fill('#0f172a'); // Dark slate header

        // Marketplace Brand
        doc
          .fillColor('#38bdf8')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('FREELANCER MARKETPLACE', 40, 30);

        doc
          .fillColor('#94a3b8')
          .fontSize(9)
          .font('Helvetica')
          .text('Verified Escrow & Professional Invoicing', 40, 52);

        // Invoice Number & Status in Header Right
        doc
          .fillColor('#ffffff')
          .fontSize(16)
          .font('Helvetica-Bold')
          .text(`INVOICE`, 380, 26, { align: 'right', width: 175 });

        doc
          .fillColor('#e2e8f0')
          .fontSize(10)
          .font('Helvetica')
          .text(`#${data.invoiceNumber}`, 380, 46, { align: 'right', width: 175 });

        const statusColor =
          data.status === 'PAID'
            ? '#22c55e'
            : data.status === 'OVERDUE'
              ? '#ef4444'
              : '#38bdf8';

        doc
          .fillColor(statusColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(`STATUS: ${data.status}`, 380, 62, { align: 'right', width: 175 });

        // 2. Dates & Project Metadata
        let y = 120;
        doc
          .fillColor('#334155')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('ISSUE DATE', 40, y);
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('DUE DATE', 160, y);
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('CONTRACT ID', 280, y);
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('PROJECT TITLE', 400, y);

        y += 12;
        doc
          .fillColor('#0f172a')
          .fontSize(9)
          .font('Helvetica')
          .text(new Date(data.issueDate).toLocaleDateString(), 40, y);
        doc
          .text(new Date(data.dueDate).toLocaleDateString(), 160, y);
        doc
          .text(data.contractId.slice(0, 14) + '...', 280, y);
        doc
          .font('Helvetica-Bold')
          .text(data.project.title, 400, y, { width: 155, height: 24, ellipsis: true });

        // 3. Parties Box (Billed To / Issued By)
        y = 160;
        doc
          .roundedRect(40, y, doc.page.width - 80, 80, 6)
          .fillAndStroke('#f8fafc', '#e2e8f0');

        // Billed To
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('BILLED TO (CLIENT)', 55, y + 12);

        doc
          .fillColor('#0f172a')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(data.client.companyName || data.client.name, 55, y + 25);

        doc
          .fillColor('#475569')
          .fontSize(8.5)
          .font('Helvetica')
          .text(data.client.email, 55, y + 40);

        if (data.client.location) {
          doc.text(data.client.location, 55, y + 54);
        }

        // Issued By
        doc
          .fillColor('#64748b')
          .fontSize(8)
          .font('Helvetica-Bold')
          .text('ISSUED BY (FREELANCER)', 310, y + 12);

        doc
          .fillColor('#0f172a')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(data.freelancer.name, 310, y + 25);

        doc
          .fillColor('#475569')
          .fontSize(8.5)
          .font('Helvetica')
          .text(data.freelancer.title || 'Independent Contractor', 310, y + 40);

        doc.text(data.freelancer.email, 310, y + 54);

        // 4. Line Items Table
        y = 265;
        doc
          .rect(40, y, doc.page.width - 80, 24)
          .fill('#1e293b');

        doc
          .fillColor('#f8fafc')
          .fontSize(8.5)
          .font('Helvetica-Bold')
          .text('#', 50, y + 7)
          .text('ITEM DELIVERABLE / DESCRIPTION', 80, y + 7)
          .text('AMOUNT (USD)', 440, y + 7, { align: 'right', width: 100 });

        y += 24;
        let itemIndex = 1;

        for (const item of data.items) {
          const isEven = itemIndex % 2 === 0;
          doc
            .rect(40, y, doc.page.width - 80, 26)
            .fill(isEven ? '#f8fafc' : '#ffffff');

          doc
            .fillColor('#64748b')
            .fontSize(8.5)
            .font('Helvetica')
            .text(itemIndex.toString(), 50, y + 8);

          doc
            .fillColor('#1e293b')
            .fontSize(8.5)
            .font('Helvetica')
            .text(item.description, 80, y + 8, { width: 350, ellipsis: true });

          doc
            .fillColor('#0f172a')
            .fontSize(8.5)
            .font('Helvetica-Bold')
            .text(`$${Number(item.amount).toFixed(2)}`, 440, y + 8, { align: 'right', width: 100 });

          y += 26;
          itemIndex++;
        }

        // Table Bottom Border
        doc
          .moveTo(40, y)
          .lineTo(doc.page.width - 40, y)
          .strokeColor('#cbd5e1')
          .stroke();

        // 5. Totals Section
        y += 15;
        const totalX = 360;
        const totalW = 180;

        doc
          .fillColor('#475569')
          .fontSize(9)
          .font('Helvetica')
          .text('Subtotal:', totalX, y)
          .text(`$${Number(data.subtotal).toFixed(2)}`, totalX, y, { align: 'right', width: totalW });

        y += 16;
        doc
          .text('Tax (0.00% / Platform Fee):', totalX, y)
          .text(`$${Number(data.tax).toFixed(2)}`, totalX, y, { align: 'right', width: totalW });

        y += 20;
        doc
          .rect(totalX - 10, y - 4, totalW + 20, 30)
          .fill('#f1f5f9');

        doc
          .fillColor('#0f172a')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Total Due:', totalX, y + 4)
          .text(`$${Number(data.total).toFixed(2)}`, totalX, y + 4, { align: 'right', width: totalW });

        // 6. Payment Information Box if paid
        y += 50;
        if (data.status === 'PAID' && data.payments && data.payments.length > 0) {
          const p = data.payments[0];
          doc
            .roundedRect(40, y, doc.page.width - 80, 50, 6)
            .fillAndStroke('#ecfdf5', '#a7f3d0');

          doc
            .fillColor('#065f46')
            .fontSize(9)
            .font('Helvetica-Bold')
            .text('✔ PAYMENT SETTLED', 55, y + 10);

          doc
            .fillColor('#047857')
            .fontSize(8)
            .font('Helvetica')
            .text(
              `Paid on ${data.paidAt ? new Date(data.paidAt).toLocaleDateString() : new Date().toLocaleDateString()} | Provider: ${p.provider} | Transaction Ref: ${p.transactionId}`,
              55,
              y + 26
            );

          y += 65;
        }

        // 7. Footer
        const bottomY = doc.page.height - 70;
        doc
          .moveTo(40, bottomY)
          .lineTo(doc.page.width - 40, bottomY)
          .strokeColor('#e2e8f0')
          .stroke();

        doc
          .fillColor('#94a3b8')
          .fontSize(7.5)
          .font('Helvetica')
          .text(
            'This is a computer-generated tax invoice issued by Freelancer Marketplace Escrow & Billing Systems. No signature is required.',
            40,
            bottomY + 10,
            { align: 'center', width: doc.page.width - 80 }
          );

        doc.text(
          'For billing questions or dispute claims, please access the platform dispute center or contact support.',
          40,
          bottomY + 22,
          { align: 'center', width: doc.page.width - 80 }
        );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
