'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Download, ArrowDownLeft, ArrowUpRight, SlidersHorizontal, Search } from 'lucide-react';
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
import { convertUIFiltersToAPI, getActiveFilterCount } from '../../utils/filterUtils';
import Table from '../../components/Tables/TransactionTable';
import TransactionFilterModal, { FilterValues } from '../../components/TransactionFilterModal';
import ExportTransactionModal, { ExportSettings } from './ExportTransaction';
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

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
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

    const filterCount = getActiveFilterCount(activeFilters);

    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Transactions</h1>
                    {pagination && (
                        <span className="main__subtitle">
                            Showing {transactions.length} of {pagination.total_count} transactions
                        </span>
                    )}
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
                {error && (
                    <div className="main__error">
                        <span>{error}</span>
                        <button onClick={handleClearError} className="main__error-close">×</button>
                    </div>
                )}
                
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

                    <Table />
                </div>
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
        </>
    );
};

export default TransactionList;
