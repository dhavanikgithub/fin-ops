import PDFDocument from 'pdfkit'; // This extends PDFDocument with table method
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

interface ClientData {
    data: Transaction[];
    total: ClientTotal;
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
            gray100: '#f3f4f6',
            gray200: '#e5e7eb',
            gray500: '#6b7280',
            gray700: '#374151',
            gray900: '#111827',
            red500: '#ef4444',
            red700: '#b91c1c',
            red900: '#7f1d1d',
            green500: '#10b981',
            green700: '#047857',
            green900: '#064e3b',
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
        const dateRangeText = startDate === "All" ? "" : `${startDate} to ${endDate}`
        const headerHeight = dateRangeText === "" ? 60 : 80;

        // Header background
        this.doc.rect(0, 0, this.doc.page.width, headerHeight)
            .fill('#e5e7eb')
            .stroke();

        // Title
        this.setFont();
        this.doc.fill(this.colors.gray700)
            .fontSize(20)
            .font('Helvetica-Bold')
            .text('Transaction Report', 0, 25, { align: 'center' });

        // Date range
        this.doc.fontSize(12)
            .font('Helvetica')
            .fill(this.colors.gray500)
            .text(dateRangeText, 0, 50, { align: 'center' });

        this.doc.y = headerHeight + 10;
    }

    private addClientTable(clientName: string, clientData: ClientData): void {
        const tableWidth = this.pageWidth * 0.9;
        const tableStartX = (this.doc.page.width - tableWidth) / 2;

        // Check if we need a new page
        // if (this.doc.y + (clientData.data.length + 3) * 35 > this.doc.page.height - 50) {
        //   this.doc.addPage(); // Standard PDFKit method
        // }
        const dynamicData = clientData.data.map(transaction => [
            {
                text: transaction.is_widthdraw_transaction ? "WITHDRAW" : "DEPOSIT",
                align: { y: "center" },
                padding: "5"
            },
            {
                text: transaction.transaction_amount,
                align: { y: "center" },
                padding: "5"
            },
            {
                text: `${transaction.widthdraw_charges}\n${transaction.widthdraw_charges_pr}`,
                align: { y: "center" },
                padding: "5",
                textOptions: {
                    lineGap: 5,
                },
            },
            {
                text: transaction.bank_name,
                align: { y: "center" },
                padding: "5"
            },
            {
                text: transaction.card_name,
                align: { y: "center" },
                padding: "5"
            },
            {
                text: `${transaction.date}\n${transaction.time}`,
                align: { y: "center" },
                padding: "5",
                textOptions: {
                    lineGap: 5,
                },
            }
        ] as PDFKit.Mixins.CellOptions[])


        // Prepare table data for pdfkit-table
        const tableData: PDFKit.Mixins.TableOptionsWithData = {
            rowStyles: (i) => {
                return { borderColor: "#E3E5E9" };
            },
            position: { x: 15 },
            data: [
                [
                    {
                        colSpan: 6,
                        padding: "10",
                        align: { x: "center", y: "center" },
                        text: clientName
                    }
                ],
                [
                    {
                        align: { x: "center", y: "center" },
                        padding: "5",
                        backgroundColor: "#ECEDF0",
                        text: "Transaction Type",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "5",
                        backgroundColor: "#ECEDF0",
                        text: "Amount",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "5",
                        backgroundColor: "#ECEDF0",
                        text: "Withdraw charge",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "5",
                        backgroundColor: "#ECEDF0",
                        text: "Bank",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "5",
                        backgroundColor: "#ECEDF0",
                        text: "Card",
                    },
                    {
                        align: { x: "center", y: "center" },
                        padding: "5",
                        backgroundColor: "#ECEDF0",
                        text: "Date & Time",
                    }
                ],
                ...dynamicData,
                [
                    {
                        colSpan: 4,
                        border: [true, false, true, true],
                        backgroundColor: "#ECEDF0",
                    },
                    {
                        colSpan: 2,
                        border: [true, true, true, false],
                        align: { y: "center" },
                        backgroundColor: "#ECEDF0",
                        padding: "10",
                        textOptions: {
                            lineGap: 5,
                        },
                        text: `${clientData.total.widthdraw_charges} (Fee)\n${clientData.total.transaction_amount} (Credit)\nTotal: ${clientData.total.final_amount}`,
                    }
                ],
            ],
        };

        this.doc.y = this.doc.y + 10
        // Create table using the table method from pdfkit-table
        this.doc.table(tableData);
    }
}

export default TransactionReportPDF;