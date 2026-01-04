'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Eye, ChevronDown, ChevronUp, ArrowDownLeft, ArrowUpRight, MoreHorizontal, Check, X, AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { loadMoreTransactions, sortTransactions } from '../../store/actions/transactionActions';
import { Transaction } from '../../services/transactionService';
import './TransactionTable.scss';
import { getTransactionTypeLabel, isDeposit, isWithdraw } from '@/utils/transactionUtils';
import { formatAmountWithSymbol, formatDateToReadable, formatTime, getAvatarColor, getAvatarInitials } from '@/utils/helperFunctions';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';
import { Button } from '@/components/FormInputs';

interface TableProps {
    selectedTransaction?: Transaction | null;
    onTransactionSelect?: (transaction: Transaction) => void;
}

// Error Fallback Component for Transaction Table
const TransactionTableErrorFallback: React.FC<{
    error: Error;
    resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="txn-table-wrap">
            <div className="txn-table__container">
                <div className="txn-table__error-boundary">
                    <div className="txn-table__error-boundary-content">
                        <AlertTriangle size={48} className="txn-table__error-boundary-icon" />
                        <h3 className="txn-table__error-boundary-title">Something went wrong with the transaction table</h3>
                        <p className="txn-table__error-boundary-message">
                            We encountered an unexpected error while displaying the transactions.
                            Don't worry, your data is safe.
                        </p>
                        {process.env.NODE_ENV === 'development' && (
                            <details className="txn-table__error-boundary-details">
                                <summary>Technical Details (Development)</summary>
                                <pre className="txn-table__error-boundary-stack">
                                    {error.message}
                                    {error.stack && `\n${error.stack}`}
                                </pre>
                            </details>
                        )}
                        <div className="txn-table__error-boundary-actions">
                            <Button
                                variant="primary"
                                icon={<RotateCcw size={16} />}
                                onClick={resetErrorBoundary}
                                className="txn-table__error-boundary-retry"
                            >
                                Try Again
                            </Button>
                            <Button
                                variant="secondary"
                                icon={<RefreshCw size={16} />}
                                onClick={() => window.location.reload()}
                                className="txn-table__error-boundary-refresh"
                            >
                                Refresh Page
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TransactionTableContent: React.FC<TableProps> = ({ selectedTransaction, onTransactionSelect }) => {
    const dispatch = useAppDispatch();
    const { showBoundary } = useErrorBoundary();
    const {
        transactions,
        loading,
        loadingMore,
        hasMore,
        sortConfig,
        pagination,
        error,
        editingTransactionIds,
        deletingTransactionIds,
        searchQuery
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


    // Function to highlight search terms in text
    const highlightText = (text: string, search: string): React.ReactNode => {
        if (!search || !search.trim() || !text) return text;

        const searchTerm = search.trim();
        // Normalize search term by removing trailing zeros after decimal
        const normalizedSearch = searchTerm.replace(/\.?0+$/, '');
        
        // For numeric matching, also try without commas
        const searchWithoutComma = searchTerm.replace(/,/g, '');
        const textWithoutComma = text.toString().replace(/,/g, '');
        
        // Check if the search term (without commas) exists in text (without commas)
        if (searchWithoutComma && textWithoutComma.toLowerCase().includes(searchWithoutComma.toLowerCase())) {
            // Split text by commas to handle comma-separated numbers
            const parts: React.ReactNode[] = [];
            let remainingText = text.toString();
            let key = 0;
            
            // Find all occurrences considering commas
            const regex = new RegExp(
                searchWithoutComma.split('').join(',?'),
                'gi'
            );
            
            const matches = remainingText.match(regex);
            if (matches) {
                let lastIndex = 0;
                let searchIndex = 0;
                
                while (searchIndex < remainingText.length) {
                    const textSegment = remainingText.slice(searchIndex).replace(/,/g, '');
                    const matchIndex = textSegment.toLowerCase().indexOf(searchWithoutComma.toLowerCase());
                    
                    if (matchIndex !== -1) {
                        // Calculate actual position in original text (with commas)
                        let actualIndex = searchIndex;
                        let segmentIndex = 0;
                        
                        for (let i = searchIndex; i < remainingText.length && segmentIndex < matchIndex; i++) {
                            if (remainingText[i] !== ',') {
                                segmentIndex++;
                            }
                            actualIndex = i + 1;
                        }
                        
                        // Add text before match
                        if (actualIndex > lastIndex) {
                            parts.push(remainingText.slice(lastIndex, actualIndex));
                        }
                        
                        // Calculate match length in original text (including commas)
                        let matchLength = 0;
                        let matchedChars = 0;
                        for (let i = actualIndex; i < remainingText.length && matchedChars < searchWithoutComma.length; i++) {
                            matchLength++;
                            if (remainingText[i] !== ',') {
                                matchedChars++;
                            }
                        }
                        
                        // Add highlighted match
                        parts.push(
                            <mark key={`highlight-${key++}`} className="txn-table__highlight">
                                {remainingText.slice(actualIndex, actualIndex + matchLength)}
                            </mark>
                        );
                        
                        lastIndex = actualIndex + matchLength;
                        searchIndex = lastIndex;
                    } else {
                        break;
                    }
                }
                
                // Add remaining text
                if (lastIndex < remainingText.length) {
                    parts.push(remainingText.slice(lastIndex));
                }
                
                return parts.length > 0 ? parts : text;
            }
        }
        
        // Fallback to original logic for non-numeric or simple matches
        // Create regex for both exact and normalized versions
        const escapedSearch = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const escapedNormalized = normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedSearch}|${escapedNormalized})`, 'gi');

        const parts = text.toString().split(regex);
        
        return parts.map((part, index) => {
            const isMatch = part.toLowerCase() === searchTerm.toLowerCase() || 
                           part.toLowerCase() === normalizedSearch.toLowerCase();
            return isMatch ? (
                <mark key={index} className="txn-table__highlight">{part}</mark>
            ) : (
                part
            );
        });
    };

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
        const completedSaves = prevSavingIds.filter(id => !editingTransactionIds.includes(id));
        completedSaves.forEach(id => {
            setCompletedOperations(prev => ({ ...prev, [id]: 'saved' }));
            setTimeout(() => {
                setCompletedOperations(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
                toast.success('Transaction saved');
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
                    toast.success('Transaction deleted');
                }, 400); // Match CSS animation duration
            }, 1000); // Wait 1 second to show delete status
        });

        // Update previous states
        setPrevSavingIds(editingTransactionIds);
        setPrevDeletingIds(deletingTransactionIds);
    }, [editingTransactionIds, deletingTransactionIds, prevSavingIds, prevDeletingIds]);

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

    // Handle sorting with error handling
    const handleSort = async (field: string) => {
        try {
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

            await dispatch(sortTransactions({
                sort_by: field,
                sort_order: newDirection
            })).unwrap();
        } catch (error) {
            // Handle expected API errors
            logger.error('Failed to sort transactions:', error);
            toast.error('Failed to sort transactions. Please try again.');

            // Reset sort state on error
            setSortField(sortConfig.sort_by);
            setSortDirection(sortConfig.sort_order);
        }
    };

    // Load more items function with error handling
    const loadMore = useCallback(async () => {
        if (loadingMore || !hasMore) return;

        try {
            await dispatch(loadMoreTransactions()).unwrap();
        } catch (error) {
            // Handle expected API errors (network issues, server errors)
            logger.error('Failed to load more transactions:', error);
            toast.error('Failed to load more transactions. Please try again.');
        }
    }, [dispatch, loadingMore, hasMore]);

    // Intersection Observer for infinite scroll with error handling
    useEffect(() => {
        try {
            const observer = new IntersectionObserver(
                (entries) => {
                    try {
                        const first = entries[0];
                        if (first.isIntersecting) {
                            loadMore();
                        }
                    } catch (error) {
                        // Handle unexpected errors in intersection callback
                        logger.error('Error in intersection observer callback:', error);
                        showBoundary(error);
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
        } catch (error) {
            // Handle unexpected errors in observer setup
            logger.error('Error setting up intersection observer:', error);
            showBoundary(error);
        }
    }, [loadMore, transactions, showBoundary]);

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

    // Safe transaction selection handler
    const handleTransactionSelect = useCallback((transaction: Transaction) => {
        try {
            if (onTransactionSelect) {
                onTransactionSelect(transaction);
            }
        } catch (error) {
            // Handle unexpected errors in transaction selection
            logger.error('Error selecting transaction:', error);
            showBoundary(error);
        }
    }, [onTransactionSelect, showBoundary]);

    // Safe notes modal handler
    const handleNotesView = useCallback((e: React.MouseEvent, remark: string) => {
        try {
            const rect = e.currentTarget.getBoundingClientRect();
            setNotesModal({
                open: true,
                text: remark,
                position: {
                    x: rect.left + rect.width / 2,
                    y: rect.top - 8
                }
            });
        } catch (error) {
            // Handle unexpected errors in notes modal
            logger.error('Error opening notes modal:', error);
            // For notes modal errors, don't crash the whole table
            toast.error('Unable to display notes. Please try again.');
        }
    }, []);

    const SortIcon: React.FC<{ field: string }> = ({ field }) => {
        if (sortField !== field) {
            return null;
        }

        return sortDirection === 'asc' ?
            <ChevronUp size={16} className="txn-table__sort-icon txn-table__sort-icon--active" /> :
            <ChevronDown size={16} className="txn-table__sort-icon txn-table__sort-icon--active" />;
    };

    const renderBankAndCard = (bankName: string | null, cardName: string | null, search: string) => {
        if (bankName && cardName) {
            return (
                <div className="txn-table__method-bank">
                    {highlightText(bankName, search)} • {highlightText(cardName, search)}
                </div>
            )
        }
        else if (bankName) {
            return (
                <div className="txn-table__method-bank">
                    {highlightText(bankName, search)}
                </div>
            )
        }
        else if (cardName) {
            return (
                <div className="txn-table__method-bank">
                    {highlightText(cardName, search)}
                </div>
            )
        }
        else return <div className="txn-table__method-bank">-</div>;
    }

    const renderWithdrawCharges = (transaction: Transaction | null, search: string) => {
        if (transaction && transaction.widthdraw_charges !== null && transaction.widthdraw_charges !== 0) {
            return (
                <div className="txn-table__charges">
                    <span className="txn-table__charges-value">{highlightText(transaction.widthdraw_charges.toFixed(2), search)}%</span>
                    <div className="txn-table__charges-amount">
                        ₹ {highlightText((transaction.transaction_amount * transaction.widthdraw_charges / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }), search)}/-
                    </div>
                </div>
            )
        }
        else {
            return (
                <div className="txn-table__charges">-</div>
            )
        }
    }

    return (
        <div className="txn-table-wrap">
            {/* Scrollable container */}
            <div className="txn-table__container" ref={tableContainerRef}>
                <table className="table">
                    <thead
                        ref={tableHeaderRef}
                        className={showHeaderShadow ? 'table__header--shadow' : ''}
                    >
                        <tr>
                            
                            <th>
                                <div
                                    className="txn-table__sort-header"
                                    onClick={() => handleSort('client_name')}
                                >
                                    Client
                                    <SortIcon field="client_name" />
                                </div>
                            </th>
                            <th>
                                <div
                                    className="txn-table__sort-header"
                                    onClick={() => handleSort('transaction_amount')}
                                >
                                    Amount
                                    <SortIcon field="transaction_amount" />
                                </div>
                            </th>
                            <th>
                                <div className="txn-table__sort-header table__sort-header--disabled">
                                    Bank • Card
                                </div>
                            </th>
                            <th>
                                <div className="txn-table__sort-header table__sort-header--disabled">
                                    Charges
                                </div>
                            </th>

                            <th>
                                <div
                                    className="txn-table__sort-header"
                                    onClick={() => handleSort('create_date')}
                                >
                                    Date & Time
                                    <SortIcon field="create_date" />
                                </div>
                            </th>
                            <th>
                                <div className="txn-table__sort-header table__sort-header--disabled">
                                    Notes
                                </div>
                            </th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && transactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="txn-table__no-results">
                                    <div className="txn-table__loading">
                                        <div className="txn-table__spinner"></div>
                                        Loading transactions...
                                    </div>
                                </td>
                            </tr>
                        ) : transactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="txn-table__no-results">
                                    No transactions found.
                                </td>
                            </tr>
                        ) : (
                            transactions.filter(transaction => !removingTransactions.has(transaction.id)).map((transaction: Transaction, index: number) => {
                                const isSaving = editingTransactionIds.includes(transaction.id);
                                const isDeleting = deletingTransactionIds.includes(transaction.id);
                                const completedStatus = completedOperations[transaction.id];
                                const isRemoving = removingTransactions.has(transaction.id);
                                const isNew = newTransactions.has(transaction.id);

                                return (
                                    <tr
                                        key={`${transaction.id}-${index}`}
                                        className={`
                                            ${selectedTransaction?.id === transaction.id ? 'txn-table__row--selected' : ''}
                                            ${isRemoving ? 'txn-table__row--removing' : ''}
                                            ${isNew ? 'txn-table__row--inserting' : ''}
                                        `.trim()}
                                    >
                                        
                                        <td>
                                            <div className="txn-table__client">
                                                <div
                                                    className="txn-table__client-avatar"
                                                    style={{ backgroundColor: getAvatarColor(transaction.client_name) }}
                                                >
                                                    {getAvatarInitials(transaction.client_name)}

                                                    {/* Loading/Status Overlay */}
                                                    {(isSaving || isDeleting || completedStatus) && (
                                                        <div className="txn-table__avatar-overlay">
                                                            {isSaving && (
                                                                <div className="txn-table__avatar-spinner">
                                                                    <div className="txn-table__spinner-ring"></div>
                                                                </div>
                                                            )}
                                                            {isDeleting && (
                                                                <div className="txn-table__avatar-spinner">
                                                                    <div className="txn-table__spinner-ring txn-table__spinner-ring--delete"></div>
                                                                </div>
                                                            )}
                                                            {completedStatus === 'saved' && (
                                                                <div className="txn-table__avatar-status txn-table__avatar-status--success">
                                                                    <Check size={16} />
                                                                </div>
                                                            )}
                                                            {completedStatus === 'deleted' && (
                                                                <div className="txn-table__avatar-status txn-table__avatar-status--error">
                                                                    <X size={16} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="txn-table__client-name">{highlightText(transaction.client_name, searchQuery)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`txn-table__amount txn-table__amount--${getTransactionTypeLabel(transaction.transaction_type)}`}>
                                                {isDeposit(transaction.transaction_type) ? (
                                                    <ArrowDownLeft size={16} className="txn-table__amount-icon" />
                                                ) : (
                                                    <ArrowUpRight size={16} className="txn-table__amount-icon" />
                                                )}
                                                <span className="txn-table__amount-value">
                                                    {highlightText(formatAmountWithSymbol(transaction.transaction_amount), searchQuery)}/-
                                                </span>
                                            </div>

                                        </td>
                                        <td>
                                            {renderBankAndCard(transaction.bank_name, transaction.card_name, searchQuery)}
                                        </td>
                                        <td>
                                            {renderWithdrawCharges(transaction, searchQuery)}
                                        </td>
                                        <td>
                                            {formatDateToReadable(transaction.create_date)} <span className="txn-table__time">• {formatTime(transaction.create_time)}</span>
                                        </td>
                                        <td>
                                            <div className="txn-table__notes">
                                                {transaction.remark.length > 30 ? (
                                                    <span className="txn-table__notes-text">
                                                        {highlightText(transaction.remark.slice(0, 30), searchQuery)}
                                                        <Button
                                                            variant="ghost"
                                                            size="small"
                                                            onClick={(e) => handleNotesView(e, transaction.remark)}
                                                            className="txn-table__notes-viewmore"
                                                        >
                                                            ...
                                                        </Button>
                                                    </span>
                                                ) : (
                                                    <span className="txn-table__notes-text">
                                                        {transaction.remark && transaction.remark.trim() !== '' ? highlightText(transaction.remark, searchQuery) : '-'}
                                                    </span>
                                                )}
                                            </div>

                                        </td>

                                        <td>
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                icon={<MoreHorizontal size={16} />}
                                                onClick={() => handleTransactionSelect(transaction)}
                                                className="txn-table__row-actions"
                                            >
                                                Manage
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Infinite scroll trigger */}
                {hasMore && !loading && (
                    <div ref={observerRef} className="txn-table__load-trigger">
                        {loadingMore && (
                            <div className="txn-table__loading">
                                <div className="txn-table__spinner"></div>
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

// Main wrapper component with ErrorBoundary
const Table: React.FC<TableProps> = ({ selectedTransaction, onTransactionSelect }) => {
    return (
        <ErrorBoundary
            FallbackComponent={TransactionTableErrorFallback}
            onError={(error, errorInfo) => {
                logger.error('Transaction Table Error Boundary caught an error:', error, errorInfo);
                toast.error('Transaction table encountered an error');
            }}
            onReset={() => {
                logger.log('Transaction Table Error Boundary reset');
                // Optionally refresh the transaction data
                window.location.reload();
            }}
        >
            <TransactionTableContent
                selectedTransaction={selectedTransaction}
                onTransactionSelect={onTransactionSelect}
            />
        </ErrorBoundary>
    );
};

export default Table;