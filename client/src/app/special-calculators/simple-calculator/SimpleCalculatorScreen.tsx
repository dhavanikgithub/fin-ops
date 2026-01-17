'use client'
import React, { useState } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { RefreshCcw, Save, Percent, Wallet, Play, RotateCcw, AlertTriangle, Home, Calculator, X, Edit2, Trash2, Settings } from 'lucide-react';
import { Button, NumericInput, TextInput, ToggleSwitch } from '@/components/FormInputs';
import './SimpleCalculatorScreen.scss';
import logger from '@/utils/logger';
import { clampPercent, clampPositive, decimalToPercentage, formatAmountAsCurrency, percentageToDecimal } from '@/utils/helperFunctions';
import toast from 'react-hot-toast';
import DeleteScenarioConfirmModal from './DeleteScenarioConfirmModal';
import DeletePresetConfirmModal, { PresetToDelete } from './DeletePresetConfirmModal';

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
    createdAt: string;
    updatedAt: string;
}

interface PlatformChargePreset {
    id: string;
    name: string;
    amount: number;
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = 'calculator_scenarios';
const BANK_PRESETS_KEY = 'bank_charge_presets';
const PLATFORM_PRESETS_KEY = 'platform_charge_presets';
const SETTINGS_KEY = 'calculator_settings';
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
                                Don&apos;t worry, your saved scenarios are safe. You can try again or go back to the main dashboard.
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
                                    onClick={() => window.location.href = '/special-calculators/simple-calculator'}
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

const CalculatorScreenContent: React.FC = () => {
    const { showBoundary } = useErrorBoundary();
    const [amount, setAmount] = useState(0);
    const [bankRatePercentage, setBankRatePercentage] = useState(0);
    const [ourRatePercentage, setOurRatePercentage] = useState(0);
    const [platformRateAmt, setPlatformRateAmt] = useState(0);
    
    const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
    const [bankChargePresets, setBankChargePresets] = useState<BankChargePreset[]>([]);
    const [showPresetManager, setShowPresetManager] = useState(false);
    const [editingPreset, setEditingPreset] = useState<BankChargePreset | null>(null);
    const [newPresetName, setNewPresetName] = useState('');
    const [newPresetPercentage, setNewPresetPercentage] = useState(0);
    const [selectedPresetId, setSelectedPresetId] = useState<string>('');
    const [platformChargePresets, setPlatformChargePresets] = useState<PlatformChargePreset[]>([]);
    const [showPlatformPresetManager, setShowPlatformPresetManager] = useState(false);
    const [editingPlatformPreset, setEditingPlatformPreset] = useState<PlatformChargePreset | null>(null);
    const [newPlatformPresetName, setNewPlatformPresetName] = useState('');
    const [newPlatformPresetAmount, setNewPlatformPresetAmount] = useState(0);
    const [selectedPlatformPresetId, setSelectedPlatformPresetId] = useState<string>('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deleteModalMode, setDeleteModalMode] = useState<'single' | 'all'>('single');
    const [scenarioToDelete, setScenarioToDelete] = useState<SavedScenario | null>(null);
    const [deletePresetModalOpen, setDeletePresetModalOpen] = useState(false);
    const [presetToDelete, setPresetToDelete] = useState<PresetToDelete | null>(null);
    const [showPresetSettings, setShowPresetSettings] = useState(false);
    const [requirePresetDeleteConfirmation, setRequirePresetDeleteConfirmation] = useState(true);

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
                    const now = new Date().toISOString();
                    const defaultPresets: BankChargePreset[] = [
                        { id: '1', name: 'HDFC Bank', percentage: 2.5, createdAt: now, updatedAt: now },
                        { id: '2', name: 'ICICI Bank', percentage: 2.8, createdAt: now, updatedAt: now },
                        { id: '3', name: 'SBI', percentage: 2.0, createdAt: now, updatedAt: now },
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

        const loadPlatformPresets = () => {
            try {
                const stored = localStorage.getItem(PLATFORM_PRESETS_KEY);
                if (stored) {
                    const presets = JSON.parse(stored) as PlatformChargePreset[];
                    setPlatformChargePresets(presets);
                    logger.debug('Loaded platform charge presets from localStorage', { count: presets.length });
                } else {
                    // Initialize with some default presets
                    const now = new Date().toISOString();
                    const defaultPresets: PlatformChargePreset[] = [
                        { id: '1', name: 'Standard Fee', amount: 50, createdAt: now, updatedAt: now },
                        { id: '2', name: 'Premium Fee', amount: 100, createdAt: now, updatedAt: now },
                        { id: '3', name: 'Enterprise Fee', amount: 200, createdAt: now, updatedAt: now },
                    ];
                    setPlatformChargePresets(defaultPresets);
                    localStorage.setItem(PLATFORM_PRESETS_KEY, JSON.stringify(defaultPresets));
                    logger.debug('Initialized default platform charge presets');
                }
            } catch (error) {
                logger.error('Failed to load platform charge presets:', error);
                toast.error('Failed to load platform charge presets.');
                setPlatformChargePresets([]);
            }
        };

        const loadSettings = () => {
            try {
                const stored = localStorage.getItem(SETTINGS_KEY);
                if (stored) {
                    const settings = JSON.parse(stored);
                    setRequirePresetDeleteConfirmation(settings.requirePresetDeleteConfirmation ?? true);
                    logger.debug('Loaded calculator settings from localStorage');
                }
            } catch (error) {
                logger.error('Failed to load calculator settings:', error);
            }
        };

        try {
            loadSavedScenarios();
            loadBankPresets();
            loadPlatformPresets();
            loadSettings();
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
            setOurRatePercentage(scenario.our);
            setBankRatePercentage(scenario.bank);
            setPlatformRateAmt(scenario.platform);
            
            // Check if the bank rate matches any preset and set selection
            const matchingPreset = bankChargePresets.find(p => p.percentage === scenario.bank);
            if (matchingPreset) {
                setSelectedPresetId(matchingPreset.id);
            } else {
                setSelectedPresetId('');
            }
            
            // Check if the platform rate matches any preset and set selection
            const matchingPlatformPreset = platformChargePresets.find(p => p.amount === scenario.platform);
            if (matchingPlatformPreset) {
                setSelectedPlatformPresetId(matchingPlatformPreset.id);
            } else {
                setSelectedPlatformPresetId('');
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
            setBankRatePercentage(0);
            setOurRatePercentage(0);
            setPlatformRateAmt(0);
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

            const now = new Date().toISOString();
            const newPreset: BankChargePreset = {
                id: Date.now().toString(),
                name: newPresetName.trim(),
                percentage: newPresetPercentage,
                createdAt: now,
                updatedAt: now
            };

            const updatedPresets = [...bankChargePresets, newPreset];
            localStorage.setItem(BANK_PRESETS_KEY, JSON.stringify(updatedPresets));
            setBankChargePresets(updatedPresets);
            setNewPresetName('');
            setNewPresetPercentage(0);
            
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
                    ? { ...p, name: newPresetName.trim(), percentage: newPresetPercentage, updatedAt: new Date().toISOString() }
                    : p
            );

            localStorage.setItem(BANK_PRESETS_KEY, JSON.stringify(updatedPresets));
            setBankChargePresets(updatedPresets);
            setEditingPreset(null);
            setNewPresetName('');
            setNewPresetPercentage(0);
            
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
    };

    const handleTogglePresetDeleteConfirmation = (enabled: boolean) => {
        try {
            setRequirePresetDeleteConfirmation(enabled);
            const settings = { requirePresetDeleteConfirmation: enabled };
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            logger.log('Updated preset delete confirmation setting:', enabled);
            toast.success(`Delete confirmation ${enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            logger.error('Failed to update settings:', error);
            toast.error('Failed to update settings');
        }
    };

    const handleDeletePreset = (presetId: string) => {
        try {
            const preset = bankChargePresets.find(p => p.id === presetId);
            if (!preset) return;

            if (requirePresetDeleteConfirmation) {
                // Show modal
                setPresetToDelete({
                    id: preset.id,
                    name: preset.name,
                    value: `${preset.percentage}%`,
                    type: 'bank'
                });
                setDeletePresetModalOpen(true);
            } else {
                // Direct delete without confirmation
                confirmDeleteBankPreset(presetId);
            }
        } catch (error) {
            logger.error('Failed to delete preset:', error);
            toast.error('Failed to delete preset');
            showBoundary(error);
        }
    };

    const confirmDeleteBankPreset = (presetId: string) => {
        try {
            const preset = bankChargePresets.find(p => p.id === presetId);
            if (!preset) return;

            const updatedPresets = bankChargePresets.filter(p => p.id !== presetId);
            localStorage.setItem(BANK_PRESETS_KEY, JSON.stringify(updatedPresets));
            setBankChargePresets(updatedPresets);
            
            toast.success(`Deleted ${preset.name}`);
            logger.log('Bank charge preset deleted:', preset);
        } catch (error) {
            logger.error('Failed to delete bank preset:', error);
            toast.error('Failed to delete preset');
            showBoundary(error);
        }
    };

    // Platform Preset Management Functions
    const handleSelectPlatformPreset = (presetId: string) => {
        try {
            if (!presetId) {
                setSelectedPlatformPresetId('');
                return;
            }
            const preset = platformChargePresets.find(p => p.id === presetId);
            if (preset) {
                setPlatformRateAmt(preset.amount);
                setSelectedPlatformPresetId(presetId);
                toast.success(`Applied ${preset.name} (₹${preset.amount})`);
                logger.log('Applied platform charge preset:', preset);
            }
        } catch (error) {
            logger.error('Failed to apply platform preset:', error);
            toast.error('Failed to apply platform preset');
            showBoundary(error);
        }
    };

    const handleAddPlatformPreset = () => {
        try {
            if (!newPlatformPresetName.trim()) {
                toast.error('Please enter a preset name');
                return;
            }
            if (newPlatformPresetAmount < 0) {
                toast.error('Amount must be 0 or greater');
                return;
            }

            const now = new Date().toISOString();
            const newPreset: PlatformChargePreset = {
                id: Date.now().toString(),
                name: newPlatformPresetName.trim(),
                amount: newPlatformPresetAmount,
                createdAt: now,
                updatedAt: now
            };

            const updatedPresets = [...platformChargePresets, newPreset];
            localStorage.setItem(PLATFORM_PRESETS_KEY, JSON.stringify(updatedPresets));
            setPlatformChargePresets(updatedPresets);
            setNewPlatformPresetName('');
            setNewPlatformPresetAmount(0);
            
            toast.success(`Added ${newPreset.name}`);
            logger.log('Platform charge preset added:', newPreset);
        } catch (error) {
            logger.error('Failed to add platform preset:', error);
            toast.error('Failed to add platform preset');
            showBoundary(error);
        }
    };

    const handleStartEditPlatform = (preset: PlatformChargePreset) => {
        setEditingPlatformPreset(preset);
        setNewPlatformPresetName(preset.name);
        setNewPlatformPresetAmount(preset.amount);
    };

    const handleUpdatePlatformPreset = () => {
        try {
            if (!editingPlatformPreset) return;
            if (!newPlatformPresetName.trim()) {
                toast.error('Please enter a preset name');
                return;
            }
            if (newPlatformPresetAmount < 0) {
                toast.error('Amount must be 0 or greater');
                return;
            }

            const updatedPresets = platformChargePresets.map(p =>
                p.id === editingPlatformPreset.id
                    ? { ...p, name: newPlatformPresetName.trim(), amount: newPlatformPresetAmount, updatedAt: new Date().toISOString() }
                    : p
            );

            localStorage.setItem(PLATFORM_PRESETS_KEY, JSON.stringify(updatedPresets));
            setPlatformChargePresets(updatedPresets);
            setEditingPlatformPreset(null);
            setNewPlatformPresetName('');
            setNewPlatformPresetAmount(0);
            
            toast.success('Platform preset updated successfully');
            logger.log('Platform charge preset updated');
        } catch (error) {
            logger.error('Failed to update platform preset:', error);
            toast.error('Failed to update platform preset');
            showBoundary(error);
        }
    };

    const handleCancelEditPlatform = () => {
        setEditingPlatformPreset(null);
        setNewPlatformPresetName('');
        setNewPlatformPresetAmount(0);
    };

    const handleDeletePlatformPreset = (presetId: string) => {
        try {
            const preset = platformChargePresets.find(p => p.id === presetId);
            if (!preset) return;

            if (requirePresetDeleteConfirmation) {
                // Show modal
                setPresetToDelete({
                    id: preset.id,
                    name: preset.name,
                    value: `₹${preset.amount}`,
                    type: 'platform'
                });
                setDeletePresetModalOpen(true);
            } else {
                // Direct delete without confirmation
                confirmDeletePlatformPreset(presetId);
            }
        } catch (error) {
            logger.error('Failed to delete platform preset:', error);
            toast.error('Failed to delete platform preset');
            showBoundary(error);
        }
    };

    const confirmDeletePlatformPreset = (presetId: string) => {
        try {
            const preset = platformChargePresets.find(p => p.id === presetId);
            if (!preset) return;

            const updatedPresets = platformChargePresets.filter(p => p.id !== presetId);
            localStorage.setItem(PLATFORM_PRESETS_KEY, JSON.stringify(updatedPresets));
            setPlatformChargePresets(updatedPresets);
            
            toast.success(`Deleted ${preset.name}`);
            logger.log('Platform charge preset deleted:', preset);
        } catch (error) {
            logger.error('Failed to delete platform preset:', error);
            toast.error('Failed to delete platform preset');
            showBoundary(error);
        }
    };

    const handleConfirmDeletePreset = () => {
        try {
            if (!presetToDelete) return;

            if (presetToDelete.type === 'bank') {
                confirmDeleteBankPreset(presetToDelete.id);
            } else {
                confirmDeletePlatformPreset(presetToDelete.id);
            }

            setPresetToDelete(null);
        } catch (error) {
            logger.error('Failed to confirm delete preset:', error);
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
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Button 
                                            variant="ghost"
                                            size="small"
                                            icon={<Settings size={18} />}
                                            onClick={() => setShowPresetSettings(!showPresetSettings)}
                                            title="Settings"
                                            type="button"
                                            className="preset-manager__close-btn"
                                        />
                                        <Button 
                                            variant="ghost"
                                            size="small"
                                            icon={<X size={18} />}
                                            onClick={() => setShowPresetManager(false)}
                                            title="Close"
                                            type="button"
                                            className="preset-manager__close-btn"
                                        />
                                    </div>
                                </div>
                                <div className="preset-manager__content">
                                    {showPresetSettings && (
                                        <div className="preset-manager__settings">
                                            <ToggleSwitch
                                                checked={requirePresetDeleteConfirmation}
                                                onChange={handleTogglePresetDeleteConfirmation}
                                                label="Delete Confirmation"
                                                description="Show confirmation dialog when deleting presets"
                                            />
                                        </div>
                                    )}
                                    <div className="preset-manager__form">
                                        <div className="input-field">
                                            <div className="label">Preset Name</div>
                                            <TextInput
                                                value={newPresetName}
                                                onChange={setNewPresetName}
                                                placeholder="e.g., HDFC Bank"
                                            />
                                        </div>
                                        <div className="input-field">
                                            <div className="label">Percentage (%)</div>
                                            <NumericInput
                                                value={newPresetPercentage}
                                                onChange={setNewPresetPercentage}
                                                placeholder="0 - 100"
                                                min={0}
                                                max={100}
                                            />
                                        </div>
                                        <div className="preset-manager__form-actions">
                                            {editingPreset ? (
                                                <>
                                                    <Button 
                                                        variant="primary"
                                                        icon={<Save size={16} />}
                                                        onClick={handleUpdatePreset}
                                                        type="button"
                                                        className="main__button"
                                                    >
                                                        Update
                                                    </Button>
                                                    <Button 
                                                        variant="secondary"
                                                        icon={<X size={16} />}
                                                        onClick={handleCancelEdit}
                                                        type="button"
                                                        className="main__icon-button"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    variant="primary"
                                                    icon={<Save size={16} />}
                                                    onClick={handleAddPreset}
                                                    type="button"
                                                    className="main__button"
                                                >
                                                    Add Preset
                                                </Button>
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
                                                    <div>
                                                        <span className="preset-item__name">{preset.name}</span>
                                                        <span className="preset-item__percentage">{preset.percentage}%</span>
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                                                        Created: {new Date(preset.createdAt).toLocaleDateString()} {new Date(preset.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                        {preset.updatedAt !== preset.createdAt && (
                                                            <> • Modified: {new Date(preset.updatedAt).toLocaleDateString()} {new Date(preset.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="preset-item__actions">
                                                    <Button 
                                                        variant="ghost"
                                                        size="small"
                                                        icon={<Edit2 size={14} />}
                                                        onClick={() => handleStartEdit(preset)}
                                                        title="Edit"
                                                        type="button"
                                                        className="preset-item__action-btn preset-item__action-btn--edit"
                                                    />
                                                    <Button 
                                                        variant="ghost"
                                                        size="small"
                                                        icon={<Trash2 size={14} />}
                                                        onClick={() => handleDeletePreset(preset.id)}
                                                        title="Delete"
                                                        type="button"
                                                        className="preset-item__action-btn preset-item__action-btn--delete"
                                                    />
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

                        {showPlatformPresetManager && (
                            <div className="panel preset-manager">
                                <div className="preset-manager__header">
                                    <div className="section-title">Manage Platform Charge Presets</div>
                                    <Button 
                                        variant="ghost"
                                        size="small"
                                        icon={<X size={18} />}
                                        onClick={() => setShowPlatformPresetManager(false)}
                                        title="Close"
                                        type="button"
                                        className="preset-manager__close-btn"
                                    />
                                </div>
                                <div className="preset-manager__content">
                                    <div className="preset-manager__form">
                                        <div className="input-field">
                                            <div className="label">Preset Name</div>
                                            <TextInput
                                                value={newPlatformPresetName}
                                                onChange={setNewPlatformPresetName}
                                                placeholder="e.g., Standard Fee"
                                            />
                                        </div>
                                        <div className="input-field">
                                            <div className="label">Amount (₹)</div>
                                            <NumericInput
                                                value={newPlatformPresetAmount}
                                                onChange={setNewPlatformPresetAmount}
                                                placeholder="Enter amount"
                                                min={0}
                                            />
                                        </div>
                                        <div className="preset-manager__form-actions">
                                            {editingPlatformPreset ? (
                                                <>
                                                    <Button 
                                                        variant="primary"
                                                        onClick={handleUpdatePlatformPreset}
                                                        type="button"
                                                        className="main__button"
                                                    >
                                                        Update
                                                    </Button>
                                                    <Button 
                                                        variant="secondary"
                                                        onClick={handleCancelEditPlatform}
                                                        type="button"
                                                        className="main__icon-button"
                                                    >
                                                        Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <Button 
                                                    variant="primary"
                                                    onClick={handleAddPlatformPreset}
                                                    type="button"
                                                    className="main__button"
                                                >
                                                    Add Preset
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="preset-manager__list">
                                        {platformChargePresets.map(preset => (
                                            <div 
                                                key={preset.id} 
                                                className={`preset-item ${editingPlatformPreset?.id === preset.id ? 'preset-item--editing' : ''}`}
                                            >
                                                <div className="preset-item__info">
                                                    <div>
                                                        <span className="preset-item__name">{preset.name}</span>
                                                        <span className="preset-item__percentage">₹{preset.amount}</span>
                                                    </div>
                                                    <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
                                                        Created: {new Date(preset.createdAt).toLocaleDateString()} {new Date(preset.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                        {preset.updatedAt !== preset.createdAt && (
                                                            <> • Modified: {new Date(preset.updatedAt).toLocaleDateString()} {new Date(preset.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="preset-item__actions">
                                                    <button
                                                        className="preset-item__action-btn preset-item__action-btn--edit"
                                                        onClick={() => handleStartEditPlatform(preset)}
                                                        title="Edit preset"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        className="preset-item__action-btn preset-item__action-btn--delete"
                                                        onClick={() => handleDeletePlatformPreset(preset.id)}
                                                        title="Delete preset"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {platformChargePresets.length === 0 && (
                                            <div className="preset-manager__empty">
                                                No platform charge presets yet. Add one above to get started.
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
                                        <NumericInput
                                            value={amount}
                                            onChange={setAmount}
                                            placeholder="Enter amount"
                                            min={0}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <div className="label">
                                            Bank Charge (%)
                                            <Button 
                                                variant="secondary"
                                                onClick={() => setShowPresetManager(!showPresetManager)}
                                                type="button"
                                                style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px' }}
                                                className="main__icon-button"
                                            >
                                                {showPresetManager ? 'Hide' : 'Manage'} Presets
                                            </Button>
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
                                            <div style={{ flex: '1', minWidth: '0' }}>
                                                <NumericInput
                                                    value={bankRatePercentage}
                                                    onChange={(val) => {
                                                        setBankRatePercentage(val);
                                                        setSelectedPresetId(''); // Clear selection when manually changed
                                                    }}
                                                    placeholder="0 - 100"
                                                    min={0}
                                                    max={100}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="input-field">
                                        <div className="label">Our Charge (%)</div>
                                        <NumericInput
                                            value={ourRatePercentage}
                                            onChange={setOurRatePercentage}
                                            placeholder="0 - 100"
                                            min={0}
                                            max={100}
                                        />
                                    </div>
                                    <div className="input-field">
                                        <div className="label">
                                            Platform Charge (₹)
                                            <Button 
                                                variant="secondary"
                                                onClick={() => setShowPlatformPresetManager(!showPlatformPresetManager)}
                                                type="button"
                                                style={{ marginLeft: '8px', padding: '4px 8px', fontSize: '12px' }}
                                                className="main__icon-button"
                                            >
                                                {showPlatformPresetManager ? 'Hide' : 'Manage'} Presets
                                            </Button>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <select
                                                className="control preset-select"
                                                onChange={e => handleSelectPlatformPreset(e.target.value)}
                                                value={selectedPlatformPresetId}
                                                style={{ flex: '1', minWidth: '0' }}
                                            >
                                                <option value="">Select a preset...</option>
                                                {platformChargePresets.map(preset => (
                                                    <option key={preset.id} value={preset.id}>
                                                        {preset.name} (₹{preset.amount})
                                                    </option>
                                                ))}
                                            </select>
                                            <div style={{ flex: '1', minWidth: '0' }}>
                                                <NumericInput
                                                    value={platformRateAmt}
                                                    onChange={(val) => {
                                                        setPlatformRateAmt(val);
                                                        setSelectedPlatformPresetId(''); // Clear selection when manually changed
                                                    }}
                                                    placeholder="Enter platform charge"
                                                    min={0}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="inline">
                                    <div className="pill">GST: {GST}% (fixed)</div>
                                    <Button 
                                        variant="secondary"
                                        icon={<RefreshCcw size={16} />}
                                        onClick={handleRecalculate}
                                        type="button"
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
                                    <Button 
                                        variant="secondary"
                                        icon={<Trash2 size={14} />}
                                        onClick={handleClearAllScenarios}
                                        type="button"
                                        style={{ padding: '6px 12px', fontSize: '13px', color: '#dc3545' }}
                                        title="Clear all saved scenarios"
                                        className="main__icon-button"
                                    >
                                        Clear All
                                    </Button>
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
                                                <Button 
                                                    variant="ghost"
                                                    size="small"
                                                    icon={<Trash2 size={14} />}
                                                    onClick={() => handleDeleteScenario(s.id)}
                                                    title="Delete this scenario"
                                                    type="button"
                                                    className="scenario-delete-btn"
                                                />
                                            </div>
                                            <div className="line"><span>Platform</span><span>{formatAmountAsCurrency(s.platform)}</span></div>
                                            <div className="line" style={{ fontSize: '12px', color: '#666' }}>
                                                <span>Saved: {new Date(s.savedAt).toLocaleDateString()} at {new Date(s.savedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                                            </div>
                                            <div className="inline" style={{ justifyContent: 'space-between', marginTop: 4 }}>
                                                <div className="pill">GST {s.gst}%</div>
                                                <Button 
                                                    variant="secondary"
                                                    icon={<Play size={16} />}
                                                    onClick={() => handleApplyScenario(s)}
                                                    type="button"
                                                    className="main__icon-button"
                                                >
                                                    Apply
                                                </Button>
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

                <DeletePresetConfirmModal
                    isOpen={deletePresetModalOpen}
                    onClose={() => {
                        setDeletePresetModalOpen(false);
                        setPresetToDelete(null);
                    }}
                    onConfirm={handleConfirmDeletePreset}
                    preset={presetToDelete}
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