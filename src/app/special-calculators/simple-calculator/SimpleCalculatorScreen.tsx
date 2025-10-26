'use client'
import React, { useState } from 'react';
import { Download, SlidersHorizontal, RefreshCcw, Save, Percent, Wallet, Play, Search } from 'lucide-react';
import './SimpleCalculatorScreen.scss';
import logger from '@/utils/logger';
import { clampPercent, clampPositive, decimalToPercentage, formatAmountAsCurrency, percentageToDecimal } from '@/utils/helperFunctions';

const savedScenarios = [
    {
        amount: 50000,
        our: 2.5,
        bank: 1.8,
        platform: 25,
        gst: 18,
    }
];

const GST = 18;



const CalculatorScreen: React.FC = () => {
    const [search, setSearch] = useState('');
    const [amount, setAmount] = useState(0);
    const [bankRatePercentage, setBankRatePercentage] = useState(0);
    const [ourRatePercentage, setOurRatePercentage] = useState(0);
    const [platformRateAmt, setPlatformRateAmt] = useState(0);



    // Example calculations (replace with real logic as needed)
    const bankRateDecimal = percentageToDecimal(bankRatePercentage);
    const ourRateDecimal = percentageToDecimal(ourRatePercentage);
    const GSTRateDecimal = percentageToDecimal(GST);

    const GSTOnBankDecimal = (bankRateDecimal * GSTRateDecimal);
    const GSTOnBankPercentage = decimalToPercentage(GSTOnBankDecimal);

    const bankRateWithGstDecimal = bankRateDecimal + GSTOnBankDecimal;
    const bankRateWithGstPercentage = decimalToPercentage(bankRateWithGstDecimal);

    const markupRateDecimal = ourRateDecimal - bankRateWithGstDecimal;
    const markupRatePercentage = decimalToPercentage(markupRateDecimal);

    const grossEarnings = amount * markupRateDecimal;
    const customerPayableAmount = amount - (amount * ourRateDecimal);
    const netProfit = grossEarnings - platformRateAmt;
    const netReceivableAmount = customerPayableAmount;



    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <Percent size={20} /> <h1>Simple Calculator</h1>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">

                    <div className="calculator-two-col">
                        <div className="panel">
                            <div className="section-title">Inputs</div>
                            <div className="inputs-grid">
                                <div className="input-field">
                                    <div className="label">Amount (₹)</div>
                                    <input
                                        className="control"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={amount}
                                        onChange={e => setAmount(clampPositive(parseFloat(e.target.value) || 0))}
                                        onFocus={e => e.target.select()}
                                        placeholder="Enter amount"
                                    />
                                </div>
                                <div className="input-field">
                                    <div className="label">Bank Charge (%)</div>
                                    <input
                                        className="control"
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        value={bankRatePercentage}
                                        onChange={e => setBankRatePercentage(clampPercent(parseFloat(e.target.value) || 0))}
                                        onFocus={e => e.target.select()}
                                        placeholder="0 - 100"
                                    />
                                </div>
                                <div className="input-field">
                                    <div className="label">Our Charge (%)</div>
                                    <input
                                        className="control"
                                        type="number"
                                        min={0}
                                        max={100}
                                        step="0.01"
                                        value={ourRatePercentage}
                                        onChange={e => setOurRatePercentage(clampPercent(parseFloat(e.target.value) || 0))}
                                        onFocus={e => e.target.select()}
                                        placeholder="0 - 100"
                                    />
                                </div>
                                <div className="input-field">
                                    <div className="label">Platform Charge (₹)</div>
                                    <input
                                        className="control"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={platformRateAmt}
                                        onChange={e => setPlatformRateAmt(clampPositive(parseFloat(e.target.value) || 0))}
                                        onFocus={e => e.target.select()}
                                        placeholder="Enter platform charge"
                                    />
                                </div>
                            </div>
                            <div className="inline">
                                <div className="pill">GST: {GST}% (fixed)</div>
                                <button className="main__icon-button" type="button">
                                    <RefreshCcw size={16} />
                                    Recalculate
                                </button>
                                <button className="main__button" type="button">
                                    <Save size={16} />
                                    Save Scenario
                                </button>
                            </div>
                        </div>

                        <div className="panel">
                            <div className="section-title">Results</div>
                            <div className="summary">
                                <div className="line"><span>Total Amount</span><span>{formatAmountAsCurrency(amount)}</span></div>
                                <div className="line"><span>Payable Amount</span><span>{formatAmountAsCurrency(customerPayableAmount)}</span></div>
                                <div className="line" style={{ fontWeight: 600 }}><span>Profit</span><span>{formatAmountAsCurrency(netProfit)}</span></div>
                            </div>
                            <div className="breakdown">
                                <div className="line"><span>Bank Rate</span><span>{bankRatePercentage.toFixed(2)}%</span></div>
                                <div className="line"><span>GST on Bank</span><span>{GSTOnBankPercentage.toFixed(2)}% (of amount)</span></div>
                                <div className="line"><span>Total Bank w/ GST</span><span>{bankRateWithGstPercentage.toFixed(2)}%</span></div>
                                <div className="line"><span>Our Charge</span><span>{ourRatePercentage.toFixed(2)}%</span></div>
                                <div className="line"><span>Markup (Our − Bank w/ GST)</span><span>{markupRatePercentage.toFixed(2)}%</span></div>
                                <div className="line"><span>Earned (amount × markup)</span><span>{formatAmountAsCurrency(grossEarnings)}</span></div>
                                <div className="line"><span>Platform Charge</span><span>{formatAmountAsCurrency(platformRateAmt)}</span></div>
                                <div className="line" style={{ fontWeight: 600 }}><span>Profit</span><span>{formatAmountAsCurrency(netProfit)}</span></div>
                                <div className="note">Payable = Amount − (Amount × Our Charge)</div>
                            </div>
                            <div className="total">
                                <div>Net Receivable</div>
                                <div>{formatAmountAsCurrency(netReceivableAmount)}</div>
                            </div>
                            <div className="badges">
                                <div className="badge">
                                    <Percent size={14} style={{ marginRight: 4 }} />
                                    Bank + GST: {bankRateWithGstPercentage.toFixed(2)}%
                                </div>
                                <div className="badge">
                                    <Wallet size={14} style={{ marginRight: 4 }} />
                                    Platform: {formatAmountAsCurrency(platformRateAmt)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="panel">
                        <div className="section-title">Saved Scenarios</div>
                        <div className="calculator-grid-3">
                            {savedScenarios.map((s, i) => (
                                <div className="panel" key={i}>
                                    <div className="line" style={{ fontWeight: 600 }}>
                                        {formatAmountAsCurrency(s.amount)} • Our {s.our}% • Bank {s.bank}%
                                    </div>
                                    <div className="line"><span>Platform</span><span>{formatAmountAsCurrency(s.platform)}</span></div>
                                    <div className="inline" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                                        <div className="pill">GST {s.gst}%</div>
                                        <button className="main__icon-button" type="button">
                                            <Play size={16} />
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CalculatorScreen;