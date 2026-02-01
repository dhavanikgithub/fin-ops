import { useState } from 'react';
import { Search, Plus, ChevronLeft, TrendingUp, TrendingDown, Filter, Download, Calendar, DollarSign } from 'lucide-react';

interface TransactionListScreenProps {
  onNavigate: (screen: string) => void;
}

export default function TransactionListScreen({ onNavigate }: TransactionListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);

  const transactions = [
    {
      id: 1,
      type: 'deposit',
      client: 'John Doe',
      bank: 'HDFC Bank',
      card: 'Visa Gold',
      amount: 25000,
      charges: 0,
      date: '2024-01-18',
      time: '10:30 AM',
      remark: 'Monthly deposit'
    },
    {
      id: 2,
      type: 'withdraw',
      client: 'Jane Smith',
      bank: 'ICICI Bank',
      card: 'Mastercard Platinum',
      amount: 15500,
      charges: 310,
      date: '2024-01-18',
      time: '02:15 PM',
      remark: 'Client withdrawal'
    },
    {
      id: 3,
      type: 'deposit',
      client: 'Robert Brown',
      bank: 'SBI',
      card: 'RuPay Premium',
      amount: 45000,
      charges: 0,
      date: '2024-01-17',
      time: '11:45 AM',
      remark: 'Investment deposit'
    },
    {
      id: 4,
      type: 'withdraw',
      client: 'Emily Davis',
      bank: 'Axis Bank',
      card: 'Visa Gold',
      amount: 12000,
      charges: 240,
      date: '2024-01-17',
      time: '04:20 PM',
      remark: 'Emergency withdrawal'
    },
    {
      id: 5,
      type: 'deposit',
      client: 'Michael Wilson',
      bank: 'Kotak Mahindra',
      card: 'Amex Blue',
      amount: 32000,
      charges: 0,
      date: '2024-01-16',
      time: '09:00 AM',
      remark: 'Business deposit'
    },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.card.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' || transaction.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const totalDeposits = transactions
    .filter(t => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === 'withdraw')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="p-2 bg-[#0B99FF] text-white rounded-full shadow-lg"
            >
              <Plus className="w-6 h-6" />
            </button>
            {showAddMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Add Deposit</span>
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Add Withdraw</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-xl p-3">
            <p className="text-xs text-green-600 mb-1">Total Deposits</p>
            <p className="text-lg font-bold text-green-700">₹{totalDeposits.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3">
            <p className="text-xs text-red-600 mb-1">Total Withdrawals</p>
            <p className="text-lg font-bold text-red-700">₹{totalWithdrawals.toLocaleString()}</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'all' ? 'bg-[#0B99FF] text-white' : 'bg-gray-50 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('deposit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'deposit' ? 'bg-green-600 text-white' : 'bg-gray-50 text-gray-700'
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setFilterType('withdraw')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filterType === 'withdraw' ? 'bg-red-600 text-white' : 'bg-gray-50 text-gray-700'
            }`}
          >
            Withdrawals
          </button>
          <button className="p-2 bg-gray-50 rounded-lg ml-auto">
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    transaction.type === 'deposit' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {transaction.type === 'deposit' ? (
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{transaction.client}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {transaction.bank} • {transaction.card}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                  </p>
                  {transaction.charges > 0 && (
                    <p className="text-xs text-gray-500 mt-0.5">Charges: ₹{transaction.charges}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {transaction.date}
                  </span>
                  <span>{transaction.time}</span>
                </div>
              </div>

              {transaction.remark && (
                <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">{transaction.remark}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Export Button */}
        <button className="w-full mt-6 mb-4 py-3 bg-white border-2 border-[#0B99FF] text-[#0B99FF] rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#0B99FF] hover:text-white transition-colors">
          <Download className="w-5 h-5" />
          Export to PDF
        </button>
      </div>
    </div>
  );
}
