import { ChevronLeft, Check, ChevronDown } from 'lucide-react';

interface AddTransactionModalProps {
  type: 'deposit' | 'withdraw';
  onClose: () => void;
}

export default function AddTransactionModal({ type, onClose }: AddTransactionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              Add {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </h2>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent appearance-none">
                <option>Select client</option>
                <option>John Doe</option>
                <option>Jane Smith</option>
                <option>Robert Brown</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Bank Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank
            </label>
            <div className="relative">
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent appearance-none">
                <option>Select bank (optional)</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Card Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card
            </label>
            <div className="relative">
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent appearance-none">
                <option>Select card (optional)</option>
                <option>Visa Gold Card</option>
                <option>Mastercard Platinum</option>
                <option>Amex Blue</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Transaction Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Withdraw Charges (only for withdrawals) */}
          {type === 'withdraw' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Withdraw Charges <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input
                  type="number"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Enter the withdrawal charge amount</p>
            </div>
          )}

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remark
            </label>
            <textarea
              rows={3}
              placeholder="Add notes or remarks (optional)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent resize-none"
            />
          </div>

          <div className="pt-4">
            <button 
              className={`w-full py-4 rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                type === 'deposit' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <Check className="w-5 h-5" />
              Create {type === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
