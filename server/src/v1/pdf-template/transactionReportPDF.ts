import PDFDocument from 'pdfkit';
import * as fs from 'fs';

// Type definitions
interface Transaction {
    is_widthdraw_transaction: boolean;
    transaction_amount: string;
    widthdraw_charges: string;
    widthdraw_charges_pr: string;
    bank_name: string;
    card_name: string;
    date: string;
    time: string;
}

interface ClientTotal {
    widthdraw_charges: string;
    transaction_amount: string;
    final_amount: string;
}

interface ClientInfo {
    name: string;
    email?: string | null;
    contact?: string | null;
    address?: string | null;
}

interface ClientData {
    data: Transaction[];
    total: ClientTotal;
    clientInfo?: ClientInfo;
}

interface ReportData {
    startDate: string;
    endDate: string;
    isClientSpecific: boolean;
    groupedData: Record<string, ClientData>;
}

interface Colors {
    gray100: string;
    gray200: string;
    gray500: string;
    gray700: string;
    gray900: string;
    red500: string;
    red700: string;
    red900: string;
    green500: string;
    green700: string;
    green900: string;
    white: string;
}

class TransactionReportPDF {
    private doc: PDFKit.PDFDocument;
    private pageWidth: number;
    private colors: Colors;

    constructor() {
        // Create PDFDocument and cast to extended type
        this.doc = new PDFDocument({ margin: 20, size: 'A4' });
        this.pageWidth = this.doc.page.width - 40; // Account for margins

        this.colors = {
            gray100: '#f8fafc',
            gray200: '#e2e8f0',
            gray500: '#64748b',
            gray700: '#334155',
            gray900: '#0f172a',
            red500: '#ef4444',
            red700: '#dc2626',
            red900: '#991b1b',
            green500: '#22c55e',
            green700: '#16a34a',
            green900: '#15803d',
            white: '#ffffff'
        };
    }

    private setFont(): void {
        this.doc.font('Helvetica');
    }

    async generatePDF(data: ReportData, outputPath: string): Promise<void> {
        const stream = fs.createWriteStream(outputPath);
        this.doc.pipe(stream);

        // Add header
        this.addHeader(data.startDate, data.endDate);
        const entries = Object.entries(data.groupedData);
        let index = 0;
        // Add content for each client
        for (const [clientName, clientData] of entries) {
            this.addClientTable(clientName, clientData);
            if (index++ !== entries.length - 1) {
                this.doc.addPage();
            }
        }

        this.doc.end();

        return new Promise<void>((resolve) => {
            stream.on('finish', resolve);
        });
    }

    private addHeader(startDate: string, endDate: string): void {
        const headerHeight = 120;

        // Modern gradient-like header background
        this.doc.rect(0, 0, this.doc.page.width, headerHeight)
            .fill('#1e293b')
            .stroke();

        // Accent bar
        this.doc.rect(0, headerHeight - 6, this.doc.page.width, 6)
            .fill('#3b82f6')
            .stroke();

        // Company Name
        this.setFont();
        this.doc.fill(this.colors.white)
            .fontSize(26)
            .font('Helvetica-Bold')
            .text('Bapa Sita Ram Enterprise', 40, 25);

        // Subtitle
        this.doc.fontSize(11)
            .font('Helvetica')
            .fill('#94a3b8')
            .text('Financial Transaction Report', 40, 58);

        // Date range on right
        if (startDate !== "All") {
            this.doc.fontSize(10)
                .font('Helvetica-Bold')
                .fill(this.colors.white)
                .text('Report Period', 0, 30, { align: 'right', width: this.doc.page.width - 40 });
            
            this.doc.fontSize(11)
                .font('Helvetica')
                .fill('#94a3b8')
                .text(`${startDate} to ${endDate}`, 0, 48, { align: 'right', width: this.doc.page.width - 40 });
        }

        // Generation date
        const currentDate = new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        this.doc.fontSize(8)
            .font('Helvetica')
            .fill('#64748b')
            .text(`Generated on: ${currentDate}`, 0, 85, { align: 'right', width: this.doc.page.width - 40 });

        this.doc.y = headerHeight + 25;
    }

