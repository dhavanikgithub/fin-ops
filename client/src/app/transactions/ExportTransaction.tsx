'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, X, User } from 'lucide-react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import './ExportTransaction.scss';
import ReactDatePicker from '../../components/DatePicker/ReactDatePicker';
import { AutocompleteInput, AutocompleteOption } from '@/components/FormInputs';
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
                    <button className="export-modal__close" onClick={handleClose}>
                        <X size={16} />
                    </button>
                </div>
                <div className="export-modal__body">
                    <div className="export-modal__error-section">
                        <span className="export-modal__error">
                            Something went wrong while preparing the export. Please try again.
                        </span>
                        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginTop: '8px' }}>
                            {process.env.NODE_ENV === 'development' && error.message}
                        </p>
                        <button
                            type="button"
                            className="export-modal__retry"
                            onClick={handleRetry}
                        >
                            Try Again
                        </button>
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

    // Cleanup when modal closes
    useEffect(() => {
        if (!isOpen) {
            dispatch(clearClientAutocomplete());
        }
    }, [isOpen, dispatch]);


    // Client change handler - converts between AutocompleteOption and ExportSettings format
    const handleClientChange = (client: AutocompleteOption | null) => {
        setExportSettings(prev => ({
            ...prev,
            client: client ? { label: client.name, value: client.id } : null
        }));
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
                    const filename = `transaction-report-${exportSettings.startDate}-to-${exportSettings.endDate}.pdf`;

                    transactionService.downloadPDF(pdfContent, filename);

                    // Success feedback
                    toast.success('Report generated and downloaded successfully');

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
        setExportSettings(initialSettings);
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
                    <button className="export-modal__close" onClick={handleCancel}>
                        <X size={16} />
                    </button>
                </div>

                {formErrors.general ? (
                    <div className="export-modal__body">
                        <div className="export-modal__error-section">
                            <span className="export-modal__error">{formErrors.general}</span>
                            <button
                                type="button"
                                className="export-modal__retry"
                                onClick={() => setFormErrors(prev => ({ ...prev, general: undefined }))}
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="export-modal__body">
                            <div className="export-modal__form">
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
                            <button
                                className="export-modal__export"
                                onClick={handleExport}
                                disabled={reportLoading || !exportSettings.startDate || !exportSettings.endDate}
                            >
                                <Download size={16} />
                                {reportLoading ? 'Generating Report...' : 'Export'}
                            </button>
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
