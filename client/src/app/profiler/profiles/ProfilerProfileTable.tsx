'use client'
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { markProfilerProfileDone, deleteProfilerProfile } from '@/store/actions/profilerProfileActions';
import { ProfilerProfile } from '@/services/profilerProfileService';
import { CheckCircle, Trash2, ChevronUp, ChevronDown, Minus, User, Building2 } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import DeleteProfilerProfileModal from './DeleteProfilerProfileModal';
import './ProfilerProfileTable.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

interface ProfilerProfileTableProps {
    profiles: ProfilerProfile[];
    sortConfig: {
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    onRefresh: () => void;
}

// Format credit card number with bullet every 4 digits
const formatCreditCard = (value: string): string => {
    if (!value) return '';
    const digits = value.replace(/[•\-\s]/g, '');
    const formatted = digits.match(/.{1,4}/g)?.join(' • ') || digits;
    return formatted;
};

const ProfilerProfileTable: React.FC<ProfilerProfileTableProps> = ({
    profiles,
    sortConfig,
    onSort,
    onRefresh
}) => {
    const dispatch = useAppDispatch();
    const { markingDoneIds, deletingProfileIds } = useAppSelector((state) => state.profilerProfiles);
    const [deleteModalProfile, setDeleteModalProfile] = useState<ProfilerProfile | null>(null);

    const handleSortClick = (column: string) => {
        const newOrder = sortConfig.sort_by === column && sortConfig.sort_order === 'asc' ? 'desc' : 'asc';
        onSort(column, newOrder);
    };

    const getSortIcon = (column: string) => {
        if (sortConfig.sort_by !== column) {
            return null;
        }
        return sortConfig.sort_order === 'asc' 
            ? <ChevronUp size={14} className="profiler-profile-table__sort-icon profiler-profile-table__sort-icon--active" />
            : <ChevronDown size={14} className="profiler-profile-table__sort-icon profiler-profile-table__sort-icon--active" />;
    };

    const handleMarkDone = async (profileId: number) => {
        try {
            await dispatch(markProfilerProfileDone({ id: profileId })).unwrap();
            toast.success('Profile marked as done');
            onRefresh();
        } catch (error: any) {
            logger.error('Error marking profile as done:', error);
            toast.error(error || 'Failed to mark profile as done');
        }
    };

    const handleDeleteClick = (profile: ProfilerProfile) => {
        setDeleteModalProfile(profile);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModalProfile) return;

        try {
            await dispatch(deleteProfilerProfile({ id: deleteModalProfile.id })).unwrap();
            toast.success('Profile deleted successfully');
            setDeleteModalProfile(null);
            onRefresh();
        } catch (error: any) {
            logger.error('Error deleting profiler profile:', error);
            toast.error(error || 'Failed to delete profile');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'profiler-profile-table__badge--success';
            case 'done':
                return 'profiler-profile-table__badge--info';
            case 'pending':
                return 'profiler-profile-table__badge--warning';
            default:
                return 'profiler-profile-table__badge--muted';
        }
    };

