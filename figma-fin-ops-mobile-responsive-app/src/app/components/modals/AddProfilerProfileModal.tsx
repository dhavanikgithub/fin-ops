import { ChevronLeft, Check, ChevronDown, Activity } from 'lucide-react';

interface AddProfilerProfileModalProps {
  onClose: () => void;
}

export default function AddProfilerProfileModal({ onClose }: AddProfilerProfileModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">Add Profiler Profile</h2>
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
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent appearance-none">
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
              Bank <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent appearance-none">
                <option>Select bank</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Credit Card Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Credit Card Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter last 4 digits (e.g., 1234)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            />
          </div>

          {/* Pre-planned Deposit Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pre-planned Deposit Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input
                type="number"
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
            </div>
          </div>

          {/* Carry Forward Enabled */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Carry Forward</p>
                <p className="text-xs text-gray-500">Enable balance carry forward</p>
              </div>
            </div>
            <button className="relative w-12 h-6 rounded-full bg-indigo-600">
              <div className="absolute top-0.5 translate-x-6 w-5 h-5 bg-white rounded-full"></div>
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              rows={3}
              placeholder="Add notes (optional)"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent resize-none"
            />
          </div>

          <div className="pt-4">
            <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Create Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
