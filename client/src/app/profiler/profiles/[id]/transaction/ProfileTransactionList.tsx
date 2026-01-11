'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfilerProfileById } from '@/store/actions/profilerProfileActions';
import { fetchProfilerTransactionsByProfile } from '@/store/actions/profilerTransactionActions';
import { clearProfilerTransactions } from '@/store/slices/profilerTransactionSlice';
import { Building2, CreditCard, Loader2, User } from 'lucide-react';
import ProfileTransactionHeader from './ProfileTransactionHeader';
import ProfileTransactionTable from './ProfileTransactionTable';
import './ProfileTransactionList.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

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
        error: transactionsError,
        pagination,
        sortConfig
    } = useAppSelector((state) => state.profilerTransactions);

    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

    const loadTransactions = (page: number = currentPage, sort_by: string = sortBy, sort_order: 'asc' | 'desc' = sortOrder) => {
        dispatch(fetchProfilerTransactionsByProfile({
            profileId,
            page,
            limit: 10,
            sort_by,
            sort_order
        }));
    };

    const handlePageChange = (page: number) => {
        logger.log('Changing page to:', page);
        setCurrentPage(page);
        loadTransactions(page);
    };

    const handleSort = (sort_by: string, sort_order: 'asc' | 'desc') => {
        logger.log('Sorting by:', sort_by, sort_order);
        setSortBy(sort_by);
        setSortOrder(sort_order);
        loadTransactions(currentPage, sort_by, sort_order);
    };

    const handleRefresh = () => {
        logger.log('Refreshing transactions');
        loadTransactions();
    };

    if (profileLoading || !selectedProfile) {
        return (
            <div className="profile-transaction-list__loading">
                <Loader2 size={40} className="profile-transaction-list__spinner" />
                <p>Loading profile...</p>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

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
                                    <span className="profile-transaction-header__balance-value">{formatCurrency(selectedProfile.pre_planned_deposit_amount)}</span>
                                </div>

                                <div className="profile-transaction-header__balance-item">
                                    <span className="profile-transaction-header__balance-label">Current Balance</span>
                                    <span className={`profile-transaction-header__balance-value ${selectedProfile.current_balance > 0
                                        ? 'profile-transaction-header__balance-value--positive'
                                        : selectedProfile.current_balance < 0
                                            ? 'profile-transaction-header__balance-value--negative'
                                            : ''
                                        }`}>
                                        {formatCurrency(selectedProfile.current_balance)}
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
                    <ProfileTransactionTable
                        transactions={transactions}
                        loading={transactionsLoading}
                        pagination={pagination}
                        sortConfig={{ sort_by: sortBy, sort_order: sortOrder }}
                        onPageChange={handlePageChange}
                        onSort={handleSort}
                        onRefresh={handleRefresh}
                    />
                </div>
            </div>
        </>
    );
};

export default ProfileTransactionList;
