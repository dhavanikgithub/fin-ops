'use client'
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfilerProfileById } from '@/store/actions/profilerProfileActions';
import { fetchProfilerTransactionsByProfile } from '@/store/actions/profilerTransactionActions';
import { clearProfilerTransactions } from '@/store/slices/profilerTransactionSlice';
import { Loader2 } from 'lucide-react';
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

    return (
        <>
            <ProfileTransactionHeader
                profile={selectedProfile}
                onAddTransaction={onAddTransaction}
                onRefresh={handleRefresh}
            />

            <div className="main__content">
                <div className="main__view">
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
