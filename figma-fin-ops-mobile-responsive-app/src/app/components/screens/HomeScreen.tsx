import { Building2, CreditCard, Users, ArrowLeftRight, UserCircle, Calculator, Settings, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const quickStats = [
    { label: 'Total Deposits', value: '₹1,245,890', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Total Withdrawals', value: '₹892,340', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Net Balance', value: '₹353,550', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  const quickActions = [
    { id: 'banks', label: 'Banks', icon: Building2, color: 'bg-purple-500' },
    { id: 'cards', label: 'Cards', icon: CreditCard, color: 'bg-pink-500' },
    { id: 'clients', label: 'Clients', icon: Users, color: 'bg-green-500' },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight, color: 'bg-blue-500' },
    { id: 'profiler', label: 'Profiler', icon: UserCircle, color: 'bg-indigo-500' },
    { id: 'calculator', label: 'Calculator', icon: Calculator, color: 'bg-orange-500' },
  ];

  const recentTransactions = [
    { id: 1, type: 'deposit', client: 'John Doe', amount: '₹25,000', date: '2h ago', bank: 'HDFC Bank' },
    { id: 2, type: 'withdraw', client: 'Jane Smith', amount: '₹15,500', date: '5h ago', bank: 'ICICI Bank' },
    { id: 3, type: 'deposit', client: 'Robert Brown', amount: '₹45,000', date: '1d ago', bank: 'SBI' },
  ];

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0B99FF] to-[#0066CC] px-6 py-6 rounded-b-[2rem]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Finance Inventory</h1>
            <p className="text-blue-100 text-sm mt-1">Manage your transactions</p>
          </div>
          <button onClick={() => onNavigate('settings')} className="p-2 bg-white/20 rounded-full">
            <Settings className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="space-y-3">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white/95 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onNavigate(action.id)}
                className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`${action.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          <button onClick={() => onNavigate('transactions')} className="text-sm text-[#0B99FF] font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  transaction.type === 'deposit' ? 'bg-green-50' : 'bg-red-50'
                }`}>
                  {transaction.type === 'deposit' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{transaction.client}</p>
                  <p className="text-sm text-gray-500">{transaction.bank} • {transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
