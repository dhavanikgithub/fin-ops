'use client'
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfilerBank, deleteProfilerBank } from '@/store/actions/profilerBankActions';
import { ProfilerBank } from '@/services/profilerBankService';
import { Edit, Trash2, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import DeleteProfilerBankModal from './DeleteProfilerBankModal';
import './ProfilerBankTable.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

interface ProfilerBankTableProps {
    banks: ProfilerBank[];
    sortConfig: {
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    onRefresh: () => void;
}

const ProfilerBankTable: React.FC<ProfilerBankTableProps> = ({
    banks,
    sortConfig,
    onSort,
    onRefresh
}) => {
    const dispatch = useAppDispatch();
    const { savingBankIds, deletingBankIds } = useAppSelector((state) => state.profilerBanks);
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<ProfilerBank>>({});
    const [deleteModalBank, setDeleteModalBank] = useState<ProfilerBank | null>(null);

    const handleSortClick = (column: string) => {
        const newOrder = sortConfig.sort_by === column && sortConfig.sort_order === 'asc' ? 'desc' : 'asc';
        onSort(column, newOrder);
    };

    const getSortIcon = (column: string) => {
        if (sortConfig.sort_by !== column) {
            return <Minus size={14} className="profiler-bank-table__sort-icon" />;
        }
        return sortConfig.sort_order === 'asc' 
            ? <ChevronUp size={14} className="profiler-bank-table__sort-icon profiler-bank-table__sort-icon--active" />
            : <ChevronDown size={14} className="profiler-bank-table__sort-icon profiler-bank-table__sort-icon--active" />;
    };

    const handleEdit = (bank: ProfilerBank) => {
        setEditingId(bank.id);
        setEditFormData({
            id: bank.id,
            bank_name: bank.bank_name
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const handleSave = async (bankId: number) => {
        try {
            if (!editFormData.bank_name?.trim()) {
                toast.error('Bank name is required');
                return;
            }

            await dispatch(updateProfilerBank({
                id: bankId,
                bank_name: editFormData.bank_name
            })).unwrap();

            toast.success('Bank updated successfully');
            setEditingId(null);
            setEditFormData({});
        } catch (error: any) {
            logger.error('Error updating profiler bank:', error);
            toast.error(error || 'Failed to update bank');
        }
    };

    const handleDeleteClick = (bank: ProfilerBank) => {
        setDeleteModalBank(bank);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModalBank) return;

        try {
            await dispatch(deleteProfilerBank({ id: deleteModalBank.id })).unwrap();
            toast.success('Bank deleted successfully');
            setDeleteModalBank(null);
            onRefresh();
        } catch (error: any) {
            logger.error('Error deleting profiler bank:', error);
            toast.error(error || 'Failed to delete bank');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <>
            <div className="profiler-bank-table">
                <div className="profiler-bank-table__wrapper">
                    <table className="profiler-bank-table__table">
                        <thead className="profiler-bank-table__thead">
                            <tr>
                                <th onClick={() => handleSortClick('bank_name')} className="profiler-bank-table__th profiler-bank-table__th--sortable">
                                    <div className="profiler-bank-table__th-content">
                                        Bank Name {getSortIcon('bank_name')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('profile_count')} className="profiler-bank-table__th profiler-bank-table__th--sortable profiler-bank-table__th--center">
                                    <div className="profiler-bank-table__th-content">
                                        Profiles {getSortIcon('profile_count')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('created_at')} className="profiler-bank-table__th profiler-bank-table__th--sortable">
                                    <div className="profiler-bank-table__th-content">
                                        Created {getSortIcon('created_at')}
                                    </div>
                                </th>
                                <th className="profiler-bank-table__th profiler-bank-table__th--actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="profiler-bank-table__tbody">
                            {banks.map((bank) => {
                                const isEditing = editingId === bank.id;
                                const isSaving = savingBankIds.includes(bank.id);
                                const isDeleting = deletingBankIds.includes(bank.id);

                                return (
                                    <tr key={bank.id} className="profiler-bank-table__tr">
                                        <td className="profiler-bank-table__td">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.bank_name || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, bank_name: e.target.value })}
                                                    className="profiler-bank-table__input"
                                                    placeholder="Bank name"
                                                />
                                            ) : (
                                                <div className="profiler-bank-table__bank-name">
                                                    {bank.bank_name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="profiler-bank-table__td profiler-bank-table__td--center">
                                            <span className={`profiler-bank-table__badge ${bank.profile_count > 0 ? 'profiler-bank-table__badge--success' : 'profiler-bank-table__badge--muted'}`}>
                                                {bank.profile_count}
                                            </span>
                                        </td>
                                        <td className="profiler-bank-table__td">
                                            <span className="profiler-bank-table__date">
                                                {formatDate(bank.created_at)}
                                            </span>
                                        </td>
                                        <td className="profiler-bank-table__td profiler-bank-table__td--actions">
                                            <div className="profiler-bank-table__actions">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            variant="primary"
                                                            size="small"
                                                            onClick={() => handleSave(bank.id)}
                                                            disabled={isSaving}
                                                        >
                                                            {isSaving ? 'Saving...' : 'Save'}
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="small"
                                                            onClick={handleCancelEdit}
                                                            disabled={isSaving}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="small"
                                                            icon={<Edit size={16} />}
                                                            onClick={() => handleEdit(bank)}
                                                            disabled={isDeleting}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="small"
                                                            icon={<Trash2 size={16} />}
                                                            onClick={() => handleDeleteClick(bank)}
                                                            disabled={isDeleting || bank.profile_count > 0}
                                                            className="profiler-bank-table__delete-btn"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteModalBank && (
                <DeleteProfilerBankModal
                    bank={deleteModalBank}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteModalBank(null)}
                />
            )}
        </>
    );
};

export default ProfilerBankTable;
