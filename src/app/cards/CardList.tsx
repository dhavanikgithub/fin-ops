'use client';
import React, { useState } from 'react';
import { Plus, Edit, Trash, MoreHorizontal, CreditCard, Search, X } from 'lucide-react';
import DeleteCardConfirmModal from './DeleteCardConfirmModal';
import './CardList.scss';

interface Card {
    id: string;
    name: string;
    created: string;
    transactions: number;
    last4: string;
    cardNumber: string;
    linkedTransactionsCount: number;
}

interface CardListProps {
    onNewCard: () => void;
}

const mockCards: Card[] = [
    {
        id: '1',
        name: 'Visa Platinum',
        created: 'Jan 11, 2024',
        transactions: 128,
        last4: '1234',
        cardNumber: '4111111111111234',
        linkedTransactionsCount: 128,
    },
    {
        id: '2',
        name: 'Mastercard Business',
        created: 'Mar 03, 2024',
        transactions: 86,
        last4: '4421',
        cardNumber: '5555555555554421',
        linkedTransactionsCount: 86,
    },
    {
        id: '3',
        name: 'RuPay Classic',
        created: 'Jun 19, 2023',
        transactions: 42,
        last4: '9801',
        cardNumber: '6061111111119801',
        linkedTransactionsCount: 42,
    },
];

const CardList: React.FC<CardListProps> = ({ onNewCard }) => {
    const [search, setSearch] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<Card | null>(null);
    const [selectedCard, setSelectedCard] = useState<Card | null>(null);

    const filteredCards = mockCards.filter(card =>
        card.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectCard = (card: Card) => {
        setSelectedCard(card);
    };

    const handleDeselectCard = () => {
        setSelectedCard(null);
    };

    const handleDeleteCard = (card: Card) => {
        setCardToDelete(card);
        setIsDeleteModalOpen(true);
    };

    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCardToDelete(null);
    };

    const handleConfirmDelete = (cardId: string, deleteTransactions: boolean) => {
        // TODO: Implement actual delete logic
        console.log(`Deleting card ${cardId}, deleteTransactions: ${deleteTransactions}`);
        handleCloseDeleteModal();
    };

    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Cards</h1>
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
                                placeholder="Search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="cards-grid">
                        {filteredCards.map(card => (
                            <div 
                                className={`card-item ${selectedCard?.id === card.id ? 'card-item--selected' : ''}`} 
                                key={card.id}
                            >
                                <div className="card-left">
                                    <CreditCard size={22} />
                                    <div>
                                        <div className="card-title">{card.name}</div>
                                        <div className="card-sub">Created: {card.created}</div>
                                    </div>
                                </div>
                                <div className="card-meta">
                                    <div className="meta-block">
                                        <div className="meta-label">Transactions</div>
                                        <div className="meta-value">{card.transactions}</div>
                                    </div>
                                    <div className="meta-block">
                                        <div className="meta-label">Last 4</div>
                                        <div className="meta-value">{card.last4}</div>
                                    </div>
                                    <button className="row-actions" onClick={() => handleSelectCard(card)}>
                                        <MoreHorizontal size={16} />
                                        Manage
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredCards.length === 0 && (
                            <div className="card-item card-item--empty">
                                No cards found.
                            </div>
                        )}
                    </div>
                </div>

                {selectedCard && (
                    <div className="detail">
                        <div className="detail__header">
                            <CreditCard size={28} />
                            <div>
                                <div className="detail__name">Edit Card</div>
                                <div className="label">Update card details or delete</div>
                            </div>
                            <button className="detail__cancel" onClick={handleDeselectCard}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="form">
                            <div>
                                <div className="label">Card Name</div>
                                <input className="control" value={selectedCard.name} readOnly />
                            </div>
                            <div>
                                <div className="label">Created On</div>
                                <input className="control" value={selectedCard.created} readOnly />
                            </div>
                            <div className="inline-actions">
                                <button className="main__button">
                                    <Edit size={16} />
                                    Save
                                </button>
                                <button className="main__icon-button" onClick={() => handleDeleteCard(selectedCard)}>
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
                onClose={handleCloseDeleteModal}
                onDelete={handleConfirmDelete}
                card={cardToDelete}
            />
        </>
    );
};

export default CardList;