'use client'
import React, { useState } from 'react';
import { UserPlus, SlidersHorizontal } from 'lucide-react';
import './ClientsScreen.scss';
import ClientTable, { Client } from '../../components/Tables/ClientTable';

const mockClients: Client[] = [
    {
        id: 1,
        name: 'Alice Cooper',
        email: 'alice@example.com',
        avatar: 'https://app.banani.co/avatar1.jpeg',
        bank: 'HDFC Bank',
        cards: 'VISA • RuPay',
        lastTransaction: 'Sep 02, 2025',
        lastTransactionTime: '02:15 PM',
    },
    {
        id: 2,
        name: 'Rahul Shah',
        email: 'rahul@acme.co',
        avatar: 'https://app.banani.co/avatar2.jpg',
        bank: 'Axis Bank',
        cards: 'Mastercard',
        lastTransaction: 'Sep 02, 2025',
        lastTransactionTime: '09:40 AM',
    },
    {
        id: 3,
        name: 'Maria Gomez',
        email: 'maria@globex.com',
        avatar: 'https://app.banani.co/avatar3.jpeg',
        bank: 'ICICI Bank',
        cards: 'RuPay',
        lastTransaction: 'Sep 01, 2025',
        lastTransactionTime: '06:05 PM',
    },
];

const ClientsScreen: React.FC = () => {
    const [search, setSearch] = useState('');

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Clients</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button">
                        <UserPlus size={16} />
                        New Client
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
                                placeholder="Search clients"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="main__actions">
                            <button className="main__icon-button">
                                <SlidersHorizontal size={16} />
                                Filters
                            </button>
                        </div>
                    </div>

                    <ClientTable clients={mockClients} search={search} />
                </div>

                <div className="detail">
                    <div className="detail__header">
                        {/* You can use the avatar logic here as well if needed */}
                        <div
                            className="client__avatar"
                            style={{ backgroundColor: '#FF6B6B' }}
                        >
                            AC
                        </div>
                        <div>
                            <div className="detail__name">Alice Cooper</div>
                            <div className="detail__sub">Client since Jan 2023</div>
                        </div>
                    </div>
                    <div className="detail__badges">
                        <div className="badge">HDFC Bank</div>
                        <div className="badge">VISA</div>
                        <div className="badge">alice@example.com</div>
                    </div>
                    <div className="detail__divider" />
                    <div className="detail__quick-actions">
                        <button className="quick-btn deposit">Deposit</button>
                        <button className="quick-btn withdraw">Withdraw</button>
                    </div>
                    <div className="detail__divider" />
                    <div>
                        <div className="detail__recent-title">Recent Transactions</div>
                        <div className="detail__recent-list">
                            <div className="detail__recent-item">
                                <span>₹ 24,500</span>
                                <span className="sub">Sep 02, 2025 • 02:15 PM</span>
                            </div>
                            <div className="detail__recent-item">
                                <span>₹ 3,200</span>
                                <span className="sub">Aug 30, 2025 • 11:05 AM</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientsScreen;