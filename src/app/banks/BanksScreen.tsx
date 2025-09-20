'use client'
import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Edit, Trash, MoreHorizontal, Building2 } from 'lucide-react';
import './BanksScreen.scss';

interface Bank {
    id: number;
    name: string;
    created: string;
    transactions: number;
}

const mockBanks: Bank[] = [
    {
        id: 1,
        name: 'HDFC Bank',
        created: 'Jan 10, 2024',
        transactions: 1204,
    },
    {
        id: 2,
        name: 'Axis Bank',
        created: 'Feb 02, 2024',
        transactions: 836,
    },
    {
        id: 3,
        name: 'ICICI Bank',
        created: 'Mar 18, 2023',
        transactions: 652,
    },
    {
        id: 4,
        name: 'State Bank of India',
        created: 'Jul 05, 2022',
        transactions: 2014,
    },
];

const BanksScreen: React.FC = () => {
    const [search, setSearch] = useState('');

    const filteredBanks = mockBanks.filter(bank =>
        bank.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Banks</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__button">
                        <Plus size={16} />
                        Add New Bank
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
                                placeholder="Search banks"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ minWidth: 220 }}
                            />
                        </div>
                        <div className="main__actions">
                            <button className="main__icon-button">
                                <SlidersHorizontal size={16} />
                                Filter
                            </button>
                        </div>
                    </div>

                    <div className="banks-grid">
                        {filteredBanks.map(bank => (
                            <div className="bank-card" key={bank.id}>
                                <div className="bank-left">
                                    <Building2 size={22} />
                                    <div>
                                        <div className="bank-title">{bank.name}</div>
                                        <div className="bank-sub">Created: {bank.created}</div>
                                    </div>
                                </div>
                                <div className="bank-meta">
                                    <div className="meta-block">
                                        <div className="meta-label">Transactions</div>
                                        <div className="meta-value">{bank.transactions.toLocaleString()}</div>
                                    </div>
                                    <button className="row-actions">
                                        <MoreHorizontal size={16} />
                                        Manage
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredBanks.length === 0 && (
                            <div className="bank-card bank-card--empty">
                                No banks found.
                            </div>
                        )}
                    </div>
                </div>

                <div className="detail">
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
                            <div className="control">HDFC Bank</div>
                        </div>
                        <div>
                            <div className="label">Created On</div>
                            <div className="control">Jan 10, 2024</div>
                        </div>
                        <div>
                            <div className="label">Transactions</div>
                            <div className="control">1,204</div>
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

export default BanksScreen;