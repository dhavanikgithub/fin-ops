import { useState } from 'react';
import { ChevronLeft, Server, Bell, Shield, Info, ChevronRight, Moon, Globe, Database } from 'lucide-react';

interface SettingsScreenProps {
  onNavigate: (screen: string) => void;
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const [apiUrl, setApiUrl] = useState('https://api.example.com');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const settingsGroups = [
    {
      title: 'Server Configuration',
      items: [
        {
          icon: Server,
          label: 'API Base URL',
          value: apiUrl,
          type: 'input',
          color: 'text-blue-600',
          bg: 'bg-blue-50'
        },
        {
          icon: Database,
          label: 'API Version',
          value: 'v1',
          type: 'text',
          color: 'text-purple-600',
          bg: 'bg-purple-50'
        },
      ]
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          label: 'Notifications',
          value: notifications,
          type: 'toggle',
          color: 'text-orange-600',
          bg: 'bg-orange-50'
        },
        {
          icon: Moon,
          label: 'Dark Mode',
          value: darkMode,
          type: 'toggle',
          color: 'text-indigo-600',
          bg: 'bg-indigo-50'
        },
        {
          icon: Globe,
          label: 'Language',
          value: 'English',
          type: 'text',
          color: 'text-green-600',
          bg: 'bg-green-50'
        },
      ]
    },
    {
      title: 'About',
      items: [
        {
          icon: Info,
          label: 'App Version',
          value: '1.0.0',
          type: 'text',
          color: 'text-gray-600',
          bg: 'bg-gray-50'
        },
        {
          icon: Shield,
          label: 'Privacy Policy',
          type: 'link',
          color: 'text-red-600',
          bg: 'bg-red-50'
        },
      ]
    }
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Server Connection Status */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/90 text-sm mb-1">Server Status</p>
              <p className="text-white text-xl font-semibold">Connected</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-white/80 text-xs">Last sync: 2 minutes ago</p>
          </div>
        </div>

        {/* Settings Groups */}
        <div className="space-y-6">
          {settingsGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                {group.title}
              </h2>
              <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                {group.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={itemIndex}
                      className={`flex items-center justify-between p-4 ${
                        itemIndex !== group.items.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${item.bg} p-2.5 rounded-lg`}>
                          <Icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                        <span className="font-medium text-gray-900">{item.label}</span>
                      </div>

                      {item.type === 'toggle' && (
                        <button
                          onClick={() => {
                            if (item.label === 'Notifications') setNotifications(!notifications);
                            if (item.label === 'Dark Mode') setDarkMode(!darkMode);
                          }}
                          className={`relative w-12 h-6 rounded-full transition-colors ${
                            item.value ? 'bg-[#0B99FF]' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                              item.value ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          ></div>
                        </button>
                      )}

                      {item.type === 'text' && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{item.value}</span>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      )}

                      {item.type === 'link' && (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* API Configuration Section */}
        <div className="mt-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            API Configuration
          </h2>
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B99FF] focus:border-transparent mb-3"
            />
            <button className="w-full py-3 bg-[#0B99FF] text-white rounded-xl font-semibold hover:bg-[#0A88E6] transition-colors">
              Save Configuration
            </button>
          </div>
        </div>

        {/* Test Connection Button */}
        <button className="w-full py-3 bg-white border-2 border-[#0B99FF] text-[#0B99FF] rounded-xl font-semibold hover:bg-[#0B99FF] hover:text-white transition-colors mb-4">
          Test Connection
        </button>

        {/* App Info */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500 mb-1">Finance Inventory Management</p>
          <p className="text-xs text-gray-400">Version 1.0.0 • Build 2024.01.18</p>
        </div>
      </div>
    </div>
  );
}
