'use client'
import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Edit, Trash, MoreHorizontal, CreditCard } from 'lucide-react';
import './CardsScreen.scss';

interface Card {
    id: number;
    name: string;
    created: string;
    transactions: number;
    last4: string;
}

const mockCards: Card[] = [
    {
        id: 1,
        name: 'Visa Platinum',
        created: 'Jan 11, 2024',
        transactions: 128,
        last4: '1234',
    },
    {
        id: 2,
        name: 'Mastercard Business',
        created: 'Mar 03, 2024',
        transactions: 86,
        last4: '4421',
    },
    {
        id: 3,
        name: 'RuPay Classic',
        created: 'Jun 19, 2023',
        transactions: 42,
        last4: '9801',
    },
];

const CardsScreen: React.FC = () => {
    const [search, setSearch] = useState('');

    const filteredCards = mockCards.filter(card =>
        card.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Cards</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__button">
                        <Plus size={16} />
                        New Card
                    </button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="main__view-header">
                        <div className="main__search-row">
                            <input
                                type="text"
                                className="main__input"
                                placeholder="Search cards"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ minWidth: 220 }}
                            />
                        </div>
                        <div className="main__actions">
                            <button className="main__icon-button">
                                <SlidersHorizontal size={16} />
                                Filters
                            </button>
                        </div>
                    </div>

                    <div className="cards-grid">
                        {filteredCards.map(card => (
                            <div className="card-item" key={card.id}>
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
                                    <button className="row-actions">
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

                <div className="detail">
                    <div className="detail__header">
                        <CreditCard size={28} />
                        <div>
                            <div className="detail__name">Edit Card</div>
                            <div className="label">Update card details or delete</div>
                        </div>
                    </div>
                    <div className="form">
                        <div>
                            <div className="label">Card Name</div>
                            <div className="control">Visa Platinum</div>
                        </div>
                        <div>
                            <div className="label">Created On</div>
                            <div className="control">Jan 11, 2024</div>
                        </div>
                        <div className="inline-actions">
                            <button className="main__button">
                                <Edit size={16} />
                                Save
                            </button>
                            <button className="main__icon-button">
                                <Trash size={16} />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardsScreen;