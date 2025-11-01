'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, X, User } from 'lucide-react';
import './ExportTransaction.scss';
import ReactDatePicker from '../../components/DatePicker/ReactDatePicker';
import logger from '@/utils/logger';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchClientAutocomplete } from '../../store/actions/clientActions';
import { clearClientAutocomplete } from '../../store/slices/clientAutocompleteSlice';
import { generateTransactionReport } from '../../store/actions/transactionActions';
import transactionService from '../../services/transactionService';

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

const ExportTransactionModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
    const dispatch = useAppDispatch();
    const { items: clientAutocompleteItems, loading: clientLoading } = useAppSelector(state => state.clientAutocomplete);
    const { reportLoading, reportError } = useAppSelector(state => state.transactions);


    const initialSettings: ExportSettings = {
        startDate: '',
        endDate: '',
        client: null,
    };
    const [exportSettings, setExportSettings] = useState<ExportSettings>(initialSettings);

    const [dateValidationError, setDateValidationError] = useState<string>('');
    const [clientSearch, setClientSearch] = useState('');
    const [clientHighlightedIndex, setClientHighlightedIndex] = useState(0);

    // Debounced timer for client search
    const clientSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Memoized debounced client search
    const debouncedClientSearch = useCallback((searchTerm: string) => {
        if (clientSearchDebounceTimer.current) {
            clearTimeout(clientSearchDebounceTimer.current);
        }

        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                dispatch(fetchClientAutocomplete({ search: searchTerm, limit: 5 }));
            } else {
                dispatch(clearClientAutocomplete());
            }
        }, 300);

        clientSearchDebounceTimer.current = timer;
    }, [dispatch]);

    // Cleanup timer when modal closes
    useEffect(() => {
        if (!isOpen) {
            setClientSearch('');
            setClientHighlightedIndex(0);
        }

        return () => {
            if (clientSearchDebounceTimer.current) {
                clearTimeout(clientSearchDebounceTimer.current);
            }
        };
    }, [isOpen, dispatch]);

    // Trigger search when client search term changes
    useEffect(() => {
        if (clientSearch.trim()) {
            debouncedClientSearch(clientSearch);
        } else if (clientSearch === '') {
            dispatch(clearClientAutocomplete());
        }
    }, [clientSearch, debouncedClientSearch, dispatch]);

    // Reset highlighted index when items change
    useEffect(() => {
        if (clientAutocompleteItems.length > 0) {
            setClientHighlightedIndex(0);
        }
    }, [clientAutocompleteItems.length]);


    // Keyboard navigation for client search
    const handleClientKeyDown = (e: React.KeyboardEvent) => {
        const availableClients = clientAutocompleteItems;
        if (!clientSearch || availableClients.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setClientHighlightedIndex(prev =>
                    prev < availableClients.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setClientHighlightedIndex(prev =>
                    prev > 0 ? prev - 1 : availableClients.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (availableClients.length > 0) {
                    const selectedClient = availableClients[clientHighlightedIndex];
                    setExportSettings(prev => ({
                        ...prev,
                        client: { label: selectedClient.name, value: selectedClient.id }
                    }));
                    setClientSearch('');
                    setClientHighlightedIndex(0);
                    dispatch(clearClientAutocomplete());
                }
                break;
            case 'Escape':
                e.preventDefault();
                setClientSearch('');
                setClientHighlightedIndex(0);
                dispatch(clearClientAutocomplete());
                break;
        }
    };

    // Render client autocomplete with token display
    const renderClientAutocomplete = () => {
        return (
            <div className="export-modal__client-field">
                {exportSettings.client ? (
                    <div className="export-modal__client-selected">
                        <div className="export-modal__client-token">
                            <User size={14} />
                            <span>{exportSettings.client.label}</span>
                            <button
                                type="button"
                                className="export-modal__token-remove"
                                onClick={() => setExportSettings(prev => ({ ...prev, client: null }))}
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="export-modal__client-search" style={{ position: 'relative' }}>
                        <input
                            type="text"
                            className="export-modal__input"
                            placeholder="Search client..."
                            value={clientSearch}
                            onChange={e => setClientSearch(e.target.value)}
                            onKeyDown={handleClientKeyDown}
                            autoComplete="off"
                        />
                        {clientSearch && (
                            <div className="export-modal__dropdown">
                                {clientLoading ? (
                                    <div className="export-modal__dropdown-item export-modal__dropdown-item--loading">
                                        Loading clients...
                                    </div>
                                ) : clientAutocompleteItems.length > 0 ? (
                                    clientAutocompleteItems.map((client, index) => (
                                        <div
                                            key={client.id}
                                            className={`export-modal__dropdown-item ${index === clientHighlightedIndex ? 'export-modal__dropdown-item--highlighted' : ''}`}
                                            onClick={() => {
                                                setExportSettings(prev => ({
                                                    ...prev,
                                                    client: { label: client.name, value: client.id }
                                                }));
                                                setClientSearch('');
                                                setClientHighlightedIndex(0);
                                                dispatch(clearClientAutocomplete());
                                            }}
                                            onMouseEnter={() => setClientHighlightedIndex(index)}
                                        >
                                            {client.name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="export-modal__dropdown-item export-modal__dropdown-item--no-results">
                                        No clients found
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const handleSettingChange = (field: keyof ExportSettings, value: string) => {
        setExportSettings(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
        const dateString = date ? date.toISOString().split('T')[0] : '';

        // Clear any existing validation errors
        setDateValidationError('');

        setExportSettings(prev => {
            const newSettings = {
                ...prev,
                [field]: dateString
            };

            // Validate dates after update
            if (field === 'startDate' && prev.endDate && dateString) {
                // If setting start date and end date exists, check if start date is after end date
                if (new Date(dateString) > new Date(prev.endDate)) {
                    logger.warn('Start date cannot be after end date. Clearing end date.');
                    setDateValidationError('Start date cannot be after end date. End date has been cleared.');
                    return prev;
                }
            } else if (field === 'endDate' && prev.startDate && dateString) {
                // If setting end date and start date exists, check if end date is before start date
                if (new Date(dateString) < new Date(prev.startDate)) {
                    logger.warn('End date cannot be before start date. Please select a valid end date.');
                    setDateValidationError('End date must be after start date. Please select a valid end date.');
                    // Don't update the end date if it's invalid
                    return prev;
                }
            }

            return newSettings;
        });
    };


    const handleExport = async () => {
        // Validate dates before export
        if (exportSettings.startDate && exportSettings.endDate) {
            if (new Date(exportSettings.startDate) > new Date(exportSettings.endDate)) {
                setDateValidationError('Cannot export: End date must be after start date.');
                return;
            }
        }

        if (!exportSettings.startDate || !exportSettings.endDate) {
            setDateValidationError('Please select both start and end dates.');
            return;
        }

        // Clear any validation errors
        setDateValidationError('');

        try {
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
                
                // Download the PDF
                const pdfContent = result.payload.data.pdfContent;
                const filename = `transaction-report-${exportSettings.startDate}-to-${exportSettings.endDate}.pdf`;
                
                transactionService.downloadPDF(pdfContent, filename);
                
                // Call the parent onExport callback for any additional handling
                onExport(exportSettings);
                onClose();
            } else if (generateTransactionReport.rejected.match(result)) {
                throw new Error(result.payload as string || 'Failed to generate report');
            }
        } catch (error) {
            logger.error('Export failed:', error);
            setDateValidationError('Export failed. Please try again.');
        }
    };

    const handleCancel = () => {
        onClose();
        setExportSettings(initialSettings);
        setDateValidationError('');
    };

    if (!isOpen) return null;

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
                            {(dateValidationError || reportError) && (
                                <span className="export-modal__error">
                                    {dateValidationError || reportError}
                                </span>
                            )}
                        </div>

                        <div className="export-modal__field">
                            <label className="export-modal__label">Client</label>
                            {renderClientAutocomplete()}
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
            </div>
        </div>
    );
};

export default ExportTransactionModal;
