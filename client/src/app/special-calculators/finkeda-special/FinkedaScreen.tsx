'use client'

import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
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
import { Button, NumericInput, PillToggleGroup } from '@/components/FormInputs';
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
                                Don&apos;t worry, your saved scenarios are safe. You can try again or go back to the main dashboard.
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
                                <Button
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                    className="main__button"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<Calculator size={16} />}
                                    onClick={() => window.location.href = '/special-calculators/finkeda-special'}
                                    className="main__icon-button"
                                >
                                    Reload Calculator
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<Home size={16} />}
                                    onClick={() => window.location.href = '/'}
                                    className="main__icon-button"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinkedaScreenContent: React.FC<FinkedaScreenProps> = ({ initialSettings }) => {
    const { showBoundary } = useErrorBoundary();
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
            showBoundary(error);
        }
    }, []);

    // Update local state when initialSettings changes
    React.useEffect(() => {
        try {
            if (initialSettings) {
                setSettings(initialSettings);
                const rupayCharge = parseFloat(initialSettings.rupay_card_charge_amount.toString());
                const masterCharge = parseFloat(initialSettings.master_card_charge_amount.toString());
                setRupayChargeAmount(rupayCharge);
                setMasterChargeAmount(masterCharge);
                logger.debug('Updated settings from initial settings', initialSettings);
            }
        } catch (error) {
            logger.error('Error updating settings from initial settings:', error);
            showBoundary(error);
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
            showBoundary(error);
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
            showBoundary(error);
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
            showBoundary(error);
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
            showBoundary(error);
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
            showBoundary(error);
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
            showBoundary(error);
        }
    };

    const handleCardTypeToggle = (cardType: CardType) => {
        try {
            setSelectedCardType(cardType);
            logger.log('Card type changed to:', cardType);
        } catch (error) {
            logger.error('Error changing card type:', error);
            toast.error('Error changing card type');
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
                    <div className="main__view finkeda-container">

                        <div className="finkeda-two-col">
                            <div className="finkeda-card">
                                <div className="finkeda-card__title">Inputs</div>

                                <div className="finkeda-form-row">
                                    <div className="finkeda-field">
                                        <div className="finkeda-label">Amount (₹)</div>
                                        <NumericInput
                                            value={amount}
                                            onChange={setAmount}
                                            placeholder="Enter amount ₹"
                                            min={0}
                                        />
                                    </div>
                                    <div className="finkeda-field">
                                        <div className="finkeda-label">Bank Charge (%)</div>
                                        <NumericInput
                                            value={bankRatePercentage}
                                            onChange={setBankRatePercentage}
                                            placeholder="Bank charge %"
                                            min={0}
                                            max={100}
                                        />
                                    </div>
                                </div>

                                <div className="finkeda-form-row">
                                    <div className="finkeda-field">
                                        <div className="finkeda-label">My Charges (%)</div>
                                        <NumericInput
                                            value={ourRatePercentage}
                                            onChange={setOurRatePercentage}
                                            placeholder="Enter %"
                                            min={0}
                                            max={100}
                                        />
                                    </div>
                                    <div className="finkeda-field">
                                        <div className="finkeda-label">Card Type</div>
                                        <PillToggleGroup
                                            type="radio"
                                            value={selectedCardType}
                                            onChange={(value) => handleCardTypeToggle(value as CardType)}
                                            options={[
                                                { label: `Rupay (${rupayChargeAmount}%)`, value: CARD_TYPES.RUPAY },
                                                { label: `Master (${masterChargeAmount}%)`, value: CARD_TYPES.MASTER }
                                            ]}
                                            name="cardType"
                                        />
                                    </div>
                                </div>

                                <div className="finkeda-actions">
                                    <div className="pill">GST: {GST}% (fixed)</div>
                                    <Button 
                                        variant="secondary"
                                        icon={<Settings size={16} />}
                                        onClick={handleToggleSettings}
                                        className="main__icon-button"
                                    >
                                        {showSettings ? 'Hide Settings' : 'Show Settings'}
                                    </Button>
                                    <Button 
                                        variant="secondary"
                                        icon={<RefreshCcw size={16} />}
                                        onClick={handleRecalculate}
                                        className="main__icon-button"
                                    >
                                        Recalculate
                                    </Button>
                                    <Button 
                                        variant="primary"
                                        icon={<Save size={16} />}
                                        onClick={handleSaveScenario}
                                        type="button"
                                        className="main__button"
                                    >
                                        Save
                                    </Button>
                                    <Button 
                                        variant="secondary"
                                        icon={<RotateCcw size={16} />}
                                        onClick={handleReset}
                                        type="button"
                                        className="main__icon-button"
                                    >
                                        Reset
                                    </Button>
                                </div>

                                {showSettings && (
                                    <>
                                        <div className="finkeda-form-row">
                                            <div className="finkeda-field">
                                                <div className="finkeda-label">Rupay Charge (%)</div>
                                                <NumericInput
                                                    value={rupayChargeAmount}
                                                    onChange={setRupayChargeAmount}
                                                    placeholder="Rupay charge %"
                                                    min={0}
                                                    max={100}
                                                />
                                            </div>
                                            <div className="finkeda-field">
                                                <div className="finkeda-label">Master Charge (%)</div>
                                                <NumericInput
                                                    value={masterChargeAmount}
                                                    onChange={setMasterChargeAmount}
                                                    placeholder="Master charge %"
                                                    min={0}
                                                    max={100}
                                                />
                                            </div>
                                        </div>

                                        <div className="finkeda-actions">
                                            <div className="finkeda-badge">
                                                Current: {selectedCardType} ({selectedCardType === CARD_TYPES.RUPAY ? rupayChargeAmount : masterChargeAmount}%)
                                            </div>
                                            <Button 
                                                variant="primary"
                                                icon={<Save size={16} />}
                                                onClick={handleUpdateSettings}
                                                disabled={isUpdatingSettings}
                                                className="main__button"
                                            >
                                                {isUpdatingSettings ? 'Updating...' : 'Update Settings'}
                                            </Button>
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
                                                    <Button 
                                                        variant="ghost"
                                                        size="small"
                                                        icon={<Play size={16} />}
                                                        onClick={() => handleApplyScenario(calc)}
                                                        className="finkeda-row-actions"
                                                    >
                                                        Apply
                                                    </Button>
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
        showBoundary(error);
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
