'use client'
import React, { useState, useEffect, useCallback } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { UserPlus, Edit, Search, UserMinus, ArrowDownLeft, ArrowUpRight, X, AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { SearchInput, TextInput, TextArea, Button } from '@/components/FormInputs';
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

// Error Fallback Component for Client List
const ClientListErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
    onNewClient: () => void;
}> = ({ error, resetErrorBoundary, onNewClient }) => {
    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <AlertTriangle size={16} />
                    <h1>Error - Clients</h1>
                </div>
                <div className="main__header-right">
                    <Button
                        variant="secondary"
                        icon={<UserPlus size={16} />}
                        onClick={onNewClient}
                        className="main__icon-button"
                    >
                        New Client
                    </Button>
                </div>
            </header>

            <div className="main__content">
                <div className="main__view">
                    <div className="cl__error-boundary">
                        <div className="cl__error-boundary-content">
                            <AlertTriangle size={64} className="cl__error-boundary-icon" />
                            <h2 className="cl__error-boundary-title">Something went wrong</h2>
                            <p className="cl__error-boundary-message">
                                We encountered an unexpected error while loading the clients list. 
                                Your client data is safe. You can try refreshing or add a new client.
                            </p>
                            {process.env.NODE_ENV === 'development' && (
                                <details className="cl__error-boundary-details">
                                    <summary>Technical Details (Development)</summary>
                                    <pre className="cl__error-boundary-stack">
                                        {error.message}
                                        {error.stack && `\n${error.stack}`}
                                    </pre>
                                </details>
                            )}
                            <div className="cl__error-boundary-actions">
                                <Button
                                    variant="primary"
                                    icon={<RotateCcw size={16} />}
                                    onClick={resetErrorBoundary}
                                    className="main__button"
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<UserPlus size={16} />}
                                    onClick={onNewClient}
                                    className="main__icon-button"
                                >
                                    Add New Client
                                </Button>
                                <Button
                                    variant="secondary"
                                    icon={<Home size={16} />}
                                    onClick={() => window.location.href = '/'}
                                    className="main__icon-button"
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const ClientListContent: React.FC<ClientListProps> = ({ onNewClient }) => {
    const dispatch = useAppDispatch();
    const { showBoundary } = useErrorBoundary();
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
        try {
            // Update previous states
            setPrevUpdatingIds(savingClientIds);
            setPrevDeletingIds(deletingClientIds);
        } catch (error) {
            logger.error('Error updating operation states:', error);
            showBoundary(error);
        }
    }, [savingClientIds, deletingClientIds, prevUpdatingIds, prevDeletingIds, showBoundary]);

    // Load initial clients
    useEffect(() => {
        try {
            dispatch(fetchClients());
        } catch (error) {
            logger.error('Error fetching initial clients:', error);
            showBoundary(error);
        }
    }, [dispatch, showBoundary]);

    // Handle search with debouncing
    const handleSearchChange = useCallback((value: string) => {
        try {
            setLocalSearchQuery(value);

            // Clear existing timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }

            // Set new timeout for debounced search
            const timeout = setTimeout(() => {
                try {
                    if (value.trim() !== reduxSearchQuery) {
                        dispatch(searchClients(value.trim()));
                    }
                } catch (error) {
                    logger.error('Error performing search:', error);
                    toast.error('Search failed. Please try again.');
                }
            }, 500); // 500ms debounce

            setSearchTimeout(timeout);
        } catch (error) {
            logger.error('Error handling search change:', error);
            toast.error('Failed to update search. Please try again.');
        }
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
        try {
            logger.log('Navigate to new client');
            onNewClient();
        } catch (error) {
            logger.error('Error navigating to new client:', error);
            showBoundary(error);
        }
    };

    const handleDeleteClient = () => {
        try {
            setIsDeleteModalOpen(true);
        } catch (error) {
            logger.error('Error opening delete modal:', error);
            showBoundary(error);
        }
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
            toast.success('Client deleted successfully');
        } catch (error) {
            logger.error('Failed to delete client:', error);
            toast.error('Failed to delete client.');
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

    const handleEditFormChange = (field: keyof Client, value: any) => {
        try {
            if (!selectedClient) return;
            setSelectedClientWithRef({
                ...selectedClient,
                [field]: value
            });
        } catch (error) {
            logger.error('Error updating form field:', error);
            toast.error('Failed to update form. Please try again.');
        }
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
            toast.success('Client updated successfully');
        } catch (error) {
            logger.error('Failed to update client:', error);
            toast.error('Failed to update client.');
        }
    };

    const handleClientSelect = (client: Client) => {
        try {
            if(selectedClientRef.current === client){
                setSelectedClientWithRef(null);
                return; // No change
            }
            setSelectedClientWithRef(client);
        } catch (error) {
            logger.error('Error selecting client:', error);
            showBoundary(error);
        }
    };

    const handleDeselectClient = () => {
        try {
            setSelectedClientWithRef(null);
        } catch (error) {
            logger.error('Error deselecting client:', error);
            showBoundary(error);
        }
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

    try {
        return (
            <>
                <header className="main__header">
                    <div className="main__header-left">
                        <h1>Clients</h1>
                    </div>
                    <div className="main__header-right">
                        <Button 
                            variant="secondary"
                            icon={<UserPlus size={16} />}
                            onClick={handleNewClient}
                            className="main__icon-button"
                        >
                            New Client
                        </Button>
                    </div>
                </header>

                <div className="main__content">
                    <div className="main__view">
                        <div className="main__view-header">
                            <SearchInput
                                value={localSearchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search clients..."
                                loading={loading}
                            />
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
                            {/* Close button */}
                            <button 
                                className="detail__close-button"
                                onMouseUp={handleDeselectClient}
                                onTouchEnd={handleDeselectClient}
                                disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                aria-label="Close detail panel"
                            >
                                <X size={20} />
                            </button>

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
                                <Button 
                                    variant="outline"
                                    icon={<ArrowDownLeft size={16} />}
                                    onClick={() => {
                                        try {
                                            // Save selected client to session storage
                                            sessionStorage.setItem('preselected_client', JSON.stringify({
                                                id: selectedClient.id,
                                                name: selectedClient.name
                                            }));
                                            // Navigate to transactions page (deposit view)
                                            window.location.href = '/transactions?view=deposit';
                                        } catch (error) {
                                            logger.error('Error navigating to deposit:', error);
                                            toast.error('Failed to open deposit form');
                                        }
                                    }}
                                    className="quick-btn quick-btn--outlined deposit"
                                >
                                    Add Deposit
                                </Button>
                                <Button 
                                    variant="outline"
                                    icon={<ArrowUpRight size={16} />}
                                    onClick={() => {
                                        try {
                                            // Save selected client to session storage
                                            sessionStorage.setItem('preselected_client', JSON.stringify({
                                                id: selectedClient.id,
                                                name: selectedClient.name
                                            }));
                                            // Navigate to transactions page (withdraw view)
                                            window.location.href = '/transactions?view=withdraw';
                                        } catch (error) {
                                            logger.error('Error navigating to withdraw:', error);
                                            toast.error('Failed to open withdraw form');
                                        }
                                    }}
                                    className="quick-btn quick-btn--outlined withdraw"
                                >
                                    Add Withdraw
                                </Button>
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
                                        <TextInput
                                            value={selectedClient.name || ''}
                                            onChange={(value) => handleEditFormChange('name', value)}
                                            placeholder="Enter client name"
                                            disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                        />
                                    </div>
                                    <div>
                                        <div className="label">Email</div>
                                        <TextInput
                                            type="email"
                                            value={selectedClient.email || ''}
                                            onChange={(value) => handleEditFormChange('email', value)}
                                            placeholder="client@example.com"
                                            disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                        />
                                    </div>
                                    <div>
                                        <div className="label">Contact Number</div>
                                        <TextInput
                                            type="tel"
                                            value={selectedClient.contact || ''}
                                            onChange={(value) => handleEditFormChange('contact', value)}
                                            placeholder="+91 98765 43210"
                                            disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                        />
                                    </div>
                                    <div>
                                        <div className="label">Address</div>
                                        <TextArea
                                            value={selectedClient.address || ''}
                                            onChange={(value) => handleEditFormChange('address', value)}
                                            placeholder="Street address, city, state, pincode"
                                            rows={4}
                                            disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                        />
                                    </div>
                                    <div className="inline-actions">
                                        <Button 
                                            variant="primary"
                                            icon={<Edit size={16} />}
                                            onClick={() => handleSaveClient(selectedClient)}
                                            disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                            className="main__button"
                                        >
                                            {selectedClient && savingClientIds.includes(selectedClient.id) ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button 
                                            variant="secondary"
                                            icon={<UserMinus size={16} />}
                                            onClick={handleDeleteClient}
                                            disabled={isSelectedClientBeingProcessed(selectedClient, savingClientIds, deletingClientIds)}
                                            className="main__icon-button"
                                        >
                                            {selectedClient && deletingClientIds.includes(selectedClient.id) ? 'Deleting...' : 'Delete'}
                                        </Button>
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
            </>
        );
    } catch (error) {
        logger.error('Error rendering client list:', error);
        showBoundary(error);
        return null;
    }
};

// Main wrapper component with ErrorBoundary
const ClientList: React.FC<ClientListProps> = (props) => {
    return (
        <ErrorBoundary
            FallbackComponent={(fallbackProps) => (
                <ClientListErrorFallback {...fallbackProps} onNewClient={props.onNewClient} />
            )}
            onError={(error, errorInfo) => {
                logger.error('Client list error boundary triggered:', {
                    error: error.message,
                    stack: error.stack,
                    errorInfo,
                    timestamp: new Date().toISOString()
                });
            }}
        >
            <ClientListContent {...props} />
        </ErrorBoundary>
    );
};

export default ClientList;