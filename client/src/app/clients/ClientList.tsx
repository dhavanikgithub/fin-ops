'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { UserPlus, Edit, Search, UserMinus, ArrowDownLeft, ArrowUpRight, X } from 'lucide-react';
import DeleteClientConfirmModal, { Client as ModalClient } from './DeleteClientConfirmModal';
import './ClientList.scss';
import ClientTable from './ClientTable';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchClients, searchClients, updateClient, deleteClient } from '../../store/actions/clientActions';
import { Client } from '../../services/clientService';
import { formatDateToMonthYear, getAvatarColor, getAvatarInitials } from '@/utils/helperFunctions';
import useStateWithRef from '@/hooks/useStateWithRef';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface ClientListProps {
    onNewClient: () => void;
}

const ClientList: React.FC<ClientListProps> = ({ onNewClient }) => {
    const dispatch = useAppDispatch();
    const {
        clients,
        loading,
        error,
        searchQuery: reduxSearchQuery,
        pagination,
        savingClientIds,
        deletingClientIds
    } = useAppSelector((state) => state.clients);

    const [localSearchQuery, setLocalSearchQuery] = useState('');
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
    const [selectedClient, setSelectedClientWithRef, selectedClientRef] = useStateWithRef<Client | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Track previous states to detect completion
    const [prevUpdatingIds, setPrevUpdatingIds] = useState<number[]>([]);
    const [prevDeletingIds, setPrevDeletingIds] = useState<number[]>([]);

    // Handle completed operations status display
    useEffect(() => {
                // Update previous states
        setPrevUpdatingIds(savingClientIds);
        setPrevDeletingIds(deletingClientIds);
    }, [savingClientIds, deletingClientIds, prevUpdatingIds, prevDeletingIds]);

    // Load initial clients
    useEffect(() => {
        dispatch(fetchClients());
    }, [dispatch]);

    // Handle search with debouncing
    const handleSearchChange = useCallback((value: string) => {
        setLocalSearchQuery(value);

        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Set new timeout for debounced search
        const timeout = setTimeout(() => {
            if (value.trim() !== reduxSearchQuery) {
                dispatch(searchClients(value.trim()));
            }
        }, 500); // 500ms debounce

        setSearchTimeout(timeout);
    }, [dispatch, searchTimeout, reduxSearchQuery]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    const handleNewClient = () => {
        logger.log('Navigate to new client');
        onNewClient();
    };

    const handleDeleteClient = () => {
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async (clientId: string, deleteTransactions: boolean) => {
        if (!clientId) return;
        const clientIdNum = Number(clientId);
        try {
            await dispatch(deleteClient({ id: clientIdNum })).unwrap();
            setIsDeleteModalOpen(false);
            if(selectedClientRef.current && selectedClientRef.current.id === clientIdNum){
                setSelectedClientWithRef(null);
            }
        } catch (error) {
            logger.error('Failed to delete client:', error);
            toast.error('Failed to delete client.');
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
    };

    const handleEditFormChange = (field: keyof Client, value: any) => {
        if (!selectedClient) return;
        setSelectedClientWithRef({
            ...selectedClient,
            [field]: value
        });
    };

    const handleSaveClient = async (client: Client | null) => {
        if (!client) return;

        try {
            await dispatch(updateClient({
                id: client.id,
                name: client.name.trim(),
                email: client.email ? client.email.trim() : undefined,
                contact: client.contact ? client.contact.trim() : undefined,
                address: client.address ? client.address.trim() : undefined,
            })).unwrap();
        } catch (error) {
            logger.error('Failed to update client:', error);
            toast.error('Failed to update client.');
        }
    };

    const handleClientSelect = (client: Client) => {
        setSelectedClientWithRef(client);
    };

    const handleDeselectClient = () => {
        setSelectedClientWithRef(null);
    };

    // Convert Client to ModalClient format - using the selected client data
    const getModalClient = (): ModalClient | null => {
        if (!selectedClient) return null;
        return {
            id: selectedClient.id.toString(),
            name: selectedClient.name,
            email: selectedClient.email,
            phone: selectedClient.contact,
            company: 'Acme Corp', // Mock company data
            clientId: `CL-${selectedClient.id.toString().padStart(5, '0')}`,
            location: selectedClient.address,
            activeTransactions: 12, // Mock data
            openBalance: 124500, // Mock balance in paise (₹1,24,500.00)
        };
    };

    // Helper function to check if a client ID is in deletingClientIds
    const isClientBeingDeleted = (
        transactionId: number,
        deletingTransactionIds: number[]
    ): boolean => {
        return deletingTransactionIds.includes(transactionId);
    };

    // Helper function to check if a client ID is in editingClientIds
    const isClientBeingSaved = (
        clientId: number,
        editingClientIds: number[]
    ): boolean => {
        return editingClientIds.includes(clientId);
    };

    // Helper function to check if a client is being processed (saved or deleted)
    const isClientBeingProcessed = (
        clientId: number,
        editingClientIds: number[],
        deletingClientIds: number[]
    ): boolean => {
        return isClientBeingSaved(clientId, editingClientIds) || isClientBeingDeleted(clientId, deletingClientIds);
    };

    const isSelectedClientBeingProcessed = (
        selectedClient: Client | null,
        editingClientIds: number[],
        deletingClientIds: number[]
    ): boolean => {
        if (!selectedClient) return false;
        return isClientBeingProcessed(selectedClient.id, editingClientIds, deletingClientIds);
    };

    return (
        <div className="main">
            <header className="main__header">
                <div className="main__header-left">
                    <h1>Clients</h1>
                </div>
                <div className="main__header-right">
                    <button className="main__icon-button" onClick={handleNewClient}>
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
                                placeholder="Search clients..."
                                value={localSearchQuery}
                                onChange={e => handleSearchChange(e.target.value)}
                                onFocus={e => e.target.select()}
                            />
                        </div>
                        {/* <div className="main__actions">
                            <button className="main__icon-button">
                                <SlidersHorizontal size={16} />
                                Filters
                            </button>
                        </div> */}
                    </div>

                    <ClientTable
                        search={localSearchQuery}
                        selectedClient={selectedClient}
                        onClientSelect={handleClientSelect}
                    />
                    {pagination && (
                        <span className="main__subtitle">
                            Showing {clients.length} of {pagination.total_count} clients
                        </span>
                    )}
                </div>

                {selectedClient && (
                    <div className="detail">
                        {/* Processing overlay */}
                        {isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds) && (
                            <div className="detail__processing-overlay">
                                <div className="detail__processing-content">
                                    <div className="detail__processing-spinner"></div>
                                    <div className="detail__processing-message">
                                        {isClientBeingSaved(selectedClient.id, savingClientIds) ? 'Saving client details...' : 'Deleting client...'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="detail__header">
                            <div
                                className="client__avatar"
                                style={{ backgroundColor: getAvatarColor(selectedClient.name) }}
                            >
                                {getAvatarInitials(selectedClient.name)}
                            </div>
                            <div>
                                <div className="detail__name">{selectedClient.name}</div>
                                <div className="detail__sub">Client since {formatDateToMonthYear(selectedClient.create_date)}</div>
                            </div>
                        </div>
                        {selectedClient.email ? <div className="detail__badges">
                            {selectedClient.email ? <div className="badge">{selectedClient.email}</div> : null}
                        </div> : null}
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
                                    <span className="sub">No recent transactions</span>
                                </div>
                            </div>
                        </div>
                        <div className="detail__divider" />
                        <div className="client-edit">
                            <div className="client-edit__title">Edit Client</div>
                            <div className="client-edit__form">
                                <div>
                                    <div className="label">Client Name</div>
                                    <input
                                        className="control"
                                        value={selectedClient.name || ''}
                                        onChange={(e) => handleEditFormChange('name', e.target.value)}
                                        onFocus={e => e.target.select()}
                                        placeholder="Enter client name"
                                        disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                    />
                                </div>
                                <div>
                                    <div className="label">Email</div>
                                    <input
                                        className="control"
                                        value={selectedClient.email || ''}
                                        onChange={(e) => handleEditFormChange('email', e.target.value)}
                                        onFocus={e => e.target.select()}
                                        placeholder="client@example.com"
                                        type="email"
                                        disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                    />
                                </div>
                                <div>
                                    <div className="label">Contact Number</div>
                                    <input
                                        className="control"
                                        value={selectedClient.contact || ''}
                                        onChange={(e) => handleEditFormChange('contact', e.target.value)}
                                        onFocus={e => e.target.select()}
                                        placeholder="+91 98765 43210"
                                        type="tel"
                                        disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                    />
                                </div>
                                <div>
                                    <div className="label">Address</div>
                                    <textarea
                                        className="control"
                                        rows={4}
                                        value={selectedClient.address || ''}
                                        onChange={(e) => handleEditFormChange('address', e.target.value)}
                                        onFocus={e => e.target.select()}
                                        placeholder="Street address, city, state, pincode"
                                        disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                    />
                                </div>
                                <div className="inline-actions">
                                    <button
                                        className="main__button"
                                        onClick={() => handleSaveClient(selectedClient)}
                                        disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                    >
                                        <Edit size={16} />
                                        {selectedClient && savingClientIds.includes(selectedClient.id) ? 'Saving...' : 'Save'}
                                    </button>
                                    <button
                                        className="main__icon-button"
                                        onClick={handleDeleteClient}
                                        disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                    >
                                        <UserMinus size={16} />
                                        {selectedClient && deletingClientIds.includes(selectedClient.id) ? 'Deleting...' : 'Delete'}
                                    </button>
                                    <button
                                        className="main__secondary-button"
                                        onClick={handleDeselectClient}
                                        disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>

            <DeleteClientConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                onDelete={handleDeleteConfirm}
                client={getModalClient()}
            />
        </div>
    );
};

export default ClientList;