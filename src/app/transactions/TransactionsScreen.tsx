'use client';
import React, { useState } from 'react';
import { Download, ArrowDownLeft, ArrowUpRight, SlidersHorizontal, Search } from 'lucide-react';
import Table from '../../components/Tables/TransactionTable';
import TransactionFilterModal, { FilterValues } from '../../components/TransactionFilterModal';
import './TransactionsScreen.scss';

const TransactionScreen: React.FC = () => {
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [activeFilters, setActiveFilters] = useState<FilterValues | null>(null);

    const handleOpenFilterModal = () => {
        setIsFilterModalOpen(true);
    };

    const handleCloseFilterModal = () => {
        setIsFilterModalOpen(false);
    };

    const handleApplyFilters = (filters: FilterValues) => {
        setActiveFilters(filters);
        console.log('Applied filters:', filters);
        // Here you would typically update your data based on the filters
    };

    const getActiveFilterCount = () => {
        if (!activeFilters) return 0;

        let count = 0;
        if (activeFilters.types.length > 0) count++;
        if (activeFilters.minAmount || activeFilters.maxAmount) count++;
        if (activeFilters.startDate || activeFilters.endDate) count++;
        if (activeFilters.banks.length > 0) count++;
        if (activeFilters.cards.length > 0) count++;
        if (activeFilters.clients.length > 0) count++;

        return count;
    };

    const filterCount = getActiveFilterCount();

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Transactions</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button">
                        <Download size={16} />
                        Export
                    </button>
                    <button className="main__button">
                        <ArrowDownLeft size={16} />
                        Deposit
                    </button>
                    <button className="main__button">
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
                                placeholder="Search"
                            />
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

                    <Table filters={activeFilters} />
                    {/* <Pagination /> */}
                </div>
            </div>

            <TransactionFilterModal
                isOpen={isFilterModalOpen}
                onClose={handleCloseFilterModal}
                onApplyFilters={handleApplyFilters}
            />
        </div>
    );
};

export default TransactionScreen;