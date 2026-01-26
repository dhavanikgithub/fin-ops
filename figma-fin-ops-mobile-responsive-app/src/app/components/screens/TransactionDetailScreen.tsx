import { ChevronLeft, Edit, Trash2, User, Building2, CreditCard, Calendar, Clock, FileText, TrendingUp, TrendingDown } from 'lucide-react';

interface TransactionDetailScreenProps {
  type: 'deposit' | 'withdraw';
  onNavigate: (screen: string) => void;
}

export default function TransactionDetailScreen({ type, onNavigate }: TransactionDetailScreenProps) {
  const transaction = {
    id: 1,
    type: type,
    client: 'John Doe',
    clientEmail: 'john.doe@example.com',
    clientContact: '+91 98765 43210',
    bank: 'HDFC Bank',
    card: 'Visa Gold Card',
    amount: 25000,
    charges: type === 'withdraw' ? 500 : 0,
    netAmount: type === 'withdraw' ? 24500 : 25000,
    remark: 'Monthly deposit for investment portfolio',
    date: '2024-01-18',
    time: '10:30 AM',
    createDate: '2024-01-18',
    createTime: '10:30 AM',
  };

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className={`px-4 py-6 rounded-b-3xl ${
        type === 'deposit' 
          ? 'bg-gradient-to-br from-green-500 to-green-600' 
          : 'bg-gradient-to-br from-red-500 to-red-600'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => onNavigate('transactions')} className="p-2 bg-white/20 rounded-lg -ml-2">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex gap-2">
            <button className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30">
              <Edit className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-white">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            {type === 'deposit' ? (
              <TrendingUp className="w-8 h-8 text-white" />
            ) : (
              <TrendingDown className="w-8 h-8 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </h1>
            <p className="text-white/90 text-sm mt-1">Transaction #{transaction.id.toString().padStart(6, '0')}</p>
          </div>
        </div>

        {/* Amount Display */}
        <div className="bg-white/95 rounded-2xl p-4">
          <p className="text-sm text-gray-600 mb-1">Transaction Amount</p>
          <p className={`text-4xl font-bold ${
            type === 'deposit' ? 'text-green-600' : 'text-red-600'
          }`}>
            {type === 'deposit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
          </p>
          {type === 'withdraw' && transaction.charges > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
              <span className="text-sm text-gray-600">Charges</span>
              <span className="text-sm font-semibold text-red-600">-₹{transaction.charges.toLocaleString()}</span>
            </div>
          )}
          {type === 'withdraw' && (
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Net Amount</span>
              <span className="text-lg font-bold text-gray-900">₹{transaction.netAmount.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Client Information */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Information</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded-lg mt-0.5">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Client Name</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{transaction.client}</p>
              </div>
            </div>
            <div className="pl-11">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm text-gray-700 mt-0.5">{transaction.clientEmail}</p>
            </div>
            <div className="pl-11">
              <p className="text-xs text-gray-500">Contact</p>
              <p className="text-sm text-gray-700 mt-0.5">{transaction.clientContact}</p>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded-lg mt-0.5">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Bank</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{transaction.bank}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-pink-50 rounded-lg mt-0.5">
                <CreditCard className="w-5 h-5 text-pink-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Card</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{transaction.card}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg mt-0.5">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  {new Date(transaction.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-50 rounded-lg mt-0.5">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{transaction.time}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Remark */}
        {transaction.remark && (
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-gray-50 rounded-lg mt-0.5">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Remark</h2>
            </div>
            <p className="text-sm text-gray-700 pl-11">{transaction.remark}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created: {new Date(transaction.createDate).toLocaleDateString()} at {transaction.createTime}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button className="py-3 bg-white border-2 border-[#0B99FF] text-[#0B99FF] rounded-xl font-semibold hover:bg-[#0B99FF] hover:text-white transition-colors">
            Edit Transaction
          </button>
          <button className="py-3 bg-white border-2 border-red-500 text-red-600 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
