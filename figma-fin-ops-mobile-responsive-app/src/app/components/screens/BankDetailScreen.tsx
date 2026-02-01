import { ChevronLeft, Edit, Trash2, Building2, Calendar, Activity, TrendingUp, TrendingDown } from 'lucide-react';

interface BankDetailScreenProps {
  onNavigate: (screen: string) => void;
}

export default function BankDetailScreen({ onNavigate }: BankDetailScreenProps) {
  const bank = {
    id: 1,
    name: 'HDFC Bank',
    transactionCount: 145,
    createDate: '2024-01-15',
    createTime: '10:30 AM',
    modifyDate: '2024-01-18',
    modifyTime: '03:45 PM'
  };

  const recentTransactions = [
    { id: 1, type: 'deposit', client: 'John Doe', amount: 25000, date: '2024-01-18' },
    { id: 2, type: 'withdraw', client: 'Jane Smith', amount: 15500, date: '2024-01-17' },
    { id: 3, type: 'deposit', client: 'Robert Brown', amount: 45000, date: '2024-01-16' },
    { id: 4, type: 'withdraw', client: 'Emily Davis', amount: 12000, date: '2024-01-15' },
  ];

  const totalDeposits = recentTransactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = recentTransactions
    .filter(t => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 px-4 py-6 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => onNavigate('banks')} className="p-2 bg-white/20 rounded-lg -ml-2">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex gap-2">
            <button className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30">
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-2 bg-red-500/80 text-white rounded-lg hover:bg-red-500">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{bank.name}</h1>
            <p className="text-purple-100 text-sm mt-1">{bank.transactionCount} Transactions</p>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/95 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-1">Total Deposits</p>
            <p className="text-xl font-bold text-green-600">₹{totalDeposits.toLocaleString()}</p>
          </div>
          <div className="bg-white/95 rounded-xl p-3">
            <p className="text-xs text-gray-600 mb-1">Total Withdrawals</p>
            <p className="text-xl font-bold text-red-600">₹{totalWithdrawals.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Bank Information */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Information</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(bank.createDate).toLocaleDateString()} at {bank.createTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Last Modified</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(bank.modifyDate).toLocaleDateString()} at {bank.modifyTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button className="text-sm text-[#0B99FF] font-medium">View All</button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    transaction.type === 'deposit' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {transaction.type === 'deposit' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.client}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ${
                  transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Delete Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4 mb-4">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Warning:</span> Deleting this bank will also remove all associated transaction records.
          </p>
        </div>
      </div>
    </div>
  );
}
