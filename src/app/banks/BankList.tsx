'use client'
import React, { useState, useEffect } from 'react';
import { Plus, SlidersHorizontal, Edit, Trash, MoreHorizontal, Building2, Search, X, Loader } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
    fetchPaginatedBanks, 
    updateBank, 
    deleteBank 
} from '../../store/actions/bankActions';
import { 
    setSearchQuery, 
    setSorting, 
    setEditingBank, 
    closeEditForm, 
    clearError 
} from '../../store/slices/bankSlice';
import { Bank } from '../../services/bankService';
import DeleteBankConfirmModal, { Bank as ModalBank } from './DeleteBankConfirmModal';
import { formatDateToMonthYear } from '../../utils/helperFunctions';
import './BankList.scss';

interface BankListProps {
    onNewBank: () => void;
}

const BankList: React.FC<BankListProps> = ({ onNewBank }) => {
    const dispatch = useAppDispatch();
    const { 
        banks, 
        loading, 
        error, 
        searchQuery, 
        sortBy, 
        sortOrder, 
        pagination,
        editingBank,
        showEditForm,
        updating,
        deleting
    } = useAppSelector(state => state.banks);

    const [localSearch, setLocalSearch] = useState('');
    const [editForm, setEditForm] = useState({ name: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Load banks on component mount
    useEffect(() => {
        dispatch(fetchPaginatedBanks({ 
            page: 1, 
            limit: 50, 
            search: searchQuery, 
            sort_by: sortBy, 
            sort_order: sortOrder 
        }));
    }, [dispatch, searchQuery, sortBy, sortOrder]);

    // Update edit form when editing bank changes
    useEffect(() => {
        if (editingBank) {
            setEditForm({ name: editingBank.name });
        }
    }, [editingBank]);

    // Handle search input with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (localSearch !== searchQuery) {
                dispatch(setSearchQuery(localSearch));
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [localSearch, searchQuery, dispatch]);

    // Event handlers
    const handleNewBank = () => {
        onNewBank();
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearch(e.target.value);
    };

    const handleEditBank = (bank: Bank) => {
        dispatch(setEditingBank(bank));
    };

    const handleSaveBank = async () => {
        if (!editingBank || !editForm.name.trim()) return;

        try {
            await dispatch(updateBank({
                id: editingBank.id,
                name: editForm.name.trim()
            }));
            // Success handling is done in the reducer
        } catch (error) {
            console.error('Failed to update bank:', error);
        }
    };

    const handleDeleteBank = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async (bankId: string, deleteTransactions: boolean) => {
        try {
            await dispatch(deleteBank({ id: parseInt(bankId) }));
            setIsDeleteModalOpen(false);
            dispatch(closeEditForm());
        } catch (error) {
            console.error('Failed to delete bank:', error);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const handleCancelEdit = () => {
        dispatch(closeEditForm());
        setEditForm({ name: '' });
    };

    // Convert Bank to ModalBank format
    const getModalBank = (bank: Bank | null): ModalBank | null => {
        if (!bank) return null;
        return {
            id: bank.id.toString(),
            name: bank.name,
            accountNumber: `XXXX${bank.id.toString().padStart(4, '0')}`, // Mock account number
            linkedTransactionsCount: bank.transaction_count,
        };
    };

    // Format date for display
    const formatDisplayDate = (dateStr: string): string => {
        try {
            return formatDateToMonthYear(dateStr);
        } catch {
            return dateStr;
        }
    };

    const isUpdating = editingBank ? updating.includes(editingBank.id) : false;
    const isDeleting = editingBank ? deleting.includes(editingBank.id) : false;

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Banks</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleNewBank}>
                        <Plus size={16} />
                        Add New Bank
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
                                placeholder="Search banks..."
                                value={localSearch}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>

                    {loading && (
                        <div className="main__loading">
                            <Loader className="spinner" size={20} />
                            Loading banks...
                        </div>
                    )}

                    {error && (
                        <div className="main__error">
                            Error: {error}
                            <button onClick={() => dispatch(clearError())}>Dismiss</button>
                        </div>
                    )}

                    <div className="banks-grid">
                        {banks.map(bank => (
                            <div 
                                className={`bank-card ${editingBank?.id === bank.id ? 'bank-card--selected' : ''}`}
                                key={bank.id}
                            >
                                <div className="bank-left">
                                    {deleting.includes(bank.id) && (
                                        <div className="bank-card__overlay">
                                            <Loader className="spinner" size={20} />
                                        </div>
                                    )}
                                    <Building2 size={22} />
                                    <div>
                                        <div className="bank-title">{bank.name}</div>
                                        <div className="bank-sub">Created: {formatDisplayDate(bank.create_date)}</div>
                                    </div>
                                </div>
                                <div className="bank-meta">
                                    <div className="meta-block">
                                        <div className="meta-label">Transactions</div>
                                        <div className="meta-value">{bank.transaction_count.toLocaleString()}</div>
                                    </div>
                                    <button 
                                        className="row-actions"
                                        onClick={() => handleEditBank(bank)}
                                        disabled={deleting.includes(bank.id)}
                                    >
                                        <MoreHorizontal size={16} />
                                        Manage
                                    </button>
                                </div>
                            </div>
                        ))}
                        {!loading && banks.length === 0 && (
                            <div className="bank-card bank-card--empty">
                                {searchQuery ? 'No banks found matching your search.' : 'No banks found.'}
                            </div>
                        )}
                    </div>
                </div>

                {showEditForm && editingBank && (
                    <div className="detail">
                        {isUpdating && (
                            <div className="detail__overlay">
                                <Loader className="spinner" size={24} />
                            </div>
                        )}
                        <div className="detail__header">
                            <Building2 size={28} />
                            <div>
                                <div className="detail__name">Edit Bank</div>
                                <div className="label">Update bank details or delete</div>
                            </div>
                        </div>
                        <div className="form">
                            <div>
                                <div className="label">Bank Name</div>
                                <input 
                                    className="control" 
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ name: e.target.value })}
                                    disabled={isUpdating || isDeleting}
                                />
                            </div>
                            <div>
                                <div className="label">Created On</div>
                                <input 
                                    className="control" 
                                    value={formatDisplayDate(editingBank.create_date)} 
                                    readOnly 
                                />
                            </div>
                            <div>
                                <div className="label">Transactions</div>
                                <input 
                                    className="control" 
                                    value={editingBank.transaction_count.toLocaleString()} 
                                    readOnly 
                                />
                            </div>
                            <div className="inline-actions">
                                <button 
                                    className="main__button"
                                    onClick={handleSaveBank}
                                    disabled={isUpdating || isDeleting || !editForm.name.trim()}
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader className="spinner" size={16} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Edit size={16} />
                                            Save
                                        </>
                                    )}
                                </button>
                                <button 
                                    className="main__icon-button" 
                                    onClick={handleDeleteBank}
                                    disabled={isUpdating || isDeleting}
                                >
                                    <Trash size={16} />
                                    Delete
                                </button>
                                <button 
                                    className="main__secondary-button" 
                                    onClick={handleCancelEdit}
                                    disabled={isUpdating || isDeleting}
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DeleteBankConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onDelete={handleDeleteConfirm}
                bank={getModalBank(editingBank)}
            />
        </div>
    );
};

export default BankList;