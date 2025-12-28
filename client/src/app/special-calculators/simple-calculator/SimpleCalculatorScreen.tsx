'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { RefreshCcw, Save, Percent, Wallet, Play, RotateCcw, AlertTriangle, Home, Calculator, X, Edit2, Trash2 } from 'lucide-react';
import './SimpleCalculatorScreen.scss';
import logger from '@/utils/logger';
import { clampPercent, clampPositive, decimalToPercentage, formatAmountAsCurrency, percentageToDecimal } from '@/utils/helperFunctions';
import toast from 'react-hot-toast';
import DeleteScenarioConfirmModal from './DeleteScenarioConfirmModal';

interface SavedScenario {
    id: string;
    amount: number;
    our: number;
    bank: number;
    platform: number;
    gst: number;
    savedAt: string;
}

interface BankChargePreset {
    id: string;
    name: string;
    percentage: number;
}

const STORAGE_KEY = 'calculator_scenarios';
const BANK_PRESETS_KEY = 'bank_charge_presets';
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
    const { showBoundary } = useErrorBoundary();
    const [amount, setAmount] = useState(0);
    const [bankRatePercentage, setBankRatePercentage] = useState(0);
    const [ourRatePercentage, setOurRatePercentage] = useState(0);
    const [platformRateAmt, setPlatformRateAmt] = useState(0);
    
    // Display string states for input fields (to handle typing decimals like "0.")
    const [amountDisplay, setAmountDisplay] = useState('');
    const [bankRateDisplay, setBankRateDisplay] = useState('');
    const [ourRateDisplay, setOurRateDisplay] = useState('');
    const [platformRateDisplay, setPlatformRateDisplay] = useState('');
    const [presetPercentageDisplay, setPresetPercentageDisplay] = useState('');
    
    const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
    const [bankChargePresets, setBankChargePresets] = useState<BankChargePreset[]>([]);
    const [showPresetManager, setShowPresetManager] = useState(false);
    const [editingPreset, setEditingPreset] = useState<BankChargePreset | null>(null);
    const [newPresetName, setNewPresetName] = useState('');
    const [newPresetPercentage, setNewPresetPercentage] = useState(0);
    const [selectedPresetId, setSelectedPresetId] = useState<string>('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteModalMode, setDeleteModalMode] = useState<'single' | 'all'>('single');
    const [scenarioToDelete, setScenarioToDelete] = useState<SavedScenario | null>(null);

    // Load saved scenarios and bank presets from localStorage on component mount
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

        const loadBankPresets = () => {
            try {
                const stored = localStorage.getItem(BANK_PRESETS_KEY);
                if (stored) {
                    const presets = JSON.parse(stored) as BankChargePreset[];
                    setBankChargePresets(presets);
                    logger.debug('Loaded bank charge presets from localStorage', { count: presets.length });
                } else {
                    // Initialize with some default presets
                    const defaultPresets: BankChargePreset[] = [
                        { id: '1', name: 'HDFC Bank', percentage: 2.5 },
                        { id: '2', name: 'ICICI Bank', percentage: 2.8 },
                        { id: '3', name: 'SBI', percentage: 2.0 },
                    ];
                    setBankChargePresets(defaultPresets);
                    localStorage.setItem(BANK_PRESETS_KEY, JSON.stringify(defaultPresets));
                    logger.debug('Initialized default bank charge presets');
                }
            } catch (error) {
                logger.error('Failed to load bank charge presets:', error);
                toast.error('Failed to load bank charge presets.');
                setBankChargePresets([]);
            }
        };

        try {
            loadSavedScenarios();
            loadBankPresets();
        } catch (error) {
            logger.error('Error during component initialization:', error);
            showBoundary(error);
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
            showBoundary(error);
        }
    };

    // Apply a saved scenario to current inputs
    const handleApplyScenario = (scenario: SavedScenario) => {
        try {
            setAmount(scenario.amount);
            setAmountDisplay(scenario.amount.toString());
            setOurRatePercentage(scenario.our);
            setOurRateDisplay(scenario.our.toString());
            setBankRatePercentage(scenario.bank);
            setBankRateDisplay(scenario.bank.toString());
            setPlatformRateAmt(scenario.platform);
            setPlatformRateDisplay(scenario.platform.toString());
            
            // Check if the bank rate matches any preset and set selection
            const matchingPreset = bankChargePresets.find(p => p.percentage === scenario.bank);
            if (matchingPreset) {
                setSelectedPresetId(matchingPreset.id);
            } else {
                setSelectedPresetId('');
            }
            
            toast.success('Scenario applied successfully!');
            logger.log('Applied scenario:', scenario);
        } catch (error) {
            logger.error('Failed to apply scenario:', error);
            toast.error('Failed to apply scenario');
            showBoundary(error);
        }
    };

    // Delete a single saved scenario
    const handleDeleteScenario = (scenarioId: string) => {
        try {
            const scenario = savedScenarios.find(s => s.id === scenarioId);
            if (!scenario) return;

            setScenarioToDelete(scenario);
            setDeleteModalMode('single');
            setDeleteModalOpen(true);
        } catch (error) {
            logger.error('Failed to open delete scenario modal:', error);
            toast.error('Failed to open delete dialog');
            showBoundary(error);
        }
    };

    // Confirm delete single scenario
    const confirmDeleteScenario = () => {
        try {
            if (!scenarioToDelete) return;

            const updatedScenarios = savedScenarios.filter(s => s.id !== scenarioToDelete.id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedScenarios));
            setSavedScenarios(updatedScenarios);
            
            logger.log('Scenario deleted:', scenarioToDelete);
            setScenarioToDelete(null);
        } catch (error) {
            logger.error('Failed to delete scenario:', error);
            toast.error('Failed to delete scenario');
            showBoundary(error);
        }
    };

    // Clear all saved scenarios
    const handleClearAllScenarios = () => {
        try {
            if (savedScenarios.length === 0) {
                toast.error('No scenarios to clear');
                return;
            }

            setDeleteModalMode('all');
            setDeleteModalOpen(true);
        } catch (error) {
            logger.error('Failed to open clear all modal:', error);
            toast.error('Failed to open clear all dialog');
            showBoundary(error);
        }
    };

    // Confirm clear all scenarios
    const confirmClearAllScenarios = () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            setSavedScenarios([]);
            
            logger.log('All scenarios cleared');
        } catch (error) {
            logger.error('Failed to clear scenarios:', error);
            toast.error('Failed to clear scenarios');
            showBoundary(error);
        }
    };

    // Reset all input fields to default values
    const handleReset = () => {
        try {
            setAmount(0);
            setAmountDisplay('');
            setBankRatePercentage(0);
            setBankRateDisplay('');
            setOurRatePercentage(0);
            setOurRateDisplay('');
            setPlatformRateAmt(0);
            setPlatformRateDisplay('');
            setSelectedPresetId('');
            
            toast.success('Calculator reset successfully!');
            logger.log('Input fields reset to default values');
        } catch (error) {
            logger.error('Failed to reset calculator:', error);
            toast.error('Failed to reset calculator');
            showBoundary(error);
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
            showBoundary(error);
        }
    };

    // Bank Preset Management Functions
    const handleSelectPreset = (presetId: string) => {
        try {
            if (!presetId) {
                setSelectedPresetId('');
                return;
            }
            const preset = bankChargePresets.find(p => p.id === presetId);
            if (preset) {
                setBankRatePercentage(preset.percentage);
                setBankRateDisplay(preset.percentage.toString());
                setSelectedPresetId(presetId);
                toast.success(`Applied ${preset.name} (${preset.percentage}%)`);
                logger.log('Applied bank charge preset:', preset);
            }
        } catch (error) {
            logger.error('Failed to apply preset:', error);
            toast.error('Failed to apply preset');
            showBoundary(error);
        }
    };

    const handleAddPreset = () => {
        try {
            if (!newPresetName.trim()) {
                toast.error('Please enter a preset name');
                return;
            }
            if (newPresetPercentage < 0 || newPresetPercentage > 100) {
                toast.error('Percentage must be between 0 and 100');
                return;
            }

            const newPreset: BankChargePreset = {
                id: Date.now().toString(),
                name: newPresetName.trim(),
                percentage: newPresetPercentage
            };

            const updatedPresets = [...bankChargePresets, newPreset];
            localStorage.setItem(BANK_PRESETS_KEY, JSON.stringify(updatedPresets));
            setBankChargePresets(updatedPresets);
            setNewPresetName('');
            setNewPresetPercentage(0);
            setPresetPercentageDisplay('');
            
            toast.success(`Added ${newPreset.name}`);
            logger.log('Bank charge preset added:', newPreset);
        } catch (error) {
            logger.error('Failed to add preset:', error);
            toast.error('Failed to add preset');
            showBoundary(error);
        }
    };

    const handleStartEdit = (preset: BankChargePreset) => {
        setEditingPreset(preset);
        setNewPresetName(preset.name);
        setNewPresetPercentage(preset.percentage);
        setPresetPercentageDisplay(preset.percentage.toString());
    };

    const handleUpdatePreset = () => {
        try {
            if (!editingPreset) return;
            if (!newPresetName.trim()) {
                toast.error('Please enter a preset name');
                return;
            }
            if (newPresetPercentage < 0 || newPresetPercentage > 100) {
                toast.error('Percentage must be between 0 and 100');
                return;
            }

            const updatedPresets = bankChargePresets.map(p =>
                p.id === editingPreset.id
                    ? { ...p, name: newPresetName.trim(), percentage: newPresetPercentage }
                    : p
            );

            localStorage.setItem(BANK_PRESETS_KEY, JSON.stringify(updatedPresets));
            setBankChargePresets(updatedPresets);
            setEditingPreset(null);
            setNewPresetName('');
            setNewPresetPercentage(0);
            setPresetPercentageDisplay('');
            
            toast.success('Preset updated successfully');
            logger.log('Bank charge preset updated');
        } catch (error) {
            logger.error('Failed to update preset:', error);
            toast.error('Failed to update preset');
            showBoundary(error);
        }
    };

    const handleCancelEdit = () => {
        setEditingPreset(null);
        setNewPresetName('');
        setNewPresetPercentage(0);
        setPresetPercentageDisplay('');
    };

    const handleDeletePreset = (presetId: string) => {
        try {
            const preset = bankChargePresets.find(p => p.id === presetId);
            if (!preset) return;

            if (confirm(`Are you sure you want to delete "${preset.name}"?`)) {
                const updatedPresets = bankChargePresets.filter(p => p.id !== presetId);
                localStorage.setItem(BANK_PRESETS_KEY, JSON.stringify(updatedPresets));
                setBankChargePresets(updatedPresets);
                
                toast.success(`Deleted ${preset.name}`);
                logger.log('Bank charge preset deleted:', preset);
            }
        } catch (error) {
            logger.error('Failed to delete preset:', error);
            toast.error('Failed to delete preset');
            showBoundary(error);
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

                        {showPresetManager && (
                            <div className="panel preset-manager">
                                <div className="preset-manager__header">
                                    <div className="section-title">Manage Bank Charge Presets</div>
                                    <button 
                                        className="preset-manager__close-btn" 
                                        type="button"
                                        onClick={() => setShowPresetManager(false)}
                                        title="Close"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="preset-manager__content">
                                    <div className="preset-manager__form">
                                        <div className="input-field">
                                            <div className="label">Preset Name</div>
                                            <input
                                                className="control"
                                                type="text"
                                                value={newPresetName}
                                                onChange={e => setNewPresetName(e.target.value)}
                                                placeholder="e.g., HDFC Bank"
                                            />
                                        </div>
                                        <div className="input-field">
                                            <div className="label">Percentage (%)</div>
                                            <input
                                                className="control"
                                                type="text"
                                                inputMode="decimal"
                                                value={presetPercentageDisplay}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    // Only allow positive numbers with decimals
                                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                        setPresetPercentageDisplay(val);
                                                        setNewPresetPercentage(val === '' || val === '.' ? 0 : clampPercent(parseFloat(val) || 0));
                                                    }
                                                }}
                                                onBlur={() => {
                                                    // Format on blur
                                                    if (presetPercentageDisplay && newPresetPercentage > 0) {
                                                        setPresetPercentageDisplay(newPresetPercentage.toString());
                                                    }
                                                }}
                                                placeholder="0 - 100"
                                            />
                                        </div>
                                        <div className="preset-manager__form-actions">
                                            {editingPreset ? (
                                                <>
                                                    <button 
                                                        className="main__button" 
                                                        type="button"
                                                        onClick={handleUpdatePreset}
                                                    >
                                                        <Save size={16} />
                                                        Update
                                                    </button>
                                                    <button 
                                                        className="main__icon-button" 
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                    >
                                                        <X size={16} />
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <button 
                                                    className="main__button" 
                                                    type="button"
                                                    onClick={handleAddPreset}
                                                >
                                                    <Save size={16} />
                                                    Add Preset
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="preset-manager__list">
                                        {bankChargePresets.map(preset => (
                                            <div 
                                                key={preset.id} 
                                                className={`preset-item ${editingPreset?.id === preset.id ? 'preset-item--editing' : ''}`}
                                            >
                                                <div className="preset-item__info">
                                                    <span className="preset-item__name">{preset.name}</span>
                                                    <span className="preset-item__percentage">{preset.percentage}%</span>
                                                </div>
                                                <div className="preset-item__actions">
                                                    <button 
                                                        className="preset-item__action-btn preset-item__action-btn--edit" 
                                                        type="button"
                                                        onClick={() => handleStartEdit(preset)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button 
                                                        className="preset-item__action-btn preset-item__action-btn--delete" 
                                                        type="button"
                                                        onClick={() => handleDeletePreset(preset.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {bankChargePresets.length === 0 && (
                                            <div className="preset-manager__empty">
                                                No presets yet. Add your first bank charge preset above.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="calculator-two-col">
                            <div className="panel">
                                <div className="section-title">Inputs</div>
                                <div className="inputs-grid">
                                    <div className="input-field">
                                        <div className="label">Amount (₹)</div>
                                        <input
                                            className="control"
                                            type="text"
                                            inputMode="decimal"
                                            value={amountDisplay}
                                            onChange={e => {
                                                const val = e.target.value;
                                                // Only allow positive numbers with decimals
                                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                    setAmountDisplay(val);
                                                    setAmount(val === '' || val === '.' ? 0 : clampPositive(parseFloat(val) || 0));
                                                }
                                            }}
                                            onFocus={e => e.target.select()}
                                            onBlur={() => {
                                                // Format on blur
                                                if (amountDisplay && amount > 0) {
                                                    setAmountDisplay(amount.toString());
                                                }
                                            }}
                                            placeholder="Enter amount"
                                        />
                                    </div>
                                    <div className="input-field">
                                        <div className="label">
                                            Bank Charge (%)
                                            <button 
                                                className="main__icon-button" 
                                                type="button"
                                                onClick={() => setShowPresetManager(!showPresetManager)}
                                                style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px' }}
                                            >
                                                {showPresetManager ? 'Hide' : 'Manage'} Presets
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <select
                                                className="control preset-select"
                                                onChange={e => handleSelectPreset(e.target.value)}
                                                value={selectedPresetId}
                                                style={{ flex: '1', minWidth: '0' }}
                                            >
                                                <option value="">Select a preset...</option>
                                                {bankChargePresets.map(preset => (
                                                    <option key={preset.id} value={preset.id}>
                                                        {preset.name} ({preset.percentage}%)
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                className="control"
                                                type="text"
                                                inputMode="decimal"
                                                value={bankRateDisplay}
                                                onChange={e => {
                                                    const val = e.target.value;
                                                    // Only allow positive numbers with decimals
                                                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                        setBankRateDisplay(val);
                                                        setBankRatePercentage(val === '' || val === '.' ? 0 : clampPercent(parseFloat(val) || 0));
                                                        setSelectedPresetId(''); // Clear selection when manually changed
                                                    }
                                                }}
                                                onFocus={e => e.target.select()}
                                                onBlur={() => {
                                                    // Format on blur
                                                    if (bankRateDisplay && bankRatePercentage > 0) {
                                                        setBankRateDisplay(bankRatePercentage.toString());
                                                    }
                                                }}
                                                placeholder="0 - 100"
                                                style={{ flex: '1', minWidth: '0' }}
                                            />
                                        </div>
                                    </div>
                                    <div className="input-field">
                                        <div className="label">Our Charge (%)</div>
                                        <input
                                            className="control"
                                            type="text"
                                            inputMode="decimal"
                                            value={ourRateDisplay}
                                            onChange={e => {
                                                const val = e.target.value;
                                                // Only allow positive numbers with decimals
                                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                    setOurRateDisplay(val);
                                                    setOurRatePercentage(val === '' || val === '.' ? 0 : clampPercent(parseFloat(val) || 0));
                                                }
                                            }}
                                            onFocus={e => e.target.select()}
                                            onBlur={() => {
                                                // Format on blur
                                                if (ourRateDisplay && ourRatePercentage > 0) {
                                                    setOurRateDisplay(ourRatePercentage.toString());
                                                }
                                            }}
                                            placeholder="0 - 100"
                                        />
                                    </div>
                                    <div className="input-field">
                                        <div className="label">Platform Charge (₹)</div>
                                        <input
                                            className="control"
                                            type="text"
                                            inputMode="decimal"
                                            value={platformRateDisplay}
                                            onChange={e => {
                                                const val = e.target.value;
                                                // Only allow positive numbers with decimals
                                                if (val === '' || /^\d*\.?\d*$/.test(val)) {
                                                    setPlatformRateDisplay(val);
                                                    setPlatformRateAmt(val === '' || val === '.' ? 0 : clampPositive(parseFloat(val) || 0));
                                                }
                                            }}
                                            onFocus={e => e.target.select()}
                                            onBlur={() => {
                                                // Format on blur
                                                if (platformRateDisplay && platformRateAmt > 0) {
                                                    setPlatformRateDisplay(platformRateAmt.toString());
                                                }
                                            }}
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div className="section-title">Saved Scenarios ({savedScenarios.length})</div>
                                {savedScenarios.length > 0 && (
                                    <button 
                                        className="main__icon-button" 
                                        type="button"
                                        onClick={handleClearAllScenarios}
                                        style={{ padding: '6px 12px', fontSize: '13px', color: '#dc3545' }}
                                        title="Clear all saved scenarios"
                                    >
                                        <Trash2 size={14} />
                                        Clear All
                                    </button>
                                )}
                            </div>
                            {savedScenarios.length === 0 ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                                    No saved scenarios yet. Save your current calculation to get started.
                                </div>
                            ) : (
                                <div className="calculator-grid-3">
                                    {savedScenarios.map((s: SavedScenario, i: number) => (
                                        <div className="panel scenario-card" key={s.id}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <div className="line" style={{ fontWeight: 600, flex: 1 }}>
                                                    {formatAmountAsCurrency(s.amount)} • Our {s.our}% • Bank {s.bank}%
                                                </div>
                                                <button 
                                                    className="scenario-delete-btn" 
                                                    type="button"
                                                    onClick={() => handleDeleteScenario(s.id)}
                                                    title="Delete this scenario"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
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

                <DeleteScenarioConfirmModal
                    isOpen={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setScenarioToDelete(null);
                    }}
                    onConfirm={deleteModalMode === 'single' ? confirmDeleteScenario : confirmClearAllScenarios}
                    scenario={scenarioToDelete}
                    mode={deleteModalMode}
                    totalCount={savedScenarios.length}
                />
            </div>
        );
    } catch (error) {
        logger.error('Error rendering simple calculator:', error);
        showBoundary(error);
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