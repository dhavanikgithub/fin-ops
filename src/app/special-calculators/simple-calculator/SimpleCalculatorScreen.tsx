'use client'
import React, { useState } from 'react';
import { Download, SlidersHorizontal, RefreshCcw, Save, Percent, Wallet, Play, Search } from 'lucide-react';
import './SimpleCalculatorScreen.scss';

const savedScenarios = [
    {
        amount: 50000,
        our: 2.5,
        bank: 1.8,
        platform: 25,
        gst: 18,
    },
    {
        amount: 15000,
        our: 2.0,
        bank: 1.5,
        platform: 10,
        gst: 18,
    },
    {
        amount: 8000,
        our: 2.2,
        bank: 1.6,
        platform: 15,
        gst: 18,
    },
];

const GST = 18;

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));
const clampPositive = (value: number) => Math.max(0, value);

const CalculatorScreen: React.FC = () => {
    const [search, setSearch] = useState('');
    const [amount, setAmount] = useState(50000);
    const [bankCharge, setBankCharge] = useState(1.8);
    const [ourCharge, setOurCharge] = useState(2.2);
    const [platformCharge, setPlatformCharge] = useState(25);

    // Example calculations (replace with real logic as needed)
    const bankRate = bankCharge / 100;    
    const myRate = ourCharge / 100;
    const totalBankWithGst = bankRate + (bankRate * (GST / 100));
    const markup = myRate - totalBankWithGst;
    const earned = amount * markup;
    console.log("Earn: ",earned)
    const payable = amount - (amount * myRate);
    const profit = earned - platformCharge;
    console.log("Profit: ",profit)
    const netReceivable = payable;

    

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <Percent size={20} /> <h1>Simple Calculator</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__search-row">
                            <span className="main__search-icon">
                                <Search size={16} />
                            </span>
                            <input
                                type="text"
                                className="main__input"
                                placeholder="Search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ minWidth: 320 }}
                            />
                        </div>
                        <div className="main__actions">
                            <button className="main__icon-button">
                                <SlidersHorizontal size={16} />
                                Presets
                            </button>
                        </div>
                    </div>

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
                                        value={bankCharge}
                                        onChange={e => setBankCharge(clampPercent(parseFloat(e.target.value) || 0))}
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
                                        value={ourCharge}
                                        onChange={e => setOurCharge(clampPercent(parseFloat(e.target.value) || 0))}
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
                                        value={platformCharge}
                                        onChange={e => setPlatformCharge(clampPositive(parseFloat(e.target.value) || 0))}
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
                                <div className="line"><span>Total Amount</span><span>₹ {amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                                <div className="line"><span>Payable Amount</span><span>₹ {payable.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                                <div className="line" style={{ fontWeight: 600 }}><span>Profit</span><span>₹ {profit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                            </div>
                            <div className="breakdown">
                                <div className="line"><span>Bank Rate</span><span>{bankCharge.toFixed(2)}%</span></div>
                                <div className="line"><span>GST on Bank</span><span>{(bankCharge * GST / 100).toFixed(2)}% (of amount)</span></div>
                                <div className="line"><span>Total Bank w/ GST</span><span>{totalBankWithGst.toFixed(2)}%</span></div>
                                <div className="line"><span>Our Charge</span><span>{ourCharge.toFixed(2)}%</span></div>
                                <div className="line"><span>Markup (Our − Bank w/ GST)</span><span>{markup.toFixed(2)}%</span></div>
                                <div className="line"><span>Earned (amount × markup)</span><span>₹ {earned.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                                <div className="line"><span>Platform Charge</span><span>₹ {platformCharge.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                                <div className="line" style={{ fontWeight: 600 }}><span>Profit</span><span>₹ {profit.toLocaleString(undefined, {minimumFractionDigits: 2})}</span></div>
                                <div className="note">Payable = Amount − (Amount × Our Charge)</div>
                            </div>
                            <div className="total">
                                <div>Net Receivable</div>
                                <div>₹ {netReceivable.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                            </div>
                            <div className="badges">
                                <div className="badge">
                                    <Percent size={14} style={{ marginRight: 4 }} />
                                    Bank + GST: {totalBankWithGst.toFixed(2)}%
                                </div>
                                <div className="badge">
                                    <Wallet size={14} style={{ marginRight: 4 }} />
                                    Platform: ₹ {platformCharge}
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
                                        ₹ {s.amount.toLocaleString()} • Our {s.our}% • Bank {s.bank}%
                                    </div>
                                    <div className="line"><span>Platform</span><span>₹ {s.platform}</span></div>
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