    return (
        <>
            <div className="profiler-profile-table">
                <div className="profiler-profile-table__wrapper">
                    <table className="profiler-profile-table__table">
                        <thead className="profiler-profile-table__thead">
                            <tr>
                                <th onClick={() => handleSortClick('profiler_client_name')} className="profiler-profile-table__th profiler-profile-table__th--sortable">
                                    <div className="profiler-profile-table__th-content">
                                        Client {getSortIcon('profiler_client_name')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('profiler_bank_name')} className="profiler-profile-table__th profiler-profile-table__th--sortable">
                                    <div className="profiler-profile-table__th-content">
                                        Bank {getSortIcon('profiler_bank_name')}
                                    </div>
                                </th>
                                <th className="profiler-profile-table__th">Credit Card</th>
                                <th onClick={() => handleSortClick('opening_balance')} className="profiler-profile-table__th profiler-profile-table__th--sortable profiler-profile-table__th--right">
                                    <div className="profiler-profile-table__th-content">
                                        Opening Bal {getSortIcon('opening_balance')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('balance')} className="profiler-profile-table__th profiler-profile-table__th--sortable profiler-profile-table__th--right">
                                    <div className="profiler-profile-table__th-content">
                                        Balance {getSortIcon('balance')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('status')} className="profiler-profile-table__th profiler-profile-table__th--sortable profiler-profile-table__th--center">
                                    <div className="profiler-profile-table__th-content">
                                        Status {getSortIcon('status')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('transaction_count')} className="profiler-profile-table__th profiler-profile-table__th--sortable profiler-profile-table__th--center">
                                    <div className="profiler-profile-table__th-content">
                                        Txns {getSortIcon('transaction_count')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('created_at')} className="profiler-profile-table__th profiler-profile-table__th--sortable">
                                    <div className="profiler-profile-table__th-content">
                                        Created {getSortIcon('created_at')}
                                    </div>
                                </th>
                                <th className="profiler-profile-table__th profiler-profile-table__th--actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="profiler-profile-table__tbody">
                            {profiles.map((profile) => {
                                const isMarkingDone = markingDoneIds.includes(profile.id);
                                const isDeleting = deletingProfileIds.includes(profile.id);

                                return (
                                    <tr key={profile.id} className="profiler-profile-table__tr">
                                        <td className="profiler-profile-table__td">
                                            <div className="profiler-profile-table__client">
                                                <User size={14} />
                                                {profile.client_name}
                                            </div>
                                        </td>
                                        <td className="profiler-profile-table__td">
                                            <div className="profiler-profile-table__bank">
                                                <Building2 size={14} />
                                                {profile.bank_name}
                                            </div>
                                        </td>
                                        <td className="profiler-profile-table__td">
                                            <span className="profiler-profile-table__card-number">
                                                {formatCreditCard(profile.credit_card_number)}
                                            </span>
                                        </td>
                                        <td className="profiler-profile-table__td profiler-profile-table__td--right">
                                            <span className="profiler-profile-table__amount">
                                                {formatCurrency(profile.pre_planned_deposit_amount)}
                                            </span>
                                        </td>
                                        <td className="profiler-profile-table__td profiler-profile-table__td--right">
                                            <span className={`profiler-profile-table__amount ${
                                                profile.current_balance > 0 
                                                    ? 'profiler-profile-table__amount--positive' 
                                                    : profile.current_balance < 0 
                                                        ? 'profiler-profile-table__amount--negative' 
                                                        : ''
                                            }`}>
                                                {formatCurrency(profile.current_balance)}
                                            </span>
                                        </td>
                                        <td className="profiler-profile-table__td profiler-profile-table__td--center">
                                            <span className={`profiler-profile-table__badge ${getStatusBadgeClass(profile.status)}`}>
                                                {profile.status}
                                            </span>
                                        </td>
                                        <td className="profiler-profile-table__td profiler-profile-table__td--center">
                                            <span className={`profiler-profile-table__badge ${(profile.transaction_count && profile.transaction_count > 0) ? 'profiler-profile-table__badge--success' : 'profiler-profile-table__badge--muted'}`}>
                                                {profile.transaction_count || 0}
                                            </span>
                                        </td>
                                        <td className="profiler-profile-table__td">
                                            <span className="profiler-profile-table__date">
                                                {formatDate(profile.created_at)}
                                            </span>
                                        </td>
                                        <td className="profiler-profile-table__td profiler-profile-table__td--actions">
                                            <div className="profiler-profile-table__actions">
                                                {profile.status.toLowerCase() !== 'done' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="small"
                                                        icon={<CheckCircle size={16} />}
                                                        onClick={() => handleMarkDone(profile.id)}
                                                        disabled={isMarkingDone || isDeleting}
                                                        className="profiler-profile-table__mark-done-btn"
                                                        title="Mark as done"
                                                    />
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="small"
                                                    icon={<Trash2 size={16} />}
                                                    onClick={() => handleDeleteClick(profile)}
                                                    disabled={isDeleting || (profile.transaction_count ? profile.transaction_count > 0 : false)}
                                                    className="profiler-profile-table__delete-btn"
                                                    title="Delete profile"
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteModalProfile && (
                <DeleteProfilerProfileModal
                    profile={deleteModalProfile}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteModalProfile(null)}
                />
            )}
        </>
    );
};

export default ProfilerProfileTable;
