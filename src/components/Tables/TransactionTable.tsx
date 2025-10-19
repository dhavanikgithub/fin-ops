'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, ChevronDown, ChevronUp, ArrowDownLeft, ArrowUpRight, MoreHorizontal, Check, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadMoreTransactions, sortTransactions } from '../../store/actions/transactionActions';
import { Transaction } from '../../services/transactionService';
import '../../styles/TransactionTable.scss';
import { getTransactionTypeLabel, isDeposit, isWithdraw } from '@/utils/transactionUtils';
import { formatAmountWithSymbol, formatDateToReadable, formatTime, getAvatarColor, getAvatarInitials } from '@/utils/helperFunctions';

interface TableProps {
    selectedTransaction?: Transaction | null;
    onTransactionSelect?: (transaction: Transaction) => void;
    savingTransactionIds?: number[];
    deletingTransactionIds?: number[];
}

const Table: React.FC<TableProps> = ({ selectedTransaction, onTransactionSelect, savingTransactionIds = [], deletingTransactionIds = [] }) => {
    const dispatch = useAppDispatch();
    const {
        transactions,
        loading,
        loadingMore,
        hasMore,
        sortConfig,
        pagination,
        error
    } = useAppSelector((state) => state.transactions);

    const [showHeaderShadow, setShowHeaderShadow] = useState(false);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    
    // Track completed operations for temporary status display
    const [completedOperations, setCompletedOperations] = useState<{
        [transactionId: number]: 'saved' | 'deleted'
    }>({});
    
    // Track transactions being removed (for fade-out animation)
    const [removingTransactions, setRemovingTransactions] = useState<Set<number>>(new Set());
    
    // Track new transactions for insertion animation
    const [newTransactions, setNewTransactions] = useState<Set<number>>(new Set());
    
    // Track previous transaction count to detect new additions
    const [prevTransactionCount, setPrevTransactionCount] = useState(0);

    const tableContainerRef = useRef<HTMLDivElement>(null);
    const tableHeaderRef = useRef<HTMLTableSectionElement>(null);
    const observerRef = useRef<HTMLDivElement>(null);

    // Update local sort state when Redux state changes
    useEffect(() => {
        setSortField(sortConfig.sort_by);
        setSortDirection(sortConfig.sort_order);
    }, [sortConfig]);

    // Track previous states to detect completion
    const [prevSavingIds, setPrevSavingIds] = useState<number[]>([]);
    const [prevDeletingIds, setPrevDeletingIds] = useState<number[]>([]);

    // Handle completed operations status display
    useEffect(() => {
        // Check for newly completed save operations
        const completedSaves = prevSavingIds.filter(id => !savingTransactionIds.includes(id));
        completedSaves.forEach(id => {
            setCompletedOperations(prev => ({ ...prev, [id]: 'saved' }));
            setTimeout(() => {
                setCompletedOperations(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
            }, 1000);
        });

        // Check for newly completed delete operations
        const completedDeletes = prevDeletingIds.filter(id => !deletingTransactionIds.includes(id));
        completedDeletes.forEach(id => {
            // First show the deletion status icon
            setCompletedOperations(prev => ({ ...prev, [id]: 'deleted' }));
            
            // After 1 second, start fade-out animation and remove status
            setTimeout(() => {
                setCompletedOperations(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
                // Start fade-out animation after status icon disappears
                setRemovingTransactions(prev => new Set([...prev, id]));
                
                // Remove from removing set after animation completes
                setTimeout(() => {
                    setRemovingTransactions(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(id);
                        return newSet;
                    });
                }, 400); // Match CSS animation duration
            }, 1000); // Wait 1 second to show delete status
        });

        // Update previous states
        setPrevSavingIds(savingTransactionIds);
        setPrevDeletingIds(deletingTransactionIds);
    }, [savingTransactionIds, deletingTransactionIds, prevSavingIds, prevDeletingIds]);

    // Handle new record insertion animations
    useEffect(() => {
        if (transactions.length > prevTransactionCount && prevTransactionCount > 0) {
            // New transactions were added
            const newTransactionIds = transactions
                .slice(0, transactions.length - prevTransactionCount)
                .map(t => t.id);
            
            setNewTransactions(new Set(newTransactionIds));
            
            // Remove animation class after animation completes
            setTimeout(() => {
                setNewTransactions(new Set());
            }, 500);
        }
        setPrevTransactionCount(transactions.length);
    }, [transactions, prevTransactionCount]);

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

    // Calculate table height offset
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

    // Handle sorting
    const handleSort = (field: string) => {
        let newDirection: 'asc' | 'desc';
        
        if (sortField === field) {
            // If clicking on the same column, toggle between asc and desc
            newDirection = sortDirection === 'desc' ? 'asc' : 'desc';
        } else {
            // If clicking on a different column, start with asc
            newDirection = 'asc';
        }

        setSortField(field);
        setSortDirection(newDirection);

        dispatch(sortTransactions({
            sort_by: field,
            sort_order: newDirection
        }));
    };

    // Load more items function
    const loadMore = useCallback(() => {
        if (loadingMore || !hasMore) return;
        dispatch(loadMoreTransactions());
    }, [dispatch, loadingMore, hasMore]);

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
    }, [loadMore, transactions]);

    // Modal state for viewing full notes with position
    const [notesModal, setNotesModal] = useState<{
        open: boolean;
        text: string;
        position: { x: number; y: number }
    }>({
        open: false,
        text: '',
        position: { x: 0, y: 0 }
    });

    const SortIcon: React.FC<{ field: string }> = ({ field }) => {
        if (sortField !== field) {
            return null;
        }

        return sortDirection === 'asc' ?
            <ChevronUp size={16} className="table__sort-icon table__sort-icon--active" /> :
            <ChevronDown size={16} className="table__sort-icon table__sort-icon--active" />;
    };

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
                                <div
                                    className="table__sort-header"
                                    onClick={() => handleSort('client_name')}
                                >
                                    Client
                                    <SortIcon field="client_name" />
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header table__sort-header--disabled">
                                    Bank • Card
                                </div>
                            </th>
                            <th>
                                <div
                                    className="table__sort-header"
                                    onClick={() => handleSort('transaction_amount')}
                                >
                                    Amount
                                    <SortIcon field="transaction_amount" />
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header table__sort-header--disabled">
                                    Charges
                                </div>
                            </th>
                            <th>
                                <div className="table__sort-header table__sort-header--disabled">
                                    Notes
                                </div>
                            </th>
                            <th>
                                <div
                                    className="table__sort-header"
                                    onClick={() => handleSort('create_date')}
                                >
                                    Date & Time
                                    <SortIcon field="create_date" />
                                </div>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && transactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="table__no-results">
                                    <div className="table__loading">
                                        <div className="table__spinner"></div>
                                        Loading transactions...
                                    </div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="table__no-results">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.filter(transaction => !removingTransactions.has(transaction.id)).map((transaction: Transaction, index: number) => {
                                const isSaving = savingTransactionIds.includes(transaction.id);
                                const isDeleting = deletingTransactionIds.includes(transaction.id);
                                const completedStatus = completedOperations[transaction.id];
                                const isRemoving = removingTransactions.has(transaction.id);
                                const isNew = newTransactions.has(transaction.id);
                                
                                return (
                                    <tr 
                                        key={`${transaction.id}-${index}`}
                                        className={`
                                            ${selectedTransaction?.id === transaction.id ? 'table__row--selected' : ''}
                                            ${isRemoving ? 'table__row--removing' : ''}
                                            ${isNew ? 'table__row--inserting' : ''}
                                        `.trim()}
                                    >
                                        <td>
                                            <div className="table__client">
                                                <div
                                                    className="table__client-avatar"
                                                    style={{ backgroundColor: getAvatarColor(transaction.client_name) }}
                                                >
                                                    {getAvatarInitials(transaction.client_name)}
                                                    
                                                    {/* Loading/Status Overlay */}
                                                    {(isSaving || isDeleting || completedStatus) && (
                                                        <div className="table__avatar-overlay">
                                                            {isSaving && (
                                                                <div className="table__avatar-spinner">
                                                                    <div className="table__spinner-ring"></div>
                                                                </div>
                                                            )}
                                                            {isDeleting && (
                                                                <div className="table__avatar-spinner">
                                                                    <div className="table__spinner-ring table__spinner-ring--delete"></div>
                                                                </div>
                                                            )}
                                                            {completedStatus === 'saved' && (
                                                                <div className="table__avatar-status table__avatar-status--success">
                                                                    <Check size={16} />
                                                                </div>
                                                            )}
                                                            {completedStatus === 'deleted' && (
                                                                <div className="table__avatar-status table__avatar-status--error">
                                                                    <X size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="table__client-name">{transaction.client_name}</span>
                                            </div>
                                        </td>
                                    <td>
                                        <div className="table__method-bank">
                                            <div className="table__pill">
                                                {transaction.bank_name || transaction.card_name ? `${transaction.bank_name || ''}${transaction.bank_name && transaction.card_name ? ' • ' : ''}${transaction.card_name || ''}` : 'N/A'}
                                            </div>
                                        </div>

                                    </td>
                                    <td>
                                        <div className={`table__amount table__amount--${getTransactionTypeLabel(transaction.transaction_type)}`}>
                                            {isDeposit(transaction.transaction_type) ? (
                                                <ArrowDownLeft size={16} className="table__amount-icon" />
                                            ) : (
                                                <ArrowUpRight size={16} className="table__amount-icon" />
                                            )}
                                            <span className="table__amount-value">
                                                {formatAmountWithSymbol(transaction.transaction_amount)}
                                            </span>
                                        </div>

                                    </td>
                                    <td>
                                        <div className="table__charges">
                                            <span className="table__charges-value">{transaction.widthdraw_charges.toFixed(2)}%</span>
                                            <div className="table__charges-amount">
                                                ₹ {(transaction.transaction_amount * transaction.widthdraw_charges / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="table__notes">
                                            {transaction.remark.length > 30 ? (
                                                <span className="table__notes-text">
                                                    {transaction.remark.slice(0, 30)}
                                                    <button
                                                        className="table__notes-viewmore"
                                                        onClick={(e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setNotesModal({
                                                                open: true,
                                                                text: transaction.remark,
                                                                position: {
                                                                    x: rect.left + rect.width / 2,
                                                                    y: rect.top - 8
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        ...
                                                    </button>
                                                </span>
                                            ) : (
                                                <span className="table__notes-text">
                                                    {transaction.remark && transaction.remark.trim() !== '' ? transaction.remark : 'N/A'}
                                                </span>
                                            )}
                                        </div>

                                    </td>
                                    <td>
                                        {formatDateToReadable(transaction.create_date)} <span className="table__time">• {formatTime(transaction.create_time)}</span>
                                    </td>
                                    <td>
                                        <button 
                                            className="row-actions"
                                            onClick={() => onTransactionSelect && onTransactionSelect(transaction)}
                                        >
                                            <MoreHorizontal size={16} />
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Infinite scroll trigger */}
                {hasMore && !loading && (
                    <div ref={observerRef} className="table__load-trigger">
                        {loadingMore && (
                            <div className="table__loading">
                                <div className="table__spinner"></div>
                                Loading more transactions...
                            </div>
                        )}
                    </div>
                )}

                {/* Error message */}
                {error && (
                    <div className="table__error">
                        Error: {error}
                    </div>
                )}

            </div>

            {/* Notes Popup */}
            {notesModal.open && (
                <div
                    className="notes-popup-overlay"
                    onClick={() => setNotesModal({ open: false, text: '', position: { x: 0, y: 0 } })}
                >
                    <div
                        className="notes-popup"
                        style={{
                            left: notesModal.position.x,
                            top: notesModal.position.y,
                            transform: 'translate(-50%, -100%)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="notes-popup__content">
                            {notesModal.text}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Table;