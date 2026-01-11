'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Download, ArrowDownLeft, ArrowUpRight, SlidersHorizontal, Search, Edit, Trash, X, Check, Banknote, CreditCard, User, AlertTriangle, RotateCcw, Home, Funnel } from 'lucide-react';
import { AutocompleteInput, AutocompleteOption, SearchInput, NumericInput, TextArea, PillToggleGroup, Button } from '@/components/FormInputs';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
    fetchTransactions,
    searchTransactions,
    applyFilters,
    deleteTransaction,
    editTransaction
} from '../../store/actions/transactionActions';
import {
    setSearchQuery,
    setFilters,
    clearError
} from '../../store/slices/transactionSlice';
import { fetchBankAutocomplete } from '../../store/actions/bankActions';
import { clearBankAutocomplete } from '../../store/slices/bankAutocompleteSlice';
import { fetchCardAutocomplete } from '../../store/actions/cardActions';
import { clearCardAutocomplete } from '../../store/slices/cardAutocompleteSlice';
import { fetchClientAutocomplete } from '../../store/actions/clientActions';
import { clearClientAutocomplete } from '../../store/slices/clientAutocompleteSlice';
import { convertUIFiltersToAPI, getActiveFilterCount } from '../../utils/filterUtils';
import { isDeposit, isWithdraw, getTransactionTypeLabel } from '../../utils/transactionUtils';
import { Transaction } from '../../services/transactionService';
import Table from './TransactionTable';
import TransactionFilterModal, { FilterValues } from './TransactionFilterModal';
import ExportTransactionModal, { ExportSettings } from './ExportTransaction';
import DeleteTransactionConfirmModal from './DeleteTransactionConfirmModal';
import './TransactionList.scss';
import useStateWithRef from '@/hooks/useStateWithRef';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

// localStorage key for persisting filters
const FILTERS_STORAGE_KEY = 'transaction_filters';

interface TransactionListProps {
    onDeposit: () => void;
    onWithdraw: () => void;
}

// Error Fallback Component for Search Bar
const SearchBarErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="main__search-row">
            <div className="tl__search-error">
                <span className="tl__search-error-message">Search unavailable</span>
                <Button
                    variant="ghost"
                    size="small"
                    icon={<RotateCcw size={14} />}
                    onClick={resetErrorBoundary}
                    title="Retry search"
                    className="tl__search-error-retry"
                />
            </div>
            {process.env.NODE_ENV === 'development' && (
                <div className="tl__search-error-details" title={`Error: ${error.message}`}>
                    ⚠️
                </div>
            )}
        </div>
    );
};

// Search Bar Component
const SearchBar: React.FC<{
    localSearchQuery: string;
    loading: boolean;
    onSearchChange: (value: string) => void;
}> = ({ localSearchQuery, loading, onSearchChange }) => {
    const { showBoundary } = useErrorBoundary();
    try {
        return (
            <SearchInput
                value={localSearchQuery}
                onChange={onSearchChange}
                placeholder="Search transactions..."
                loading={loading}
            />
        );
    } catch (error) {
        logger.error('Error in search bar component:', error);
        showBoundary(error);
    }
};

// Error Fallback Component for Transaction List
const TransactionListErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onDeposit: () => void;
    onWithdraw: () => void;
}> = ({ error, resetErrorBoundary, onDeposit, onWithdraw }) => {
    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <AlertTriangle size={16} />
                    <h1>Error - Transactions</h1>
                </div>
                <div className="main__header-right">
                    <Button variant="secondary" icon={<ArrowDownLeft size={16} />} onClick={onDeposit}>
                        Deposit
                    </Button>
                    <Button variant="secondary" icon={<ArrowUpRight size={16} />} onClick={onWithdraw}>
                        Withdraw
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="tl__error-boundary">
                        <div className="tl__error-boundary-content">
                            <AlertTriangle size={64} className="tl__error-boundary-icon" />
                            <h2 className="tl__error-boundary-title">Something went wrong</h2>
                            <p className="tl__error-boundary-message">
                                We encountered an unexpected error while loading the transactions list.
                                Your transaction data is safe. You can try refreshing or add a new transaction.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="tl__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="tl__error-boundary-stack">
                                        {error.message}
                                        {error.stack && '\n\nStack trace:\n' + error.stack}
                                    </pre>
                                </details>
                            )}
                            <div className="tl__error-boundary-actions">
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
                                    icon={<ArrowDownLeft size={16} />}
                                    onClick={onDeposit}
                                    className="main__icon-button"
                                >
                                    Add Deposit
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
        </>
    );
};

