'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, MoreHorizontal, MapPin, Wallet, ArrowDownLeft, ArrowUpRight, Check, X } from 'lucide-react';
import './ClientTable.scss';
import { formatDateToReadable, formatTime, getAvatarColor, getAvatarInitials } from '@/utils/helperFunctions';
import { Client } from '../../services/clientService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadMoreClients, sortClients } from '../../store/actions/clientActions';

interface ClientTableProps {
    search?: string;
    selectedClient?: Client | null;
    onClientSelect?: (client: Client) => void;
}


const ClientTable: React.FC<ClientTableProps> = ({ selectedClient, onClientSelect }) => {
    const dispatch = useAppDispatch();
    const {
        clients,
        loading,
        loadingMore,
        hasMore,
        sortConfig,
        pagination,
        savingClientIds,
        deletingClientIds
    } = useAppSelector((state) => state.clients);

    const [showHeaderShadow, setShowHeaderShadow] = useState(false);

    // Track completed operations for temporary status display
    const [completedOperations, setCompletedOperations] = useState<{
        [clientId: number]: 'saved' | 'deleted'
    }>({});

    // Track previous states to detect completion
    const [prevUpdatingIds, setPrevUpdatingIds] = useState<number[]>([]);
    const [prevDeletingIds, setPrevDeletingIds] = useState<number[]>([]);

    const tableContainerRef = useRef<HTMLDivElement>(null);
    const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);

    // Handle completed operations status display
    useEffect(() => {
        // Check for newly completed update operations
        const completedUpdates = prevUpdatingIds.filter(id => !savingClientIds.includes(id));
        completedUpdates.forEach(id => {
            setCompletedOperations(prev => ({ ...prev, [id]: 'saved' }));
            setTimeout(() => {
                setCompletedOperations(prev => {
                    const updated = { ...prev };
                    delete updated[id];
                    return updated;
                });
            }, 1000);
        });

        // Check for newly completed delete operations
        const completedDeletes = prevDeletingIds.filter(id => !deletingClientIds.includes(id));
        completedDeletes.forEach(id => {
            setCompletedOperations(prev => ({ ...prev, [id]: 'deleted' }));
            setTimeout(() => {
                setCompletedOperations(prev => {
                    const updated = { ...prev };
                    delete updated[id];
                    return updated;
                });
            }, 1000);
        });

        // Update previous states
        setPrevUpdatingIds(savingClientIds);
        setPrevDeletingIds(deletingClientIds);
    }, [savingClientIds, deletingClientIds, prevUpdatingIds, prevDeletingIds]);

    // Responsive items per page calculation
    useEffect(() => {
        const calculateTableHeight = () => {
            const tableWrap = tableContainerRef.current?.parentElement;
            if (!tableWrap) return;
            const rect = tableWrap.getBoundingClientRect();
            const topOffset = rect.top;
            const bottomPadding = 60;
            const totalOffset = topOffset + bottomPadding;
            document.documentElement.style.setProperty('--table-offset', `${totalOffset}px`);
        };
        const timer = setTimeout(calculateTableHeight, 100);
        window.addEventListener('resize', calculateTableHeight);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateTableHeight);
        };
    }, []);

    // Header shadow on scroll
    useEffect(() => {
        const container = tableContainerRef.current;
        if (!container) return;
        const handleScroll = () => {
            const scrollTop = container.scrollTop;
            setShowHeaderShadow(scrollTop > 5);
        };
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // Handle sorting
    const handleSort = (field: string) => {
        let newDirection: 'asc' | 'desc';

        if (sortConfig.sort_by === field) {
            newDirection = sortConfig.sort_order === 'asc' ? 'desc' : 'asc';
        } else {
            newDirection = 'asc';
        }

        dispatch(sortClients({
            sort_by: field,
            sort_order: newDirection
        }));
    };

    // Clients are already filtered and sorted by the API
    const displayedClients = clients;

    // Load more clients function
    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return;
        dispatch(loadMoreClients());
    }, [dispatch, loadingMore, hasMore]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new window.IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting) {
                    loadMore();
                }
            },
            {
                threshold: 0.1,
                rootMargin: '50px',
                root: tableContainerRef.current
            }
        );
        const currentObserverRef = observerRef.current;
        if (currentObserverRef) {
            observer.observe(currentObserverRef);
        }
        return () => {
            if (currentObserverRef) {
                observer.unobserve(currentObserverRef);
            }
        };
    }, [loadMore]);

    // Add sort icon component
    const SortIcon: React.FC<{ field: string }> = ({ field }) => {
        if (sortConfig.sort_by !== field) {
            return null; // Don't show icon for non-active columns
        }

        return sortConfig.sort_order === 'asc' ?
            <ChevronDown size={16} className="table__sort-icon table__sort-icon--active" style={{ transform: 'rotate(180deg)' }} /> :
            <ChevronDown size={16} className="table__sort-icon table__sort-icon--active" />;
    };

    const renderClientAddress = (address: string) => {
        if (!address) return '-';
        return (
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <MapPin size={16} className="table__address-icon" />
                <span className="table__address-pill" title={address}>{address}</span>
            </div>
        );
    }

    return (
        <div className="table-wrap">
            <div className="table__container" ref={tableContainerRef}>
                <table className="table">
                    <thead
                        ref={tableHeaderRef}
                        className={showHeaderShadow ? 'table__header--shadow' : ''}
                    >
                        <tr>
                            <th>
                                <div className="table__sort-header table__sort-header--sortable" onClick={() => handleSort('name')}>
                                    Client
                                    <SortIcon field="name" />
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header table__sort-header--sortable" onClick={() => handleSort('contact')}>
                                    Contact Number
                                    <SortIcon field="contact" />
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header table__sort-header--sortable" onClick={() => handleSort('address')}>
                                    Address
                                    <SortIcon field="address" />
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header table__sort-header--sortable" onClick={() => handleSort('transaction_count')}>
                                    Transactions
                                    <SortIcon field="transaction_count" />
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header table__sort-header--sortable" onClick={() => handleSort('create_date')}>
                                    Date Created
                                    <SortIcon field="create_date" />
                                </div>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedClients.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="table__no-results">
                                    {loading ? 'Loading clients...' : 'No clients found.'}
                                </td>
                            </tr>
                        ) : (
                            displayedClients.map((client, idx) => (
                                <tr
                                    key={client.id}
                                    className={selectedClient?.id === client.id ? 'table__row--selected' : ''}
                                >
                                    <td>
                                        <div className="table__client">
                                            <div
                                                className="table__client-avatar"
                                                style={{ backgroundColor: getAvatarColor(client.name) }}
                                            >
                                                {getAvatarInitials(client.name)}

                                                 {/* Loading/Status Overlay */}
                                                {(savingClientIds.includes(client.id) || deletingClientIds.includes(client.id) || completedOperations[client.id]) && (
                                                    <div className="table__avatar-overlay">
                                                        {savingClientIds.includes(client.id) && (
                                                            <div className="table__avatar-spinner">
                                                                <div className="table__spinner-ring"></div>
                                                            </div>
                                                        )}
                                                        {deletingClientIds.includes(client.id) && (
                                                            <div className="table__avatar-spinner">
                                                                <div className="table__spinner-ring table__spinner-ring--delete"></div>
                                                            </div>
                                                        )}
                                                        {completedOperations[client.id] === 'saved' && (
                                                            <div className="table__avatar-status table__avatar-status--success">
                                                                <Check size={16} />
                                                            </div>
                                                        )}
                                                        {completedOperations[client.id] === 'deleted' && (
                                                            <div className="table__avatar-status table__avatar-status--error">
                                                                <X size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="table__client-meta">
                                                <div className="table__client-name">{client.name}</div>
                                                <div className="table__client-email">{client.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{client.contact ? client.contact : '-'}</td>
                                    <td>
                                        {renderClientAddress(client.address)}
                                    </td>
                                    <td>
                                        {client.transaction_count || 0}
                                    </td>
                                    <td>
                                        {formatDateToReadable(client.create_date)}{' '}
                                        <span className="client-table__time">• {formatTime(client.create_time)}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {!selectedClient &&
                                                (
                                                    <>
                                                        <button className="table__row-actions__deposit">
                                                            <ArrowDownLeft size={16} />
                                                        </button>
                                                        <button className="table__row-actions__withdraw">
                                                            <ArrowUpRight size={16} />
                                                        </button>
                                                    </>
                                                )
                                            }
                                            <button className="table__row-actions">
                                                <Wallet size={16} />
                                                {client.transaction_count || 0} T
                                            </button>
                                            <button
                                                className="row-actions"
                                                onClick={() => onClientSelect && onClientSelect(client)}
                                            >
                                                <MoreHorizontal size={16} />
                                                Manage
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                {hasMore && (
                    <div ref={observerRef} className="table__load-trigger">
                        {loadingMore && (
                            <div className="table__loading">
                                <div className="table__spinner"></div>
                                Loading more clients...
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientTable;