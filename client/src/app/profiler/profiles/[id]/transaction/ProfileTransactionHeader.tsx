'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { ProfilerProfile } from '@/services/profilerProfileService';
import { ArrowLeft, RefreshCw, Plus } from 'lucide-react';
import { Button } from '@/components/FormInputs';
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

    

    const handleBackToProfiles = () => {
        router.push('/profiler/profiles');
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
