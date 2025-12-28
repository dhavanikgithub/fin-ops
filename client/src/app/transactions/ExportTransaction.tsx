'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, X, User } from 'lucide-react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import './ExportTransaction.scss';
import ReactDatePicker from '../../components/DatePicker/ReactDatePicker';
import { AutocompleteInput, AutocompleteOption, Button, PillToggleGroup } from '@/components/FormInputs';
import logger from '@/utils/logger';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchClientAutocomplete } from '../../store/actions/clientActions';
import { clearClientAutocomplete } from '../../store/slices/clientAutocompleteSlice';
import { generateTransactionReport } from '../../store/actions/transactionActions';
import transactionService from '../../services/transactionService';
import toast from 'react-hot-toast';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExport: (exportSettings: ExportSettings) => void;
}

export interface ExportSettings {
    startDate: string;
    endDate: string;
    client: { label: string; value: number } | null;
}

interface RecentExport {
    id: string;
    timestamp: number;
    settings: ExportSettings;
    dateRangeOption: DateRangeOption;
}

type DateRangeOption = 'today' | 'this-week' | 'this-month' | 'date-range';

const RECENT_EXPORTS_KEY = 'recent_transaction_exports';
const MAX_RECENT_EXPORTS = 5;

// Helper function to compute date ranges
const computeDateRange = (option: DateRangeOption): { startDate: string; endDate: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let startDate: Date;
    let endDate: Date = new Date(today);

    switch (option) {
        case 'today':
            startDate = new Date(today);
            break;
        
        case 'this-week':
            // Start of week (Monday)
            const dayOfWeek = today.getDay();
            const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days, else go back to Monday
            startDate = new Date(today);
            startDate.setDate(today.getDate() + diff);
            break;
        
        case 'this-month':
            // Start of month
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            break;
        
        default:
            // For 'date-range', return empty strings
            return { startDate: '', endDate: '' };
    }

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    };
};

