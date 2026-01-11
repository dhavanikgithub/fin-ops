import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

// Type definitions
interface ProfilerTransaction {
    id: number;
    transaction_type: 'deposit' | 'withdraw';
    amount: number;
    withdraw_charges_percentage?: number | null;
    withdraw_charges_amount?: number | null;
    notes?: string | null;
    created_at: Date | string;
    client_name?: string;
    bank_name?: string;
    credit_card_number?: string;
}

interface ProfileSummary {
    total_deposits: number;
    total_withdrawals: number;
    total_charges: number;
    net_amount: number;
    transaction_difference: number;
    credit_uncountable: number;
}

interface ProfileReportData {
    client_name: string;
    bank_name: string;
    credit_card_number: string;
    opening_balance: number;
    current_balance: number;
    transactions: ProfilerTransaction[];
    summary: ProfileSummary;
}

interface Colors {
    gray100: string;
    gray200: string;
    gray500: string;
    gray700: string;
    gray900: string;
    red500: string;
    red700: string;
    green500: string;
    green700: string;
    white: string;
    primary: string;
}

class ProfilerTransactionReportPDF {
    private doc: PDFKit.PDFDocument;
    private pageWidth: number;
    private colors: Colors;

    constructor() {
        this.doc = new PDFDocument({ margin: 20, size: 'A4' });
        this.pageWidth = this.doc.page.width - 40;

        this.colors = {
            gray100: '#f3f4f6',
            gray200: '#e5e7eb',
            gray500: '#6b7280',
            gray700: '#374151',
            gray900: '#111827',
            red500: '#ef4444',
            red700: '#b91c1c',
            green500: '#10b981',
            green700: '#047857',
            white: '#ffffff',
            primary: '#3b82f6'
        };
    }

    private setFont(): void {
        this.doc.font('Helvetica');
    }

