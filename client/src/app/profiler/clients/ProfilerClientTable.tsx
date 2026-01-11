'use client'
import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfilerClient, deleteProfilerClient } from '@/store/actions/profilerClientActions';
import { ProfilerClient } from '@/services/profilerClientService';
import { Edit, Trash2, Phone, Mail, CreditCard, ChevronUp, ChevronDown, Minus } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import DeleteProfilerClientModal from './DeleteProfilerClientModal';
import './ProfilerClientTable.scss';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';

interface ProfilerClientTableProps {
    clients: ProfilerClient[];
    sortConfig: {
        sort_by: string;
        sort_order: 'asc' | 'desc';
    };
    onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    onRefresh: () => void;
}

// Format Aadhaar number with bullet every 4 digits
const formatAadhaar = (value: string): string => {
    if (!value) return '';
    const digits = value.replace(/[•\-\s]/g, '');
    const formatted = digits.match(/.{1,4}/g)?.join(' • ') || digits;
    return formatted;
};

// Remove bullets, hyphens and spaces from Aadhaar number
const unformatAadhaar = (value: string): string => {
    return value.replace(/[•\-\s]/g, '');
};

const ProfilerClientTable: React.FC<ProfilerClientTableProps> = ({
    clients,
    sortConfig,
    onSort,
    onRefresh
}) => {
    const dispatch = useAppDispatch();
    const { savingClientIds, deletingClientIds } = useAppSelector((state) => state.profilerClients);
    
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<ProfilerClient>>({});
    const [deleteModalClient, setDeleteModalClient] = useState<ProfilerClient | null>(null);

    const handleSortClick = (column: string) => {
        const newOrder = sortConfig.sort_by === column && sortConfig.sort_order === 'asc' ? 'desc' : 'asc';
        onSort(column, newOrder);
    };

    const getSortIcon = (column: string) => {
        if (sortConfig.sort_by !== column) {
            return null;
        }
        return sortConfig.sort_order === 'asc' 
            ? <ChevronUp size={14} className="profiler-client-table__sort-icon profiler-client-table__sort-icon--active" />
            : <ChevronDown size={14} className="profiler-client-table__sort-icon profiler-client-table__sort-icon--active" />;
    };

    const handleEdit = (client: ProfilerClient) => {
        setEditingId(client.id);
        setEditFormData({
            id: client.id,
            name: client.name,
            email: client.email || '',
            mobile_number: client.mobile_number || '',
            aadhaar_card_number: client.aadhaar_card_number || '',
            notes: client.notes || ''
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({});
    };

    const handleSave = async (clientId: number) => {
        try {
            if (!editFormData.name?.trim()) {
                toast.error('Client name is required');
                return;
            }

            await dispatch(updateProfilerClient({
                id: clientId,
                name: editFormData.name,
                email: editFormData.email || null,
                mobile_number: editFormData.mobile_number || null,
                aadhaar_card_number: editFormData.aadhaar_card_number || null,
                notes: editFormData.notes || null
            })).unwrap();

            toast.success('Client updated successfully');
            setEditingId(null);
            setEditFormData({});
        } catch (error: any) {
            logger.error('Error updating profiler client:', error);
            toast.error(error || 'Failed to update client');
        }
    };

    const handleDeleteClick = (client: ProfilerClient) => {
        setDeleteModalClient(client);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteModalClient) return;

        try {
            await dispatch(deleteProfilerClient({ id: deleteModalClient.id })).unwrap();
            toast.success('Client deleted successfully');
            setDeleteModalClient(null);
            onRefresh();
        } catch (error: any) {
            logger.error('Error deleting profiler client:', error);
            toast.error(error || 'Failed to delete client');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <>
            <div className="profiler-client-table">
                <div className="profiler-client-table__wrapper">
                    <table className="profiler-client-table__table">
                        <thead className="profiler-client-table__thead">
                            <tr>
                                <th onClick={() => handleSortClick('name')} className="profiler-client-table__th profiler-client-table__th--sortable">
                                    <div className="profiler-client-table__th-content">
                                        Name {getSortIcon('name')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('email')} className="profiler-client-table__th profiler-client-table__th--sortable">
                                    <div className="profiler-client-table__th-content">
                                        Email {getSortIcon('email')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('mobile_number')} className="profiler-client-table__th profiler-client-table__th--sortable">
                                    <div className="profiler-client-table__th-content">
                                        Mobile {getSortIcon('mobile_number')}
                                    </div>
                                </th>
                                <th className="profiler-client-table__th">Aadhaar</th>
                                <th onClick={() => handleSortClick('profile_count')} className="profiler-client-table__th profiler-client-table__th--sortable profiler-client-table__th--center">
                                    <div className="profiler-client-table__th-content">
                                        Profiles {getSortIcon('profile_count')}
                                    </div>
                                </th>
                                <th onClick={() => handleSortClick('created_at')} className="profiler-client-table__th profiler-client-table__th--sortable">
                                    <div className="profiler-client-table__th-content">
                                        Created {getSortIcon('created_at')}
                                    </div>
                                </th>
                                <th className="profiler-client-table__th profiler-client-table__th--actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="profiler-client-table__tbody">
                            {clients.map((client) => {
                                const isEditing = editingId === client.id;
                                const isSaving = savingClientIds.includes(client.id);
                                const isDeleting = deletingClientIds.includes(client.id);

                                return (
                                    <tr key={client.id} className="profiler-client-table__tr">
                                        <td className="profiler-client-table__td">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.name || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                    className="profiler-client-table__input"
                                                    placeholder="Client name"
                                                />
                                            ) : (
                                                <div className="profiler-client-table__client-name">
                                                    {client.name}
                                                </div>
                                            )}
                                        </td>
                                        <td className="profiler-client-table__td">
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    value={editFormData.email || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                                    className="profiler-client-table__input"
                                                    placeholder="Email"
                                                />
                                            ) : (
                                                <div className="profiler-client-table__email">
                                                    {client.email ? (
                                                        <>
                                                            <Mail size={14} />
                                                            {client.email}
                                                        </>
                                                    ) : (
                                                        <span className="profiler-client-table__empty">—</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="profiler-client-table__td">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={editFormData.mobile_number || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, mobile_number: e.target.value })}
                                                    className="profiler-client-table__input"
                                                    placeholder="Mobile number"
                                                />
                                            ) : (
                                                <div className="profiler-client-table__mobile">
                                                    {client.mobile_number ? (
                                                        <>
                                                            <Phone size={14} />
                                                            {client.mobile_number}
                                                        </>
                                                    ) : (
                                                        <span className="profiler-client-table__empty">—</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="profiler-client-table__td">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={formatAadhaar(editFormData.aadhaar_card_number || '')}
                                                    onChange={(e) => {
                                                        const unformatted = unformatAadhaar(e.target.value);
                                                        if (unformatted === '' || /^\d{0,12}$/.test(unformatted)) {
                                                            setEditFormData({ ...editFormData, aadhaar_card_number: unformatted });
                                                        }
                                                    }}
                                                    className="profiler-client-table__input"
                                                    placeholder="1234 • 5678 • 9012"
                                                    maxLength={18}
                                                />
                                            ) : (
                                                <div className="profiler-client-table__aadhaar">
                                                    {client.aadhaar_card_number ? (
                                                        <>
                                                            <CreditCard size={14} />
                                                            {formatAadhaar(client.aadhaar_card_number)}
                                                        </>
                                                    ) : (
                                                        <span className="profiler-client-table__empty">—</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="profiler-client-table__td profiler-client-table__td--center">
                                            <span className={`profiler-client-table__badge ${client.profile_count > 0 ? 'profiler-client-table__badge--success' : 'profiler-client-table__badge--muted'}`}>
                                                {client.profile_count}
                                            </span>
                                        </td>
                                        <td className="profiler-client-table__td">
                                            <span className="profiler-client-table__date">
                                                {formatDate(client.created_at)}
                                            </span>
                                        </td>
                                        <td className="profiler-client-table__td profiler-client-table__td--actions">
                                            <div className="profiler-client-table__actions">
                                                {isEditing ? (
                                                    <>
                                                        <Button
                                                            variant="primary"
                                                            size="small"
                                                            onClick={() => handleSave(client.id)}
                                                            disabled={isSaving}
                                                        >
                                                            {isSaving ? 'Saving...' : 'Save'}
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="small"
                                                            onClick={handleCancelEdit}
                                                            disabled={isSaving}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="small"
                                                            icon={<Edit size={16} />}
                                                            onClick={() => handleEdit(client)}
                                                            disabled={isDeleting}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="small"
                                                            icon={<Trash2 size={16} />}
                                                            onClick={() => handleDeleteClick(client)}
                                                            disabled={isDeleting || client.profile_count > 0}
                                                            className="profiler-client-table__delete-btn"
                                                        />
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {deleteModalClient && (
                <DeleteProfilerClientModal
                    client={deleteModalClient}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setDeleteModalClient(null)}
                />
            )}
        </>
    );
};

export default ProfilerClientTable;
