import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import VisitorSidebar from '../../components/dashboard/VisitorSidebar';
import {
  Calculator,
  Calendar,
  ArrowRightLeft,
  Clock,
  Thermometer,
  DollarSign,
  Ruler,
  Zap,
  Copy,
  RefreshCw,
  Info,
  BookOpen,
  Download,
  Share2
} from 'lucide-react';
import { toast } from 'sonner';

const ConverterTools = () => {
  const { user } = useAuth();
  const [selectedConverter, setSelectedConverter] = useState('calendar');
  
  // Calendar converter state
  const [calendarInput, setCalendarInput] = useState('');
  const [calendarOutput, setCalendarOutput] = useState('');
  const [calendarDirection, setCalendarDirection] = useState('eth-to-greg'); // 'eth-to-greg' or 'greg-to-eth'
  
  // Currency converter state
  const [currencyAmount, setCurrencyAmount] = useState('');
  const [currencyOutput, setCurrencyOutput] = useState('');
  const [currencyFrom, setCurrencyFrom] = useState('ETB');
  const [currencyTo, setCurrencyTo] = useState('USD');
  
  // Unit converter state
  const [unitAmount, setUnitAmount] = useState('');
  const [unitOutput, setUnitOutput] = useState('');
  const [unitFrom, setUnitFrom] = useState('km');
  const [unitTo, setUnitTo] = useState('miles');

  const converterTypes = [
    {
      id: 'calendar',
      name: 'Ethiopian Calendar',
      icon: Calendar,
      description: 'Convert between Ethiopian and Gregorian calendars',
      color: 'text-blue-600'
    },
    {
      id: 'currency',
      name: 'Currency Converter',
      icon: DollarSign,
      description: 'Convert Ethiopian Birr to other currencies',
      color: 'text-green-600'
    },
    {
      id: 'units',
      name: 'Unit Converter',
      icon: Ruler,
      description: 'Convert between different units of measurement',
      color: 'text-purple-600'
    },
    {
      id: 'time',
      name: 'Time Converter',
      icon: Clock,
      description: 'Convert between Ethiopian and standard time',
      color: 'text-orange-600'
    }
  ];

  // Ethiopian calendar functions (simplified)
  const ethiopianToGregorian = (ethDate) => {
    try {
      // Basic conversion algorithm (simplified)
      const [year, month, day] = ethDate.split('-').map(Number);
      if (!year || !month || !day) return null;
      
      // Add approximately 7-8 years to Ethiopian year
      const gregYear = year + 7;
      const gregMonth = month;
      const gregDay = Math.min(day, 30);
      
      return `${gregYear}-${gregMonth.toString().padStart(2, '0')}-${gregDay.toString().padStart(2, '0')}`;
    } catch (error) {
      return null;
    }
  };

  const gregorianToEthiopian = (gregDate) => {
    try {
      const [year, month, day] = gregDate.split('-').map(Number);
      if (!year || !month || !day) return null;
      
      // Subtract approximately 7-8 years from Gregorian year
      const ethYear = year - 7;
      const ethMonth = month;
      const ethDay = Math.min(day, 30);
      
      return `${ethYear}-${ethMonth.toString().padStart(2, '0')}-${ethDay.toString().padStart(2, '0')}`;
    } catch (error) {
      return null;
    }
  };

  // Currency conversion (mock rates)
  const exchangeRates = {
    ETB: { USD: 0.018, EUR: 0.017, GBP: 0.015, JPY: 2.7 },
    USD: { ETB: 55.2, EUR: 0.92, GBP: 0.81, JPY: 148.5 },
    EUR: { ETB: 59.8, USD: 1.08, GBP: 0.88, JPY: 161.2 },
    GBP: { ETB: 68.1, USD: 1.23, EUR: 1.14, JPY: 183.5 }
  };

  // Unit conversions
  const unitConversions = {
    km: { miles: 0.621371, meters: 1000, feet: 3280.84 },
    miles: { km: 1.60934, meters: 1609.34, feet: 5280 },
    meters: { km: 0.001, miles: 0.000621371, feet: 3.28084 },
    feet: { km: 0.0003048, miles: 0.000189394, meters: 0.3048 }
  };

  const handleCalendarConvert = () => {
    if (!calendarInput) return;
    
    let result;
    if (calendarDirection === 'eth-to-greg') {
      result = ethiopianToGregorian(calendarInput);
    } else {
      result = gregorianToEthiopian(calendarInput);
    }
    
    if (result) {
      setCalendarOutput(result);
      toast.success('Date converted successfully!');
    } else {
      toast.error('Please enter a valid date (YYYY-MM-DD format)');
    }
  };

  const handleCurrencyConvert = () => {
    if (!currencyAmount) return;
    
    const amount = parseFloat(currencyAmount);
    if (isNaN(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    const rate = exchangeRates[currencyFrom]?.[currencyTo];
    if (rate) {
      const result = (amount * rate).toFixed(2);
      setCurrencyOutput(result);
      toast.success('Currency converted successfully!');
    } else {
      toast.error('Conversion rate not available');
    }
  };

  const handleUnitConvert = () => {
    if (!unitAmount) return;
    
    const amount = parseFloat(unitAmount);
    if (isNaN(amount)) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    const rate = unitConversions[unitFrom]?.[unitTo];
    if (rate) {
      const result = (amount * rate).toFixed(4);
      setUnitOutput(result);
      toast.success('Unit converted successfully!');
    } else {
      toast.error('Conversion not available');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const resetConverter = () => {
    switch (selectedConverter) {
      case 'calendar':
        setCalendarInput('');
        setCalendarOutput('');
        break;
      case 'currency':
        setCurrencyAmount('');
        setCurrencyOutput('');
        break;
      case 'units':
        setUnitAmount('');
        setUnitOutput('');
        break;
      default:
        break;
    }
    toast.success('Converter reset');
  };

  const CalendarConverter = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCalendarDirection('eth-to-greg')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            calendarDirection === 'eth-to-greg'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Ethiopian → Gregorian</p>
          </div>
        </button>
        <button
          onClick={() => setCalendarDirection('greg-to-eth')}
          className={`p-4 rounded-lg border-2 transition-colors ${
            calendarDirection === 'greg-to-eth'
              ? 'border-blue-600 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Gregorian → Ethiopian</p>
          </div>
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {calendarDirection === 'eth-to-greg' ? 'Ethiopian Date' : 'Gregorian Date'}
          </label>
          <input
            type="text"
            value={calendarInput}
            onChange={(e) => setCalendarInput(e.target.value)}
            placeholder="YYYY-MM-DD"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {calendarDirection === 'eth-to-greg' ? 'Gregorian Date' : 'Ethiopian Date'}
          </label>
          <div className="flex">
            <input
              type="text"
              value={calendarOutput}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50"
              placeholder="Result will appear here"
            />
            <button
              onClick={() => calendarOutput && copyToClipboard(calendarOutput)}
              className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg hover:bg-gray-200 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleCalendarConvert}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowRightLeft className="h-4 w-4" />
        Convert Date
      </button>
    </div>
  );

  const CurrencyConverter = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={currencyAmount}
            onChange={(e) => setCurrencyAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <select
            value={currencyFrom}
            onChange={(e) => setCurrencyFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="ETB">Ethiopian Birr (ETB)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <select
            value={currencyTo}
            onChange={(e) => setCurrencyTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
            <option value="GBP">British Pound (GBP)</option>
            <option value="ETB">Ethiopian Birr (ETB)</option>
          </select>
        </div>
      </div>
      
      {currencyOutput && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Converted Amount:</p>
              <p className="text-2xl font-bold text-green-800">
                {currencyAmount} {currencyFrom} = {currencyOutput} {currencyTo}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`${currencyAmount} ${currencyFrom} = ${currencyOutput} ${currencyTo}`)}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <button
        onClick={handleCurrencyConvert}
        className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
      >
        <DollarSign className="h-4 w-4" />
        Convert Currency
      </button>
      
      <div className="text-xs text-gray-500 text-center">
        * Exchange rates are approximate and for educational purposes only
      </div>
    </div>
  );

  const UnitConverter = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
          <input
            type="number"
            value={unitAmount}
            onChange={(e) => setUnitAmount(e.target.value)}
            placeholder="Enter value"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
          <select
            value={unitFrom}
            onChange={(e) => setUnitFrom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="km">Kilometers</option>
            <option value="miles">Miles</option>
            <option value="meters">Meters</option>
            <option value="feet">Feet</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
          <select
            value={unitTo}
            onChange={(e) => setUnitTo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="miles">Miles</option>
            <option value="km">Kilometers</option>
            <option value="meters">Meters</option>
            <option value="feet">Feet</option>
          </select>
        </div>
      </div>
      
      {unitOutput && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Converted Value:</p>
              <p className="text-2xl font-bold text-purple-800">
                {unitAmount} {unitFrom} = {unitOutput} {unitTo}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(`${unitAmount} ${unitFrom} = ${unitOutput} ${unitTo}`)}
              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      
      <button
        onClick={handleUnitConvert}
        className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
      >
        <Ruler className="h-4 w-4" />
        Convert Units
      </button>
    </div>
  );

  const TimeConverter = () => (
    <div className="space-y-6">
      <div className="text-center py-12 bg-orange-50 border border-orange-200 rounded-lg">
        <Clock className="h-12 w-12 text-orange-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-orange-800 mb-2">Time Converter</h3>
        <p className="text-orange-700">
          Ethiopian time system converter coming soon!
        </p>
        <p className="text-sm text-orange-600 mt-2">
          Ethiopia follows a 12-hour clock starting at 6 AM (Ethiopian dawn)
        </p>
      </div>
    </div>
  );

  const selectedConverterData = converterTypes.find(c => c.id === selectedConverter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <VisitorSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Ethiopian Converter Tools</h1>
                <p className="text-gray-600 mt-1">Convert between Ethiopian and international systems</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {converterTypes.map(converter => (
                <div key={converter.id} className="bg-white rounded-lg p-4 shadow-sm border">
                  <div className="flex items-center gap-2">
                    <converter.icon className={`h-5 w-5 ${converter.color}`} />
                    <span className="text-sm text-gray-600">{converter.name}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{converter.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            {/* Converter Selection */}
            <div className="col-span-3">
              <div className="bg-white rounded-lg shadow-sm border p-4 sticky top-4">
                <h3 className="font-semibold text-gray-900 mb-4">Available Converters</h3>
                <div className="space-y-2">
                  {converterTypes.map(converter => {
                    const Icon = converter.icon;
                    return (
                      <button
                        key={converter.id}
                        onClick={() => setSelectedConverter(converter.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          selectedConverter === converter.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${converter.color}`} />
                        <div className="flex-1">
                          <span className="block font-medium">{converter.name}</span>
                          <span className="text-xs text-gray-500">{converter.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Converter */}
            <div className="col-span-9">
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <selectedConverterData.icon className={`h-6 w-6 ${selectedConverterData.color}`} />
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                          {selectedConverterData.name}
                        </h2>
                        <p className="text-sm text-gray-600">{selectedConverterData.description}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={resetConverter}
                      className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Reset converter"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Reset
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {selectedConverter === 'calendar' && <CalendarConverter />}
                  {selectedConverter === 'currency' && <CurrencyConverter />}
                  {selectedConverter === 'units' && <UnitConverter />}
                  {selectedConverter === 'time' && <TimeConverter />}
                </div>
              </div>

              {/* Educational Content */}
              {selectedConverter === 'calendar' && (
                <div className="mt-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    About the Ethiopian Calendar
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-blue-700">
                    <div>
                      <h4 className="font-medium mb-2">Key Facts:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• 13 months total</li>
                        <li>• 12 months of 30 days each</li>
                        <li>• 13th month (Pagumen) has 5-6 days</li>
                        <li>• About 7-8 years behind Gregorian</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">New Year:</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Called "Enkutatash"</li>
                        <li>• Falls on September 11 (or 12 in leap years)</li>
                        <li>• Celebrated with flowers and gifts</li>
                        <li>• Marks the end of the rainy season</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConverterTools;
