'use client';
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { Eye, ChevronDown, MoreHorizontal, MapPin } from 'lucide-react';
import '../../styles/ClientTable.scss';
import { getAvatarColor, getAvatarInitials } from '@/utils/helperFunctions';

export interface Client {
    id: number;
    name: string;
    email: string;
    contact: string;
    address: string;
    avatar: string;
    lastTransaction: string;
    lastTransactionTime: string;
}

interface ClientTableProps {
    clients: Client[];
    search?: string;
    selectedClient?: Client | null;
    onClientSelect?: (client: Client) => void;
}


const ClientTable: React.FC<ClientTableProps> = ({ clients, search = '', selectedClient, onClientSelect }) => {
    const [visibleItems, setVisibleItems] = useState(10);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [showHeaderShadow, setShowHeaderShadow] = useState(false);

    const tableContainerRef = useRef<HTMLDivElement>(null);
    const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);

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
            const availableHeight = window.innerHeight - totalOffset;
            const rowHeight = 60;
            const calculatedItems = Math.floor(availableHeight / rowHeight);
            const itemsCount = Math.min(Math.max(calculatedItems, 5), 25);
            setItemsPerPage(itemsCount);
            setVisibleItems(itemsCount);
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

    // Filtered clients
    const filteredClients = useMemo(() => {
        if (!search) return clients;
        const s = search.toLowerCase();
        return clients.filter(
            c =>
                c.name.toLowerCase().includes(s) ||
                c.email.toLowerCase().includes(s) ||
                c.contact.toLowerCase().includes(s) ||
                c.address.toLowerCase().includes(s)
        );
    }, [clients, search]);

    // Paginated clients
    const displayedClients = useMemo(() => {
        return filteredClients.slice(0, visibleItems);
    }, [filteredClients, visibleItems]);

    // Infinite scroll load more
    const loadMore = useCallback(() => {
        if (isLoading || visibleItems >= filteredClients.length) return;
        setIsLoading(true);
        setTimeout(() => {
            setVisibleItems(prev => Math.min(prev + itemsPerPage, filteredClients.length));
            setIsLoading(false);
        }, 300);
    }, [isLoading, visibleItems, filteredClients.length, itemsPerPage]);

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

    // Reset visible items when search changes
    useEffect(() => {
        setVisibleItems(itemsPerPage);
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [search, itemsPerPage]);

    const hasMoreItems = visibleItems < filteredClients.length;

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
                                <div className="table__sort-header">
                                    Client
                                    <ChevronDown size={16} className="table__sort-icon" />
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header">
                                    Contact Number
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header">
                                    Address
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header">
                                    Last Transaction
                                </div>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedClients.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="table__no-results">
                                    No clients found.
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
                                            </div>
                                            <div className="table__client-meta">
                                                <div className="table__client-name">{client.name}</div>
                                                <div className="table__client-email">{client.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{client.contact}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <MapPin size={16} className="table__address-icon" />
                                            <span className="table__address-pill" title={client.address}>{client.address}</span>
                                        </div>
                                    </td>
                                    <td>
                                        {client.lastTransaction}{' '}
                                        <span className="client-table__time">• {client.lastTransactionTime}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="table__row-actions">
                                                <Eye size={16} />
                                                View
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
                {hasMoreItems && (
                    <div ref={observerRef} className="table__load-trigger">
                        {isLoading && (
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