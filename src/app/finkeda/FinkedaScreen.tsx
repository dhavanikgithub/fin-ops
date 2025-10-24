'use client'

import React, { useState } from 'react';
import {
    Percent,
    ArrowDownCircle,
    ArrowUpCircle,
    SlidersHorizontal,
    Calculator,
    FileText,
    RefreshCcw,
    Save,
    Eye
} from 'lucide-react';
import './FinkedaScreen.scss';

interface RecentCalculation {
    client: string;
    type: 'deposit' | 'withdraw';
    amount: number;
    fee: number;
    net: number;
    date: string;
    time: string;
}

const recentCalculations: RecentCalculation[] = [
    {
        client: 'Akash Patel',
        type: 'deposit',
        amount: 24500,
        fee: 735,
        net: 23765,
        date: 'Sep 02, 2025',
        time: '02:20 PM'
    },
    {
        client: 'Jia Lee',
        type: 'withdraw',
        amount: 8999,
        fee: 270,
        net: 8729,
        date: 'Sep 02, 2025',
        time: '09:50 AM'
    }
];

const FinkedaScreen: React.FC = () => {
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedBank, setSelectedBank] = useState('');
    const [transactionType, setTransactionType] = useState<'deposit' | 'withdraw'>('deposit');
    const [amount, setAmount] = useState(0);
    const [finkedaFee, setFinkedaFee] = useState(0);
    const [fixedCharge, setFixedCharge] = useState(0);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);

    // Calculations
    const baseAmount = amount;
    const feeAmount = (baseAmount * finkedaFee) / 100;
    const taxAmount = ((feeAmount + fixedCharge) * tax) / 100;
    const totalCharges = feeAmount + fixedCharge + taxAmount;
    const netPayable = baseAmount + totalCharges - discount;
    const payoutToClient = transactionType === 'deposit' ? baseAmount - discount : baseAmount - totalCharges;

    const handleCalculate = () => {
        // This would trigger any additional calculations or validations
        console.log('Calculating Finkeda charges...');
    };

    const handleReset = () => {
        setSelectedClient('');
        setSelectedBank('');
        setTransactionType('deposit');
        setAmount(0);
        setFinkedaFee(0);
        setFixedCharge(0);
        setTax(0);
        setDiscount(0);
    };

    const handleSaveQuote = () => {
        console.log('Saving quote...');
    };

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Finkeda Calculator</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleReset}>
                        <RefreshCcw size={16} />
                        Reset
                    </button>
                    <button className="main__button" onClick={handleSaveQuote}>
                        <Save size={16} />
                        Save Quote
                    </button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__title">
                            <Percent size={20} />
                            Configure Calculation
                        </div>
                    </div>

                    <div className="finkeda-two-col">
                        <div className="finkeda-card">
                            <div className="finkeda-card__title">Inputs</div>

                            <div className="finkeda-form-row">
                                <div className="finkeda-field">
                                    <div className="finkeda-label">Amount (₹)</div>
                                    <input
                                        className="finkeda-control"
                                        type="number"
                                        placeholder="Enter amount ₹"
                                        value={amount || ''}
                                        onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="finkeda-field">
                                    <div className="finkeda-label">GST (%)</div>
                                    <input
                                        className="finkeda-control"
                                        type="number"
                                        placeholder="Enter %"
                                        value={tax || ''}
                                        onChange={e => setTax(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                
                            </div>

                            <div className="finkeda-form-row">
                                <div className="finkeda-field">
                                    <div className="finkeda-label">Fixed Charge (%)</div>
                                    <input
                                        className="finkeda-control"
                                        type="number"
                                        placeholder="Fixed charge %"
                                        value={fixedCharge || ''}
                                        onChange={e => setFixedCharge(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="finkeda-field">
                                    <div className="finkeda-label">My Charges (%)</div>
                                    <input
                                        className="finkeda-control"
                                        type="number"
                                        placeholder="Enter %"
                                        value={finkedaFee || ''}
                                        onChange={e => setFinkedaFee(parseFloat(e.target.value) || 0)}
                                    />
                                </div>
                                
                            </div>

                            <div className="finkeda-actions">
                                <button className="main__icon-button">
                                    <SlidersHorizontal size={16} />
                                    Settings
                                </button>
                                <button className="main__button" onClick={handleCalculate}>
                                    <Calculator size={16} />
                                    Calculate
                                </button>
                            </div>
                        </div>

                        <div className="finkeda-card">
                            <div className="finkeda-card__title">Summary</div>
                            <div className="finkeda-summary">
                                <div className="finkeda-summary__row">
                                    <span>Base Amount</span>
                                    <span>₹ {baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>Finkeda Fee</span>
                                    <span>₹ {feeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>Fixed Charge</span>
                                    <span>₹ {fixedCharge.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>Tax</span>
                                    <span>₹ {taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>Discount</span>
                                    <span>- ₹ {discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="finkeda-divider"></div>
                                <div className="finkeda-summary__row finkeda-summary__row--accent">
                                    <span>Net Payable</span>
                                    <span>₹ {netPayable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>Payout To Client</span>
                                    <span>₹ {payoutToClient.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                            <div className="finkeda-summary-actions">
                                <div className="finkeda-badge">Auto-updates on Calculate</div>
                            </div>
                        </div>
                    </div>

                    <div className="finkeda-card">
                        <div className="finkeda-card__title">Recent Calculations</div>
                        <div className="finkeda-table-wrap">
                            <table className="finkeda-table">
                                <thead>
                                    <tr>
                                        <th>Client</th>
                                        <th>Amount</th>
                                        <th>Fee</th>
                                        <th>Net</th>
                                        <th>Date & Time</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentCalculations.map((calc, index) => (
                                        <tr key={index}>
                                            <td>{calc.client}</td>
                                            <td>₹ {calc.amount.toLocaleString('en-IN')}</td>
                                            <td>₹ {calc.fee.toLocaleString('en-IN')}</td>
                                            <td>₹ {calc.net.toLocaleString('en-IN')}</td>
                                            <td>
                                                {calc.date} <span className="finkeda-time">• {calc.time}</span>
                                            </td>
                                            <td>
                                                <button className="finkeda-row-actions">
                                                    <Eye size={16} />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinkedaScreen;
