'use client'
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { deleteProfilerTransaction } from '@/store/actions/profilerTransactionActions';
import { ProfilerTransaction } from '@/services/profilerTransactionService';
import { Trash2, ChevronUp, ChevronDown, Minus, ArrowDownCircle, ArrowUpCircle, User, Building2, Calendar, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import DeleteProfilerTransactionModal from './DeleteProfilerTransactionModal';
import './ProfilerTransactionTable.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';
import { formatAmountAsCurrency, formatDate } from '@/utils/helperFunctions';

interface ProfilerTransactionTableProps {
    transactions: ProfilerTransaction[];
    sortConfig: {
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    onRefresh: () => void;
}

const ProfilerTransactionTable: React.FC<ProfilerTransactionTableProps> = ({
    transactions,
    sortConfig,
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
            ? <ChevronUp size={14} className="profiler-transaction-table__sort-icon profiler-transaction-table__sort-icon--active" />
            : <ChevronDown size={14} className="profiler-transaction-table__sort-icon profiler-transaction-table__sort-icon--active" />;
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
            logger.error('Error deleting profiler transaction:', error);
            toast.error(error || 'Failed to delete transaction');
        }
    };


    return (
        <>
            <div className="profiler-transaction-table">
                <div className="profiler-transaction-table__wrapper">
                    <table className="profiler-transaction-table__table">
                        <thead className="profiler-transaction-table__thead">
                            <tr>
                                <th onClick={() => handleSortClick('transaction_date')} className="profiler-transaction-table__th profiler-transaction-table__th--sortable">
                                    <div className="profiler-transaction-table__th-content">
                                        Date {getSortIcon('transaction_date')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('transaction_type')} className="profiler-transaction-table__th profiler-transaction-table__th--sortable profiler-transaction-table__th--center">
                                    <div className="profiler-transaction-table__th-content">
                                        Type {getSortIcon('transaction_type')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('profiler_client_name')} className="profiler-transaction-table__th profiler-transaction-table__th--sortable">
                                    <div className="profiler-transaction-table__th-content">
                                        Client {getSortIcon('profiler_client_name')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('profiler_bank_name')} className="profiler-transaction-table__th profiler-transaction-table__th--sortable">
                                    <div className="profiler-transaction-table__th-content">
                                        Bank {getSortIcon('profiler_bank_name')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('original_amount')} className="profiler-transaction-table__th profiler-transaction-table__th--sortable profiler-transaction-table__th--right">
                                    <div className="profiler-transaction-table__th-content">
                                        Amount {getSortIcon('original_amount')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('charges_percentage')} className="profiler-transaction-table__th profiler-transaction-table__th--sortable profiler-transaction-table__th--right">
                                    <div className="profiler-transaction-table__th-content">
                                        Charges {getSortIcon('charges_percentage')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('adjusted_amount')} className="profiler-transaction-table__th profiler-transaction-table__th--sortable profiler-transaction-table__th--right">
                                    <div className="profiler-transaction-table__th-content">
                                        Net {getSortIcon('adjusted_amount')}
                                    </div>
                                </th>
                                <th className="profiler-transaction-table__th profiler-transaction-table__th--actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="profiler-transaction-table__tbody">
                            {transactions.map((transaction) => {
                                const isDeleting = deletingTransactionIds.includes(transaction.id);
                                const isDeposit = transaction.transaction_type.toLowerCase() === 'deposit';
                                
                                // Calculate adjusted amount based on charges
                                const chargesPercentage = transaction.withdraw_charges_percentage || 0;
                                const adjustedAmount = isDeposit 
                                    ? transaction.amount - (transaction.amount * chargesPercentage / 100)
                                    : transaction.amount + (transaction.amount * chargesPercentage / 100);

                                return (
                                    <tr key={transaction.id} className="profiler-transaction-table__tr">
                                        <td className="profiler-transaction-table__td">
                                            <div className="profiler-transaction-table__date">
                                                <Calendar size={14} />
                                                {formatDate(transaction.created_at)}
                                            </div>
                                        </td>
                                        <td className="profiler-transaction-table__td profiler-transaction-table__td--center">
                                            <span className={`profiler-transaction-table__badge profiler-transaction-table__badge--${isDeposit ? 'success' : 'destructive'}`}>
                                                {isDeposit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                                {transaction.transaction_type}
                                            </span>
                                        </td>
                                        <td className="profiler-transaction-table__td">
                                            <div className="profiler-transaction-table__client">
                                                <User size={14} />
                                                {transaction.client_name}
                                            </div>
                                        </td>
                                        <td className="profiler-transaction-table__td">
                                            <div className="profiler-transaction-table__bank">
                                                <Building2 size={14} />
                                                {transaction.bank_name}
                                            </div>
                                        </td>
                                        <td className="profiler-transaction-table__td profiler-transaction-table__td--right">
                                            <span className="profiler-transaction-table__amount">
                                                {formatAmountAsCurrency(transaction.amount)}
                                            </span>
                                        </td>
                                        <td className="profiler-transaction-table__td profiler-transaction-table__td--right">
                                            <span className="profiler-transaction-table__charges">
                                                {chargesPercentage}%
                                            </span>
                                        </td>
                                        <td className="profiler-transaction-table__td profiler-transaction-table__td--right">
                                            <span className={`profiler-transaction-table__amount profiler-transaction-table__amount--${isDeposit ? 'positive' : 'negative'}`}>
                                                {formatAmountAsCurrency(adjustedAmount)}
                                            </span>
                                        </td>
                                        <td className="profiler-transaction-table__td profiler-transaction-table__td--actions">
                                            <div className="profiler-transaction-table__actions">
                                                <Button
                                                    variant="ghost"
                                                    size="small"
                                                    icon={<Trash2 size={16} />}
                                                    onClick={() => handleDeleteClick(transaction)}
                                                    disabled={isDeleting}
                                                    className="profiler-transaction-table__delete-btn"
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
                <DeleteProfilerTransactionModal
                    transaction={deleteModalTransaction}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteModalTransaction(null)}
                />
            )}
        </>
    );
};

export default ProfilerTransactionTable;
