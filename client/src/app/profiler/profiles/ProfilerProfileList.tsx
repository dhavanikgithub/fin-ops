'use client'
import React, { useEffect, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { 
    fetchProfilerProfiles, 
    loadMoreProfilerProfiles, 
    searchProfilerProfiles,
    sortProfilerProfiles 
} from '@/store/actions/profilerProfileActions';
import { setSearchQuery, clearProfilerProfiles } from '@/store/slices/profilerProfileSlice';
import { Search, FileText, Loader2 } from 'lucide-react';
import { TextInput, Button } from '@/components/FormInputs';
import ProfilerProfileTable from './ProfilerProfileTable';
import './ProfilerProfileList.scss';
import logger from '@/utils/logger';
import toast from 'react-hot-toast';

interface ProfilerProfileListProps {
    onNewProfile: () => void;
}

const ProfilerProfileList: React.FC<ProfilerProfileListProps> = ({ onNewProfile }) => {
    const dispatch = useAppDispatch();
    const { 
        profiles, 
        loading, 
        loadingMore, 
        error, 
        hasMore, 
        searchQuery,
        sortConfig,
        pagination 
    } = useAppSelector((state) => state.profilerProfiles);

    const observerTarget = useRef<HTMLDivElement>(null);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        dispatch(fetchProfilerProfiles());
        return () => {
            dispatch(clearProfilerProfiles());
        };
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
                    logger.log('Loading more profiler profiles...');
                    dispatch(loadMoreProfilerProfiles());
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

    const handleSearch = useCallback((value: string) => {
        dispatch(setSearchQuery(value));
        
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            logger.log('Searching profiler profiles:', value);
            dispatch(searchProfilerProfiles(value));
        }, 500);
    }, [dispatch]);

    const handleSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
        logger.log('Sorting profiler profiles:', { sortBy, sortOrder });
        dispatch(sortProfilerProfiles({ sort_by: sortBy, sort_order: sortOrder }));
    }, [dispatch]);

    const handleRefresh = useCallback(() => {
        logger.log('Refreshing profiler profiles');
        dispatch(fetchProfilerProfiles());
    }, [dispatch]);

    return (
        <div className="profiler-profile-list">
            <div className="profiler-profile-list__header">
                <div className="profiler-profile-list__title-section">
                    <h1 className="profiler-profile-list__title">Profiles</h1>
                    <p className="profiler-profile-list__subtitle">
                        Manage financial profiles for clients
                    </p>
                </div>
                
                <div className="profiler-profile-list__actions">
                    <div className="profiler-profile-list__search">
                        <TextInput
                            type="text"
                            placeholder="Search by client, bank, or remarks..."
                            value={searchQuery}
                            onChange={(value: string) => handleSearch(value)}
                            icon={<Search size={18} />}
                            className="profiler-profile-list__search-input"
                        />
                    </div>
                    
                    <Button
                        variant="primary"
                        icon={<FileText size={18} />}
                        onClick={onNewProfile}
                        className="profiler-profile-list__add-button"
                    >
                        Add Profile
                    </Button>
                </div>
            </div>

            {pagination && (
                <div className="profiler-profile-list__stats">
                    <span className="profiler-profile-list__stats-text">
                        Showing {profiles.length} of {pagination.total_count} profiles
                    </span>
                </div>
            )}

            <div className="profiler-profile-list__content">
                {loading && profiles.length === 0 ? (
                    <div className="profiler-profile-list__loading">
                        <Loader2 size={48} className="profiler-profile-list__loading-icon" />
                        <p>Loading profiler profiles...</p>
                    </div>
                ) : profiles.length === 0 ? (
                    <div className="profiler-profile-list__empty">
                        <FileText size={64} className="profiler-profile-list__empty-icon" />
                        <h3>No Profiles Found</h3>
                        <p>Get started by adding your first profiler profile</p>
                        <Button
                            variant="primary"
                            icon={<FileText size={18} />}
                            onClick={onNewProfile}
                        >
                            Add First Profile
                        </Button>
                    </div>
                ) : (
                    <>
                        <ProfilerProfileTable
                            profiles={profiles}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onRefresh={handleRefresh}
                        />
                        
                        {hasMore && (
                            <div ref={observerTarget} className="profiler-profile-list__load-more">
                                {loadingMore && (
                                    <div className="profiler-profile-list__loading-more">
                                        <Loader2 size={24} className="profiler-profile-list__loading-more-icon" />
                                        <span>Loading more profiles...</span>
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

export default ProfilerProfileList;
