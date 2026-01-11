'use client'
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteProfilerTransaction } from '@/store/actions/profilerTransactionActions';
import { ProfilerTransaction } from '@/services/profilerTransactionService';
import { Trash2, ChevronUp, ChevronDown, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import Pagination from '@/components/Pagination';
import DeleteProfileTransactionModal from './DeleteProfileTransactionModal';
import './ProfileTransactionTable.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

interface ProfileTransactionTableProps {
    transactions: ProfilerTransaction[];
    loading: boolean;
    pagination: any;
    sortConfig: {
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    onPageChange: (page: number) => void;
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    onRefresh: () => void;
}

const ProfileTransactionTable: React.FC<ProfileTransactionTableProps> = ({
    transactions,
    loading,
    pagination,
    sortConfig,
    onPageChange,
    onSort,
    onRefresh
}) => {
    const dispatch = useAppDispatch();
    const { deletingTransactionIds } = useAppSelector((state) => state.profilerTransactions);
    const [deleteModalTransaction, setDeleteModalTransaction] = useState<ProfilerTransaction | null>(null);

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

    if (loading) {
        return (
            <div className="profile-transaction-table">
                <div className="profile-transaction-table__loading">
                    <Loader2 size={40} className="profile-transaction-table__spinner" />
                    <p>Loading transactions...</p>
                </div>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="profile-transaction-table">
                <div className="profile-transaction-table__empty">
                    <p>No transactions found for this profile</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="profile-transaction-table">
                <div className="profile-transaction-table__wrapper">
                    <table className="profile-transaction-table__table">
                        <thead className="profile-transaction-table__thead">
                            <tr>
                                <th onClick={() => handleSortClick('transaction_type')} className="profile-transaction-table__th profile-transaction-table__th--sortable">
                                    <div className="profile-transaction-table__th-content">
                                        Type {getSortIcon('transaction_type')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('amount')} className="profile-transaction-table__th profile-transaction-table__th--sortable profile-transaction-table__th--right">
                                    <div className="profile-transaction-table__th-content">
                                        Amount {getSortIcon('amount')}
                                    </div>
                                </th>
                                <th className="profile-transaction-table__th profile-transaction-table__th--right">
                                    Charges
                                </th>
                                <th className="profile-transaction-table__th">Notes</th>
                                <th onClick={() => handleSortClick('created_at')} className="profile-transaction-table__th profile-transaction-table__th--sortable">
                                    <div className="profile-transaction-table__th-content">
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
                                                    <TrendingUp size={16} />
                                                ) : (
                                                    <TrendingDown size={16} />
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

                {pagination && pagination.total_pages > 1 && (
                    <div className="profile-transaction-table__pagination">
                        <Pagination
                            currentPage={pagination.current_page}
                            totalPages={pagination.total_pages}
                            onPageChange={onPageChange}
                        />
                    </div>
                )}
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
