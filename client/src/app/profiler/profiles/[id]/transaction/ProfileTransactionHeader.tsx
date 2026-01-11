'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { ProfilerProfile } from '@/services/profilerProfileService';
import { ArrowLeft, RefreshCw, Plus, User, Building2, CreditCard } from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './ProfileTransactionHeader.scss';

interface ProfileTransactionHeaderProps {
    profile: ProfilerProfile;
    onAddTransaction: () => void;
    onRefresh: () => void;
}

const ProfileTransactionHeader: React.FC<ProfileTransactionHeaderProps> = ({
    profile,
    onAddTransaction,
    onRefresh
}) => {
    const router = useRouter();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatCreditCard = (value: string): string => {
        if (!value) return '';
        const digits = value.replace(/[•\-\s]/g, '');
        const formatted = digits.match(/.{1,4}/g)?.join(' • ') || digits;
        return formatted;
    };

    const handleBackToProfiles = () => {
        router.push('/profiler/profiles');
    };

    return (
        <div className="profile-transaction-header">
            <div className="profile-transaction-header__back">
                <Button
                    variant="ghost"
                    icon={<ArrowLeft size={18} />}
                    onClick={handleBackToProfiles}
                >
                    Back to Profiles
                </Button>
            </div>

            <div className="main__title-row">
                <div>
                    <h1 className="main__title">Profile Transactions</h1>
                    <p className="main__subtitle">
                        View and manage transactions for this profile
                    </p>
                </div>

                <div className="main__actions">
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
            </div>

            <div className="profile-transaction-header__profile-card">
                <div className="profile-transaction-header__details">
                    <div className="profile-transaction-header__detail-item">
                        <User size={16} className="profile-transaction-header__detail-icon" />
                        <div className="profile-transaction-header__detail-content">
                            <span className="profile-transaction-header__detail-label">Client</span>
                            <span className="profile-transaction-header__detail-value">{profile.client_name}</span>
                        </div>
                    </div>

                    <div className="profile-transaction-header__detail-item">
                        <Building2 size={16} className="profile-transaction-header__detail-icon" />
                        <div className="profile-transaction-header__detail-content">
                            <span className="profile-transaction-header__detail-label">Bank</span>
                            <span className="profile-transaction-header__detail-value">{profile.bank_name}</span>
                        </div>
                    </div>

                    <div className="profile-transaction-header__detail-item">
                        <CreditCard size={16} className="profile-transaction-header__detail-icon" />
                        <div className="profile-transaction-header__detail-content">
                            <span className="profile-transaction-header__detail-label">Card Number</span>
                            <span className="profile-transaction-header__detail-value">{formatCreditCard(profile.credit_card_number)}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-transaction-header__balances">
                    <div className="profile-transaction-header__balance-item">
                        <span className="profile-transaction-header__balance-label">Opening Balance</span>
                        <span className="profile-transaction-header__balance-value">{formatCurrency(profile.pre_planned_deposit_amount)}</span>
                    </div>

                    <div className="profile-transaction-header__balance-item">
                        <span className="profile-transaction-header__balance-label">Current Balance</span>
                        <span className={`profile-transaction-header__balance-value ${
                            profile.current_balance > 0 
                                ? 'profile-transaction-header__balance-value--positive' 
                                : profile.current_balance < 0 
                                    ? 'profile-transaction-header__balance-value--negative' 
                                    : ''
                        }`}>
                            {formatCurrency(profile.current_balance)}
                        </span>
                    </div>

                    <div className="profile-transaction-header__balance-item">
                        <span className="profile-transaction-header__balance-label">Status</span>
                        <span className={`main__tag main__tag--${profile.status}`}>
                            {profile.status}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileTransactionHeader;