// Error Fallback Component
const ExportErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onClose: () => void;
}> = ({ error, resetErrorBoundary, onClose }) => {
    const handleRetry = () => {
        resetErrorBoundary();
    };

    const handleClose = () => {
        resetErrorBoundary();
        onClose();
    };

    return (
        <div className="export-modal-overlay" onClick={handleClose}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                <div className="export-modal__header">
                    <h2 className="export-modal__title">
                        <X size={18} />
                        Export Error
                    </h2>
                    <Button
                        variant="ghost"
                        size="small"
                        icon={<X size={16} />}
                        onClick={handleClose}
                        className="export-modal__close"
                    />
                </div>
                <div className="export-modal__body">
                    <div className="export-modal__error-section">
                        <span className="export-modal__error">
                            Something went wrong while preparing the export. Please try again.
                        </span>
                        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                            {process.env.NODE_ENV === 'development' && error.message}
                        </p>
                        <Button
                            variant="ghost"
                            size="small"
                            onClick={handleRetry}
                            type="button"
                            className="export-modal__retry"
                        >
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ExportTransactionModalContent: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
    const dispatch = useAppDispatch();
    const { showBoundary } = useErrorBoundary();
    const { items: clientAutocompleteItems, loading: clientLoading } = useAppSelector(state => state.clientAutocomplete);
    const { reportLoading, reportError } = useAppSelector(state => state.transactions);

    // Error states for expected errors
    const [formErrors, setFormErrors] = useState<{
        dateValidation?: string;
        general?: string;
    }>({});

    const initialSettings: ExportSettings = {
        startDate: '',
        endDate: '',
        client: null,
    };
    const [exportSettings, setExportSettings] = useState<ExportSettings>(initialSettings);
    const [selectedDateRange, setSelectedDateRange] = useState<DateRangeOption>('today');
    const [recentExports, setRecentExports] = useState<RecentExport[]>([]);

    const [dateValidationError, setDateValidationError] = useState<string>('');

    // Client search handler
    const handleClientSearch = useCallback((searchTerm: string) => {
        try {
            if (searchTerm.trim()) {
                dispatch(fetchClientAutocomplete({ search: searchTerm, limit: 5 }));
            } else {
                dispatch(clearClientAutocomplete());
            }
        } catch (error) {
            logger.error('Unexpected error during client search:', error);
            toast.error('Failed to search clients. Please try again.');
        }
    }, [dispatch]);

    // Initialize dates with 'today' on component mount
    useEffect(() => {
        const { startDate, endDate } = computeDateRange('today');
        setExportSettings(prev => ({
            ...prev,
            startDate,
            endDate
        }));

        // Load recent exports from localStorage
        try {
            const savedRecents = localStorage.getItem(RECENT_EXPORTS_KEY);
            if (savedRecents) {
                const parsed = JSON.parse(savedRecents) as RecentExport[];
                setRecentExports(parsed);
                logger.log('Loaded recent exports:', parsed);
            }
        } catch (error) {
            logger.error('Failed to load recent exports:', error);
        }
    }, []);

    // Cleanup when modal closes
    useEffect(() => {
        if (!isOpen) {
            dispatch(clearClientAutocomplete());
        }
    }, [isOpen, dispatch]);

    // Handle date range option change
    const handleDateRangeOptionChange = (option: string | number | (string | number)[]) => {
        // Since we're using radio mode, we'll only receive a single value
        const selectedOption = option as DateRangeOption;
        setSelectedDateRange(selectedOption);
        
        // Clear any existing validation errors
        setFormErrors(prev => ({ ...prev, dateValidation: undefined }));
        
        if (selectedOption !== 'date-range') {
            // Auto-compute dates for preset options
            const { startDate, endDate } = computeDateRange(selectedOption);
            setExportSettings(prev => ({
                ...prev,
                startDate,
                endDate
            }));
            logger.log(`Auto-computed dates for ${selectedOption}:`, { startDate, endDate });
        } else {
            // Clear dates when switching to custom date range
            setExportSettings(prev => ({
                ...prev,
                startDate: '',
                endDate: ''
            }));
        }
    };

    // Client change handler - converts between AutocompleteOption and ExportSettings format
    const handleClientChange = (client: AutocompleteOption | null) => {
        setExportSettings(prev => ({
            ...prev,
            client: client ? { label: client.name, value: client.id } : null
        }));
    };

    // Save recent export to localStorage
    const saveRecentExport = (settings: ExportSettings, dateRangeOption: DateRangeOption) => {
        try {
            // Check if an export with the same settings already exists
            const existingIndex = recentExports.findIndex(recent => 
                recent.settings.startDate === settings.startDate &&
                recent.settings.endDate === settings.endDate &&
                recent.settings.client?.value === settings.client?.value &&
                recent.dateRangeOption === dateRangeOption
            );

            let updatedRecents: RecentExport[];

            if (existingIndex !== -1) {
                // Update existing export's timestamp and move to top
                const existingExport = recentExports[existingIndex];
                const updatedExport: RecentExport = {
                    ...existingExport,
                    timestamp: Date.now()
                };
                
                // Remove the old entry and add updated one at the beginning
                updatedRecents = [
                    updatedExport,
                    ...recentExports.filter((_, index) => index !== existingIndex)
                ];
                
                logger.log('Updated existing recent export:', updatedExport);
            } else {
                // Create new export entry
                const newRecent: RecentExport = {
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    settings: { ...settings },
                    dateRangeOption
                };

                updatedRecents = [newRecent, ...recentExports]
                    .slice(0, MAX_RECENT_EXPORTS);
                
                logger.log('Saved new recent export:', newRecent);
            }

            setRecentExports(updatedRecents);
            localStorage.setItem(RECENT_EXPORTS_KEY, JSON.stringify(updatedRecents));
        } catch (error) {
            logger.error('Failed to save recent export:', error);
        }
    };

    // Apply recent export settings
    const applyRecentExport = (recent: RecentExport) => {
        setExportSettings(recent.settings);
        setSelectedDateRange(recent.dateRangeOption);
        toast.success('Applied recent export settings');
        logger.log('Applied recent export:', recent);
    };

    // Delete a recent export
    const deleteRecentExport = (id: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent triggering applyRecentExport
        try {
            const updatedRecents = recentExports.filter(item => item.id !== id);
            setRecentExports(updatedRecents);
            localStorage.setItem(RECENT_EXPORTS_KEY, JSON.stringify(updatedRecents));
            toast.success('Removed from recent exports');
            logger.log('Deleted recent export:', id);
        } catch (error) {
            logger.error('Failed to delete recent export:', error);
            toast.error('Failed to remove recent export');
        }
    };

    const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
        const dateString = date ? date.toISOString().split('T')[0] : '';

        // Clear any existing validation errors
        setFormErrors(prev => ({ ...prev, dateValidation: undefined }));
        setDateValidationError('');

        setExportSettings(prev => {
            const newSettings = {
                ...prev,
                [field]: dateString
            };

            // Validate dates after update (Expected Error Handling)
            if (field === 'startDate' && prev.endDate && dateString) {
                // If setting start date and end date exists, check if start date is after end date
                if (new Date(dateString) > new Date(prev.endDate)) {
                    const errorMsg = 'Start date cannot be after end date. End date has been cleared.';
                    logger.warn(errorMsg);
                    setFormErrors(prev => ({ ...prev, dateValidation: errorMsg }));
                    return prev; // Don't update if invalid
                }
            } else if (field === 'endDate' && prev.startDate && dateString) {
                // If setting end date and start date exists, check if end date is before start date
                if (new Date(dateString) < new Date(prev.startDate)) {
                    const errorMsg = 'End date must be after start date. Please select a valid end date.';
                    logger.warn(errorMsg);
                    setFormErrors(prev => ({ ...prev, dateValidation: errorMsg }));
                    return prev; // Don't update if invalid
                }
            }

            return newSettings;
        });
    };


    const validateExportSettings = (): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];

        // Expected validation errors
        if (!exportSettings.startDate) {
            errors.push('Start date is required');
        }

        if (!exportSettings.endDate) {
            errors.push('End date is required');
        }

        if (exportSettings.startDate && exportSettings.endDate) {
            if (new Date(exportSettings.startDate) > new Date(exportSettings.endDate)) {
                errors.push('End date must be after start date');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    };

    const handleExport = async () => {
        try {
            // Clear previous errors
            setFormErrors({});

            // Validate form (Expected Error Handling)
            const validation = validateExportSettings();
            if (!validation.isValid) {
                setFormErrors({
                    general: validation.errors.join('. ')
                });
                return;
            }

            logger.log('Starting transaction report generation...', exportSettings);

            // Convert settings to export request format
            const reportRequest = {
                startDate: exportSettings.startDate,
                endDate: exportSettings.endDate,
                clientId: exportSettings.client?.value?.toString() || null,
            };

            const result = await dispatch(generateTransactionReport(reportRequest));

            if (generateTransactionReport.fulfilled.match(result)) {
                logger.log('Report generated successfully:', result.payload);

                try {
                    // Download the PDF (Potential unexpected error)
                    const pdfContent = result.payload.data.pdfContent;
                    const filename = result.payload.data.filename;

                    transactionService.downloadPDF(pdfContent, filename);

                    // Success feedback
                    toast.success('Report generated and downloaded successfully');

                    // Save to recent exports
                    saveRecentExport(exportSettings, selectedDateRange);

                    // Call the parent onExport callback for any additional handling
                    onExport(exportSettings);
                    onClose();
                } catch (downloadError) {
                    // Handle unexpected errors during download
                    logger.error('Unexpected error during PDF download:', downloadError);
                    showBoundary(downloadError);
                }
            } else if (generateTransactionReport.rejected.match(result)) {
                // Expected API errors (like "No transactions found")
                const errorMessage = result.payload || 'Failed to generate report';
                setFormErrors({ general: errorMessage });
            }
        } catch (error) {
            // Catch any unexpected errors
            logger.error('Unexpected error during export:', error);

            // Use error boundary for unexpected errors
            showBoundary(error);
        }
    };

    const handleCancel = () => {
        // Reset all error states when closing
        setFormErrors({});
        setDateValidationError('');
        const { startDate, endDate } = computeDateRange('today');
        setExportSettings({ ...initialSettings, startDate, endDate });
        setSelectedDateRange('today');
        onClose();
    };

    return (
        <div className="export-modal-overlay" onClick={handleCancel}>
            <div className="export-modal" onClick={(e) => e.stopPropagation()}>
                <div className="export-modal__header">
                    <h2 className="export-modal__title">
                        <Download size={18} />
                        Export Transactions
                    </h2>
                    <Button 
                        variant="ghost"
                        size="small"
                        icon={<X size={16} />}
                        onClick={handleCancel}
                        className="export-modal__close"
                    />
                </div>

                {formErrors.general ? (
                    <div className="export-modal__body">
                        <div className="export-modal__error-section">
                            <span className="export-modal__error">{formErrors.general}</span>
                            <Button 
                                variant="ghost"
                                size="small"
                                onClick={() => setFormErrors(prev => ({ ...prev, general: undefined }))}
                                type="button"
                                className="export-modal__retry"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="export-modal__body">
                            <div className="export-modal__form">
                                {recentExports.length > 0 && (
                                    <div className="export-modal__field export-modal__field--full">
                                        <label className="export-modal__label">Recent Exports</label>
                                        <div className="export-modal__recents">
                                            {recentExports.map((recent) => {
                                                const isToday = recent.settings.startDate === recent.settings.endDate;
                                                const dateLabel = isToday
                                                    ? new Date(recent.settings.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                                                    : `${new Date(recent.settings.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - ${new Date(recent.settings.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;
                                                
                                                return (
                                                    <div
                                                        key={recent.id}
                                                        className="export-modal__recent-item"
                                                        onClick={() => applyRecentExport(recent)}
                                                    >
                                                        <div className="export-modal__recent-info">
                                                            <span className="export-modal__recent-date">{dateLabel}</span>
                                                            {recent.settings.client && (
                                                                <span className="export-modal__recent-client">
                                                                    <User size={12} />
                                                                    {recent.settings.client.label}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="export-modal__recent-actions">
                                                            <span className="export-modal__recent-time">
                                                                {new Date(recent.timestamp).toLocaleDateString('en-GB', { 
                                                                    day: 'numeric', 
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                            <button
                                                                className="export-modal__recent-delete"
                                                                onClick={(e) => deleteRecentExport(recent.id, e)}
                                                                type="button"
                                                                title="Remove from recent exports"
                                                            >
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="export-modal__field">
                                    <label className="export-modal__label">Time Period</label>
                                    <PillToggleGroup
                                        type="radio"
                                        value={selectedDateRange}
                                        onChange={handleDateRangeOptionChange}
                                        options={[
                                            { label: 'Today', value: 'today' },
                                            { label: 'This Week', value: 'this-week' },
                                            { label: 'This Month', value: 'this-month' },
                                            { label: 'Date Range', value: 'date-range' }
                                        ]}
                                    />
                                    {selectedDateRange !== 'date-range' && exportSettings.startDate && exportSettings.endDate && (
                                        <div className="export-modal__date-info">
                                            <span className="export-modal__date-badge">
                                                {new Date(exportSettings.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                {exportSettings.startDate !== exportSettings.endDate && (
                                                    <>
                                                        {' '}- {new Date(exportSettings.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                {selectedDateRange === 'date-range' && (
                                    <div className="export-modal__field">
                                        <label className="export-modal__label">Date range</label>
                                        <div className="export-modal__date-row">
                                            <ReactDatePicker
                                                value={exportSettings.startDate}
                                                onChange={(date) => handleDateChange('startDate')(date as Date | null)}
                                                placeholder="Start date"
                                                className="export-modal__input"
                                                maxDateToday={true}
                                                options={{
                                                    mode: 'single',
                                                    format: 'd-m-Y',
                                                    showIcon: true,
                                                    iconPosition: 'right',
                                                    closeOnSelect: true,
                                                    allowInput: false,
                                                    blockFutureDates: true,
                                                    enableMonthDropdown: true,
                                                    enableYearDropdown: true,
                                                    iconClickOpens: true,
                                                    maxDate: new Date(),
                                                    onSelect: (date) => {
                                                        logger.log('Start date selected:', date);
                                                    }
                                                }}
                                            />
                                            <ReactDatePicker
                                                value={exportSettings.endDate}
                                                onChange={(date) => handleDateChange('endDate')(date as Date | null)}
                                                placeholder="End date"
                                                className="export-modal__input"
                                                maxDateToday={true}
                                                options={{
                                                    mode: 'single',
                                                    format: 'd-m-Y',
                                                    showIcon: true,
                                                    iconPosition: 'right',
                                                    closeOnSelect: true,
                                                    allowInput: false,
                                                    blockFutureDates: true,
                                                    enableMonthDropdown: true,
                                                    enableYearDropdown: true,
                                                    iconClickOpens: true,
                                                    maxDate: new Date(),
                                                    onSelect: (date) => {
                                                        logger.log('End date selected:', date);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                                
                                <div className="export-modal__field">
                                    <label className="export-modal__label">Client</label>
                                    <AutocompleteInput
                                        value={exportSettings.client ? { id: exportSettings.client.value, name: exportSettings.client.label } : null}
                                        onChange={handleClientChange}
                                        options={clientAutocompleteItems}
                                        loading={clientLoading}
                                        placeholder="Search client..."
                                        icon={<User size={16} />}
                                        onSearch={handleClientSearch}
                                        hint="Optional: Filter report by specific client."
                                    />
                                </div>

                            </div>
                        </div>
                        <div className="export-modal__footer">
                            <Button 
                                variant="primary"
                                icon={<Download size={16} />}
                                onClick={handleExport}
                                disabled={reportLoading || !exportSettings.startDate || !exportSettings.endDate}
                                className="export-modal__export"
                            >
                                {reportLoading ? 'Generating Report...' : 'Export'}
                            </Button>
                        </div>
                    </>
                )}


            </div>
        </div>
    );
};

// Main wrapper component with ErrorBoundary
const ExportTransactionModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
    if (!isOpen) return null;

    return (
        <ErrorBoundary
            FallbackComponent={(props) => (
                <ExportErrorFallback {...props} onClose={onClose} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Export Modal Error Boundary caught an error:', error, errorInfo);
                toast.error('Export functionality encountered an error');
            }}
            onReset={() => {
                logger.log('Export Modal Error Boundary reset');
            }}
        >
            <ExportTransactionModalContent
                isOpen={isOpen}
                onClose={onClose}
                onExport={onExport}
            />
        </ErrorBoundary>
    );
};

export default ExportTransactionModal;
