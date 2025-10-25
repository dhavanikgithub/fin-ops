'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, MoreHorizontal, CreditCard, Search, X, Loader } from 'lucide-react';
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

interface CardListProps {
    onNewCard: () => void;
}

const CardList: React.FC<CardListProps> = ({ onNewCard }) => {
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
        dispatch(fetchPaginatedCards({ 
            page: 1, 
            limit: 50, 
            search: searchQuery, 
            sort_by: sortBy, 
            sort_order: sortOrder 
        }));
    }, [dispatch, searchQuery, sortBy, sortOrder]);

    // Update edit form when editing card changes
    useEffect(() => {
        if (editingCard) {
            setEditForm({ name: editingCard.name });
        }
    }, [editingCard]);

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
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalSearch(e.target.value);
    };

    const handleEditCard = (card: Card) => {
        dispatch(setEditingCard(card));
    };

    const handleSaveCard = async () => {
        if (!editingCard || !editForm.name.trim()) return;

        try {
            await dispatch(updateCard({
                id: editingCard.id,
                name: editForm.name.trim()
            }));
            // Success handling is done in the reducer
        } catch (error) {
            console.error('Failed to update card:', error);
        }
    };

    const handleDeleteCard = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async (cardId: string, deleteTransactions: boolean) => {
        try {
            await dispatch(deleteCard({ id: parseInt(cardId) }));
            setIsDeleteModalOpen(false);
            dispatch(closeEditForm());
        } catch (error) {
            console.error('Failed to delete card:', error);
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const handleCancelEdit = () => {
        dispatch(closeEditForm());
        setEditForm({ name: '' });
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
};

export default CardList;