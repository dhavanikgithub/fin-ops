'use client';
import React, { useState, useEffect } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { Plus, Edit, Trash, MoreHorizontal, CreditCard, Search, X, Loader, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
    fetchPaginatedCards, 
    updateCard, 
    deleteCard 
} from '../../store/actions/cardActions';
import { 
    setSearchQuery, 
    setSorting, 
    setEditingCard, 
    closeEditForm, 
    clearError 
} from '../../store/slices/cardSlice';
import { Card } from '../../services/cardService';
import DeleteCardConfirmModal, { Card as ModalCard } from './DeleteCardConfirmModal';
import { formatDateToMonthYear } from '../../utils/helperFunctions';
import './CardList.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

// Error Fallback Component for Card List
const CardListErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onNewCard: () => void;
}> = ({ error, resetErrorBoundary, onNewCard }) => {
    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <AlertTriangle size={16} />
                    <h1>Error - Cards</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={onNewCard}>
                        <Plus size={16} />
                        New Card
                    </button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="cl__error-boundary">
                        <div className="cl__error-boundary-content">
                            <AlertTriangle size={64} className="cl__error-boundary-icon" />
                            <h2 className="cl__error-boundary-title">Something went wrong</h2>
                            <p className="cl__error-boundary-message">
                                We encountered an unexpected error while loading the cards list. 
                                Your card data is safe. You can try refreshing or add a new card.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="cl__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="cl__error-boundary-stack">
                                        {error.message}
                                        {error.stack && '\n\nStack trace:\n' + error.stack}
                                    </pre>
                                </details>
                            )}
                            <div className="cl__error-boundary-actions">
                                <button 
                                    className="main__button"
                                    onClick={resetErrorBoundary}
                                >
                                    <RotateCcw size={16} />
                                    Try Again
                                </button>
                                <button 
                                    className="main__icon-button"
                                    onClick={onNewCard}
                                >
                                    <Plus size={16} />
                                    Add New Card
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

interface CardListProps {
    onNewCard: () => void;
}

