'use client'
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProfilerProfiles } from '@/store/actions/profilerProfileActions';
import { fetchProfilerTransactions } from '@/store/actions/profilerTransactionActions';
import { 
    Users, 
    Building2, 
    UserCircle, 
    Receipt, 
    ArrowDownCircle, 
    ArrowUpCircle, 
    TrendingUp, 
    ChevronRight,
    Activity,
    Loader2
} from 'lucide-react';
import { Button } from '@/components/FormInputs';
import './ProfilerDashboard.scss';

const ProfilerDashboard: React.FC = () => {
    const router = useRouter();
    const dispatch = useAppDispatch();
    
    const { profiles, loading: profilesLoading } = useAppSelector((state) => state.profilerProfiles);
    const { transactions, loading: transactionsLoading } = useAppSelector((state) => state.profilerTransactions);

    useEffect(() => {
        dispatch(fetchProfilerProfiles({ page: 1, limit: 100 }));
        dispatch(fetchProfilerTransactions({ page: 1, limit: 10 }));
    }, [dispatch]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Calculate summary statistics
    const activeProfiles = profiles.filter(p => p.status === 'active');
    const totalDeposits = transactions
        .filter(t => t.transaction_type === 'deposit')
        .reduce((sum, t) => sum + t.amount, 0);
    const totalWithdraws = transactions
        .filter(t => t.transaction_type === 'withdraw')
        .reduce((sum, t) => sum + t.amount + (t.withdraw_charges_amount || 0), 0);
    const currentBalance = totalDeposits - totalWithdraws;

    // Get top profiles by balance
    const topProfiles = [...profiles]
        .filter(p => p.status === 'active')
        .sort((a, b) => b.current_balance - a.current_balance)
        .slice(0, 5);

    // Get recent transactions
    const recentTransactions = transactions.slice(0, 5);

    const isLoading = profilesLoading || transactionsLoading;

    return (
        <div className="profiler-dashboard">
            <div className="profiler-dashboard__header">
                <div className="profiler-dashboard__title-section">
                    <h1 className="profiler-dashboard__title">
                        <Activity size={32} />
                        Profiler Dashboard
                    </h1>
                    <p className="profiler-dashboard__subtitle">
                        Overview of your financial profiles and transactions
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="profiler-dashboard__loading">
                    <Loader2 className="profiler-dashboard__spinner" size={48} />
                    <p>Loading dashboard...</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="profiler-dashboard__summary">
                        <div className="profiler-dashboard__card profiler-dashboard__card--primary">
                            <div className="profiler-dashboard__card-icon">
                                <UserCircle size={32} />
                            </div>
                            <div className="profiler-dashboard__card-content">
                                <p className="profiler-dashboard__card-label">Active Profiles</p>
                                <h2 className="profiler-dashboard__card-value">{activeProfiles.length}</h2>
                                <p className="profiler-dashboard__card-subtitle">
                                    {profiles.length} total profiles
                                </p>
                            </div>
                        </div>

                        <div className="profiler-dashboard__card profiler-dashboard__card--success">
                            <div className="profiler-dashboard__card-icon">
                                <ArrowDownCircle size={32} />
                            </div>
                            <div className="profiler-dashboard__card-content">
                                <p className="profiler-dashboard__card-label">Total Deposits</p>
                                <h2 className="profiler-dashboard__card-value">{formatCurrency(totalDeposits)}</h2>
                                <p className="profiler-dashboard__card-subtitle">
                                    {transactions.filter(t => t.transaction_type === 'deposit').length} transactions
                                </p>
                            </div>
                        </div>

                        <div className="profiler-dashboard__card profiler-dashboard__card--destructive">
                            <div className="profiler-dashboard__card-icon">
                                <ArrowUpCircle size={32} />
                            </div>
                            <div className="profiler-dashboard__card-content">
                                <p className="profiler-dashboard__card-label">Total Withdraws</p>
                                <h2 className="profiler-dashboard__card-value">{formatCurrency(totalWithdraws)}</h2>
                                <p className="profiler-dashboard__card-subtitle">
                                    {transactions.filter(t => t.transaction_type === 'withdraw').length} transactions
                                </p>
                            </div>
                        </div>

                        <div className="profiler-dashboard__card profiler-dashboard__card--info">
                            <div className="profiler-dashboard__card-icon">
                                <TrendingUp size={32} />
                            </div>
                            <div className="profiler-dashboard__card-content">
                                <p className="profiler-dashboard__card-label">Current Balance</p>
                                <h2 className={`profiler-dashboard__card-value ${currentBalance >= 0 ? 'profiler-dashboard__card-value--positive' : 'profiler-dashboard__card-value--negative'}`}>
                                    {formatCurrency(currentBalance)}
                                </h2>
                                <p className="profiler-dashboard__card-subtitle">
                                    Net position
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="profiler-dashboard__section">
                        <h2 className="profiler-dashboard__section-title">Quick Actions</h2>
                        <div className="profiler-dashboard__actions">
                            <Button
                                variant="outline"
                                icon={<Users size={20} />}
                                iconRight={<ChevronRight size={16} />}
                                onClick={() => router.push('/profiler/clients')}
                                className="profiler-dashboard__action-btn"
                            >
                                Manage Clients
                            </Button>
                            <Button
                                variant="outline"
                                icon={<Building2 size={20} />}
                                iconRight={<ChevronRight size={16} />}
                                onClick={() => router.push('/profiler/banks')}
                                className="profiler-dashboard__action-btn"
                            >
                                Manage Banks
                            </Button>
                            <Button
                                variant="outline"
                                icon={<UserCircle size={20} />}
                                iconRight={<ChevronRight size={16} />}
                                onClick={() => router.push('/profiler/profiles')}
                                className="profiler-dashboard__action-btn"
                            >
                                Manage Profiles
                            </Button>
                            <Button
                                variant="outline"
                                icon={<Receipt size={20} />}
                                iconRight={<ChevronRight size={16} />}
                                onClick={() => router.push('/profiler/transactions')}
                                className="profiler-dashboard__action-btn"
                            >
                                Manage Transactions
                            </Button>
                        </div>
                    </div>

                    {/* Two Column Layout */}
                    <div className="profiler-dashboard__content">
                        {/* Top Profiles */}
                        <div className="profiler-dashboard__section">
                            <div className="profiler-dashboard__section-header">
                                <h2 className="profiler-dashboard__section-title">Top Profiles by Balance</h2>
                                <Button
                                    variant="ghost"
                                    size="small"
                                    iconRight={<ChevronRight size={16} />}
                                    onClick={() => router.push('/profiler/profiles')}
                                >
                                    View All
                                </Button>
                            </div>
                            <div className="profiler-dashboard__list">
                                {topProfiles.length > 0 ? (
                                    topProfiles.map((profile) => (
                                        <div 
                                            key={profile.id} 
                                            className="profiler-dashboard__list-item profiler-dashboard__list-item--clickable"
                                            onClick={() => router.push(`/profiler/profiles/${profile.id}/transaction`)}
                                        >
                                            <div className="profiler-dashboard__list-item-content">
                                                <div className="profiler-dashboard__list-item-header">
                                                    <span className="profiler-dashboard__list-item-name">
                                                        {profile.client_name}
                                                    </span>
                                                    <span className={`profiler-dashboard__list-item-balance ${profile.current_balance >= 0 ? 'profiler-dashboard__list-item-balance--positive' : 'profiler-dashboard__list-item-balance--negative'}`}>
                                                        {formatCurrency(profile.current_balance)}
                                                    </span>
                                                </div>
                                                <div className="profiler-dashboard__list-item-meta">
                                                    <span className="profiler-dashboard__list-item-bank">
                                                        <Building2 size={14} />
                                                        {profile.bank_name}
                                                    </span>
                                                    <span className="profiler-dashboard__list-item-transactions">
                                                        {profile.transaction_count} transaction{profile.transaction_count !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="profiler-dashboard__empty">
                                        <UserCircle size={48} />
                                        <p>No active profiles found</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="profiler-dashboard__section">
                            <div className="profiler-dashboard__section-header">
                                <h2 className="profiler-dashboard__section-title">Recent Transactions</h2>
                                <Button
                                    variant="ghost"
                                    iconRight={<ChevronRight size={16} />}
                                    onClick={() => router.push('/profiler/transactions')}
                                >
                                    View All
                                </Button>
                            </div>
                            <div className="profiler-dashboard__list">
                                {recentTransactions.length > 0 ? (
                                    recentTransactions.map((transaction) => {
                                        const isDeposit = transaction.transaction_type === 'deposit';
                                        return (
                                            <div key={transaction.id} className="profiler-dashboard__list-item">
                                                <div className="profiler-dashboard__list-item-icon">
                                                    {isDeposit ? (
                                                        <ArrowDownCircle size={20} className="profiler-dashboard__list-item-icon--success" />
                                                    ) : (
                                                        <ArrowUpCircle size={20} className="profiler-dashboard__list-item-icon--destructive" />
                                                    )}
                                                </div>
                                                <div className="profiler-dashboard__list-item-content">
                                                    <div className="profiler-dashboard__list-item-header">
                                                        <span className="profiler-dashboard__list-item-name">
                                                            {transaction.client_name}
                                                        </span>
                                                        <span className={`profiler-dashboard__list-item-amount ${isDeposit ? 'profiler-dashboard__list-item-amount--positive' : 'profiler-dashboard__list-item-amount--negative'}`}>
                                                            {isDeposit ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                                                        </span>
                                                    </div>
                                                    <div className="profiler-dashboard__list-item-meta">
                                                        <span className="profiler-dashboard__list-item-bank">
                                                            <Building2 size={14} />
                                                            {transaction.bank_name}
                                                        </span>
                                                        <span className="profiler-dashboard__list-item-date">
                                                            {formatDate(transaction.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="profiler-dashboard__empty">
                                        <Receipt size={48} />
                                        <p>No transactions found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ProfilerDashboard;
