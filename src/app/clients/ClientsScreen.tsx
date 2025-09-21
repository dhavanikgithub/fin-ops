'use client'
import React, { useState } from 'react';
import { UserPlus, SlidersHorizontal, Edit, Trash, User2, Search, UserMinus, ArrowDownCircle, ArrowUpCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import './ClientsScreen.scss';
import ClientTable, { Client } from '../../components/Tables/ClientTable';

const mockClients: Client[] = [
    {
        id: 1,
        name: 'Alice Cooper',
        email: 'alice@example.com',
        contact: '+1 555-123-4567',
        address: '123 Main St, Springfield',
        avatar: 'https://app.banani.co/avatar1.jpeg',
        lastTransaction: 'Sep 02, 2025',
        lastTransactionTime: '02:15 PM',
    },
    {
        id: 2,
        name: 'Rahul Shah',
        email: 'rahul@acme.co',
        contact: '+91 98765-43210',
        address: '22 Residency Rd, Mumbai',
        avatar: 'https://app.banani.co/avatar2.jpg',
        lastTransaction: 'Sep 02, 2025',
        lastTransactionTime: '09:40 AM',
    },
    {
        id: 3,
        name: 'Maria Gomez',
        email: 'maria@globex.com',
        contact: '+34 600-123-456',
        address: 'Calle Mayor 5, Madrid',
        avatar: 'https://app.banani.co/avatar3.jpeg',
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
                        {/* <div className="main__actions">
                            <button className="main__icon-button">
                                <SlidersHorizontal size={16} />
                                Filters
                            </button>
                        </div> */}
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
                        <div className="badge">alice@example.com</div>
                    </div>
                    <div className="detail__divider" />
                    <div className="detail__quick-actions">
                        <button className="quick-btn quick-btn--outlined deposit">
                            <ArrowDownLeft size={16} />
                            Deposit
                        </button>
                        <button className="quick-btn quick-btn--outlined withdraw">
                            <ArrowUpRight size={16} />
                            Withdraw
                        </button>
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
                    <div className="detail__divider" />
                    <div className="client-edit">
                        <div className="client-edit__title">Edit Client</div>
                        <div className="client-edit__form">
                            <div>
                                <div className="label">Client Name</div>
                                <input className="control" value="Alice Cooper" readOnly />
                            </div>
                            <div>
                                <div className="label">Email</div>
                                <input className="control" value="alice@example.com" readOnly />
                            </div>
                            <div>
                                <div className="label">Contact Number</div>
                                <input className="control" value="+1 555-123-4567" readOnly />
                            </div>
                            <div>
                                <div className="label">Address</div>
                                <textarea className="control" rows={4} value="123 Main St, Springfield" readOnly />
                            </div>
                            <div className="inline-actions">
                                <button className="main__button">
                                    <Edit size={16} />
                                    Save
                                </button>
                                <button className="main__icon-button">
                                    <UserMinus size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default ClientsScreen;