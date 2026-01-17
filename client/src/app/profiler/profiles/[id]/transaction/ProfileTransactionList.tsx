'use client'
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfilerProfileById } from '@/store/actions/profilerProfileActions';
import { fetchProfilerTransactionsByProfile } from '@/store/actions/profilerTransactionActions';
import { clearProfilerTransactions } from '@/store/slices/profilerTransactionSlice';
import { Building2, CreditCard, Loader2, User } from 'lucide-react';
import { SearchInput } from '@/components/FormInputs';
import ProfileTransactionHeader from './ProfileTransactionHeader';
import ProfileTransactionTable from './ProfileTransactionTable';
import './ProfileTransactionList.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';
import { formatAmountAsCurrency } from '@/utils/helperFunctions';

interface ProfileTransactionListProps {
    onAddTransaction: () => void;
}

const ProfileTransactionList: React.FC<ProfileTransactionListProps> = ({ onAddTransaction }) => {
    const params = useParams();
    const profileId = Number(params.id);
    const dispatch = useAppDispatch();

    const { selectedProfile, loading: profileLoading, error: profileError } = useAppSelector((state) => state.profilerProfiles);
    const {
        transactions,
        loading: transactionsLoading,
        loadingMore,
        error: transactionsError,
        pagination,
        sortConfig,
        hasMore
    } = useAppSelector((state) => state.profilerTransactions);

    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (profileId) {
            logger.log('Fetching profile and transactions for profile ID:', profileId);
            dispatch(fetchProfilerProfileById({ id: profileId }));
            loadTransactions();
        }

        return () => {
            dispatch(clearProfilerTransactions());
        };
    }, [profileId, dispatch]);

    useEffect(() => {
        if (profileError) {
            toast.error(profileError);
        }
    }, [profileError]);

    useEffect(() => {
        if (transactionsError) {
            toast.error(transactionsError);
        }
    }, [transactionsError]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !transactionsLoading && !loadingMore) {
                    logger.log('Loading more profile transactions...');
                    loadMoreTransactions();
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
    }, [hasMore, transactionsLoading, loadingMore]);

    const loadTransactions = useCallback((sort_by: string = sortBy, sort_order: 'asc' | 'desc' = sortOrder, search: string = searchQuery) => {
        dispatch(fetchProfilerTransactionsByProfile({
            profileId,
            page: 1,
            limit: 50,
            sort_by,
            sort_order,
            search: search || undefined
        }));
    }, [dispatch, profileId, sortBy, sortOrder, searchQuery]);

    const loadMoreTransactions = useCallback(() => {
        if (!pagination?.has_next_page || loadingMore || transactionsLoading) return;

        dispatch(fetchProfilerTransactionsByProfile({
            profileId,
            page: pagination.current_page + 1,
            limit: 50,
            sort_by: sortBy,
            sort_order: sortOrder,
            search: searchQuery || undefined
        }));
    }, [dispatch, profileId, pagination, loadingMore, transactionsLoading, sortBy, sortOrder, searchQuery]);

    const handleSort = useCallback((sort_by: string, sort_order: 'asc' | 'desc') => {
        logger.log('Sorting by:', sort_by, sort_order);
        setSortBy(sort_by);
        setSortOrder(sort_order);
        loadTransactions(sort_by, sort_order, searchQuery);
    }, [loadTransactions, searchQuery]);

    const handleRefresh = useCallback(() => {
        logger.log('Refreshing transactions');
        loadTransactions();
    }, [loadTransactions]);

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);

        // Clear existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set new timeout for debounced search
        searchTimeoutRef.current = setTimeout(() => {
            logger.log('Searching transactions with query:', value);
            loadTransactions(sortBy, sortOrder, value);
        }, 500); // 500ms debounce
    }, [loadTransactions, sortBy, sortOrder]);

    if (profileLoading || !selectedProfile) {
        return (
            <div className="profile-transaction-list__loading">
                <Loader2 size={40} className="profile-transaction-list__spinner" />
                <p>Loading profile...</p>
            </div>
        );
    }

    const formatCreditCard = (value: string): string => {
        if (!value) return '';
        const digits = value.replace(/[•\-\s]/g, '');
        const formatted = digits.match(/.{1,4}/g)?.join(' • ') || digits;
        return formatted;
    };

    return (
        <>
            <ProfileTransactionHeader
                onAddTransaction={onAddTransaction}
                onRefresh={handleRefresh}
            />

            <div className="main__content">
                <div className="main__view">
                    <div className="profile-transaction-header__info-wrapper">
                        <div className="main__title-row">
                            <div>
                                <h1 className="main__title">Profile Transactions</h1>
                                <p className="main__subtitle">
                                    View and manage transactions for this profile
                                </p>
                            </div>
                        </div>

                        <div className="profile-transaction-header__profile-card">
                            <div className="profile-transaction-header__details">
                                <div className="profile-transaction-header__detail-item">
                                    <User size={16} className="profile-transaction-header__detail-icon" />
                                    <div className="profile-transaction-header__detail-content">
                                        <span className="profile-transaction-header__detail-label">Client</span>
                                        <span className="profile-transaction-header__detail-value">{selectedProfile.client_name}</span>
                                    </div>
                                </div>

                                <div className="profile-transaction-header__detail-item">
                                    <Building2 size={16} className="profile-transaction-header__detail-icon" />
                                    <div className="profile-transaction-header__detail-content">
                                        <span className="profile-transaction-header__detail-label">Bank</span>
                                        <span className="profile-transaction-header__detail-value">{selectedProfile.bank_name}</span>
                                    </div>
                                </div>

                                <div className="profile-transaction-header__detail-item">
                                    <CreditCard size={16} className="profile-transaction-header__detail-icon" />
                                    <div className="profile-transaction-header__detail-content">
                                        <span className="profile-transaction-header__detail-label">Card Number</span>
                                        <span className="profile-transaction-header__detail-value">{formatCreditCard(selectedProfile.credit_card_number)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="profile-transaction-header__balances">
                                <div className="profile-transaction-header__balance-item">
                                    <span className="profile-transaction-header__balance-label">Opening Balance</span>
                                    <span className="profile-transaction-header__balance-value">{formatAmountAsCurrency(selectedProfile.pre_planned_deposit_amount)}</span>
                                </div>

                                <div className="profile-transaction-header__balance-item">
                                    <span className="profile-transaction-header__balance-label">Current Balance</span>
                                    <span className={`profile-transaction-header__balance-value ${selectedProfile.current_balance > 0
                                        ? 'profile-transaction-header__balance-value--positive'
                                        : selectedProfile.current_balance < 0
                                            ? 'profile-transaction-header__balance-value--negative'
                                            : ''
                                        }`}>
                                        {formatAmountAsCurrency(selectedProfile.current_balance)}
                                    </span>
                                </div>

                                <div className="profile-transaction-header__balance-item">
                                    <span className="profile-transaction-header__balance-label">Status</span>
                                    <span className={`main__tag main__tag--${selectedProfile.status}`}>
                                        {selectedProfile.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="profile-transaction-header__search-row">
                        <SearchInput
                            value={searchQuery}
                            onChange={handleSearchChange}
                            placeholder="Search transactions by amount, notes..."
                            loading={transactionsLoading}
                        />
                    </div>
                    <ProfileTransactionTable
                        transactions={transactions}
                        loading={transactionsLoading}
                        sortConfig={{ sort_by: sortBy, sort_order: sortOrder }}
                        searchQuery={searchQuery}
                        onSort={handleSort}
                        onRefresh={handleRefresh}
                    />
                    
                    {hasMore && (
                        <div ref={observerTarget} className="profile-transaction-list__load-more">
                            {loadingMore && (
                                <div className="profile-transaction-list__loading-more">
                                    <Loader2 size={24} className="profile-transaction-list__loading-more-icon" />
                                    <span>Loading more transactions...</span>
                                </div>
                            )}
                        </div>
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

export default ProfileTransactionList;