    private addClientTable(clientName: string, clientData: ClientData): void {
        // Add client info section if available
        if (clientData.clientInfo) {
            this.addClientInfoSection(clientData.clientInfo);
        }

        const dynamicData = clientData.data.map(transaction => [
            {
                text: transaction.is_widthdraw_transaction ? "WITHDRAW" : "DEPOSIT",
                align: { x: "center", y: "center" },
                padding: "8",
                backgroundColor: transaction.is_widthdraw_transaction ? '#fee2e2' : '#dcfce7'
            },
            {
                text: transaction.transaction_amount,
                align: { x: "right", y: "center" },
                padding: "8"
            },
            {
                text: `${transaction.widthdraw_charges}\n${transaction.widthdraw_charges_pr}`,
                align: { x: "right", y: "center" },
                padding: "8",
                textOptions: {
                    lineGap: 3,
                },
            },
            {
                text: transaction.bank_name,
                align: { y: "center" },
                padding: "8"
            },
            {
                text: transaction.card_name,
                align: { y: "center" },
                padding: "8"
            },
            {
                text: `${transaction.date}\n${transaction.time}`,
                align: { x: "center", y: "center" },
                padding: "8",
                textOptions: {
                    lineGap: 3,
                },
            }
        ] as PDFKit.Mixins.CellOptions[])


        // Prepare table data with modern styling
        const tableData: PDFKit.Mixins.TableOptionsWithData = {
            rowStyles: (i) => {
                return { borderColor: this.colors.gray200 };
            },
            position: { x: 20 },
            data: [
                [
                    {
                        colSpan: 6,
                        padding: "12",
                        align: { x: "center", y: "center" },
                        backgroundColor: this.colors.gray700,
                        textColor: this.colors.white,
                        text: `Transactions for ${clientName}`
                    }
                ],
                [
                    {
                        align: { x: "center", y: "center" },
                        padding: "10",
                        backgroundColor: this.colors.gray100,
                        text: "Type",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "10",
                        backgroundColor: this.colors.gray100,
                        text: "Amount (Rs.)",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "10",
                        backgroundColor: this.colors.gray100,
                        text: "Charges",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "10",
                        backgroundColor: this.colors.gray100,
                        text: "Bank",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "10",
                        backgroundColor: this.colors.gray100,
                        text: "Card",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "10",
                        backgroundColor: this.colors.gray100,
                        text: "Date & Time",
                    }
                ],
                ...dynamicData,
                [
                    {
                        colSpan: 4,
                        border: [true, false, true, true],
                        backgroundColor: this.colors.gray100,
                    },
                    {
                        colSpan: 2,
                        border: [true, true, true, false],
                        align: { x: "right", y: "center" },
                        backgroundColor: this.colors.gray100,
                        padding: "12",
                        textOptions: {
                            lineGap: 4,
                        },
                        text: `Charges: ${clientData.total.widthdraw_charges}\nCredit: ${clientData.total.transaction_amount}\nNet Total: ${clientData.total.final_amount}`,
                    }
                ],
            ],
        };

        this.doc.y = this.doc.y + 10;
        this.doc.table(tableData);
    }

    private addClientInfoSection(clientInfo: ClientInfo): void {
        const startY = this.doc.y;
        const sectionHeight = 85;

        // Info box with modern styling
        this.doc.rect(20, startY, this.pageWidth, sectionHeight)
            .fill(this.colors.gray100)
            .stroke();

        this.doc.fill(this.colors.gray900);

        // Section title
        this.doc.fontSize(12)
            .font('Helvetica-Bold')
            .text('Client Information', 35, startY + 15);

        // Client details
        const leftX = 35;
        let currentY = startY + 35;

        // Client Name
        this.doc.fontSize(10)
            .font('Helvetica-Bold')
            .fill(this.colors.gray700)
            .text('Name:', leftX, currentY);
        this.doc.font('Helvetica')
            .fill(this.colors.gray900)
            .text(clientInfo.name, leftX + 80, currentY);

        currentY += 18;

        // Email
        if (clientInfo.email) {
            this.doc.font('Helvetica-Bold')
                .fill(this.colors.gray700)
                .text('Email:', leftX, currentY);
            this.doc.font('Helvetica')
                .fill(this.colors.gray900)
                .text(clientInfo.email, leftX + 80, currentY);
            currentY += 18;
        }

        // Contact
        if (clientInfo.contact) {
            this.doc.font('Helvetica-Bold')
                .fill(this.colors.gray700)
                .text('Contact:', leftX, currentY);
            this.doc.font('Helvetica')
                .fill(this.colors.gray900)
                .text(clientInfo.contact, leftX + 80, currentY);
        }

        this.doc.y = startY + sectionHeight + 20;
    }
}

export default TransactionReportPDF;