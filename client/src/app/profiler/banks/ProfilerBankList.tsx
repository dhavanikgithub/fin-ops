'use client'
import React, { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
    fetchProfilerBanks, 
    loadMoreProfilerBanks, 
    searchProfilerBanks,
    sortProfilerBanks 
} from '@/store/actions/profilerBankActions';
import { setSearchQuery, clearProfilerBanks } from '@/store/slices/profilerBankSlice';
import { Search, Building2, Loader2 } from 'lucide-react';
import { TextInput, Button } from '@/components/FormInputs';
import ProfilerBankTable from './ProfilerBankTable';
import './ProfilerBankList.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface ProfilerBankListProps {
    onNewBank: () => void;
}

const ProfilerBankList: React.FC<ProfilerBankListProps> = ({ onNewBank }) => {
    const dispatch = useAppDispatch();
    const { 
        banks, 
        loading, 
        loadingMore, 
        error, 
        hasMore, 
        searchQuery,
        sortConfig,
        pagination 
    } = useAppSelector((state) => state.profilerBanks);

    const observerTarget = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load initial banks
    useEffect(() => {
        dispatch(fetchProfilerBanks());
        return () => {
            dispatch(clearProfilerBanks());
        };
    }, [dispatch]);

    // Show error toast
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    logger.log('Loading more profiler banks...');
                    dispatch(loadMoreProfilerBanks());
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading, loadingMore, dispatch]);

    // Search handler with debounce
    const handleSearch = useCallback((value: string) => {
        dispatch(setSearchQuery(value));
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            logger.log('Searching profiler banks:', value);
            dispatch(searchProfilerBanks(value));
        }, 500);
    }, [dispatch]);

    // Sort handler
    const handleSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
        logger.log('Sorting profiler banks:', { sortBy, sortOrder });
        dispatch(sortProfilerBanks({ sort_by: sortBy, sort_order: sortOrder }));
    }, [dispatch]);

    // Refresh handler
    const handleRefresh = useCallback(() => {
        logger.log('Refreshing profiler banks');
        dispatch(fetchProfilerBanks());
    }, [dispatch]);

    return (
        <div className="profiler-bank-list">
            <div className="profiler-bank-list__header">
                <div className="profiler-bank-list__title-section">
                    <h1 className="profiler-bank-list__title">Banks</h1>
                    <p className="profiler-bank-list__subtitle">
                        Manage banks for financial profiling
                    </p>
                </div>
                
                <div className="profiler-bank-list__actions">
                    <div className="profiler-bank-list__search">
                        <TextInput
                            type="text"
                            placeholder="Search by bank name..."
                            value={searchQuery}
                            onChange={(value: string) => handleSearch(value)}
                            icon={<Search size={18} />}
                            className="profiler-bank-list__search-input"
                        />
                    </div>
                    
                    <Button
                        variant="primary"
                        icon={<Building2 size={18} />}
                        onClick={onNewBank}
                        className="profiler-bank-list__add-button"
                    >
                        Add Bank
                    </Button>
                </div>
            </div>

            {pagination && (
                <div className="profiler-bank-list__stats">
                    <span className="profiler-bank-list__stats-text">
                        Showing {banks.length} of {pagination.total_count} banks
                    </span>
                </div>
            )}

            <div className="profiler-bank-list__content">
                {loading && banks.length === 0 ? (
                    <div className="profiler-bank-list__loading">
                        <Loader2 size={48} className="profiler-bank-list__loading-icon" />
                        <p>Loading profiler banks...</p>
                    </div>
                ) : banks.length === 0 ? (
                    <div className="profiler-bank-list__empty">
                        <Building2 size={64} className="profiler-bank-list__empty-icon" />
                        <h3>No Banks Found</h3>
                        <p>Get started by adding your first profiler bank</p>
                        <Button
                            variant="primary"
                            icon={<Building2 size={18} />}
                            onClick={onNewBank}
                        >
                            Add First Bank
                        </Button>
                    </div>
                ) : (
                    <>
                        <ProfilerBankTable
                            banks={banks}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onRefresh={handleRefresh}
                        />
                        
                        {hasMore && (
                            <div ref={observerTarget} className="profiler-bank-list__load-more">
                                {loadingMore && (
                                    <div className="profiler-bank-list__loading-more">
                                        <Loader2 size={24} className="profiler-bank-list__loading-more-icon" />
                                        <span>Loading more banks...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ProfilerBankList;
