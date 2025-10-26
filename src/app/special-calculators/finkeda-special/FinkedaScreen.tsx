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
import Finkeda from '@/components/Icons/Finkeda';
import logger from '@/utils/logger';
import { formatAmountAsCurrency } from '@/utils/helperFunctions';
import { Check } from 'lucide-react';
import finkedaSettingsService, { FinkedaSettings, UpdateFinkedaSettingsRequest } from '@/services/finkedaSettingsService';

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
    }
];
const GST = 18;

const CARD_TYPES = {
    RUPAY: 'Rupay',
    MASTER: 'Master'
} as const;

type CardType = typeof CARD_TYPES[keyof typeof CARD_TYPES];

interface FinkedaScreenProps {
    initialSettings: FinkedaSettings | null;
}

const FinkedaScreen: React.FC<FinkedaScreenProps> = ({ initialSettings }) => {
    const [amount, setAmount] = useState(0);
    const [ourRatePercentage, setOurRatePercentage] = useState(0);
    const [bankRatePercentage, setBankRatePercentage] = useState(0);
    const [selectedCardType, setSelectedCardType] = useState<CardType>(CARD_TYPES.RUPAY);
    
    // Settings state
    const [settings, setSettings] = useState<FinkedaSettings | null>(initialSettings);
    const [rupayChargeAmount, setRupayChargeAmount] = useState<number>(initialSettings?.rupay_card_charge_amount || 0);
    const [masterChargeAmount, setMasterChargeAmount] = useState<number>(initialSettings?.master_card_charge_amount || 0);
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

    // Update local state when initialSettings changes
    React.useEffect(() => {
        if (initialSettings) {
            setSettings(initialSettings);
            setRupayChargeAmount(parseFloat(initialSettings.rupay_card_charge_amount.toString()));
            setMasterChargeAmount(parseFloat(initialSettings.master_card_charge_amount.toString()));
        }
    }, [initialSettings]);

    // Calculations - use card-specific charges from settings
    const baseAmount = amount;
    const cardChargeAmount = selectedCardType === CARD_TYPES.RUPAY ? rupayChargeAmount : masterChargeAmount;
    const feeAmount = (baseAmount * ourRatePercentage) / 100;
    const cardSpecificCharge = (baseAmount * cardChargeAmount) / 100;
    const taxAmount = ((feeAmount + bankRatePercentage + cardSpecificCharge) * GST) / 100;
    const totalCharges = feeAmount + bankRatePercentage + cardSpecificCharge + taxAmount;
    const netPayable = baseAmount + totalCharges;
    const payoutToClient = baseAmount - totalCharges;

    const handleCalculate = () => {
        // This would trigger any additional calculations or validations
        logger.log('Calculating Finkeda charges...');
    };

    const handleReset = () => {
        setAmount(0);
        setOurRatePercentage(0);
        setBankRatePercentage(0);
        setSelectedCardType(CARD_TYPES.RUPAY);
    };

    const handleCardTypeToggle = (cardType: CardType) => {
        setSelectedCardType(cardType);
        logger.log('Card type changed to:', cardType);
    };

    // Update settings API call
    const handleUpdateSettings = async () => {
        if (!rupayChargeAmount || !masterChargeAmount) {
            alert('Please enter valid charge amounts for both card types');
            return;
        }

        setIsUpdatingSettings(true);
        try {
            const updateRequest: UpdateFinkedaSettingsRequest = {
                rupay_card_charge_amount: rupayChargeAmount,
                master_card_charge_amount: masterChargeAmount
            };

            const updatedSettings = await finkedaSettingsService.updateSettings(updateRequest);
            setSettings(updatedSettings);
            
            logger.log('Settings updated successfully:', updatedSettings);
            alert('Settings updated successfully!');
        } catch (error) {
            logger.error('Failed to update settings:', error);
            alert('Failed to update settings. Please try again.');
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    const handleSaveQuote = () => {
        logger.log('Saving quote...');
    };

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <Finkeda size={20} /> <h1>Finkeda Calculator</h1>
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
                                        value={amount}
                                        onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                                <div className="finkeda-field">
                                    <div className="finkeda-label">Bank Charge (%)</div>
                                    <input
                                        className="finkeda-control"
                                        type="number"
                                        placeholder="Bank charge %"
                                        value={bankRatePercentage}
                                        onChange={e => setBankRatePercentage(parseFloat(e.target.value) || 0)}
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                            </div>

                            <div className="finkeda-form-row">
                                <div className="finkeda-field">
                                    <div className="finkeda-label">My Charges (%)</div>
                                    <input
                                        className="finkeda-control"
                                        type="number"
                                        placeholder="Enter %"
                                        value={ourRatePercentage}
                                        onChange={e => setOurRatePercentage(parseFloat(e.target.value) || 0)}
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                                <div className="finkeda-field">
                                    <div className="finkeda-label">Card Type</div>
                                    <div className="finkeda-pills">
                                        <label className="finkeda-pill-checkbox">
                                            <input
                                                type="radio"
                                                name="cardType"
                                                checked={selectedCardType === CARD_TYPES.RUPAY}
                                                onChange={() => handleCardTypeToggle(CARD_TYPES.RUPAY)}
                                            />
                                            <span className="finkeda-custom-radio">
                                                {selectedCardType === CARD_TYPES.RUPAY && <Check size={14} />}
                                            </span>
                                            <span>Rupay ({rupayChargeAmount}%)</span>
                                        </label>
                                        <label className="finkeda-pill-checkbox">
                                            <input
                                                type="radio"
                                                name="cardType"
                                                checked={selectedCardType === CARD_TYPES.MASTER}
                                                onChange={() => handleCardTypeToggle(CARD_TYPES.MASTER)}
                                            />
                                            <span className="finkeda-custom-radio">
                                                {selectedCardType === CARD_TYPES.MASTER && <Check size={14} />}
                                            </span>
                                            <span>Master ({masterChargeAmount}%)</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="finkeda-actions">
                                <div className="pill">GST: {GST}% (fixed)</div>
                                <button className="main__icon-button">
                                    <SlidersHorizontal size={16} />
                                    Settings
                                </button>
                                <button className="main__button" onClick={handleCalculate}>
                                    <Calculator size={16} />
                                    Calculate
                                </button>
                            </div>

                            <div className="finkeda-form-row">
                                <div className="finkeda-field">
                                    <div className="finkeda-label">Rupay Charge (%)</div>
                                    <input
                                        className="finkeda-control"
                                        type="number"
                                        step="0.01"
                                        placeholder="Rupay charge %"
                                        value={rupayChargeAmount}
                                        onChange={e => setRupayChargeAmount(parseFloat(e.target.value) || 0)}
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                                <div className="finkeda-field">
                                    <div className="finkeda-label">Master Charge (%)</div>
                                    <input
                                        className="finkeda-control"
                                        type="number"
                                        step="0.01"
                                        placeholder="Master charge %"
                                        value={masterChargeAmount}
                                        onChange={e => setMasterChargeAmount(parseFloat(e.target.value) || 0)}
                                        onFocus={e => e.target.select()}
                                    />
                                </div>
                            </div>

                            <div className="finkeda-actions">
                                <button 
                                    className="main__button" 
                                    onClick={handleUpdateSettings}
                                    disabled={isUpdatingSettings}
                                >
                                    <Save size={16} />
                                    {isUpdatingSettings ? 'Updating...' : 'Update Settings'}
                                </button>
                            </div>
                        </div>
                        <div className="finkeda-card">
                            <div className="finkeda-card__title">Summary</div>
                            <div className="finkeda-summary">
                                <div className="finkeda-summary__row">
                                    <span>Base Amount</span>
                                    <span>{formatAmountAsCurrency(baseAmount)}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>Finkeda Fee</span>
                                    <span>{formatAmountAsCurrency(feeAmount)}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>{selectedCardType} Card Charge ({cardChargeAmount}%)</span>
                                    <span>{formatAmountAsCurrency(cardSpecificCharge)}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>Fixed Charge</span>
                                    <span>{formatAmountAsCurrency(bankRatePercentage)}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>Tax</span>
                                    <span>{formatAmountAsCurrency(taxAmount)}</span>
                                </div>
                                <div className="finkeda-divider"></div>
                                <div className="finkeda-summary__row finkeda-summary__row--accent">
                                    <span>Net Payable</span>
                                    <span>{formatAmountAsCurrency(netPayable)}</span>
                                </div>
                                <div className="finkeda-summary__row">
                                    <span>Payout To Client</span>
                                    <span>{formatAmountAsCurrency(payoutToClient)}</span>
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
                                            <td>{formatAmountAsCurrency(calc.amount)}</td>
                                            <td>{formatAmountAsCurrency(calc.fee)}</td>
                                            <td>{formatAmountAsCurrency(calc.net)}</td>
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
