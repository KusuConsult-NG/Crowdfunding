import { jsPDF } from 'jspdf';

// Helper to format currency
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

interface ReceiptData {
    receiptNumber: string;
    date: Date;
    donorName: string;
    amount: number;
    currency: string;
    campaignTitle: string;
    paymentMethod: string;
}

export const generateReceiptPDF = (data: ReceiptData): ArrayBuffer => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(99, 102, 241); // Primary color #6366f1
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('DONATION RECEIPT', pageWidth / 2, 25, { align: 'center' });

    // Organization Info
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ChurchFlow', 20, 60);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('123 Church Street', 20, 66);
    doc.text('Lagos, Nigeria', 20, 72);
    doc.text('support@churchflow.com', 20, 78);

    // Receipt Details Box
    doc.setDrawColor(229, 231, 235);
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(pageWidth - 90, 55, 70, 35, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.text('Receipt Number:', pageWidth - 85, 65);
    doc.setFont('helvetica', 'bold');
    doc.text(data.receiptNumber, pageWidth - 85, 70);

    doc.setFont('helvetica', 'normal');
    doc.text('Date:', pageWidth - 85, 80);
    doc.setFont('helvetica', 'bold');
    doc.text(data.date.toLocaleDateString(), pageWidth - 85, 85);

    // Donation Details
    const startY = 110;

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray
    doc.text('Received From', 20, startY);
    doc.setTextColor(17, 24, 39); // Black
    doc.setFontSize(14);
    doc.text(data.donorName, 20, startY + 8);

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('Amount', pageWidth / 2, startY);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(14);
    doc.text(formatCurrency(data.amount, data.currency), pageWidth / 2, startY + 8);

    // Line separator
    doc.setDrawColor(229, 231, 235);
    doc.line(20, startY + 20, pageWidth - 20, startY + 20);

    // Campaign Info
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('Campaign', 20, startY + 35);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(14);
    doc.text(data.campaignTitle, 20, startY + 43);

    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text('Payment Method', pageWidth / 2, startY + 35);
    doc.setTextColor(17, 24, 39);
    doc.setFontSize(14);
    doc.text(data.paymentMethod, pageWidth / 2, startY + 43);

    // Footer
    const footerY = 250;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, footerY, pageWidth - 20, footerY);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text('Thank you for your generous support!', pageWidth / 2, footerY + 15, { align: 'center' });
    doc.text('This is a computer-generated receipt and does not require a signature.', pageWidth / 2, footerY + 22, { align: 'center' });

    return doc.output('arraybuffer');
};
