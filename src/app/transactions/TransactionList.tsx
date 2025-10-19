'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, ArrowDownLeft, ArrowUpRight, SlidersHorizontal, Search, Edit, Trash, X, Check, Banknote, CreditCard, User } from 'lucide-react';
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
import Table from '../../components/Tables/TransactionTable';
import TransactionFilterModal, { FilterValues } from '../../components/TransactionFilterModal';
import ExportTransactionModal, { ExportSettings } from './ExportTransaction';
import DeleteTransactionConfirmModal from './DeleteTransactionConfirmModal';
import './TransactionList.scss';
import useStateWithRef from '@/hooks/useStateWithRef';

interface TransactionListProps {
    onDeposit: () => void;
    onWithdraw: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onDeposit, onWithdraw }) => {
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
    const [selectedTransaction, setStateWithRef, selectedTransactionRef] = useStateWithRef<Transaction | null>(null);
    const [activeFilters, setActiveFilters] = useState<FilterValues>({
        types: [],
        minAmount: '',
        maxAmount: '',
        startDate: '',
        endDate: '',
        banks: [],
        cards: [],
        clients: []
    });
    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Autocomplete states
    const [bankSearch, setBankSearch] = useState('');
    const [cardSearch, setCardSearch] = useState('');
    const [clientSearch, setClientSearch] = useState('');
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [showCardDropdown, setShowCardDropdown] = useState(false);
    const [showClientDropdown, setShowClientDropdown] = useState(false);
    const [bankHighlightedIndex, setBankHighlightedIndex] = useState(0);
    const [cardHighlightedIndex, setCardHighlightedIndex] = useState(0);
    const [clientHighlightedIndex, setClientHighlightedIndex] = useState(0);

    // Load initial transactions
    useEffect(() => {
        dispatch(fetchTransactions());
    }, [dispatch]);

    // Handle search with debouncing
    const handleSearchChange = useCallback((value: string) => {
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
    }, [dispatch, searchTimeout]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Debounced bank search
    const bankSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    const debouncedBankSearch = useCallback((searchTerm: string) => {
        if (bankSearchDebounceTimer.current) {
            clearTimeout(bankSearchDebounceTimer.current);
        }

        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                dispatch(fetchBankAutocomplete({ search: searchTerm, limit: 5 }));
            } else {
                dispatch(clearBankAutocomplete());
            }
        }, 300);

        bankSearchDebounceTimer.current = timer;
    }, [dispatch]);

    // Debounced card search
    const cardSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

    const debouncedCardSearch = useCallback((searchTerm: string) => {
        if (cardSearchDebounceTimer.current) {
            clearTimeout(cardSearchDebounceTimer.current);
        }

        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                dispatch(fetchCardAutocomplete({ search: searchTerm, limit: 5 }));
            } else {
                dispatch(clearCardAutocomplete());
            }
        }, 300);

        cardSearchDebounceTimer.current = timer;
    }, [dispatch]);

    // Debounced client search
    const clientSearchDebounceTimer = useRef<NodeJS.Timeout | null>(null);

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

    // Effect to handle bank search changes
    useEffect(() => {
        if (showBankDropdown) {
            debouncedBankSearch(bankSearch);
        }
    }, [bankSearch, debouncedBankSearch, showBankDropdown]);

    // Effect to handle card search changes
    useEffect(() => {
        if (showCardDropdown) {
            debouncedCardSearch(cardSearch);
        }
    }, [cardSearch, debouncedCardSearch, showCardDropdown]);

    // Effect to handle client search changes
    useEffect(() => {
        if (showClientDropdown) {
            debouncedClientSearch(clientSearch);
        }
    }, [clientSearch, debouncedClientSearch, showClientDropdown]);

    // Reset highlighted indices when items change
    useEffect(() => {
        setBankHighlightedIndex(0);
    }, [bankAutocompleteItems]);

    useEffect(() => {
        setCardHighlightedIndex(0);
    }, [cardAutocompleteItems]);

    useEffect(() => {
        setClientHighlightedIndex(0);
    }, [clientAutocompleteItems]);

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

        console.log('Applied filters:', filters);
    };

    const handleExport = (exportSettings: ExportSettings) => {
        console.log('Exporting with settings:', exportSettings);
        // Handle export logic here
    };

    const handleTransactionSelect = (transaction: Transaction) => {
        setStateWithRef(transaction);
    };

    const handleDeselectTransaction = () => {
        setStateWithRef(null);
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
                setStateWithRef(null);
            }
        } catch (error) {
            console.error(`Failed to delete transaction ${transactionId}:`, error);
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
            console.log('Transaction updated successfully');
        } catch (error) {
            console.error('Failed to update transaction:', error);
        } finally {
        }
    };

    const handleTransactionFieldChange = (field: keyof Transaction, value: any) => {
        if (!selectedTransaction) return;
        setStateWithRef({
            ...selectedTransaction,
            [field]: value
        });
    };

    const handleBankSelect = (bank: { id: number; name: string }) => {
        if (!selectedTransaction) return;
        setStateWithRef({
            ...selectedTransaction,
            bank_name: bank.name,
            bank_id: bank.id
        });
        setBankSearch('');
        setShowBankDropdown(false);
        setBankHighlightedIndex(0);
    };

    const handleCardSelect = (card: { id: number; name: string }) => {
        if (!selectedTransaction) return;
        setStateWithRef({
            ...selectedTransaction,
            card_name: card.name,
            card_id: card.id
        });
        setCardSearch('');
        setShowCardDropdown(false);
        setCardHighlightedIndex(0);
    };

    const handleClientSelect = (client: { id: number; name: string }) => {
        if (!selectedTransaction) return;
        setStateWithRef({
            ...selectedTransaction,
            client_name: client.name,
            client_id: client.id
        });
        setClientSearch('');
        setShowClientDropdown(false);
        setClientHighlightedIndex(0);
    };

    // Keyboard navigation handlers
    const handleBankKeyDown = (e: React.KeyboardEvent) => {
        if (!showBankDropdown || bankAutocompleteItems.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setBankHighlightedIndex(prev => 
                    prev < bankAutocompleteItems.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setBankHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : bankAutocompleteItems.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (bankAutocompleteItems.length > 0) {
                    handleBankSelect(bankAutocompleteItems[bankHighlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowBankDropdown(false);
                setBankSearch('');
                setBankHighlightedIndex(0);
                break;
        }
    };

    const handleCardKeyDown = (e: React.KeyboardEvent) => {
        if (!showCardDropdown || cardAutocompleteItems.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setCardHighlightedIndex(prev => 
                    prev < cardAutocompleteItems.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setCardHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : cardAutocompleteItems.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (cardAutocompleteItems.length > 0) {
                    handleCardSelect(cardAutocompleteItems[cardHighlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowCardDropdown(false);
                setCardSearch('');
                setCardHighlightedIndex(0);
                break;
        }
    };

    const handleClientKeyDown = (e: React.KeyboardEvent) => {
        if (!showClientDropdown || clientAutocompleteItems.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setClientHighlightedIndex(prev => 
                    prev < clientAutocompleteItems.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setClientHighlightedIndex(prev => 
                    prev > 0 ? prev - 1 : clientAutocompleteItems.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (clientAutocompleteItems.length > 0) {
                    handleClientSelect(clientAutocompleteItems[clientHighlightedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowClientDropdown(false);
                setClientSearch('');
                setClientHighlightedIndex(0);
                break;
        }
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
            bank: selectedTransaction.bank_name || 'N/A',
            card: selectedTransaction.card_name || 'N/A',
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
        return isTransactionBeingSaved(transactionId,editingTransactionIds) || isTransactionBeingDeleted(transactionId,deletingTransactionIds);
    };

    const isSelectedTransactionBeingProcessed = (
        selectedTransaction: Transaction | null,
        editingTransactionIds: number[],
        deletingTransactionIds: number[]
    ): boolean => {
        if (!selectedTransaction) return false;
        return isTransactionBeingProcessed(selectedTransaction.id, editingTransactionIds, deletingTransactionIds);
    };

    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Transactions</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleOpenExportModal}>
                        <Download size={16} />
                        Export
                    </button>
                    <button className="main__button" onClick={onDeposit}>
                        <ArrowDownLeft size={16} />
                        Deposit
                    </button>
                    <button className="main__button" onClick={onWithdraw}>
                        <ArrowUpRight size={16} />
                        Withdraw
                    </button>
                </div>
            </header>

            <div className="main__content">

                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__search-row">
                            <span className="main__search-icon">
                                <Search size={16} />
                            </span>
                            <input
                                type="text"
                                className="main__input"
                                placeholder="Search transactions..."
                                value={localSearchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                            {loading && localSearchQuery && (
                                <div className="main__search-loading">Searching...</div>
                            )}
                        </div>
                        <div className="main__actions">
                            <button
                                className={`main__icon-button ${filterCount > 0 ? 'main__icon-button--active' : ''}`}
                                onClick={handleOpenFilterModal}
                            >
                                <SlidersHorizontal size={16} />
                                Filters
                                {filterCount > 0 && (
                                    <span className="main__filter-badge">{filterCount}</span>
                                )}
                            </button>
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
                                    <div className="filter-modal__pills">
                                        <label className="filter-modal__pill-checkbox">
                                            <input
                                                type="radio"
                                                name="transaction_type"
                                                value={0}
                                                checked={isDeposit(selectedTransaction.transaction_type)}
                                                onChange={(e) => handleTransactionFieldChange('transaction_type', parseInt(e.target.value))}
                                                disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                            />
                                            <span className="filter-modal__custom-checkbox">
                                                {isDeposit(selectedTransaction.transaction_type) && <Check size={14} />}
                                            </span>
                                            <span>Deposit</span>
                                        </label>
                                        <label className="filter-modal__pill-checkbox">
                                            <input
                                                type="radio"
                                                name="transaction_type"
                                                value={1}
                                                checked={isWithdraw(selectedTransaction.transaction_type)}
                                                onChange={(e) => handleTransactionFieldChange('transaction_type', parseInt(e.target.value))}
                                                disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                            />
                                            <span className="filter-modal__custom-checkbox">
                                                {isWithdraw(selectedTransaction.transaction_type) && <Check size={14} />}
                                            </span>
                                            <span>Withdraw</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <div className="label">Amount</div>
                                    <input
                                        className="control"
                                        type="number"
                                        value={selectedTransaction.transaction_amount}
                                        onChange={(e) => handleTransactionFieldChange('transaction_amount', parseFloat(e.target.value))}
                                        disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                    />
                                </div>
                                <div>
                                    <div className="label">Client Name</div>
                                    <div className="filter-modal__multi">
                                        <div className="filter-modal__input filter-modal__input--multi">
                                            {selectedTransaction.client_name && !showClientDropdown && (
                                                <div className="filter-modal__token">
                                                    <User size={14} />
                                                    <span>{selectedTransaction.client_name}</span>
                                                    <button
                                                        type="button"
                                                        className="filter-modal__token-remove"
                                                        onClick={() => {
                                                            handleTransactionFieldChange('client_name', '');
                                                            setShowClientDropdown(true);
                                                            setClientSearch('');
                                                        }}
                                                        disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            )}
                                            {(!selectedTransaction.client_name || showClientDropdown) && (
                                                <div className="filter-modal__add-token" style={{ position: 'relative' }}>
                                                    <input
                                                        type="text"
                                                        className="filter-modal__token-input"
                                                        placeholder="Search client..."
                                                        value={showClientDropdown ? clientSearch : selectedTransaction.client_name}
                                                        onChange={e => {
                                                            if (showClientDropdown) {
                                                                setClientSearch(e.target.value);
                                                            } else {
                                                                handleTransactionFieldChange('client_name', e.target.value);
                                                            }
                                                        }}
                                                        onFocus={() => {
                                                            setShowClientDropdown(true);
                                                            setClientSearch(selectedTransaction.client_name || '');
                                                        }}
                                                        onBlur={() => setTimeout(() => {
                                                            setShowClientDropdown(false);
                                                            setClientSearch('');
                                                            setClientHighlightedIndex(0);
                                                        }, 200)}
                                                        onKeyDown={handleClientKeyDown}
                                                        autoComplete="off"
                                                        disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                                    />
                                                    {showClientDropdown && clientSearch && (
                                                        <div className="filter-modal__dropdown">
                                                            {clientLoading ? (
                                                                <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                                                    Loading...
                                                                </div>
                                                            ) : clientAutocompleteItems.length > 0 ? (
                                                                clientAutocompleteItems.map((client, index) => (
                                                                    <div
                                                                        key={client.id}
                                                                        className={`filter-modal__dropdown-item ${index === clientHighlightedIndex ? 'filter-modal__dropdown-item--highlighted' : ''}`}
                                                                        onClick={() => handleClientSelect(client)}
                                                                        onMouseEnter={() => setClientHighlightedIndex(index)}
                                                                    >
                                                                        {client.name}
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="filter-modal__dropdown-item filter-modal__dropdown-item--no-results">
                                                                    No clients found
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isWithdraw(selectedTransaction.transaction_type) && (
                                    <>
                                        <div>
                                            <div className="label">Bank Name</div>
                                            <div className="filter-modal__multi">
                                                <div className="filter-modal__input filter-modal__input--multi">
                                                    {selectedTransaction.bank_name && (
                                                        <div className="filter-modal__token">
                                                            <Banknote size={14} />
                                                            <span>{selectedTransaction.bank_name}</span>
                                                            <button
                                                                type="button"
                                                                className="filter-modal__token-remove"
                                                                onClick={() => handleTransactionFieldChange('bank_name', '')}
                                                                disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {!selectedTransaction.bank_name && (
                                                        <div className="filter-modal__add-token" style={{ position: 'relative' }}>
                                                            <input
                                                                type="text"
                                                                className="filter-modal__token-input"
                                                                placeholder="Search bank..."
                                                                value={bankSearch}
                                                                onChange={e => setBankSearch(e.target.value)}
                                                                onFocus={() => setShowBankDropdown(true)}
                                                                onBlur={() => setTimeout(() => {
                                                                    setShowBankDropdown(false);
                                                                    setBankHighlightedIndex(0);
                                                                }, 200)}
                                                                onKeyDown={handleBankKeyDown}
                                                                autoComplete="off"
                                                                disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                                            />
                                                            {showBankDropdown && bankSearch && (
                                                                <div className="filter-modal__dropdown">
                                                                    {bankLoading ? (
                                                                        <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                                                            Loading...
                                                                        </div>
                                                                    ) : bankAutocompleteItems.length > 0 ? (
                                                                        bankAutocompleteItems.map((bank, index) => (
                                                                            <div
                                                                                key={bank.id}
                                                                                className={`filter-modal__dropdown-item ${index === bankHighlightedIndex ? 'filter-modal__dropdown-item--highlighted' : ''}`}
                                                                                onClick={() => handleBankSelect(bank)}
                                                                                onMouseEnter={() => setBankHighlightedIndex(index)}
                                                                            >
                                                                                {bank.name}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="filter-modal__dropdown-item filter-modal__dropdown-item--no-results">
                                                                            No banks found
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="label">Card Name</div>
                                            <div className="filter-modal__multi">
                                                <div className="filter-modal__input filter-modal__input--multi">
                                                    {selectedTransaction.card_name && (
                                                        <div className="filter-modal__token">
                                                            <CreditCard size={14} />
                                                            <span>{selectedTransaction.card_name}</span>
                                                            <button
                                                                type="button"
                                                                className="filter-modal__token-remove"
                                                                onClick={() => handleTransactionFieldChange('card_name', '')}
                                                                disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                    {!selectedTransaction.card_name && (
                                                        <div className="filter-modal__add-token" style={{ position: 'relative' }}>
                                                            <input
                                                                type="text"
                                                                className="filter-modal__token-input"
                                                                placeholder="Search card..."
                                                                value={cardSearch}
                                                                onChange={e => setCardSearch(e.target.value)}
                                                                onFocus={() => setShowCardDropdown(true)}
                                                                onBlur={() => setTimeout(() => {
                                                                    setShowCardDropdown(false);
                                                                    setCardHighlightedIndex(0);
                                                                }, 200)}
                                                                onKeyDown={handleCardKeyDown}
                                                                autoComplete="off"
                                                                disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                                            />
                                                            {showCardDropdown && cardSearch && (
                                                                <div className="filter-modal__dropdown">
                                                                    {cardLoading ? (
                                                                        <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                                                            Loading...
                                                                        </div>
                                                                    ) : cardAutocompleteItems.length > 0 ? (
                                                                        cardAutocompleteItems.map((card, index) => (
                                                                            <div
                                                                                key={card.id}
                                                                                className={`filter-modal__dropdown-item ${index === cardHighlightedIndex ? 'filter-modal__dropdown-item--highlighted' : ''}`}
                                                                                onClick={() => handleCardSelect(card)}
                                                                                onMouseEnter={() => setCardHighlightedIndex(index)}
                                                                            >
                                                                                {card.name}
                                                                            </div>
                                                                        ))
                                                                    ) : (
                                                                        <div className="filter-modal__dropdown-item filter-modal__dropdown-item--no-results">
                                                                            No cards found
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="label">Withdraw Charges</div>
                                            <input
                                                className="control"
                                                type="number"
                                                value={selectedTransaction.widthdraw_charges}
                                                onChange={(e) => handleTransactionFieldChange('widthdraw_charges', parseFloat(e.target.value))}
                                                disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                            />
                                        </div>
                                    </>
                                )}
                                <div>
                                    <div className="label">Remarks</div>
                                    <textarea
                                        className="control"
                                        rows={4}
                                        value={selectedTransaction.remark}
                                        onChange={(e) => handleTransactionFieldChange('remark', e.target.value)}
                                        disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                    />
                                </div>
                                <div className="inline-actions">
                                    <button
                                        className="main__button"
                                        onClick={() => handleSaveTransaction(selectedTransaction)}
                                        disabled={isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                    >
                                        <Edit size={16} />
                                        {selectedTransaction && isTransactionBeingSaved(selectedTransaction.id,editingTransactionIds) ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        className="main__icon-button"
                                        onClick={handleDeleteTransaction}
                                        disabled={!selectedTransaction || isSelectedTransactionBeingProcessed(selectedTransaction, editingTransactionIds, deletingTransactionIds)}
                                    >
                                        <Trash size={16} />
                                        {selectedTransaction && isTransactionBeingDeleted(selectedTransaction.id, deletingTransactionIds) ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button
                                        className="main__secondary-button"
                                        onClick={handleDeselectTransaction}
                                    >
                                        <X size={16} />
                                        Close
                                    </button>
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
};

export default TransactionList;
