import { useState } from 'react';
import { ChevronLeft, Users, Building2, FolderKanban, ArrowLeftRight, Plus, TrendingUp, Wallet, Activity } from 'lucide-react';

interface ProfilerScreenProps {
  onNavigate: (screen: string) => void;
}

export default function ProfilerScreen({ onNavigate }: ProfilerScreenProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'banks' | 'profiles' | 'transactions'>('dashboard');

  const stats = [
    { label: 'Active Profiles', value: '24', icon: FolderKanban, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Clients', value: '18', icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Banks', value: '12', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Transactions', value: '156', icon: ArrowLeftRight, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const profiles = [
    {
      id: 1,
      clientName: 'John Doe',
      bankName: 'HDFC Bank',
      cardNumber: '**** 1234',
      prePlannedAmount: 500000,
      currentBalance: 425000,
      remainingBalance: 75000,
      status: 'active',
      carryForward: true
    },
    {
      id: 2,
      clientName: 'Jane Smith',
      bankName: 'ICICI Bank',
      cardNumber: '**** 5678',
      prePlannedAmount: 350000,
      currentBalance: 280000,
      remainingBalance: 70000,
      status: 'active',
      carryForward: false
    },
    {
      id: 3,
      clientName: 'Robert Brown',
      bankName: 'SBI',
      cardNumber: '**** 9012',
      prePlannedAmount: 600000,
      currentBalance: 0,
      remainingBalance: 0,
      status: 'done',
      carryForward: true
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      type: 'deposit',
      clientName: 'John Doe',
      bankName: 'HDFC Bank',
      amount: 50000,
      date: '2h ago'
    },
    {
      id: 2,
      type: 'withdraw',
      clientName: 'Jane Smith',
      bankName: 'ICICI Bank',
      amount: 25000,
      charges: 500,
      date: '5h ago'
    },
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('home')} className="p-2 bg-white/20 rounded-lg -ml-2">
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-white">Profiler</h1>
              <p className="text-indigo-100 text-sm mt-0.5">Advanced Management</p>
            </div>
          </div>
          <button className="p-2 bg-white/20 text-white rounded-full">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/95 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.bg} p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white px-4 py-3 border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-2">
          {['dashboard', 'clients', 'banks', 'profiles', 'transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            {/* Active Profiles */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Profiles</h2>
              <div className="space-y-3">
                {profiles.filter(p => p.status === 'active').map((profile) => (
                  <div key={profile.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{profile.clientName}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{profile.bankName} • {profile.cardNumber}</p>
                      </div>
                      <div className="px-3 py-1 bg-green-50 rounded-lg">
                        <span className="text-xs font-medium text-green-600">Active</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Pre-planned</p>
                        <p className="text-sm font-semibold text-gray-900 mt-0.5">
                          ₹{(profile.prePlannedAmount / 1000).toFixed(0)}k
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Current</p>
                        <p className="text-sm font-semibold text-blue-600 mt-0.5">
                          ₹{(profile.currentBalance / 1000).toFixed(0)}k
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Remaining</p>
                        <p className="text-sm font-semibold text-green-600 mt-0.5">
                          ₹{(profile.remainingBalance / 1000).toFixed(0)}k
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all"
                        style={{ width: `${(profile.currentBalance / profile.prePlannedAmount) * 100}%` }}
                      ></div>
                    </div>

                    {profile.carryForward && (
                      <div className="mt-2 flex items-center gap-1">
                        <Activity className="w-3 h-3 text-indigo-600" />
                        <span className="text-xs text-indigo-600 font-medium">Carry Forward Enabled</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Recent Transactions</h2>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'deposit' ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          {transaction.type === 'deposit' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <Wallet className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.clientName}</p>
                          <p className="text-xs text-gray-500">{transaction.bankName} • {transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                        </p>
                        {transaction.charges && (
                          <p className="text-xs text-gray-500">Charges: ₹{transaction.charges}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profiles' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">All Profiles</h2>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                Add Profile
              </button>
            </div>
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{profile.clientName}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{profile.bankName} • {profile.cardNumber}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${
                    profile.status === 'active' ? 'bg-green-50' : 'bg-gray-100'
                  }`}>
                    <span className={`text-xs font-medium ${
                      profile.status === 'active' ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {profile.status === 'active' ? 'Active' : 'Done'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Pre-planned</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      ₹{(profile.prePlannedAmount / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Current</p>
                    <p className="text-sm font-semibold text-blue-600 mt-0.5">
                      ₹{(profile.currentBalance / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-sm font-semibold text-green-600 mt-0.5">
                      ₹{(profile.remainingBalance / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {(activeTab === 'clients' || activeTab === 'banks' || activeTab === 'transactions') && (
          <div className="text-center py-12">
            <p className="text-gray-500">Content for {activeTab} tab</p>
          </div>
        )}
      </div>
    </div>
  );
}
