import { useState } from 'react';
import { ChevronLeft, Delete, Save, History } from 'lucide-react';

interface CalculatorScreenProps {
  onNavigate: (screen: string) => void;
}

export default function CalculatorScreen({ onNavigate }: CalculatorScreenProps) {
  const [display, setDisplay] = useState('0');
  const [activeTab, setActiveTab] = useState<'simple' | 'finkeda'>('simple');

  const handleNumberClick = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperatorClick = (op: string) => {
    setDisplay(display + ' ' + op + ' ');
  };

  const handleClear = () => {
    setDisplay('0');
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEquals = () => {
    try {
      const result = eval(display.replace(/×/g, '*').replace(/÷/g, '/'));
      setDisplay(result.toString());
    } catch (error) {
      setDisplay('Error');
    }
  };

  const buttons = [
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', '=', '+'],
  ];

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate('home')} className="p-2 hover:bg-gray-100 rounded-lg -ml-2">
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Calculator</h1>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <History className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => setActiveTab('simple')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'simple' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-700'
            }`}
          >
            Simple Calculator
          </button>
          <button
            onClick={() => setActiveTab('finkeda')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'finkeda' ? 'bg-orange-500 text-white' : 'bg-gray-50 text-gray-700'
            }`}
          >
            Finkeda Calculator
          </button>
        </div>
      </div>

      {/* Calculator Content */}
      <div className="flex-1 px-4 py-4">
        {activeTab === 'simple' ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex flex-col">
            {/* Display */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-xl p-6 mb-4">
                <div className="text-right">
                  <p className="text-4xl font-semibold text-gray-900 break-all">{display}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Delete className="w-5 h-5" />
                  Delete
                </button>
              </div>
            </div>

            {/* Number Pad */}
            <div className="flex-1 flex flex-col gap-3">
              {buttons.map((row, rowIndex) => (
                <div key={rowIndex} className="flex gap-3 flex-1">
                  {row.map((btn) => (
                    <button
                      key={btn}
                      onClick={() => {
                        if (btn === '=') {
                          handleEquals();
                        } else if (['+', '-', '×', '÷'].includes(btn)) {
                          handleOperatorClick(btn);
                        } else {
                          handleNumberClick(btn);
                        }
                      }}
                      className={`flex-1 rounded-xl font-semibold text-xl transition-all ${
                        btn === '='
                          ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
                          : ['+', '-', '×', '÷'].includes(btn)
                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                          : 'bg-gray-50 text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Save Button */}
            <button className="mt-4 w-full py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
              <Save className="w-5 h-5" />
              Save Preset
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-6 h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Finkeda Special Calculator</h2>
            
            <div className="space-y-4">
              {/* Input Fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Base Amount</label>
                <input
                  type="number"
                  placeholder="Enter base amount"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interest Rate (%)</label>
                <input
                  type="number"
                  placeholder="Enter interest rate"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months)</label>
                <input
                  type="number"
                  placeholder="Enter duration"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Processing Fee (%)</label>
                <input
                  type="number"
                  placeholder="Enter processing fee"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Result Display */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 mt-6">
                <p className="text-sm text-orange-700 mb-1">Calculated Result</p>
                <p className="text-3xl font-bold text-orange-900">₹0.00</p>
              </div>

              {/* Calculate Button */}
              <button className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                Calculate
              </button>

              {/* History */}
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Calculations</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">₹50,000 @ 12% for 6 months</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <p className="text-sm font-semibold text-orange-600">₹53,000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
