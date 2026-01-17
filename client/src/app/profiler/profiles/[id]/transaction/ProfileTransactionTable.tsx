'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteProfilerTransaction } from '@/store/actions/profilerTransactionActions';
import { ProfilerTransaction, ProfilerTransactionPaginationInfo } from '@/services/profilerTransactionService';
import { Trash2, ChevronUp, ChevronDown, TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import DeleteProfileTransactionModal from './DeleteProfileTransactionModal';
import './ProfileTransactionTable.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

interface ProfileTransactionTableProps {
    transactions: ProfilerTransaction[];
    loading: boolean;
    sortConfig: {
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    searchQuery?: string;
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    onRefresh: () => void;
}

const ProfileTransactionTable: React.FC<ProfileTransactionTableProps> = ({
    transactions,
    loading,
    sortConfig,
    searchQuery = '',
    onSort,
    onRefresh
}) => {
    const dispatch = useAppDispatch();
    const { deletingTransactionIds } = useAppSelector((state) => state.profilerTransactions);
    const [deleteModalTransaction, setDeleteModalTransaction] = useState<ProfilerTransaction | null>(null);
    const [showHeaderShadow, setShowHeaderShadow] = useState(false);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const tableHeaderRef = useRef<HTMLTableSectionElement>(null);

    const handleSortClick = (column: string) => {
        const newOrder = sortConfig.sort_by === column && sortConfig.sort_order === 'asc' ? 'desc' : 'asc';
        onSort(column, newOrder);
    };

    const getSortIcon = (column: string) => {
        if (sortConfig.sort_by !== column) {
            return null;
        }
        return sortConfig.sort_order === 'asc' 
            ? <ChevronUp size={14} className="profile-transaction-table__sort-icon profile-transaction-table__sort-icon--active" />
            : <ChevronDown size={14} className="profile-transaction-table__sort-icon profile-transaction-table__sort-icon--active" />;
    };

    const handleDeleteClick = (transaction: ProfilerTransaction) => {
        setDeleteModalTransaction(transaction);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModalTransaction) return;

        try {
            await dispatch(deleteProfilerTransaction({ id: deleteModalTransaction.id })).unwrap();
            toast.success('Transaction deleted successfully');
            setDeleteModalTransaction(null);
            onRefresh();
        } catch (error: any) {
            logger.error('Error deleting transaction:', error);
            toast.error(error || 'Failed to delete transaction');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Handle scroll events to show/hide header shadow
    useEffect(() => {
        const container = tableContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            setShowHeaderShadow(scrollTop > 5);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Calculate table height offset
    useEffect(() => {
        const calculateTableHeight = () => {
            const tableWrap = tableContainerRef.current?.parentElement;
            if (!tableWrap) return;

            const rect = tableWrap.getBoundingClientRect();
            const topOffset = rect.top;
            const bottomPadding = 60;
            const totalOffset = topOffset + bottomPadding;

            document.documentElement.style.setProperty('--table-offset', `${totalOffset}px`);
        };

        const timer = setTimeout(calculateTableHeight, 100);
        window.addEventListener('resize', calculateTableHeight);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateTableHeight);
        };
    }, []);

    if (loading) {
        return (
            <div className="profile-transaction-table-wrap">
                <div className="profile-transaction-table__container">
                    <div className="profile-transaction-table__loading">
                        <Loader2 size={40} className="profile-transaction-table__spinner" />
                        <p>Loading transactions...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="profile-transaction-table-wrap">
                <div className="profile-transaction-table__container">
                    <div className="profile-transaction-table__no-results">
                        <p>No transactions found for this profile</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="profile-transaction-table-wrap">
                <div className="profile-transaction-table__container" ref={tableContainerRef}>
                    <table className="profile-transaction-table">
                        <thead className={`profile-transaction-table__thead ${showHeaderShadow ? 'table__header--shadow' : ''}`} ref={tableHeaderRef}>
                            <tr>
                                <th className="profile-transaction-table__th">
                                    <div className="profile-transaction-table__sort-header" onClick={() => handleSortClick('transaction_type')}>
                                        Type {getSortIcon('transaction_type')}
                                    </div>
                                </th>
                                <th className="profile-transaction-table__th profile-transaction-table__th--right">
                                    <div className="profile-transaction-table__sort-header" onClick={() => handleSortClick('amount')}>
                                        Amount {getSortIcon('amount')}
                                    </div>
                                </th>
                                <th className="profile-transaction-table__th profile-transaction-table__th--right">
                                    Charges
                                </th>
                                <th className="profile-transaction-table__th">Notes</th>
                                <th className="profile-transaction-table__th">
                                    <div className="profile-transaction-table__sort-header" onClick={() => handleSortClick('created_at')}>
                                        Date {getSortIcon('created_at')}
                                    </div>
                                </th>
                                <th className="profile-transaction-table__th profile-transaction-table__th--actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="profile-transaction-table__tbody">
                            {transactions.map((transaction) => {
                                const isDeleting = deletingTransactionIds.includes(transaction.id);

                                return (
                                    <tr key={transaction.id} className="profile-transaction-table__tr">
                                        <td className="profile-transaction-table__td">
                                            <div className={`profile-transaction-table__type profile-transaction-table__type--${transaction.transaction_type}`}>
                                                {transaction.transaction_type === 'deposit' ? (
                                                    <ArrowDownLeft size={16} />
                                                ) : (
                                                    <ArrowUpRight size={16} />
                                                )}
                                                <span>{transaction.transaction_type}</span>
                                            </div>
                                        </td>
                                        <td className="profile-transaction-table__td profile-transaction-table__td--right">
                                            <span className={`profile-transaction-table__amount profile-transaction-table__amount--${transaction.transaction_type}`}>
                                                {formatCurrency(transaction.amount)}
                                            </span>
                                        </td>
                                        <td className="profile-transaction-table__td profile-transaction-table__td--right">
                                            {transaction.withdraw_charges_amount ? (
                                                <span className="profile-transaction-table__charges">
                                                    {formatCurrency(transaction.withdraw_charges_amount)}
                                                    {transaction.withdraw_charges_percentage && (
                                                        <span className="profile-transaction-table__charges-percent">
                                                            ({transaction.withdraw_charges_percentage}%)
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="profile-transaction-table__empty">—</span>
                                            )}
                                        </td>
                                        <td className="profile-transaction-table__td">
                                            {transaction.notes ? (
                                                <span className="profile-transaction-table__notes">{transaction.notes}</span>
                                            ) : (
                                                <span className="profile-transaction-table__empty">—</span>
                                            )}
                                        </td>
                                        <td className="profile-transaction-table__td">
                                            <span className="profile-transaction-table__date">
                                                {formatDate(transaction.created_at)}
                                            </span>
                                        </td>
                                        <td className="profile-transaction-table__td profile-transaction-table__td--actions">
                                            <div className="profile-transaction-table__actions">
                                                <Button
                                                    variant="ghost"
                                                    size="small"
                                                    icon={<Trash2 size={16} />}
                                                    onClick={() => handleDeleteClick(transaction)}
                                                    disabled={isDeleting}
                                                    className="profile-transaction-table__delete-btn"
                                                    title="Delete transaction"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteModalTransaction && (
                <DeleteProfileTransactionModal
                    transaction={deleteModalTransaction}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteModalTransaction(null)}
                />
            )}
        </>
    );
};

export default ProfileTransactionTable;
