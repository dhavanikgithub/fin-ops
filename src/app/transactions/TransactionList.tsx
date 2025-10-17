'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Download, ArrowDownLeft, ArrowUpRight, SlidersHorizontal, Search, Edit, Trash, X, Check, Banknote, CreditCard } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
    fetchTransactions, 
    searchTransactions, 
    applyFilters
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
import { convertUIFiltersToAPI, getActiveFilterCount } from '../../utils/filterUtils';
import { isDeposit, isWithdraw, getTransactionTypeLabel, getCapitalizedTransactionTypeLabel } from '../../utils/transactionUtils';
import { Transaction } from '../../services/transactionService';
import Table from '../../components/Tables/TransactionTable';
import TransactionFilterModal, { FilterValues } from '../../components/TransactionFilterModal';
import ExportTransactionModal, { ExportSettings } from './ExportTransaction';
import DeleteTransactionConfirmModal from './DeleteTransactionConfirmModal';
import './TransactionList.scss';

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
        hasMore 
    } = useAppSelector((state) => state.transactions);
    
    const { items: bankAutocompleteItems, loading: bankLoading } = useAppSelector(state => state.bankAutocomplete);
    const { items: cardAutocompleteItems, loading: cardLoading } = useAppSelector(state => state.cardAutocomplete);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
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
    const [showBankDropdown, setShowBankDropdown] = useState(false);
    const [showCardDropdown, setShowCardDropdown] = useState(false);

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

    const handleClearError = () => {
        dispatch(clearError());
    };

    const handleTransactionSelect = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
    };

    const handleDeselectTransaction = () => {
        setSelectedTransaction(null);
    };

    const handleDeleteTransaction = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = (transactionId: string) => {
        console.log(`Deleting transaction ${transactionId}`);
        // Here you would typically call an API to delete the transaction
        // After successful deletion, you might want to refresh the transaction list
        setIsDeleteModalOpen(false);
        setSelectedTransaction(null);
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const handleSaveTransaction = () => {
        if (!selectedTransaction) return;
        console.log('Saving transaction:', selectedTransaction);
        // Here you would typically call an API to update the transaction
        // After successful update, you might want to refresh the transaction list
    };

    const handleTransactionFieldChange = (field: keyof Transaction, value: any) => {
        if (!selectedTransaction) return;
        setSelectedTransaction({
            ...selectedTransaction,
            [field]: value
        });
    };

    const handleBankSelect = (bank: { id: number; name: string }) => {
        if (!selectedTransaction) return;
        setSelectedTransaction({
            ...selectedTransaction,
            bank_name: bank.name,
            bank_id: bank.id
        });
        setBankSearch('');
        setShowBankDropdown(false);
    };

    const handleCardSelect = (card: { id: number; name: string }) => {
        if (!selectedTransaction) return;
        setSelectedTransaction({
            ...selectedTransaction,
            card_name: card.name,
            card_id: card.id
        });
        setCardSearch('');
        setShowCardDropdown(false);
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
                                    />
                                </div>
                                <div>
                                    <div className="label">Client Name</div>
                                    <input 
                                        className="control" 
                                        value={selectedTransaction.client_name}
                                        onChange={(e) => handleTransactionFieldChange('client_name', e.target.value)}
                                    />
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
                                                                onBlur={() => setTimeout(() => setShowBankDropdown(false), 200)}
                                                                autoComplete="off"
                                                            />
                                                            {showBankDropdown && bankSearch && (
                                                                <div className="filter-modal__dropdown">
                                                                    {bankLoading ? (
                                                                        <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                                                            Loading...
                                                                        </div>
                                                                    ) : bankAutocompleteItems.length > 0 ? (
                                                                        bankAutocompleteItems.map(bank => (
                                                                            <div
                                                                                key={bank.id}
                                                                                className="filter-modal__dropdown-item"
                                                                                onClick={() => handleBankSelect(bank)}
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
                                                                onBlur={() => setTimeout(() => setShowCardDropdown(false), 200)}
                                                                autoComplete="off"
                                                            />
                                                            {showCardDropdown && cardSearch && (
                                                                <div className="filter-modal__dropdown">
                                                                    {cardLoading ? (
                                                                        <div className="filter-modal__dropdown-item filter-modal__dropdown-item--loading">
                                                                            Loading...
                                                                        </div>
                                                                    ) : cardAutocompleteItems.length > 0 ? (
                                                                        cardAutocompleteItems.map(card => (
                                                                            <div
                                                                                key={card.id}
                                                                                className="filter-modal__dropdown-item"
                                                                                onClick={() => handleCardSelect(card)}
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
                                    />
                                </div>
                                <div className="inline-actions">
                                    <button className="main__button" onClick={handleSaveTransaction}>
                                        <Edit size={16} />
                                        Save
                                    </button>
                                    <button 
                                        className="main__icon-button" 
                                        onClick={handleDeleteTransaction}
                                        disabled={!selectedTransaction}
                                    >
                                        <Trash size={16} />
                                        Delete
                                    </button>
                                    <button 
                                        className="main__secondary-button" 
                                        onClick={handleDeselectTransaction}
                                    >
                                        <X size={16} />
                                        Cancel
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
