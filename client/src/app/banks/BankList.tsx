'use client'
import React, { useState, useEffect } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Plus, SlidersHorizontal, Edit, Trash, MoreHorizontal, Building2, Search, X, Loader, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { SearchInput, TextInput } from '@/components/FormInputs';
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
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface BankListProps {
    onNewBank: () => void;
}

// Error Fallback Component for Bank List
const BankListErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onNewBank: () => void;
}> = ({ error, resetErrorBoundary, onNewBank }) => {
    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <AlertTriangle size={16} />
                    <h1>Error - Banks</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={onNewBank}>
                        <Plus size={16} />
                        Add New Bank
                    </button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="bl__error-boundary">
                        <div className="bl__error-boundary-content">
                            <AlertTriangle size={64} className="bl__error-boundary-icon" />
                            <h2 className="bl__error-boundary-title">Something went wrong</h2>
                            <p className="bl__error-boundary-message">
                                We encountered an unexpected error while loading the banks list. 
                                Your bank data is safe. You can try refreshing or add a new bank.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="bl__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="bl__error-boundary-stack">
                                        {error.message}
                                        {error.stack && '\n\nStack trace:\n' + error.stack}
                                    </pre>
                                </details>
                            )}
                            <div className="bl__error-boundary-actions">
                                <button 
                                    className="main__button"
                                    onClick={resetErrorBoundary}
                                >
                                    <RotateCcw size={16} />
                                    Try Again
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={onNewBank}
                                >
                                    <Plus size={16} />
                                    Add New Bank
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={() => window.location.href = '/'}
                                >
                                    <Home size={16} />
                                    Go to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BankListContent: React.FC<BankListProps> = ({ onNewBank }) => {
    const { showBoundary } = useErrorBoundary();
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
        try {
            dispatch(fetchPaginatedBanks({ 
                page: 1, 
                limit: 50, 
                search: searchQuery, 
                sort_by: sortBy, 
                sort_order: sortOrder 
            }));
        } catch (error) {
            logger.error('Error loading banks:', error);
            showBoundary(error);
        }
    }, [dispatch, searchQuery, sortBy, sortOrder]);

    // Update edit form when editing bank changes
    useEffect(() => {
        try {
            if (editingBank) {
                setEditForm({ name: editingBank.name });
            }
        } catch (error) {
            logger.error('Error updating edit form:', error);
            showBoundary(error);
        }
    }, [editingBank]);

    // Handle search input with debounce
    useEffect(() => {
        try {
            const timer = setTimeout(() => {
                if (localSearch !== searchQuery) {
                    dispatch(setSearchQuery(localSearch));
                }
            }, 500);

            return () => clearTimeout(timer);
        } catch (error) {
            logger.error('Error handling search debounce:', error);
            throw error;
        }
    }, [localSearch, searchQuery, dispatch]);

    // Event handlers
    const handleNewBank = () => {
        try {
            logger.debug('Navigating to add new bank');
            onNewBank();
        } catch (error) {
            logger.error('Error navigating to add bank:', error);
            toast.error('Failed to open add bank form');
            showBoundary(error);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLocalSearch(e.target.value);
            logger.debug('Search query updated:', { query: e.target.value });
        } catch (error) {
            logger.error('Error updating search:', error);
            toast.error('Failed to update search');
            showBoundary(error);
        }
    };

    const handleEditBank = (bank: Bank) => {
        try {
            dispatch(setEditingBank(bank));
            logger.debug('Editing bank:', { bankId: bank.id, bankName: bank.name });
        } catch (error) {
            logger.error('Error setting editing bank:', error);
            toast.error('Failed to open bank for editing');
            showBoundary(error);
        }
    };

    const handleSaveBank = async () => {
        try {
            if (!editingBank || !editForm.name.trim()) {
                toast.error('Bank name is required');
                return;
            }

            logger.info('Attempting to update bank:', { 
                bankId: editingBank.id, 
                newName: editForm.name.trim() 
            });

            await dispatch(updateBank({
                id: editingBank.id,
                name: editForm.name.trim()
            }));
            toast.success('Bank updated successfully!');
            logger.info('Bank updated successfully');
            // Success handling is done in the reducer
        } catch (error) {
            logger.error('Failed to update bank:', error);
            toast.error('Failed to update bank. Please try again.');
            showBoundary(error);
        }
    };

    const handleDeleteBank = () => {
        try {
            logger.debug('Opening delete confirmation modal');
            setIsDeleteModalOpen(true);
        } catch (error) {
            logger.error('Error opening delete modal:', error);
            toast.error('Failed to open delete confirmation');
            showBoundary(error);
        }
    };

    const handleDeleteConfirm = async (bankId: string, deleteTransactions: boolean) => {
        try {
            logger.info('Attempting to delete bank:', { bankId, deleteTransactions });
            await dispatch(deleteBank({ id: parseInt(bankId) }));
            setIsDeleteModalOpen(false);
            dispatch(closeEditForm());
            toast.success('Bank deleted successfully!');
            logger.info('Bank deleted successfully');
        } catch (error) {
            logger.error('Failed to delete bank:', error);
            toast.error('Failed to delete bank. Please try again.');
            showBoundary(error);
        }
    };

    const handleDeleteCancel = () => {
        try {
            logger.debug('Cancelled bank deletion');
            setIsDeleteModalOpen(false);
        } catch (error) {
            logger.error('Error cancelling delete:', error);
            showBoundary(error);
        }
    };

    const handleCancelEdit = () => {
        try {
            logger.debug('Cancelled bank edit');
            dispatch(closeEditForm());
            setEditForm({ name: '' });
        } catch (error) {
            logger.error('Error cancelling edit:', error);
            toast.error('Failed to cancel edit');
            showBoundary(error);
        }
    };

    // Convert Bank to ModalBank format
    const getModalBank = (bank: Bank | null): ModalBank | null => {
        try {
            if (!bank) return null;
            return {
                id: bank.id.toString(),
                name: bank.name,
                accountNumber: `XXXX${bank.id.toString().padStart(4, '0')}`, // Mock account number
                linkedTransactionsCount: bank.transaction_count,
            };
        } catch (error) {
            logger.error('Error converting bank to modal format:', error);
            showBoundary(error);
            return null;
        }
    };

    // Format date for display
    const formatDisplayDate = (dateStr: string): string => {
        try {
            return formatDateToMonthYear(dateStr);
        } catch (error) {
            logger.error('Error formatting date:', error);
            return dateStr;
        }
    };

    const isUpdating = editingBank ? updating.includes(editingBank.id) : false;
    const isDeleting = editingBank ? deleting.includes(editingBank.id) : false;

    try {
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
                            <SearchInput
                                value={localSearch}
                                onChange={setLocalSearch}
                                placeholder="Search banks..."
                                loading={loading}
                            />
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
                                    <TextInput
                                        value={editForm.name}
                                        onChange={(value) => setEditForm({ name: value })}
                                        disabled={isUpdating || isDeleting}
                                    />
                                </div>
                                <div>
                                    <div className="label">Created On</div>
                                    <TextInput
                                        value={formatDisplayDate(editingBank.create_date)}
                                        onChange={() => {}}
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <div className="label">Transactions</div>
                                    <TextInput
                                        value={editingBank.transaction_count.toLocaleString()}
                                        onChange={() => {}}
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
    } catch (error) {
        logger.error('Error rendering bank list:', error);
        showBoundary(error);
    }
};

// Main wrapper component with ErrorBoundary
const BankList: React.FC<BankListProps> = (props) => {
    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <BankListErrorFallback {...fallbackProps} onNewBank={props.onNewBank} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Bank list error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <BankListContent {...props} />
        </ErrorBoundary>
    );
};

export default BankList;