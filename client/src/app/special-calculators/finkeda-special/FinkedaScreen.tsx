'use client'

import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import {
    RefreshCcw,
    Save,
    Play,
    RotateCcw,
    Settings,
    Eye,
    EyeOff,
    AlertTriangle,
    Home,
    Calculator
} from 'lucide-react';
import './FinkedaScreen.scss';
import Finkeda from '@/components/Icons/Finkeda';
import logger from '@/utils/logger';
import { formatAmountAsCurrency, percentageToDecimal } from '@/utils/helperFunctions';
import { Check } from 'lucide-react';
import finkedaSettingsService, { FinkedaSettings, UpdateFinkedaSettingsRequest } from '@/services/finkedaSettingsService';
import toast from 'react-hot-toast';

const CARD_TYPES = {
    RUPAY: 'Rupay',
    MASTER: 'Master'
} as const;

interface RecentCalculation {
    id: string;
    amount: number;
    cardType: CardType;
    ourRatePercentage: number;
    bankRatePercentage: number;
    platformRatePercentage: number;
    savedAt: string;
}

const STORAGE_KEY = 'finkeda_saved_scenarios';
const GST = 18;

type CardType = typeof CARD_TYPES[keyof typeof CARD_TYPES];

interface FinkedaScreenProps {
    initialSettings: FinkedaSettings | null;
}

