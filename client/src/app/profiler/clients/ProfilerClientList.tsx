'use client'
import React, { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
    fetchProfilerClients, 
    loadMoreProfilerClients, 
    searchProfilerClients,
    sortProfilerClients 
} from '@/store/actions/profilerClientActions';
import { setSearchQuery, clearProfilerClients } from '@/store/slices/profilerClientSlice';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { TextInput, Button } from '@/components/FormInputs';
import ProfilerClientTable from './ProfilerClientTable';
import './ProfilerClientList.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface ProfilerClientListProps {
    onNewClient: () => void;
}

const ProfilerClientList: React.FC<ProfilerClientListProps> = ({ onNewClient }) => {
    const dispatch = useAppDispatch();
    const { 
        clients, 
        loading, 
        loadingMore, 
        error, 
        hasMore, 
        searchQuery,
        sortConfig,
        pagination 
    } = useAppSelector((state) => state.profilerClients);

    const observerTarget = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Load initial clients
    useEffect(() => {
        dispatch(fetchProfilerClients());
        return () => {
            dispatch(clearProfilerClients());
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
                    logger.log('Loading more profiler clients...');
                    dispatch(loadMoreProfilerClients());
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
            logger.log('Searching profiler clients:', value);
            dispatch(searchProfilerClients(value));
        }, 500);
    }, [dispatch]);

    // Sort handler
    const handleSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
        logger.log('Sorting profiler clients:', { sortBy, sortOrder });
        dispatch(sortProfilerClients({ sort_by: sortBy, sort_order: sortOrder }));
    }, [dispatch]);

    // Refresh handler
    const handleRefresh = useCallback(() => {
        logger.log('Refreshing profiler clients');
        dispatch(fetchProfilerClients());
    }, [dispatch]);

    return (
        <div className="profiler-client-list">
            <div className="profiler-client-list__header">
                <div className="profiler-client-list__title-section">
                    <h1 className="profiler-client-list__title">Clients</h1>
                    <p className="profiler-client-list__subtitle">
                        Manage clients for financial profiling
                    </p>
                </div>
                
                <div className="profiler-client-list__actions">
                    <div className="profiler-client-list__search">
                        <TextInput
                            type="text"
                            placeholder="Search by name, email, mobile, or aadhaar..."
                            value={searchQuery}
                            onChange={(value: string) => handleSearch(value)}
                            icon={<Search size={18} />}
                            className="profiler-client-list__search-input"
                        />
                    </div>
                    
                    <Button
                        variant="primary"
                        icon={<UserPlus size={18} />}
                        onClick={onNewClient}
                        className="profiler-client-list__add-button"
                    >
                        Add Client
                    </Button>
                </div>
            </div>

            {pagination && (
                <div className="profiler-client-list__stats">
                    <span className="profiler-client-list__stats-text">
                        Showing {clients.length} of {pagination.total_count} clients
                    </span>
                </div>
            )}

            <div className="profiler-client-list__content">
                {loading && clients.length === 0 ? (
                    <div className="profiler-client-list__loading">
                        <Loader2 size={48} className="profiler-client-list__loading-icon" />
                        <p>Loading profiler clients...</p>
                    </div>
                ) : clients.length === 0 ? (
                    <div className="profiler-client-list__empty">
                        <UserPlus size={64} className="profiler-client-list__empty-icon" />
                        <h3>No Clients Found</h3>
                        <p>Get started by adding your first profiler client</p>
                        <Button
                            variant="primary"
                            icon={<UserPlus size={18} />}
                            onClick={onNewClient}
                        >
                            Add First Client
                        </Button>
                    </div>
                ) : (
                    <>
                        <ProfilerClientTable
                            clients={clients}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onRefresh={handleRefresh}
                        />
                        
                        {hasMore && (
                            <div ref={observerTarget} className="profiler-client-list__load-more">
                                {loadingMore && (
                                    <div className="profiler-client-list__loading-more">
                                        <Loader2 size={24} className="profiler-client-list__loading-more-icon" />
                                        <span>Loading more clients...</span>
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

export default ProfilerClientList;
