import { useState } from 'react';
import { Search, Plus, ChevronLeft, Users, Mail, Phone, MapPin, MoreVertical, Edit, Trash2, Filter, ArrowUpDown } from 'lucide-react';

interface ClientListScreenProps {
  onNavigate: (screen: string) => void;
}

export default function ClientListScreen({ onNavigate }: ClientListScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const clients = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john.doe@example.com', 
      contact: '+91 98765 43210', 
      address: 'Mumbai, Maharashtra',
      transactionCount: 45,
      createDate: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane.smith@example.com', 
      contact: '+91 98765 43211', 
      address: 'Delhi, NCR',
      transactionCount: 67,
      createDate: '2024-01-10'
    },
    { 
      id: 3, 
      name: 'Robert Brown', 
      email: 'robert.b@example.com', 
      contact: '+91 98765 43212', 
      address: 'Bangalore, Karnataka',
      transactionCount: 89,
      createDate: '2024-01-18'
    },
    { 
      id: 4, 
      name: 'Emily Davis', 
      email: 'emily.davis@example.com', 
      contact: '+91 98765 43213', 
      address: 'Hyderabad, Telangana',
      transactionCount: 34,
      createDate: '2024-01-20'
    },
    { 
      id: 5, 
      name: 'Michael Wilson', 
      email: 'michael.w@example.com', 
      contact: '+91 98765 43214', 
      address: 'Chennai, Tamil Nadu',
      transactionCount: 56,
      createDate: '2024-01-12'
    },
  ];

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contact.includes(searchQuery)
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
            <h1 className="text-xl font-semibold text-gray-900">Clients</h1>
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
            placeholder="Search clients..."
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

      {/* Client List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{client.transactionCount} transactions</p>
                  </div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{client.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{client.address}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  Joined: {new Date(client.createDate).toLocaleDateString()}
                </span>
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
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
