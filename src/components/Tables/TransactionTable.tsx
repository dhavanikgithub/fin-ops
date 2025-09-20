'use client';
import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { ArrowDownLeft, ArrowUpRight, Eye, ChevronDown } from 'lucide-react';
import { FilterValues } from '../TransactionFilterModal';
import '../../styles/TransactionTable.scss';

interface Transaction {
    id: string;
    client: string;
    bank: string;
    card: string;
    amount: number;
    type: 'deposit' | 'withdraw';
    date: string;
    time: string;
    dateObj: Date;
}

interface TableProps {
    filters?: FilterValues | null;
}

const Table: React.FC<TableProps> = ({ filters }) => {
    const [visibleItems, setVisibleItems] = useState(10);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [showHeaderShadow, setShowHeaderShadow] = useState(false);
    
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);

    const allTransactions: Transaction[] = [
        {
            id: '1',
            client: 'Akash Patel',
            bank: 'HDFC Bank',
            card: 'VISA',
            amount: 24500,
            type: 'deposit',
            date: 'Sep 02, 2025',
            time: '02:15 PM',
            dateObj: new Date('2025-09-02T14:15:00')
        },
        {
            id: '2',
            client: 'Jia Lee',
            bank: 'Axis Bank',
            card: 'Mastercard',
            amount: 8999,
            type: 'withdraw',
            date: 'Sep 02, 2025',
            time: '09:40 AM',
            dateObj: new Date('2025-09-02T09:40:00')
        },
        {
            id: '3',
            client: 'Maria Gomez',
            bank: 'ICICI Bank',
            card: 'RuPay',
            amount: 12100,
            type: 'deposit',
            date: 'Sep 01, 2025',
            time: '06:05 PM',
            dateObj: new Date('2025-09-01T18:05:00')
        },
        {
            id: '4',
            client: 'Alice Cooper',
            bank: 'HDFC Bank',
            card: 'VISA',
            amount: 5500,
            type: 'withdraw',
            date: 'Aug 31, 2025',
            time: '11:30 AM',
            dateObj: new Date('2025-08-31T11:30:00')
        },
        {
            id: '5',
            client: 'Rahul S.3',
            bank: 'Axis Bank',
            card: 'Mastercard',
            amount: 18750,
            type: 'deposit',
            date: 'Aug 30, 2025',
            time: '03:45 PM',
            dateObj: new Date('2025-08-30T15:45:00')
        },
        {
            id: '6',
            client: 'Emma Watson',
            bank: 'SBI Bank',
            card: 'VISA',
            amount: 32000,
            type: 'deposit',
            date: 'Aug 29, 2025',
            time: '10:20 AM',
            dateObj: new Date('2025-08-29T10:20:00')
        },
        {
            id: '7',
            client: 'David Kim',
            bank: 'ICICI Bank',
            card: 'RuPay',
            amount: 7500,
            type: 'withdraw',
            date: 'Aug 28, 2025',
            time: '04:15 PM',
            dateObj: new Date('2025-08-28T16:15:00')
        },
        {
            id: '8',
            client: 'Sarah Johnson',
            bank: 'Axis Bank',
            card: 'Mastercard',
            amount: 15600,
            type: 'deposit',
            date: 'Aug 27, 2025',
            time: '01:30 PM',
            dateObj: new Date('2025-08-27T13:30:00')
        },
        {
            id: '9',
            client: 'Michael Chen',
            bank: 'HDFC Bank',
            card: 'VISA',
            amount: 9800,
            type: 'withdraw',
            date: 'Aug 26, 2025',
            time: '08:45 AM',
            dateObj: new Date('2025-08-26T08:45:00')
        },
        {
            id: '10',
            client: 'Lisa Anderson',
            bank: 'SBI Bank',
            card: 'RuPay',
            amount: 22400,
            type: 'deposit',
            date: 'Aug 25, 2025',
            time: '05:10 PM',
            dateObj: new Date('2025-08-25T17:10:00')
        },
        {
            id: '11',
            client: 'James Wilson',
            bank: 'ICICI Bank',
            card: 'Mastercard',
            amount: 13700,
            type: 'withdraw',
            date: 'Aug 24, 2025',
            time: '11:55 AM',
            dateObj: new Date('2025-08-24T11:55:00')
        },
        {
            id: '12',
            client: 'Nina Rodriguez',
            bank: 'Axis Bank',
            card: 'VISA',
            amount: 28900,
            type: 'deposit',
            date: 'Aug 23, 2025',
            time: '02:40 PM',
            dateObj: new Date('2025-08-23T14:40:00')
        },
        {
            id: '13',
            client: 'Robert Taylor',
            bank: 'HDFC Bank',
            card: 'RuPay',
            amount: 6400,
            type: 'withdraw',
            date: 'Aug 22, 2025',
            time: '09:25 AM',
            dateObj: new Date('2025-08-22T09:25:00')
        },
        {
            id: '14',
            client: 'Jennifer Lee',
            bank: 'SBI Bank',
            card: 'Mastercard',
            amount: 19500,
            type: 'deposit',
            date: 'Aug 21, 2025',
            time: '06:30 PM',
            dateObj: new Date('2025-08-21T18:30:00')
        },
        {
            id: '15',
            client: 'Kevin Park',
            bank: 'ICICI Bank',
            card: 'VISA',
            amount: 11200,
            type: 'withdraw',
            date: 'Aug 20, 2025',
            time: '12:15 PM',
            dateObj: new Date('2025-08-20T12:15:00')
        },
        // Add more transactions for testing infinite scroll...
        {
            id: '16',
            client: 'Amy Davis',
            bank: 'Axis Bank',
            card: 'RuPay',
            amount: 25300,
            type: 'deposit',
            date: 'Aug 19, 2025',
            time: '03:50 PM',
            dateObj: new Date('2025-08-19T15:50:00')
        },
        {
            id: '17',
            client: 'Daniel White',
            bank: 'HDFC Bank',
            card: 'Mastercard',
            amount: 8750,
            type: 'withdraw',
            date: 'Aug 18, 2025',
            time: '10:05 AM',
            dateObj: new Date('2025-08-18T10:05:00')
        },
        {
            id: '18',
            client: 'Sophia Brown',
            bank: 'SBI Bank',
            card: 'VISA',
            amount: 33600,
            type: 'deposit',
            date: 'Aug 17, 2025',
            time: '04:20 PM',
            dateObj: new Date('2025-08-17T16:20:00')
        },
        {
            id: '19',
            client: 'Ryan Miller',
            bank: 'ICICI Bank',
            card: 'RuPay',
            amount: 14800,
            type: 'withdraw',
            date: 'Aug 16, 2025',
            time: '11:10 AM',
            dateObj: new Date('2025-08-16T11:10:00')
        },
        {
            id: '20',
            client: 'Olivia Garcia',
            bank: 'Axis Bank',
            card: 'Mastercard',
            amount: 21700,
            type: 'deposit',
            date: 'Aug 15, 2025',
            time: '07:35 PM',
            dateObj: new Date('2025-08-15T19:35:00')
        }
    ];

    // Handle scroll events to show/hide header shadow
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

    // Calculate table height offset and items per page
    useEffect(() => {
        const calculateTableHeight = () => {
            const tableWrap = tableContainerRef.current?.parentElement;
            if (!tableWrap) return;

            // Get the table wrapper's position relative to viewport
            const rect = tableWrap.getBoundingClientRect();
            const topOffset = rect.top;
            
            // Calculate offset including some padding for bottom spacing
            const bottomPadding = 60; // Space for bottom padding
            const totalOffset = topOffset + bottomPadding;
            
            // Set CSS custom property for dynamic height calculation
            document.documentElement.style.setProperty('--table-offset', `${totalOffset}px`);
            
            // Calculate items per page based on available height
            const availableHeight = window.innerHeight - totalOffset;
            const rowHeight = 60; // Approximate row height
            const calculatedItems = Math.floor(availableHeight / rowHeight);
            
            // Minimum 5 items, maximum 25 items per page
            const itemsCount = Math.min(Math.max(calculatedItems, 5), 25);
            setItemsPerPage(itemsCount);
            setVisibleItems(itemsCount);
        };

        // Initial calculation with a small delay to ensure DOM is ready
        const timer = setTimeout(calculateTableHeight, 100);
        
        // Recalculate on window resize
        window.addEventListener('resize', calculateTableHeight);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateTableHeight);
        };
    }, []);

    // Function to generate initials from client name
    const getInitials = (name: string): string => {
        const words = name.trim().split(' ');
        if (words.length >= 2) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        } else {
            return words[0][0].toUpperCase();
        }
    };

    // Function to generate consistent background color for a name
    const getAvatarColor = (name: string): string => {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
            '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
            '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE',
            '#FD79A8', '#E17055', '#00B894', '#00CEC9', '#74B9FF'
        ];
        
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Filter transactions based on applied filters
    const filteredTransactions = useMemo(() => {
        if (!filters) return allTransactions;

        return allTransactions.filter(transaction => {
            if (filters.types.length > 0 && !filters.types.includes(transaction.type)) {
                return false;
            }

            if (filters.minAmount && transaction.amount < parseFloat(filters.minAmount)) {
                return false;
            }
            if (filters.maxAmount && transaction.amount > parseFloat(filters.maxAmount)) {
                return false;
            }

            if (filters.startDate) {
                const startDate = new Date(filters.startDate);
                if (transaction.dateObj < startDate) {
                    return false;
                }
            }
            if (filters.endDate) {
                const endDate = new Date(filters.endDate);
                endDate.setHours(23, 59, 59, 999);
                if (transaction.dateObj > endDate) {
                    return false;
                }
            }

            if (filters.banks.length > 0 && !filters.banks.includes(transaction.bank)) {
                return false;
            }

            if (filters.cards.length > 0 && !filters.cards.includes(transaction.card)) {
                return false;
            }

            if (filters.clients.length > 0 && !filters.clients.includes(transaction.client)) {
                return false;
            }

            return true;
        });
    }, [filters]);

    // Get currently visible transactions
    const displayedTransactions = useMemo(() => {
        return filteredTransactions.slice(0, visibleItems);
    }, [filteredTransactions, visibleItems]);

    // Load more items function
    const loadMore = useCallback(() => {
        if (isLoading || visibleItems >= filteredTransactions.length) return;
        
        setIsLoading(true);
        
        // Simulate loading delay (remove in production)
        setTimeout(() => {
            setVisibleItems(prev => Math.min(prev + itemsPerPage, filteredTransactions.length));
            setIsLoading(false);
        }, 300);
    }, [isLoading, visibleItems, filteredTransactions.length, itemsPerPage]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
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

    // Reset visible items when filters change
    useEffect(() => {
        setVisibleItems(itemsPerPage);
        // Scroll to top when filters change
        if (tableContainerRef.current) {
            tableContainerRef.current.scrollTop = 0;
        }
    }, [filters, itemsPerPage]);

    const formatAmount = (amount: number): string => {
        return `₹ ${amount.toLocaleString()}`;
    };

    const hasMoreItems = visibleItems < filteredTransactions.length;

    return (
        <div className="table-wrap">

            {/* Scrollable container */}
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
                                    Bank • Card
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header">
                                    Amount
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header">
                                    Date & Time
                                </div>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayedTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="table__no-results">
                                    No transactions found matching your filters.
                                </td>
                            </tr>
                        ) : (
                            displayedTransactions.map((transaction, index) => (
                                <tr key={`${transaction.id}-${index}`}>
                                    <td>
                                        <div className="table__client">
                                            <div 
                                                className="table__client-avatar"
                                                style={{ backgroundColor: getAvatarColor(transaction.client) }}
                                            >
                                                {getInitials(transaction.client)}
                                            </div>
                                            <span className="table__client-name">
                                                {transaction.client}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table__method-bank">
                                            <div className="table__pill">
                                                {transaction.bank} • {transaction.card}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`table__amount table__amount--${transaction.type}`}>
                                            {transaction.type === 'deposit' ? (
                                                <ArrowDownLeft size={16} className="table__amount-icon" />
                                            ) : (
                                                <ArrowUpRight size={16} className="table__amount-icon" />
                                            )}
                                            <span className="table__amount-value">
                                                {formatAmount(transaction.amount)}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        {transaction.date} <span className="table__time">• {transaction.time}</span>
                                    </td>
                                    <td>
                                        <button className="table__row-actions">
                                            <Eye size={16} />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {/* Infinite scroll trigger */}
                {hasMoreItems && (
                    <div ref={observerRef} className="table__load-trigger">
                        {isLoading && (
                            <div className="table__loading">
                                <div className="table__spinner"></div>
                                Loading more transactions...
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default Table;