import { Wallet, TrendingUp } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="h-full bg-gradient-to-br from-[#0B99FF] via-[#0066CC] to-[#004D99] flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="relative mb-8">
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
          <Wallet className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-white text-center mb-3">
        Finance Inventory
      </h1>
      <p className="text-blue-100 text-center text-lg mb-12">
        Management System
      </p>

      {/* Loading Animation */}
      <div className="flex gap-2 mb-16">
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>

      {/* Version Info */}
      <div className="absolute bottom-12 text-center">
        <p className="text-blue-100 text-sm">Version 1.0.0</p>
        <p className="text-blue-200 text-xs mt-1">© 2024 Finance Inventory</p>
      </div>
    </div>
  );
}
