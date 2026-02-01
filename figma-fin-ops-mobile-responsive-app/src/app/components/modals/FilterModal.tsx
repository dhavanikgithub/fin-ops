import { ChevronLeft, Check, Calendar, DollarSign } from 'lucide-react';

interface FilterModalProps {
  onClose: () => void;
}

export default function FilterModal({ onClose }: FilterModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Filter Transactions</h2>
          </div>
          <button className="text-sm text-[#0B99FF] font-medium">Reset</button>
        </div>

        {/* Filter Options */}
        <div className="space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Transaction Type
            </label>
            <div className="flex gap-2">
              <button className="flex-1 py-3 bg-[#0B99FF] text-white rounded-xl font-medium">
                All
              </button>
              <button className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-xl font-medium">
                Deposits
              </button>
              <button className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-xl font-medium">
                Withdrawals
              </button>
            </div>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amount Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    placeholder="999999"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Banks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Banks
            </label>
            <div className="space-y-2">
              {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                <label key={bank} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" className="w-4 h-4 text-[#0B99FF] rounded border-gray-300" />
                  <span className="text-sm text-gray-700">{bank}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cards */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Cards
            </label>
            <div className="space-y-2">
              {['Visa Gold Card', 'Mastercard Platinum', 'Amex Blue', 'RuPay Premium'].map((card) => (
                <label key={card} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" className="w-4 h-4 text-[#0B99FF] rounded border-gray-300" />
                  <span className="text-sm text-gray-700">{card}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Clients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Clients
            </label>
            <div className="space-y-2">
              {['John Doe', 'Jane Smith', 'Robert Brown', 'Emily Davis'].map((client) => (
                <label key={client} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                  <input type="checkbox" className="w-4 h-4 text-[#0B99FF] rounded border-gray-300" />
                  <span className="text-sm text-gray-700">{client}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <div className="pt-4 pb-2">
            <button className="w-full py-4 bg-[#0B99FF] text-white rounded-2xl font-semibold hover:bg-[#0A88E6] transition-colors flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
