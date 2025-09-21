'use client'
import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Edit, Trash, MoreHorizontal, Building2, Search, X } from 'lucide-react';
import DeleteBankConfirmModal, { Bank as ModalBank } from './DeleteBankConfirmModal';
import './BankList.scss';

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

interface BankListProps {
    onNewBank: () => void;
}

const BankList: React.FC<BankListProps> = ({ onNewBank }) => {
    const [search, setSearch] = useState('');
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const filteredBanks = mockBanks.filter(bank =>
        bank.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleNewBank = () => {
        console.log('Navigate to new bank');
        onNewBank();
    };

    const handleDeleteBank = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = (bankId: string, deleteTransactions: boolean) => {
        console.log(`Deleting bank ${bankId}, deleteTransactions: ${deleteTransactions}`);
        // Here you would typically call an API to delete the bank
        // After successful deletion, you might want to refresh the bank list
        setIsDeleteModalOpen(false);
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const handleDeselectBank = () => {
        setSelectedBank(null);
    };

    // Convert Bank to ModalBank format
    const getModalBank = (bank: Bank | null): ModalBank | null => {
        if (!bank) return null;
        return {
            id: bank.id.toString(),
            name: bank.name,
            accountNumber: `XXXX${bank.id.toString().padStart(4, '0')}`, // Mock account number
            linkedTransactionsCount: bank.transactions,
        };
    };

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

                    <div className="banks-grid">
                        {filteredBanks.map(bank => (
                            <div 
                                className={`bank-card ${selectedBank?.id === bank.id ? 'bank-card--selected' : ''}`}
                                key={bank.id}
                            >
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
                                    <button 
                                        className="row-actions"
                                        onClick={() => setSelectedBank(bank)}
                                    >
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

                {selectedBank && (
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
                                <input className="control" value={selectedBank?.name || ''} readOnly />
                            </div>
                            <div>
                                <div className="label">Created On</div>
                                <input className="control" value={selectedBank?.created || ''} readOnly />
                            </div>
                            <div>
                                <div className="label">Transactions</div>
                                <input className="control" value={selectedBank?.transactions.toLocaleString() || ''} readOnly />
                            </div>
                            <div className="inline-actions">
                                <button className="main__button">
                                    <Edit size={16} />
                                    Save
                                </button>
                                <button 
                                    className="main__icon-button" 
                                    onClick={handleDeleteBank}
                                    disabled={!selectedBank}
                                >
                                    <Trash size={16} />
                                    Delete
                                </button>
                                <button 
                                    className="main__secondary-button" 
                                    onClick={handleDeselectBank}
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
                bank={getModalBank(selectedBank)}
            />
        </div>
    );
};

export default BankList;