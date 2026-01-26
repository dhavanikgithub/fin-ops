import { ChevronLeft, Check } from 'lucide-react';

interface AddBankModalProps {
  onClose: () => void;
}

export default function AddBankModal({ onClose }: AddBankModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Add Bank</h2>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter bank name"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent"
            />
          </div>

          <div className="pt-4">
            <button className="w-full py-4 bg-[#0B99FF] text-white rounded-2xl font-semibold hover:bg-[#0A88E6] transition-colors flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Create Bank
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