const CardListContent: React.FC<CardListProps> = ({ onNewCard }) => {
    const { showBoundary } = useErrorBoundary();
    const dispatch = useAppDispatch();
    const { 
        cards, 
        loading, 
        error, 
        searchQuery, 
        sortBy, 
        sortOrder, 
        pagination,
        editingCard,
        showEditForm,
        updating,
        deleting
    } = useAppSelector(state => state.cards);

    const [localSearch, setLocalSearch] = useState('');
    const [editForm, setEditForm] = useState({ name: '' });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Load cards on component mount
    useEffect(() => {
        try {
            dispatch(fetchPaginatedCards({ 
                page: 1, 
                limit: 50, 
                search: searchQuery, 
                sort_by: sortBy, 
                sort_order: sortOrder 
            }));
        } catch (error) {
            logger.error('Error fetching cards:', error);
        }
    }, [dispatch, searchQuery, sortBy, sortOrder]);

    // Update edit form when editing card changes
    useEffect(() => {
        try {
            if (editingCard) {
                setEditForm({ name: editingCard.name });
            }
        } catch (error) {
            logger.error('Error updating edit form:', error);
        }
    }, [editingCard]);

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
            // Don't throw here as this could cause infinite loops
        }
    }, [localSearch, searchQuery, dispatch]);

    // Event handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setLocalSearch(e.target.value);
        } catch (error) {
            logger.error('Error handling search change:', error);
            toast.error('Failed to update search.');
        }
    };

    const handleEditCard = (card: Card) => {
        try {
            dispatch(setEditingCard(card));
        } catch (error) {
            logger.error('Error setting editing card:', error);
            toast.error('Failed to open card for editing.');
            showBoundary(error);
        }
    };

    const handleSaveCard = async () => {
        try {
            if (!editingCard || !editForm.name.trim()) return;

            await dispatch(updateCard({
                id: editingCard.id,
                name: editForm.name.trim()
            })).unwrap();
            // Success handling is done in the reducer
            toast.success('Card saved successfully.');
        } catch (error) {
            logger.error('Failed to update card:', error);
            toast.error('Failed to update card.');
            showBoundary(error);
        }
    };

    const handleDeleteCard = () => {
        try {
            setIsDeleteModalOpen(true);
        } catch (error) {
            logger.error('Error opening delete modal:', error);
            toast.error('Failed to open delete confirmation.');
            showBoundary(error);
        }
    };

    const handleDeleteConfirm = async (cardId: string, deleteTransactions: boolean) => {
        try {
            await dispatch(deleteCard({ id: parseInt(cardId) })).unwrap();
            setIsDeleteModalOpen(false);
            dispatch(closeEditForm());
            toast.success('Card deleted successfully.');
        } catch (error) {
            logger.error('Failed to delete card:', error);
            toast.error('Failed to delete card.');
            showBoundary(error);
        }
    };

    const handleDeleteCancel = () => {
        try {
            setIsDeleteModalOpen(false);
        } catch (error) {
            logger.error('Error closing delete modal:', error);
            showBoundary(error);
        }
    };

    const handleCancelEdit = () => {
        try {
            dispatch(closeEditForm());
            setEditForm({ name: '' });``
        } catch (error) {
            logger.error('Error cancelling edit:', error);
            showBoundary(error);
        }
    };

    // Convert Card to ModalCard format
    const getModalCard = (card: Card | null): ModalCard | null => {
        if (!card) return null;
        return {
            id: card.id.toString(),
            name: card.name,
            linkedTransactionsCount: card.transaction_count,
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

    const isUpdating = editingCard ? updating.includes(editingCard.id) : false;
    const isDeleting = editingCard ? deleting.includes(editingCard.id) : false;

    try {
        return (
            <>
                <header className="main__header">
                    <div className="main__header-left">
                        <CreditCard size={20} /> <h1>Cards</h1>
                    </div>
                    <div className="main__header-right">
                        <button className="main__icon-button" onClick={onNewCard}>
                            <Plus size={16} />
                            New Card
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
                                    placeholder="Search cards..."
                                    value={localSearch}
                                    onChange={handleSearchChange}
                                    onFocus={e => e.target.select()}
                                />
                            </div>
                        </div>

                        {loading && (
                            <div className="main__loading">
                                <Loader className="spinner" size={20} />
                                Loading cards...
                            </div>
                        )}

                        {error && (
                            <div className="main__error">
                                Error: {error}
                                <button onClick={() => dispatch(clearError())}>Dismiss</button>
                            </div>
                        )}

                        <div className="cards-grid">
                            {cards.map(card => (
                                <div 
                                    className={`card-item ${editingCard?.id === card.id ? 'card-item--selected' : ''}`} 
                                    key={card.id}
                                >
                                    <div className="card-left">
                                        {deleting.includes(card.id) && (
                                            <div className="card-item__overlay">
                                                <Loader className="spinner" size={20} />
                                            </div>
                                        )}
                                        <CreditCard size={22} />
                                        <div>
                                            <div className="card-title">{card.name}</div>
                                            <div className="card-sub">Created: {formatDisplayDate(card.create_date)}</div>
                                        </div>
                                    </div>
                                    <div className="card-meta">
                                        <div className="meta-block">
                                            <div className="meta-label">Transactions</div>
                                            <div className="meta-value">{card.transaction_count.toLocaleString()}</div>
                                        </div>
                                        <button 
                                            className="row-actions" 
                                            onClick={() => handleEditCard(card)}
                                            disabled={deleting.includes(card.id)}
                                        >
                                            <MoreHorizontal size={16} />
                                            Manage
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {!loading && cards.length === 0 && (
                                <div className="card-item card-item--empty">
                                    {searchQuery ? 'No cards found matching your search.' : 'No cards found.'}
                                </div>
                            )}
                        </div>
                    </div>

                    {showEditForm && editingCard && (
                        <div className="detail">
                            {isUpdating && (
                                <div className="detail__overlay">
                                    <Loader className="spinner" size={24} />
                                </div>
                            )}
                            <div className="detail__header">
                                <CreditCard size={28} />
                                <div>
                                    <div className="detail__name">Edit Card</div>
                                    <div className="label">Update card details or delete</div>
                                </div>
                                <button className="detail__cancel" onClick={handleCancelEdit}>
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="form">
                                <div>
                                    <div className="label">Card Name</div>
                                    <input 
                                        className="control" 
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ name: e.target.value })}
                                        onFocus={e => e.target.select()}
                                        disabled={isUpdating || isDeleting}
                                    />
                                </div>
                                <div>
                                    <div className="label">Created On</div>
                                    <input 
                                        className="control" 
                                        value={formatDisplayDate(editingCard.create_date)} 
                                        readOnly 
                                    />
                                </div>
                                <div>
                                    <div className="label">Transactions</div>
                                    <input 
                                        className="control" 
                                        value={editingCard.transaction_count.toLocaleString()} 
                                        readOnly 
                                    />
                                </div>
                                <div className="inline-actions">
                                    <button 
                                        className="main__button"
                                        onClick={handleSaveCard}
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
                                        onClick={handleDeleteCard}
                                        disabled={isUpdating || isDeleting}
                                    >
                                        <Trash size={16} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DeleteCardConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={handleDeleteCancel}
                    onDelete={handleDeleteConfirm}
                    card={getModalCard(editingCard)}
                />
            </>
        );
    } catch (error) {
        logger.error('Error rendering card list:', error);
        showBoundary(error);
    }
};

// Main wrapper component with ErrorBoundary
const CardList: React.FC<CardListProps> = (props) => {
    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <CardListErrorFallback {...fallbackProps} onNewCard={props.onNewCard} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Card list error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <CardListContent {...props} />
        </ErrorBoundary>
    );
};

export default CardList;