'use client'
import React, { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { RefreshCcw, Save, Percent, Wallet, Play, RotateCcw, AlertTriangle, Home, Calculator } from 'lucide-react';
import './SimpleCalculatorScreen.scss';
import logger from '@/utils/logger';
import { clampPercent, clampPositive, decimalToPercentage, formatAmountAsCurrency, percentageToDecimal } from '@/utils/helperFunctions';
import toast from 'react-hot-toast';

interface SavedScenario {
    id: string;
    amount: number;
    our: number;
    bank: number;
    platform: number;
    gst: number;
    savedAt: string;
}

const STORAGE_KEY = 'calculator_scenarios';
const GST = 18;

// Error Fallback Component for Simple Calculator Screen
const SimpleCalculatorErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main">
            <div className="main__content">
                <div className="main__view">
                    <div className="sc__error-boundary">
                        <div className="sc__error-boundary-content">
                            <AlertTriangle size={64} className="sc__error-boundary-icon" />
                            <h2 className="sc__error-boundary-title">Something went wrong</h2>
                            <p className="sc__error-boundary-message">
                                We encountered an unexpected error in the simple calculator. 
                                Don't worry, your saved scenarios are safe. You can try again or go back to the main dashboard.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="sc__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="sc__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="sc__error-boundary-actions">
                                <button 
                                    className="main__button"
                                    onClick={resetErrorBoundary}
                                >
                                    <RotateCcw size={16} />
                                    Try Again
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={() => window.location.href = '/special-calculators/simple-calculator'}
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

const CalculatorScreenContent: React.FC = () => {
    const [amount, setAmount] = useState(0);
    const [bankRatePercentage, setBankRatePercentage] = useState(0);
    const [ourRatePercentage, setOurRatePercentage] = useState(0);
    const [platformRateAmt, setPlatformRateAmt] = useState(0);
    const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);

    // Load saved scenarios from localStorage on component mount
    React.useEffect(() => {
        const loadSavedScenarios = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const scenarios = JSON.parse(stored) as SavedScenario[];
                    setSavedScenarios(scenarios);
                    logger.debug('Loaded saved scenarios from localStorage', { count: scenarios.length });
                }
            } catch (error) {
                logger.error('Failed to load saved scenarios:', error);
                toast.error('Failed to load saved scenarios. Resetting to empty.');
                setSavedScenarios([]);
            }
        };

        try {
            loadSavedScenarios();
        } catch (error) {
            logger.error('Error during component initialization:', error);
            throw error;
        }
    }, []);

    // Save current scenario to localStorage
    const handleSaveScenario = () => {
        try {
            // Check for duplicate scenario
            const isDuplicate = savedScenarios.some(scenario => 
                scenario.amount === amount &&
                scenario.our === ourRatePercentage &&
                scenario.bank === bankRatePercentage &&
                scenario.platform === platformRateAmt &&
                scenario.gst === GST
            );

            if (isDuplicate) {
                logger.warn('Duplicate scenario detected - not saving');
                toast.error('This scenario has already been saved');
                return;
            }

            const newScenario: SavedScenario = {
                id: Date.now().toString(),
                amount,
                our: ourRatePercentage,
                bank: bankRatePercentage,
                platform: platformRateAmt,
                gst: GST,
                savedAt: new Date().toISOString()
            };

            const updatedScenarios = [...savedScenarios, newScenario];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScenarios));
            setSavedScenarios(updatedScenarios);
            
            toast.success('Scenario saved successfully!');
            logger.log('Scenario saved successfully:', newScenario);
        } catch (error) {
            logger.error('Failed to save scenario:', error);
            toast.error('Failed to save scenario. Please try again.');
            throw error;
        }
    };

    // Apply a saved scenario to current inputs
    const handleApplyScenario = (scenario: SavedScenario) => {
        try {
            setAmount(scenario.amount);
            setOurRatePercentage(scenario.our);
            setBankRatePercentage(scenario.bank);
            setPlatformRateAmt(scenario.platform);
            
            toast.success('Scenario applied successfully!');
            logger.log('Applied scenario:', scenario);
        } catch (error) {
            logger.error('Failed to apply scenario:', error);
            toast.error('Failed to apply scenario');
            throw error;
        }
    };

    // Reset all input fields to default values
    const handleReset = () => {
        try {
            setAmount(0);
            setBankRatePercentage(0);
            setOurRatePercentage(0);
            setPlatformRateAmt(0);
            
            toast.success('Calculator reset successfully!');
            logger.log('Input fields reset to default values');
        } catch (error) {
            logger.error('Failed to reset calculator:', error);
            toast.error('Failed to reset calculator');
            throw error;
        }
    };

    // Force recalculation (mainly for user feedback and validation)
    const handleRecalculate = () => {
        try {
            // Force a re-render
            setAmount(amount);
            toast.success('Recalculated successfully!');
            logger.log('Recalculation triggered');
        } catch (error) {
            logger.error('Failed to recalculate:', error);
            toast.error('Failed to recalculate');
            throw error;
        }
    };

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

    try {
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
                                    <button className="main__icon-button" type="button" onClick={handleRecalculate}>
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
                            <div className="section-title">Saved Scenarios ({savedScenarios.length})</div>
                            {savedScenarios.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                    No saved scenarios yet. Save your current calculation to get started.
                                </div>
                            ) : (
                                <div className="calculator-grid-3">
                                    {savedScenarios.map((s: SavedScenario, i: number) => (
                                        <div className="panel" key={s.id}>
                                            <div className="line" style={{ fontWeight: 600 }}>
                                                {formatAmountAsCurrency(s.amount)} • Our {s.our}% • Bank {s.bank}%
                                            </div>
                                            <div className="line"><span>Platform</span><span>{formatAmountAsCurrency(s.platform)}</span></div>
                                            <div className="line" style={{ fontSize: '12px', color: '#666' }}>
                                                <span>Saved: {new Date(s.savedAt).toLocaleDateString()} at {new Date(s.savedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                            </div>
                                            <div className="inline" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                                                <div className="pill">GST {s.gst}%</div>
                                                <button 
                                                    className="main__icon-button" 
                                                    type="button"
                                                    onClick={() => handleApplyScenario(s)}
                                                >
                                                    <Play size={16} />
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        );
    } catch (error) {
        logger.error('Error rendering simple calculator:', error);
        return null;
    }
};

// Main wrapper component with ErrorBoundary
const CalculatorScreen: React.FC = () => {
    return (
        <ErrorBoundary
            FallbackComponent={SimpleCalculatorErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('Simple calculator error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <CalculatorScreenContent />
        </ErrorBoundary>
    );
};

export default CalculatorScreen;