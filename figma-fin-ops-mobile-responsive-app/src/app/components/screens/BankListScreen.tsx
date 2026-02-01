import { useState } from 'react';
import { Search, Plus, ChevronLeft, Building2, MoreVertical, Edit, Trash2, Filter, ArrowUpDown } from 'lucide-react';

interface BankListScreenProps {
  onNavigate: (screen: string) => void;
}

export default function BankListScreen({ onNavigate }: BankListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const banks = [
    { id: 1, name: 'HDFC Bank', transactionCount: 145, createDate: '2024-01-15' },
    { id: 2, name: 'ICICI Bank', transactionCount: 98, createDate: '2024-01-18' },
    { id: 3, name: 'State Bank of India', transactionCount: 234, createDate: '2024-01-10' },
    { id: 4, name: 'Axis Bank', transactionCount: 67, createDate: '2024-01-22' },
    { id: 5, name: 'Kotak Mahindra Bank', transactionCount: 112, createDate: '2024-01-20' },
    { id: 6, name: 'Punjab National Bank', transactionCount: 45, createDate: '2024-01-25' },
    { id: 7, name: 'Bank of Baroda', transactionCount: 78, createDate: '2024-01-12' },
  ];

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Banks</h1>
          </div>
          <button className="p-2 bg-[#0B99FF] text-white rounded-full shadow-lg">
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search banks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent"
          />
        </div>

        {/* Filter & Sort */}
        <div className="flex items-center gap-2 mt-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
            <ArrowUpDown className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      {/* Bank List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {filteredBanks.map((bank) => (
            <div key={bank.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{bank.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Created: {new Date(bank.createDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-blue-600">{bank.transactionCount} Transactions</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 mt-6 pb-4">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
            Previous
          </button>
          <button className="px-4 py-2 bg-[#0B99FF] text-white rounded-lg text-sm font-medium">
            1
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
            2
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
            3
          </button>
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
