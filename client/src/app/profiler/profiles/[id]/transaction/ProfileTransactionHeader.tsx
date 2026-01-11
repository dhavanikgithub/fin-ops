'use client'
import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProfilerProfile } from '@/services/profilerProfileService';
import { ArrowLeft, RefreshCw, Plus, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import { useAppDispatch } from '@/store/hooks';
import { exportProfileTransactionsPDF } from '@/store/actions/profilerTransactionActions';
import toast from 'react-hot-toast';
import logger from '@/utils/logger';
import './ProfileTransactionHeader.scss';

interface ProfileTransactionHeaderProps {
    onAddTransaction: () => void;
    onRefresh: () => void;
}

const ProfileTransactionHeader: React.FC<ProfileTransactionHeaderProps> = ({
    onAddTransaction,
    onRefresh
}) => {
    const router = useRouter();
    const params = useParams();
    const dispatch = useAppDispatch();
    const profileId = Number(params.id);
    const [isExporting, setIsExporting] = useState(false);

    const handleBackToProfiles = () => {
        router.push('/profiler/profiles');
    };

    const handleExportPDF = async () => {
        try {
            setIsExporting(true);
            logger.log('Exporting profile transactions to PDF...');
            
            const result = await dispatch(exportProfileTransactionsPDF(profileId)).unwrap();
            
            // Create download link
            const url = window.URL.createObjectURL(result.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            toast.success('PDF exported successfully');
        } catch (error: any) {
            logger.error('Error exporting PDF:', error);
            toast.error(error || 'Failed to export PDF');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <header className="main__header">
                <div className="main__header-left">
                    <Button
                        variant="ghost"
                        icon={<ArrowLeft size={18} />}
                        onClick={handleBackToProfiles}
                    >
                        Back to Profiles
                    </Button>
                </div>
                <div className="main__header-right">
                    <Button
                        variant="secondary"
                        icon={isExporting ? <Loader2 size={18} className="spinner" /> : <Download size={18} />}
                        onClick={handleExportPDF}
                        disabled={isExporting}
                    >
                        {isExporting ? 'Exporting...' : 'Export PDF'}
                    </Button>
                    <Button
                        variant="secondary"
                        icon={<RefreshCw size={18} />}
                        onClick={onRefresh}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="primary"
                        icon={<Plus size={18} />}
                        onClick={onAddTransaction}
                    >
                        Add Transaction
                    </Button>
                </div>
            </header>
        </>
    );
};

export default ProfileTransactionHeader;