    private formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }

    private formatDate(dateString: string | Date): string {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    private formatTime(dateString: string | Date): string {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private formatCreditCard(cardNumber: string): string {
        if (!cardNumber) return '';
        const digits = cardNumber.replace(/[•\-\s]/g, '');
        const formatted = digits.match(/.{1,4}/g)?.join(' • ') || digits;
        return formatted;
    }

    async generatePDF(data: ProfileReportData, outputPath: string): Promise<void> {
        const stream = fs.createWriteStream(outputPath);
        this.doc.pipe(stream);

        // Add header with logo and company info
        this.addHeader();

        // Add profile information
        this.addProfileInfo(data);

        // Add transactions table
        this.addTransactionsTable(data.transactions);

        // Add summary
        this.addSummary(data.summary, data.client_name);

        this.doc.end();

        return new Promise<void>((resolve) => {
            stream.on('finish', resolve);
        });
    }

    private addHeader(): void {
        const headerHeight = 100;

        // Header background
        this.doc.rect(0, 0, this.doc.page.width, headerHeight)
            .fill(this.colors.primary)
            .stroke();

        // Company Name
        this.setFont();
        this.doc.fill(this.colors.white)
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('Bapa Sita Ram Enterprise', 40, 30);

        // Subtitle
        this.doc.fontSize(10)
            .font('Helvetica')
            .text('Financial Profiler Report', 40, 58);

        // Report Title
        this.doc.fontSize(16)
            .font('Helvetica-Bold')
            .text('Profile Transaction Report', 0, 35, { align: 'right', width: this.doc.page.width - 40 });

        // Generation Date
        const currentDate = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        this.doc.fontSize(9)
            .font('Helvetica')
            .fill(this.colors.gray100)
            .text(`Generated: ${currentDate}`, 0, 62, { align: 'right', width: this.doc.page.width - 40 });

        this.doc.y = headerHeight + 20;
    }

    private addProfileInfo(data: ProfileReportData): void {
        const startY = this.doc.y;
        const boxHeight = 100;

        // Info box background
        this.doc.rect(20, startY, this.pageWidth, boxHeight)
            .fill(this.colors.gray100)
            .stroke();

        // Reset to black text
        this.doc.fill(this.colors.gray900);

        // Left column
        const leftX = 35;
        let currentY = startY + 15;

        this.doc.fontSize(10)
            .font('Helvetica-Bold')
            .text('Client Name:', leftX, currentY);
        this.doc.font('Helvetica')
            .text(data.client_name, leftX + 90, currentY);

        currentY += 20;
        this.doc.font('Helvetica-Bold')
            .text('Bank:', leftX, currentY);
        this.doc.font('Helvetica')
            .text(data.bank_name, leftX + 90, currentY);

        currentY += 20;
        this.doc.font('Helvetica-Bold')
            .text('Card Number:', leftX, currentY);
        this.doc.font('Helvetica')
            .text(this.formatCreditCard(data.credit_card_number), leftX + 90, currentY);

        // Right column
        const rightX = this.doc.page.width / 2 + 20;
        currentY = startY + 15;

        this.doc.font('Helvetica-Bold')
            .text('Opening Balance:', rightX, currentY);
        this.doc.font('Helvetica')
            .fill(this.colors.green700)
            .text(this.formatCurrency(data.opening_balance).replace('₹', 'Rs. '), rightX + 110, currentY);

        currentY += 20;
        this.doc.fill(this.colors.gray900)
            .font('Helvetica-Bold')
            .text('Current Balance:', rightX, currentY);
        this.doc.font('Helvetica')
            .fill(data.current_balance >= 0 ? this.colors.green700 : this.colors.red700)
            .text(this.formatCurrency(data.current_balance).replace('₹', 'Rs. '), rightX + 110, currentY);

        this.doc.y = startY + boxHeight + 20;
    }

    private addTransactionsTable(transactions: ProfilerTransaction[]): void {
        const dynamicData = transactions.map(transaction => [
            {
                text: transaction.transaction_type.toUpperCase(),
                align: { x: "center", y: "center" },
                padding: "8",
                backgroundColor: transaction.transaction_type === 'deposit' ? '#d1fae5' : '#fee2e2'
            },
            {
                text: this.formatCurrency(transaction.amount).replace('₹', 'Rs. '),
                align: { x: "right", y: "center" },
                padding: "8"
            },
            {
                text: transaction.withdraw_charges_amount 
                    ? `${this.formatCurrency(transaction.withdraw_charges_amount).replace('₹', 'Rs. ')}\n(${transaction.withdraw_charges_percentage}%)`
                    : '-',
                align: { x: "right", y: "center" },
                padding: "8",
                textOptions: {
                    lineGap: 3,
                },
            },
            {
                text: transaction.notes || '-',
                align: { y: "center" },
                padding: "8"
            },
            {
                text: `${this.formatDate(transaction.created_at)}\n${this.formatTime(transaction.created_at)}`,
                align: { x: "center", y: "center" },
                padding: "8",
                textOptions: {
                    lineGap: 3,
                },
            }
        ] as PDFKit.Mixins.CellOptions[]);

        const tableData: PDFKit.Mixins.TableOptionsWithData = {
            rowStyles: (i) => {
                return { borderColor: this.colors.gray200 };
            },
            position: { x: 20 },
            data: [
                [
                    {
                        colSpan: 5,
                        padding: "12",
                        align: { x: "center", y: "center" },
                        backgroundColor: this.colors.gray700,
                        textColor: this.colors.white,
                        text: "Transactions"
                    }
                ],
                [
                    {
                        align: { x: "center", y: "center" },
                        padding: "8",
                        backgroundColor: this.colors.gray200,
                        text: "Type"
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "8",
                        backgroundColor: this.colors.gray200,
                        text: "Amount"
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "8",
                        backgroundColor: this.colors.gray200,
                        text: "Charges"
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "8",
                        backgroundColor: this.colors.gray200,
                        text: "Notes"
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "8",
                        backgroundColor: this.colors.gray200,
                        text: "Date & Time"
                    }
                ],
                ...dynamicData
            ],
        };

        this.doc.table(tableData);
    }

    private addSummary(summary: ProfileSummary, clientName: string): void {
        this.doc.y += 20;
        const startY = this.doc.y;
        const boxHeight = 190;

        // Summary box background
        this.doc.rect(20, startY, this.pageWidth, boxHeight)
            .fill(this.colors.gray100)
            .stroke();

        this.doc.fill(this.colors.gray900);

        const leftX = 35;
        let currentY = startY + 15;
        const valueX = this.pageWidth - 120;

        // Title
        this.doc.fontSize(13)
            .font('Helvetica-Bold')
            .text('Transaction Summary', leftX, currentY);

        currentY += 30;

        // Total Deposits
        this.doc.fontSize(10)
            .font('Helvetica')
            .fill(this.colors.gray700)
            .text(`Total Deposits (${clientName} Paid):`, leftX, currentY);
        this.doc.font('Helvetica-Bold')
            .fill(this.colors.green700)
            .text(this.formatCurrency(summary.total_deposits).replace('₹', 'Rs. '), valueX, currentY, { width: 140, align: 'right' });

        currentY += 22;

        // Total Withdrawals
        this.doc.font('Helvetica')
            .fill(this.colors.gray700)
            .text('Total Withdrawals (Company Paid):', leftX, currentY);
        this.doc.font('Helvetica-Bold')
            .fill(this.colors.red700)
            .text(this.formatCurrency(summary.total_withdrawals).replace('₹', 'Rs. '), valueX, currentY, { width: 140, align: 'right' });

        currentY += 22;

        // Withdrawal Charges
        this.doc.font('Helvetica')
            .fill(this.colors.gray700)
            .text('Withdrawal Charges (Company Earned):', leftX, currentY);
        this.doc.font('Helvetica-Bold')
            .fill(this.colors.green700)
            .text(this.formatCurrency(summary.total_charges).replace('₹', 'Rs. '), valueX, currentY, { width: 140, align: 'right' });

        currentY += 25;

        // Separator line
        this.doc.strokeColor(this.colors.gray500)
            .lineWidth(1)
            .moveTo(leftX, currentY)
            .lineTo(this.pageWidth - 15, currentY)
            .stroke();

        currentY += 15;

        // Payment Difference (Withdrawals - Deposits)
        const isDiffNegative = summary.transaction_difference < 0;

        this.doc.fontSize(11)
            .font('Helvetica')
            .fill(this.colors.gray700)
            .text('Payment Difference:', leftX, currentY);
        this.doc.font('Helvetica-Bold')
            .fill(isDiffNegative ? this.colors.green700 : this.colors.red700)
            .text(this.formatCurrency(summary.transaction_difference).replace('₹', 'Rs. '), valueX, currentY, { width: 140, align: 'right' });

        currentY += 18;

        // Explanation for transaction difference
        const diffExplanation = isDiffNegative 
            ? `(Amount Receivable from ${clientName})`
            : `(Amount Payable to ${clientName})`;
        
        this.doc.fontSize(7)
            .font('Helvetica')
            .fill(isDiffNegative ? this.colors.green700 : this.colors.red700)
            .text(diffExplanation, valueX - 40, currentY, { width: 180, align: 'right' });

        currentY += 20;

        // Separator line before Credit Uncountable
        this.doc.strokeColor(this.colors.gray500)
            .lineWidth(1)
            .moveTo(leftX, currentY)
            .lineTo(this.pageWidth - 15, currentY)
            .stroke();

        currentY += 15;

        // Credit Uncountable
        this.doc.fontSize(11)
            .font('Helvetica')
            .fill(this.colors.gray700)
            .text('Credit Uncountable:', leftX, currentY);
        this.doc.font('Helvetica-Bold')
            .fill(this.colors.gray900)
            .text(this.formatCurrency(summary.credit_uncountable).replace('₹', 'Rs. '), valueX, currentY, { width: 140, align: 'right' });

        currentY += 20;

        // Formula explanation line
        this.doc.fontSize(9)
            .font('Helvetica')
            .fill(this.colors.gray500)
            .text('Withdrawal Charges:', leftX + 20, currentY);
        this.doc.font('Helvetica')
            .fill(this.colors.gray900)
            .text('+ ' + this.formatCurrency(summary.total_charges).replace('₹', 'Rs. '), valueX, currentY, { width: 140, align: 'right' });

        currentY += 18;

        // Formula separator (equals line)
        this.doc.strokeColor(this.colors.gray500)
            .lineWidth(0.5)
            .moveTo(valueX, currentY - 3)
            .lineTo(this.pageWidth - 15, currentY - 3)
            .stroke();

        currentY += 10;

        // Net Balance with dynamic label
        const isPositive = summary.net_amount >= 0;

        this.doc.fontSize(12)
            .font('Helvetica-Bold')
            .fill(this.colors.gray900)
            .text('Net Balance:', leftX, currentY);
        
        this.doc.font('Helvetica-Bold')
            .fontSize(12)
            .fill(isPositive ? this.colors.green700 : this.colors.red700)
            .text(this.formatCurrency(summary.net_amount).replace('₹', 'Rs. '), valueX, currentY, { width: 140, align: 'right' });

        currentY += 20;

        // Explanation text
        const explanationText = isPositive 
            ? `(${clientName} Outstanding Balance)`
            : '(Company Outstanding Balance)';
        
        this.doc.fontSize(8)
            .font('Helvetica')
            .fill(isPositive ? this.colors.green700 : this.colors.red700)
            .text(explanationText, leftX, currentY, { width: this.pageWidth - 50, align: 'center' });

        this.doc.y = startY + boxHeight + 20;
    }
}

export default ProfilerTransactionReportPDF;
