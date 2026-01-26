import { useState } from 'react';
import { Home, CreditCard, Building2, Users, ArrowLeftRight, Calculator, UserCircle, Settings } from 'lucide-react';
import HomeScreen from '@/app/components/screens/HomeScreen';
import BankListScreen from '@/app/components/screens/BankListScreen';
import CardListScreen from '@/app/components/screens/CardListScreen';
import ClientListScreen from '@/app/components/screens/ClientListScreen';
import TransactionListScreen from '@/app/components/screens/TransactionListScreen';
import ProfilerScreen from '@/app/components/screens/ProfilerScreen';
import SettingsScreen from '@/app/components/screens/SettingsScreen';
import CalculatorScreen from '@/app/components/screens/CalculatorScreen';

// Bottom Navigation Component
function BottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'banks', label: 'Banks', icon: Building2 },
    { id: 'cards', label: 'Cards', icon: CreditCard },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${isActive ? 'text-[#0B99FF]' : 'text-gray-500'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [currentScreen, setCurrentScreen] = useState('home');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case 'banks':
        return <BankListScreen onNavigate={setCurrentScreen} />;
      case 'cards':
        return <CardListScreen onNavigate={setCurrentScreen} />;
      case 'clients':
        return <ClientListScreen onNavigate={setCurrentScreen} />;
      case 'transactions':
        return <TransactionListScreen onNavigate={setCurrentScreen} />;
      case 'profiler':
        return <ProfilerScreen onNavigate={setCurrentScreen} />;
      case 'calculator':
        return <CalculatorScreen onNavigate={setCurrentScreen} />;
      case 'settings':
        return <SettingsScreen onNavigate={setCurrentScreen} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
  };

  return (
    <div className="bg-gray-100">
      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 h-11 bg-white z-50 flex items-center justify-between px-6">
        <span className="text-sm font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-3 border border-gray-900 rounded-sm relative">
            <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 bg-gray-900 rounded-sm"></div>
          </div>
        </div>
      </div>

      {/* Screen Content */}
      <div className="h-full bg-gray-50 overflow-hidden pt-11 pb-20">
        <div className="h-full overflow-y-auto">
          {renderScreen()}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}
