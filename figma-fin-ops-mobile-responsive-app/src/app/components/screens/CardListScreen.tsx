import { useState } from 'react';
import { Search, Plus, ChevronLeft, CreditCard, MoreVertical, Edit, Trash2, Filter, ArrowUpDown } from 'lucide-react';

interface CardListScreenProps {
  onNavigate: (screen: string) => void;
}

export default function CardListScreen({ onNavigate }: CardListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const cards = [
    { id: 1, name: 'Visa Gold Card', transactionCount: 89, createDate: '2024-01-15', color: 'from-yellow-400 to-yellow-600' },
    { id: 2, name: 'Mastercard Platinum', transactionCount: 124, createDate: '2024-01-10', color: 'from-gray-700 to-gray-900' },
    { id: 3, name: 'Amex Blue', transactionCount: 56, createDate: '2024-01-20', color: 'from-blue-500 to-blue-700' },
    { id: 4, name: 'RuPay Premium', transactionCount: 67, createDate: '2024-01-18', color: 'from-green-500 to-green-700' },
    { id: 5, name: 'Discover Card', transactionCount: 43, createDate: '2024-01-22', color: 'from-orange-500 to-orange-700' },
  ];

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-xl font-semibold text-gray-900">Cards</h1>
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
            placeholder="Search cards..."
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

      {/* Card Grid */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredCards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Card Visual */}
              <div className={`h-32 bg-gradient-to-br ${card.color} p-4 relative`}>
                <div className="flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start">
                    <CreditCard className="w-6 h-6 text-white/90" />
                    <button className="p-1 hover:bg-white/20 rounded">
                      <MoreVertical className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <div>
                    <div className="flex gap-1 mb-2">
                      <div className="w-8 h-1 bg-white/50 rounded"></div>
                      <div className="w-8 h-1 bg-white/50 rounded"></div>
                      <div className="w-8 h-1 bg-white/50 rounded"></div>
                    </div>
                    <p className="text-white text-xs font-medium truncate">{card.name}</p>
                  </div>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">Transactions</span>
                  <span className="text-sm font-semibold text-gray-900">{card.transactionCount}</span>
                </div>
                <div className="text-xs text-gray-500">
                  Created: {new Date(card.createDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 mt-3">
                  <button className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg">
                    <Edit className="w-4 h-4 text-gray-600 mx-auto" />
                  </button>
                  <button className="flex-1 py-2 bg-red-50 hover:bg-red-100 rounded-lg">
                    <Trash2 className="w-4 h-4 text-red-600 mx-auto" />
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
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