// Error Fallback Component for Finkeda Screen
const FinkedaScreenErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="fs__error-boundary">
                        <div className="fs__error-boundary-content">
                            <AlertTriangle size={64} className="fs__error-boundary-icon" />
                            <h2 className="fs__error-boundary-title">Something went wrong</h2>
                            <p className="fs__error-boundary-message">
                                We encountered an unexpected error in the Finkeda calculator. 
                                Don't worry, your saved scenarios are safe. You can try again or go back to the main dashboard.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="fs__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="fs__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="fs__error-boundary-actions">
                                <button 
                                    className="main__button"
                                    onClick={resetErrorBoundary}
                                >
                                    <RotateCcw size={16} />
                                    Try Again
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={() => window.location.href = '/special-calculators/finkeda-special'}
                                >
                                    <Calculator size={16} />
                                    Reload Calculator
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={() => window.location.href = '/'}
                                >
                                    <Home size={16} />
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinkedaScreenContent: React.FC<FinkedaScreenProps> = ({ initialSettings }) => {
    const [amount, setAmount] = useState(0);
    const [ourRatePercentage, setOurRatePercentage] = useState(0);
    const [bankRatePercentage, setBankRatePercentage] = useState(0);
    const [selectedCardType, setSelectedCardType] = useState<CardType>(CARD_TYPES.RUPAY);

    // Settings state
    const [settings, setSettings] = useState<FinkedaSettings | null>(initialSettings);
    const [rupayChargeAmount, setRupayChargeAmount] = useState<number>(initialSettings?.rupay_card_charge_amount || 0);
    const [masterChargeAmount, setMasterChargeAmount] = useState<number>(initialSettings?.master_card_charge_amount || 0);
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

    // Saved scenarios state
    const [savedScenarios, setSavedScenarios] = useState<RecentCalculation[]>([]);

    // Settings visibility state
    const [showSettings, setShowSettings] = useState(false);

    // Load saved scenarios from localStorage on component mount
    React.useEffect(() => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEY);
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    setSavedScenarios(parsedData);
                    logger.debug('Loaded saved scenarios from localStorage', { count: parsedData.length });
                } catch (parseError) {
                    logger.error('Error parsing saved scenarios:', parseError);
                    toast.error('Error loading saved scenarios. Resetting to empty.');
                    setSavedScenarios([]);
                }
            }
        } catch (error) {
            logger.error('Error accessing localStorage:', error);
            throw error;
        }
    }, []);

    // Update local state when initialSettings changes
    React.useEffect(() => {
        try {
            if (initialSettings) {
                setSettings(initialSettings);
                setRupayChargeAmount(parseFloat(initialSettings.rupay_card_charge_amount.toString()));
                setMasterChargeAmount(parseFloat(initialSettings.master_card_charge_amount.toString()));
                logger.debug('Updated settings from initial settings', initialSettings);
            }
        } catch (error) {
            logger.error('Error updating settings from initial settings:', error);
            throw error;
        }
    }, [initialSettings]);



    // Calculations - use card-specific charges from settings
    const bankRateDecimal = percentageToDecimal(bankRatePercentage);
    const ourRateDecimal = percentageToDecimal(ourRatePercentage);
    const platformRatePercentage = selectedCardType === CARD_TYPES.RUPAY ? rupayChargeAmount : masterChargeAmount;
    const platformRateDecimal = percentageToDecimal(platformRatePercentage);

    const markupRateDecimal = ourRateDecimal - bankRateDecimal;
    const earned = amount * markupRateDecimal;

    const platformAmount = amount * platformRateDecimal;
    const payable = amount * (1 - markupRateDecimal);
    const profit = earned - platformAmount;
    const portalAmount = amount - platformAmount;

    // Helper function to save scenarios to localStorage
    const saveToLocalStorage = (scenarios: RecentCalculation[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
            logger.debug('Scenarios saved to localStorage', { count: scenarios.length });
        } catch (error) {
            logger.error('Error saving scenarios to localStorage:', error);
            toast.error('Failed to save scenarios.');
            throw error;
        }
    };

    // Check if scenario already exists (to prevent duplicates)
    const isDuplicateScenario = (newScenario: Omit<RecentCalculation, 'id' | 'savedAt'>) => {
        try {
            return savedScenarios.some(scenario => 
                scenario.amount === newScenario.amount &&
                scenario.cardType === newScenario.cardType &&
                scenario.ourRatePercentage === newScenario.ourRatePercentage &&
                scenario.bankRatePercentage === newScenario.bankRatePercentage &&
                scenario.platformRatePercentage === newScenario.platformRatePercentage
            );
        } catch (error) {
            logger.error('Error checking for duplicate scenario:', error);
            throw error;
        }
    };

    // Save current scenario
    const handleSaveScenario = () => {
        try {
            if (!amount || !ourRatePercentage) {
                logger.warn('Cannot save scenario: Amount and Our Rate are required');
                toast.error('Amount and Our Rate are required to save scenario');
                return;
            }

            const newScenario: Omit<RecentCalculation, 'id' | 'savedAt'> = {
                amount,
                cardType: selectedCardType,
                ourRatePercentage,
                bankRatePercentage,
                platformRatePercentage
            };

            if (isDuplicateScenario(newScenario)) {
                logger.warn('Scenario already exists, skipping duplicate');
                toast.error('This scenario has already been saved');
                return;
            }

            const scenarioWithMetadata: RecentCalculation = {
                ...newScenario,
                id: Date.now().toString(),
                savedAt: new Date().toLocaleString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).replace(',', ' •')
            };

            const updatedScenarios = [scenarioWithMetadata, ...savedScenarios].slice(0, 10); // Keep only 10 most recent
            setSavedScenarios(updatedScenarios);
            saveToLocalStorage(updatedScenarios);
            
            toast.success('Scenario saved successfully!');
            logger.log('Scenario saved successfully:', scenarioWithMetadata);
        } catch (error) {
            logger.error('Error saving scenario:', error);
            toast.error('Failed to save scenario');
            throw error;
        }
    };

    // Apply saved scenario
    const handleApplyScenario = (scenario: RecentCalculation) => {
        try {
            setAmount(scenario.amount);
            setSelectedCardType(scenario.cardType);
            setOurRatePercentage(scenario.ourRatePercentage);
            setBankRatePercentage(scenario.bankRatePercentage);
            
            // Update the corresponding charge amounts based on card type
            if (scenario.cardType === CARD_TYPES.RUPAY) {
                setRupayChargeAmount(scenario.platformRatePercentage);
            } else {
                setMasterChargeAmount(scenario.platformRatePercentage);
            }
            
            toast.success('Scenario applied successfully!');
            logger.log('Applied scenario:', scenario);
        } catch (error) {
            logger.error('Error applying scenario:', error);
            toast.error('Failed to apply scenario');
            throw error;
        }
    };


    const handleCalculate = () => {
        try {
            // This would trigger any additional calculations or validations
            logger.log('Calculating Finkeda charges...', {
                amount,
                selectedCardType,
                ourRatePercentage,
                bankRatePercentage,
                platformRatePercentage,
                profit,
                payable
            });
        } catch (error) {
            logger.error('Error during calculation:', error);
            toast.error('Error during calculation');
            throw error;
        }
    };

    const handleRecalculate = () => {
        try {
            // Force recalculation by updating the calculations
            logger.log('Recalculating with current values...', {
                amount,
                selectedCardType,
                ourRatePercentage,
                bankRatePercentage,
                platformRatePercentage
            });
            // The calculations are reactive, so they'll update automatically
            // This function mainly provides user feedback and logging
            toast.success('Recalculated successfully!');
        } catch (error) {
            logger.error('Error during recalculation:', error);
            toast.error('Error during recalculation');
        }
    };

    const handleReset = () => {
        try {
            setAmount(0);
            setOurRatePercentage(0);
            setBankRatePercentage(0);
            setSelectedCardType(CARD_TYPES.RUPAY);
            toast.success('Form reset successfully!');
            logger.log('Form reset to default values');
        } catch (error) {
            logger.error('Error resetting form:', error);
            toast.error('Error resetting form');
            throw error;
        }
    };

    const handleCardTypeToggle = (cardType: CardType) => {
        try {
            setSelectedCardType(cardType);
            logger.log('Card type changed to:', cardType);
        } catch (error) {
            logger.error('Error changing card type:', error);
            toast.error('Error changing card type');
            throw error;
        }
    };

    // Toggle settings visibility
    const handleToggleSettings = () => {
        try {
            setShowSettings(!showSettings);
            logger.log('Settings visibility toggled to:', !showSettings);
        } catch (error) {
            logger.error('Error toggling settings:', error);
            toast.error('Error toggling settings');
        }
    };

    // Update settings API call
    const handleUpdateSettings = async () => {
        try {
            if (!rupayChargeAmount || !masterChargeAmount) {
                toast.error('Both Rupay and Master charge amounts are required');
                return;
            }

            setIsUpdatingSettings(true);
            const updateRequest: UpdateFinkedaSettingsRequest = {
                rupay_card_charge_amount: rupayChargeAmount,
                master_card_charge_amount: masterChargeAmount
            };

            const updatedSettings = await finkedaSettingsService.updateSettings(updateRequest);
            setSettings(updatedSettings);

            toast.success('Settings updated successfully!');
            logger.log('Settings updated successfully:', updatedSettings);
        } catch (error) {
            logger.error('Failed to update settings:', error);
            toast.error('Failed to update settings. Please try again.');
        } finally {
            setIsUpdatingSettings(false);
        }
    };

    try {
        return (
            <div className="main">
                <header className="main__header">
                    <div className="main__header-left">
                        <Finkeda size={20} /> <h1>Finkeda Calculator</h1>
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
                                    <button className="main__icon-button" onClick={handleToggleSettings}>
                                        <Settings size={16} />
                                        {showSettings ? 'Hide Settings' : 'Show Settings'}
                                    </button>
                                    <button className="main__icon-button" onClick={handleRecalculate}>
                                        <RefreshCcw size={16} />
                                        Recalculate
                                    </button>
                                    <button className="main__button" type="button" onClick={handleSaveScenario}>
                                        <Save size={16} />
                                        Save
                                    </button>
                                    <button className="main__icon-button" type="button" onClick={handleReset}>
                                        <RotateCcw size={16} />
                                        Reset
                                    </button>
                                </div>

                                {showSettings && (
                                    <>
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
                                            <div className="finkeda-badge">
                                                Current: {selectedCardType} ({selectedCardType === CARD_TYPES.RUPAY ? rupayChargeAmount : masterChargeAmount}%)
                                            </div>
                                            <button
                                                className="main__button"
                                                onClick={handleUpdateSettings}
                                                disabled={isUpdatingSettings}
                                            >
                                                <Save size={16} />
                                                {isUpdatingSettings ? 'Updating...' : 'Update Settings'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="finkeda-card">
                                <div className="finkeda-card__title">Summary</div>
                                <div className="finkeda-summary">
                                    <div className="finkeda-summary__row">
                                        <span>Base Amount</span>
                                        <span>{formatAmountAsCurrency(amount)}</span>
                                    </div>


                                    <div className="finkeda-summary__row">
                                        <span>{selectedCardType} Card Charge</span>
                                        <span>{platformRatePercentage}%</span>
                                    </div>
                                    <div className="finkeda-summary__row">
                                        <span>Platform Charges Amount</span>
                                        <span>{formatAmountAsCurrency(platformAmount)}</span>
                                    </div>
                                    <div className="finkeda-summary__row">
                                        <span>Portal Amount</span>
                                        <span>{formatAmountAsCurrency(portalAmount)}</span>
                                    </div>

                                    <div className="finkeda-divider"></div>
                                    <div className="finkeda-summary__row finkeda-summary__row--accent">
                                        <span>Profit</span>
                                        <span>{formatAmountAsCurrency(profit)}</span>
                                    </div>
                                    <div className="finkeda-summary__row finkeda-summary__row--accent">
                                        <span>Payout To Client</span>
                                        <span>{formatAmountAsCurrency(payable)}</span>
                                    </div>
                                </div>
                                <div className="finkeda-summary-actions">
                                    <div className="finkeda-badge">Auto-updates on Calculate</div>
                                </div>
                            </div>
                        </div>
                        <div className="finkeda-card">
                            <div className="finkeda-card__title">Saved Scenarios</div>
                            <div className="finkeda-table-wrap">
                                <table className="finkeda-table">
                                    <thead>
                                        <tr>
                                            <th>Amount</th>
                                            <th>Card Type</th>
                                            <th>Our Fee</th>
                                            <th>Card Fee</th>
                                            <th>Bank Fee</th>
                                            <th>Date & Time</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {savedScenarios.map((calc) => (
                                            <tr key={calc.id}>
                                                <td>{formatAmountAsCurrency(calc.amount)}</td>
                                                <td>{calc.cardType}</td>
                                                <td>{calc.ourRatePercentage}%</td>
                                                <td>{calc.platformRatePercentage}%</td>
                                                <td>{calc.bankRatePercentage}%</td>
                                                <td>
                                                    {calc.savedAt}
                                                </td>
                                                <td>
                                                    <button 
                                                        className="finkeda-row-actions"
                                                        onClick={() => handleApplyScenario(calc)}
                                                    >
                                                        <Play size={16} />
                                                        Apply
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {savedScenarios.length === 0 && (
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                                                    No saved scenarios yet. Save your first calculation to see it here.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        logger.error('Error rendering Finkeda screen:', error);
        return null;
    }
};

const FinkedaScreen: React.FC<FinkedaScreenProps> = (props) => {
    return (
        <ErrorBoundary 
            FallbackComponent={FinkedaScreenErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('Finkeda screen error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <FinkedaScreenContent {...props} />
        </ErrorBoundary>
    );
};

export default FinkedaScreen;
