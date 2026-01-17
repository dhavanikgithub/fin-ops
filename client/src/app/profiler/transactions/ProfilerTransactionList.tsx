'use client'
import React, { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    fetchProfilerTransactions,
    loadMoreProfilerTransactions,
    searchProfilerTransactions,
    sortProfilerTransactions
} from '@/store/actions/profilerTransactionActions';
import { setSearchQuery, clearProfilerTransactions } from '@/store/slices/profilerTransactionSlice';
import { ArrowDownCircle, ArrowUpCircle, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button, SearchInput } from '@/components/FormInputs';
import ProfilerTransactionTable from './ProfilerTransactionTable';
import './ProfilerTransactionList.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface ProfilerTransactionListProps {
    onNewDeposit: () => void;
    onNewWithdraw: () => void;
}

const ProfilerTransactionList: React.FC<ProfilerTransactionListProps> = ({ onNewDeposit, onNewWithdraw }) => {
    const dispatch = useAppDispatch();
    const {
        transactions,
        loading,
        loadingMore,
        error,
        hasMore,
        searchQuery,
        sortConfig,
        pagination
    } = useAppSelector((state) => state.profilerTransactions);

    const observerTarget = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        dispatch(fetchProfilerTransactions());
        return () => {
            dispatch(clearProfilerTransactions());
        };
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    logger.log('Loading more profiler transactions...');
                    dispatch(loadMoreProfilerTransactions());
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading, loadingMore, dispatch]);

    const handleSearch = useCallback((value: string) => {
        dispatch(setSearchQuery(value));

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            logger.log('Searching profiler transactions:', value);
            dispatch(searchProfilerTransactions(value));
        }, 500);
    }, [dispatch]);

    const handleSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
        logger.log('Sorting profiler transactions:', { sortBy, sortOrder });
        dispatch(sortProfilerTransactions({ sort_by: sortBy, sort_order: sortOrder }));
    }, [dispatch]);

    const handleRefresh = useCallback(() => {
        logger.log('Refreshing profiler transactions');
        dispatch(fetchProfilerTransactions());
    }, [dispatch]);

    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <div className="main__title-row">
                        <h1 className="main__title">Transactions</h1>
                        {/* <p className="main__subtitle">Track deposits and withdrawals for financial profiles</p> */}
                    </div>
                </div>

                <div className="main__header-right">
                    <Button
                        variant="primary"
                        icon={<ArrowDownLeft size={18} />}
                        onClick={onNewDeposit}
                    >
                        Add Deposit
                    </Button>

                    <Button
                        variant="destructive"
                        icon={<ArrowUpRight size={18} />}
                        onClick={onNewWithdraw}
                    >
                        Add Withdraw
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="profiler-transaction-list__search">
                        <SearchInput
                            placeholder="Search by client, bank, or remarks..."
                            value={searchQuery}
                            onChange={(value: string) => handleSearch(value)}
                        />
                    </div>

                    {loading && transactions.length === 0 ? (
                        <div className="profiler-transaction-list__loading">
                            <Loader2 size={48} className="profiler-transaction-list__loading-icon" />
                            <p>Loading profiler transactions...</p>
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="profiler-transaction-list__empty">
                            <ArrowDownCircle size={64} className="profiler-transaction-list__empty-icon" />
                            <h3>No Transactions Found</h3>
                            <p>Get started by adding your first transaction</p>
                            <div className="profiler-transaction-list__empty-actions">
                                <Button
                                    variant="primary"
                                    icon={<ArrowDownCircle size={18} />}
                                    onClick={onNewDeposit}
                                >
                                    Add Deposit
                                </Button>
                                <Button
                                    variant="destructive"
                                    icon={<ArrowUpCircle size={18} />}
                                    onClick={onNewWithdraw}
                                >
                                    Add Withdraw
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <ProfilerTransactionTable
                                transactions={transactions}
                                sortConfig={sortConfig}
                                onSort={handleSort}
                                onRefresh={handleRefresh}
                            />

                            {hasMore && (
                                <div ref={observerTarget} className="profiler-transaction-list__load-more">
                                    {loadingMore && (
                                        <div className="profiler-transaction-list__loading-more">
                                            <Loader2 size={24} className="profiler-transaction-list__loading-more-icon" />
                                            <span>Loading more transactions...</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                    {pagination && (
                        <span className="main__subtitle">
                            Showing {transactions.length} of {pagination.total_count} transactions
                        </span>
                    )}
                </div>
            </div>
        </>
    );
};

export default ProfilerTransactionList;