const TransactionListContent: React.FC<TransactionListProps> = ({ onDeposit, onWithdraw }) => {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useAppDispatch();
    const {
        transactions,
        loading,
        error,
        searchQuery: reduxSearchQuery,
        pagination,
        hasMore,
        editingTransactionIds,
        deletingTransactionIds
    } = useAppSelector((state) => state.transactions);

    const { items: bankAutocompleteItems, loading: bankLoading } = useAppSelector(state => state.bankAutocomplete);
    const { items: cardAutocompleteItems, loading: cardLoading } = useAppSelector(state => state.cardAutocomplete);
    const { items: clientAutocompleteItems, loading: clientLoading } = useAppSelector(state => state.clientAutocomplete);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransactionWithRef, selectedTransactionRef] = useStateWithRef<Transaction | null>(null);
    
    // Initialize filters from localStorage or default values
    const getInitialFilters = (): FilterValues => {
        try {
            const savedFilters = localStorage.getItem(FILTERS_STORAGE_KEY);
            if (savedFilters) {
                const parsed = JSON.parse(savedFilters);
                logger.log('Loaded filters from localStorage:', parsed);
                return parsed;
            }
        } catch (error) {/** empty */}
        return {
            types: [],
            minAmount: '',
            maxAmount: '',
            startDate: '',
            endDate: '',
            banks: [],
            cards: [],
            clients: []
        };
    };
    
    const [activeFilters, setActiveFilters] = useState<FilterValues>(getInitialFilters());
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Load initial transactions and apply saved filters
    useEffect(() => {
        // Check if there are any active filters
        const hasActiveFilters = activeFilters.types.length > 0 ||
            activeFilters.minAmount !== '' ||
            activeFilters.maxAmount !== '' ||
            activeFilters.startDate !== '' ||
            activeFilters.endDate !== '' ||
            activeFilters.banks.length > 0 ||
            activeFilters.cards.length > 0 ||
            activeFilters.clients.length > 0;

        if (hasActiveFilters) {
            // Apply saved filters
            const apiFilters = convertUIFiltersToAPI(activeFilters);
            dispatch(setFilters(apiFilters));
            dispatch(applyFilters(apiFilters));
            logger.log('Applied saved filters on mount:', activeFilters);
        } else {
            // Load all transactions if no filters
            dispatch(fetchTransactions());
        }
    }, [dispatch]);

    // Save filters to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(activeFilters));
            logger.log('Saved filters to localStorage:', activeFilters);
        } catch (error) {
            logger.error('Failed to save filters to localStorage:', error);
        }
    }, [activeFilters]);

    // Handle search with debouncing
    const handleSearchChange = useCallback((value: string) => {
        try {
            setLocalSearchQuery(value);

            // Clear existing timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            // Set new timeout for debounced search
            const timeout = setTimeout(() => {
                dispatch(setSearchQuery(value));
                if (value.trim()) {
                    dispatch(searchTransactions(value.trim()));
                } else {
                    dispatch(fetchTransactions());
                }
            }, 500); // 500ms debounce

            setSearchTimeout(timeout);
        }
        catch (error) {
            logger.error("Error occurred while searching:", error);
            throw error;
        }
    }, [dispatch, searchTimeout]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Search handlers for autocomplete
    const handleBankSearch = useCallback((searchTerm: string) => {
        if (searchTerm.trim()) {
            dispatch(fetchBankAutocomplete({ search: searchTerm, limit: 5 }));
        } else {
            dispatch(clearBankAutocomplete());
        }
    }, [dispatch]);

    const handleCardSearch = useCallback((searchTerm: string) => {
        if (searchTerm.trim()) {
            dispatch(fetchCardAutocomplete({ search: searchTerm, limit: 5 }));
        } else {
            dispatch(clearCardAutocomplete());
        }
    }, [dispatch]);

    const handleClientSearch = useCallback((searchTerm: string) => {
        if (searchTerm.trim()) {
            dispatch(fetchClientAutocomplete({ search: searchTerm, limit: 5 }));
        } else {
            dispatch(clearClientAutocomplete());
        }
    }, [dispatch]);

    const handleOpenFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const handleCloseFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleOpenExportModal = () => {
        setIsExportModalOpen(true);
    };

    const handleCloseExportModal = () => {
        setIsExportModalOpen(false);
    };

    const handleApplyFilters = (filters: FilterValues) => {
        setActiveFilters(filters);

        // Convert UI filters to API format
        const apiFilters = convertUIFiltersToAPI(filters);

        // Update Redux state and fetch filtered data
        dispatch(setFilters(apiFilters));
        dispatch(applyFilters(apiFilters));

        logger.log('Applied filters:', filters);
    };

    const handleExport = (exportSettings: ExportSettings) => {
        logger.log('Exporting with settings:', exportSettings);
        // Handle export logic here
    };

    const handleTransactionSelect = (transaction: Transaction) => {
        setSelectedTransactionWithRef(transaction);
    };

    const handleDeselectTransaction = () => {
        setSelectedTransactionWithRef(null);
    };

    const handleDeleteTransaction = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async (transactionId: string) => {
        if (!transactionId) return;

        const transactionIdNum = Number(transactionId);
        try {
            await dispatch(deleteTransaction(transactionIdNum)).unwrap();
            setIsDeleteModalOpen(false);
            // Use the latest `selectedTransaction` from the ref
            if (transactionId === selectedTransactionRef.current?.id.toString()) {
                setSelectedTransactionWithRef(null);
            }
        } catch (error) {
            logger.error(`Failed to delete transaction ${transactionId}:`, error);
            toast.error('Failed to delete transaction.');
        } finally {
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const handleSaveTransaction = async (transaction: Transaction) => {
        if (!transaction) return;

        try {
            await dispatch(editTransaction(transaction)).unwrap();
            logger.log('Transaction updated successfully');
        } catch (error) {
            logger.error('Failed to update transaction:', error);
            toast.error('Failed to update transaction.');
        } finally {
        }
    };

    const handleTransactionFieldChange = (field: keyof Transaction, value: any) => {
        if (!selectedTransaction) return;
        setSelectedTransactionWithRef({
            ...selectedTransaction,
            [field]: value
        });
    };

    const handleBankChange = (bank: AutocompleteOption | null) => {
        if (!selectedTransaction) return;
        setSelectedTransactionWithRef({
            ...selectedTransaction,
            bank_name: bank?.name || '',
            bank_id: bank?.id || null
        });
        dispatch(clearBankAutocomplete());
    };

    const handleCardChange = (card: AutocompleteOption | null) => {
        if (!selectedTransaction) return;
        setSelectedTransactionWithRef({
            ...selectedTransaction,
            card_name: card?.name || '',
            card_id: card?.id || null
        });
        dispatch(clearCardAutocomplete());
    };

    const handleClientChange = (client: AutocompleteOption | null) => {
        if (!selectedTransaction) return;
        setSelectedTransactionWithRef({
            ...selectedTransaction,
            client_name: client?.name || '',
            client_id: client?.id || 0
        });
        dispatch(clearClientAutocomplete());
    };

    const filterCount = getActiveFilterCount(activeFilters);

    // Convert transaction for delete modal
    const getModalTransaction = () => {
        if (!selectedTransaction) return null;
        return {
            id: selectedTransaction.id.toString(),
            date: selectedTransaction.create_date,
            time: selectedTransaction.create_time,
            client: selectedTransaction.client_name,
            type: getTransactionTypeLabel(selectedTransaction.transaction_type),
            amount: selectedTransaction.transaction_amount,
            charges: selectedTransaction.widthdraw_charges,
            bank: selectedTransaction.bank_name || '-',
            card: selectedTransaction.card_name || '-',
            notes: selectedTransaction.remark
        };
    };

    // Helper function to check if a transaction ID is in deletingTransactionIds
    const isTransactionBeingDeleted = (
        transactionId: number,
        deletingTransactionIds: number[]
    ): boolean => {
        return deletingTransactionIds.includes(transactionId);
    };

    // Helper function to check if a transaction ID is in editingTransactionIds
    const isTransactionBeingSaved = (
        transactionId: number,
        editingTransactionIds: number[]
    ): boolean => {
        return editingTransactionIds.includes(transactionId);
    };

    // Helper function to check if a transaction is being processed (saved or deleted)
    const isTransactionBeingProcessed = (
        transactionId: number,
        editingTransactionIds: number[],
        deletingTransactionIds: number[]
    ): boolean => {
        return isTransactionBeingSaved(transactionId, editingTransactionIds) || isTransactionBeingDeleted(transactionId, deletingTransactionIds);
    };

    const isSelectedTransactionBeingProcessed = (
        selectedTransaction: Transaction | null,
        editingTransactionIds: number[],
        deletingTransactionIds: number[]
    ): boolean => {
        if (!selectedTransaction) return false;
        return isTransactionBeingProcessed(selectedTransaction.id, editingTransactionIds, deletingTransactionIds);
    };

    try {
        return (
            <>
                <header className="main__header">
                    <div className="main__header-left">
                        <h1>Transactions</h1>
                    </div>
                    <div className="main__header-right">
                        <Button variant="secondary" icon={<Download size={16} />} onClick={handleOpenExportModal}>
                            Export
                        </Button>
                        <Button variant="primary" icon={<ArrowDownLeft size={16} />} onClick={onDeposit}>
                            Deposit
                        </Button>
                        <Button variant="primary" icon={<ArrowUpRight size={16} />} onClick={onWithdraw}>
                            Withdraw
                        </Button>
                    </div>
                </header>

                <div className="main__content">

                    <div className="main__view">
                        <div className="main__view-header">
                            <ErrorBoundary
                                FallbackComponent={SearchBarErrorFallback}
                                onError={(error, errorInfo) => {
                                    logger.error('Search bar error boundary triggered:', {
                                        error: error.message,
                                        stack: error.stack,
                                        errorInfo,
                                        timestamp: new Date().toISOString()
                                    });
                                    toast.error('Search temporarily unavailable. Transaction list still works.');
                                }}
                            >
                                <SearchBar
                                    localSearchQuery={localSearchQuery}
                                    loading={loading}
                                    onSearchChange={handleSearchChange}
                                />
                            </ErrorBoundary>
                            <div className="main__actions">
                                <Button
                                    variant="secondary"
                                    icon={<Funnel size={16} />}
                                    onClick={handleOpenFilterModal}
                                    badge={filterCount > 0 ? filterCount : undefined}
                                    className={`main__icon-button ${filterCount > 0 ? 'main__icon-button--active' : ''}`}
                                >
                                    Filters
                                </Button>
                            </div>
                        </div>

                        <Table
                            selectedTransaction={selectedTransaction}
                            onTransactionSelect={handleTransactionSelect}
                        />
                        {pagination && (
                            <span className="main__subtitle">
                                Showing {transactions.length} of {pagination.total_count} transactions
                            </span>
                        )}
                    </div>

                    {selectedTransaction && (
                        <div className="detail">
                            {/* Close button */}
                            <button 
                                className="detail__close-button"
                                onClick={handleDeselectTransaction}
                                disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                aria-label="Close detail panel"
                            >
                                <X size={20} />
                            </button>

                            {/* Processing Overlay */}
                            {isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds) && (
                                <div className="detail__processing-overlay">
                                    <div className="detail__processing-content">
                                        <div className="detail__processing-spinner"></div>
                                        <div className="detail__processing-message">
                                            {isTransactionBeingSaved(selectedTransaction.id, editingTransactionIds) && 'Saving Transaction...'}
                                            {isTransactionBeingDeleted(selectedTransaction.id, deletingTransactionIds) && 'Deleting Transaction...'}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="detail__header">
                                <div className="detail__header-column detail__header-column--icon">
                                    <div
                                        className={`transaction__icon transaction__icon--${getTransactionTypeLabel(selectedTransaction.transaction_type)}`}
                                    >
                                        {isDeposit(selectedTransaction.transaction_type) ? (
                                            <ArrowDownLeft size={20} />
                                        ) : (
                                            <ArrowUpRight size={20} />
                                        )}
                                    </div>
                                </div>
                                <div className="detail__header-column detail__header-column--content">
                                    <div className="detail__header-row">
                                        <div className="detail__name">{selectedTransaction.client_name}</div>
                                    </div>
                                    <div className="detail__header-row">
                                        <div className="detail__sub">
                                            ₹{selectedTransaction.transaction_amount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="detail__divider" />
                            <div className="transaction-edit">
                                <div className="transaction-edit__title">Edit Transaction</div>
                                <div className="transaction-edit__form">
                                    <div>
                                        <div className="label">Transaction Type</div>
                                        <PillToggleGroup
                                            type="radio"
                                            value={selectedTransaction.transaction_type}
                                            onChange={(value) => handleTransactionFieldChange('transaction_type', value as number)}
                                            options={[
                                                { label: 'Deposit', value: 0 },
                                                { label: 'Withdraw', value: 1 }
                                            ]}
                                            name="transaction_type"
                                            disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                        />
                                    </div>
                                    <div>
                                        <div className="label">Amount</div>
                                        <NumericInput
                                            value={selectedTransaction.transaction_amount}
                                            onChange={(value) => handleTransactionFieldChange('transaction_amount', value)}
                                            placeholder="Enter amount"
                                            min={0}
                                            disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                        />
                                    </div>
                                    <div>
                                        <div className="label">Client Name</div>
                                        <AutocompleteInput
                                            value={selectedTransaction.client_name ? { id: selectedTransaction.client_id, name: selectedTransaction.client_name } : null}
                                            onChange={handleClientChange}
                                            options={clientAutocompleteItems}
                                            loading={clientLoading}
                                            placeholder="Search client..."
                                            icon={<User size={16} />}
                                            onSearch={handleClientSearch}
                                            disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                        />
                                    </div>
                                    {isWithdraw(selectedTransaction.transaction_type) && (
                                        <>
                                            <div>
                                                <div className="label">Bank Name</div>
                                                <AutocompleteInput
                                                    value={selectedTransaction.bank_name ? { id: selectedTransaction.bank_id || 0, name: selectedTransaction.bank_name } : null}
                                                    onChange={handleBankChange}
                                                    options={bankAutocompleteItems}
                                                    loading={bankLoading}
                                                    placeholder="Search bank..."
                                                    icon={<Banknote size={16} />}
                                                    onSearch={handleBankSearch}
                                                    disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                                />
                                            </div>
                                            <div>
                                                <div className="label">Card Name</div>
                                                <AutocompleteInput
                                                    value={selectedTransaction.card_name ? { id: selectedTransaction.card_id || 0, name: selectedTransaction.card_name } : null}
                                                    onChange={handleCardChange}
                                                    options={cardAutocompleteItems}
                                                    loading={cardLoading}
                                                    placeholder="Search card..."
                                                    icon={<CreditCard size={16} />}
                                                    onSearch={handleCardSearch}
                                                    disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                                />
                                            </div>
                                            <div>
                                                <div className="label">Withdraw Charges</div>
                                                <NumericInput
                                                    value={selectedTransaction.widthdraw_charges}
                                                    onChange={(value) => handleTransactionFieldChange('widthdraw_charges', value)}
                                                    placeholder="Enter charges"
                                                    min={0}
                                                    disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                                />
                                            </div>
                                        </>
                                    )}
                                    <div>
                                        <div className="label">Remarks</div>
                                        <TextArea
                                            value={selectedTransaction.remark}
                                            onChange={(value) => handleTransactionFieldChange('remark', value)}
                                            placeholder="Enter remarks"
                                            rows={4}
                                            disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                        />
                                    </div>
                                    <div className="inline-actions">
                                        <Button
                                            variant="primary"
                                            icon={<Edit size={16} />}
                                            onClick={() => handleSaveTransaction(selectedTransaction)}
                                            disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                            className="main__button"
                                        >
                                            {selectedTransaction && isTransactionBeingSaved(selectedTransaction.id, editingTransactionIds) ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            icon={<Trash size={16} />}
                                            onClick={handleDeleteTransaction}
                                            disabled={!selectedTransaction || isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                            className="main__icon-button"
                                        >
                                            {selectedTransaction && isTransactionBeingDeleted(selectedTransaction.id, deletingTransactionIds) ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <TransactionFilterModal
                    isOpen={isFilterModalOpen}
                    onClose={handleCloseFilterModal}
                    onApplyFilters={handleApplyFilters}
                    activeFilters={activeFilters}
                />

                <ExportTransactionModal
                    isOpen={isExportModalOpen}
                    onClose={handleCloseExportModal}
                    onExport={handleExport}
                />

                <DeleteTransactionConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteCancel}
                    onDelete={handleDeleteConfirm}
                    transaction={getModalTransaction()}
                />
            </>
        );
    } catch (error) {
        logger.error('Error rendering transaction list:', error);
        showBoundary(error);
    }
};

// Main wrapper component with ErrorBoundary
const TransactionList: React.FC<TransactionListProps> = (props) => {
    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <TransactionListErrorFallback {...fallbackProps} onDeposit={props.onDeposit} onWithdraw={props.onWithdraw} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Transaction list error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <TransactionListContent {...props} />
        </ErrorBoundary>
    );
};

export default TransactionList;
