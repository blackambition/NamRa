/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  Truck, 
  ShieldCheck, 
  Receipt, 
  ArrowRightLeft,
  Package,
  TrendingUp,
  AlertCircle,
  FileText,
  BadgeCheck,
  HelpCircle,
  Plus,
  Trash2,
  Download,
  Info,
  Banknote,
  Languages,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Specialized Categories Based on Research
const CATEGORIES = [
  { name: 'Clothing & Shoes (China/Global)', duty: 0.45, description: 'High protective duty for imports outside SACU. Effective tax ~61.5%.' },
  { name: 'Bags & Accessories (China)', duty: 0.45, description: 'Wallets, handbags, and travel bags from non-trade agreement countries.' },
  { name: 'Hair Extensions & Beauty', duty: 0.45, description: 'Hair products and extensions. Major category for small SMEs.' },
  { name: 'SACU Origin (SA/Botswana)', duty: 0.00, description: 'Goods made in SA/SACU. Must have Certificate of Origin.' },
  { name: 'Standard Electronics', duty: 0.00, description: 'Laptops, tablets, phones. Duty-free, pay VAT only.' },
  { name: 'Home Appliances', duty: 0.15, description: 'Fridges, microwaves, washing machines.' },
  { name: 'Custom Tariff', duty: null, description: 'Consult NamRA eTariff for specific HS codes.' },
];

const INITIAL_CURRENCIES = [
  { code: 'ZAR', symbol: 'R', rate: 1, name: 'South African Rand' },
  { code: 'USD', symbol: '$', rate: 18.50, name: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 20.10, name: 'Euro' },
  { code: 'CNY', symbol: '¥', rate: 2.55, name: 'Chinese Yuan (Renminbi)' },
];

const VAT_RATE = 0.15;

const TRANSLATIONS: any = {
  en: {
    header: "Border Simplified",
    tagline: "Helping Namibian SMEs calculate duties and protect business profits.",
    categories: "NamRA Category",
    pay: "Pay NamRA",
    selling: "Suggested Selling Price",
    cost: "Landed Unit Cost",
    duty: "Custom Duty",
    vat: "Import VAT",
    reclaim: "VAT Reclaim",
    advice: "Expert SME Advice",
    items: "Item Basket",
    ready: "Border Ready"
  },
  os: {
    header: "Border Yi li Nawa",
    tagline: "Kwatha aanangeshefa ya Namibia ya kale ya shiiva iimaliwa yomofuta.",
    categories: "Oludhi lwooshike",
    pay: "Futa ku NamRA",
    selling: "Ondando yoku landitha",
    cost: "Ondando oyi li nawa",
    duty: "Iifuta yEpangelo",
    vat: "O-VAT",
    reclaim: "Galula O-VAT",
    advice: "Omayele gOonkuluntu",
    items: "Oshimbasket",
    ready: "Mofuta Oku li Nawa"
  }
};

interface ImportItem {
  id: string;
  name: string;
  price: string;
  shipping: string;
  categoryIndex: number;
  customDuty: string;
  quantity: string;
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'os'>('en');
  const [items, setItems] = useState<ImportItem[]>([
    { id: '1', name: 'Item 1', price: '', shipping: '', categoryIndex: 0, customDuty: '', quantity: '1' }
  ]);
  const [currencyIndex, setCurrencyIndex] = useState<number>(0);
  const [customRate, setCustomRate] = useState<string>('');
  const [isBusiness, setIsBusiness] = useState<boolean>(false);
  const [agentFee, setAgentFee] = useState<string>('');
  const [profitMargin, setProfitMargin] = useState<string>('30');
  const [exchangeRates, setExchangeRates] = useState(INITIAL_CURRENCIES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Fetch Live Rates
  useEffect(() => {
    async function fetchRates() {
      setIsLoadingRates(true);
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/NAD');
        const data = await response.json();
        if (data && data.rates) {
          const updatedCurrencies = INITIAL_CURRENCIES.map(cur => ({
            ...cur,
            rate: 1 / data.rates[cur.code] || cur.rate
          }));
          setExchangeRates(updatedCurrencies);
        }
      } catch (error) {
        console.error('Failed to fetch rates, using defaults', error);
      } finally {
        setIsLoadingRates(false);
      }
    }
    fetchRates();
  }, []);

  const validateNumeric = (value: string, setter: (v: string) => void) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setter(value);
    }
  };

  const addItem = () => {
    setItems([...items, { 
      id: Math.random().toString(36).substr(2, 9), 
      name: `Item ${items.length + 1}`, 
      price: '', 
      shipping: '', 
      categoryIndex: 0, 
      customDuty: '',
      quantity: '1'
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ImportItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const t = TRANSLATIONS[lang];
  const selectedCurrency = exchangeRates[currencyIndex];
  const activeExchangeRate = parseFloat(customRate) || selectedCurrency.rate;

  const calculations = useMemo(() => {
    const itemCalculations = items.map(item => {
      const pRaw = parseFloat(item.price) || 0;
      const sRaw = parseFloat(item.shipping) || 0;
      const qty = parseFloat(item.quantity) || 1;
      const dutyRate = CATEGORIES[item.categoryIndex].duty !== null 
        ? CATEGORIES[item.categoryIndex].duty! 
        : (parseFloat(item.customDuty) / 100 || 0);

      const pNAD = pRaw * activeExchangeRate;
      const sNAD = sRaw * activeExchangeRate;
      const customsValue = pNAD + sNAD;
      const duty = customsValue * dutyRate;
      
      // NAMRA VAT: 15% on (VDP + Duty + 10% VDP)
      const uplift = customsValue * 0.10;
      const vatBase = customsValue + duty + uplift;
      const vat = vatBase * VAT_RATE;

      const totalPerItem = (customsValue + duty + vat) / qty;

      return { customsValue, duty, vat, uplift, pNAD, sNAD, totalPerItem, qty };
    });

    const totalVDP = itemCalculations.reduce((sum, i) => sum + i.customsValue, 0);
    const totalDuty = itemCalculations.reduce((sum, i) => sum + i.duty, 0);
    const totalUplift = itemCalculations.reduce((sum, i) => sum + i.uplift, 0);
    const totalVAT = itemCalculations.reduce((sum, i) => sum + i.vat, 0);
    const totalQty = itemCalculations.reduce((sum, i) => sum + i.qty, 0);
    const aRaw = parseFloat(agentFee) || 0;

    const totalInvestment = totalVDP + totalDuty + totalVAT + aRaw;
    const taxesOnly = totalDuty + totalVAT;
    
    // Profit Logic
    const margin = parseFloat(profitMargin) / 100 || 0;
    const totalWithProfit = totalInvestment * (1 + margin);
    const suggestionPerUnit = totalWithProfit / (totalQty || 1);

    return {
      customsValue: totalVDP,
      duty: totalDuty,
      vat: totalVAT,
      uplift: totalUplift,
      totalInvestment,
      taxesOnly,
      agentFee: aRaw,
      suggestionPerUnit,
      margin: totalWithProfit - totalInvestment,
      itemCalculations
    };
  }, [items, activeExchangeRate, agentFee, isBusiness, profitMargin]);

  const exportSummary = () => {
    const date = new Date().toLocaleDateString();
    let summary = `NAMRA SME CLEARANCE SUMMARY - ${date}\n`;
    summary += `-------------------------------------------\n\n`;
    summary += `Currency: ${selectedCurrency.code} | Rate: ${activeExchangeRate.toFixed(4)} NAD\n\n`;
    
    items.forEach((item, idx) => {
      summary += `${idx + 1}. ${item.name || 'Item'} (${item.quantity} units)\n`;
      summary += `   Category: ${CATEGORIES[item.categoryIndex].name}\n`;
      summary += `   Cost (converted): N$ ${(parseFloat(item.price) * activeExchangeRate).toFixed(2)}\n`;
    });

    summary += `\nBREADOWN (NAD):\n`;
    summary += `Total Items Value: N$ ${calculations.customsValue.toLocaleString()}\n`;
    summary += `Customs Duty: N$ ${calculations.duty.toLocaleString()}\n`;
    summary += `NamRA VAT: N$ ${calculations.vat.toLocaleString()}\n`;
    summary += `Agent/Courier: N$ ${calculations.agentFee.toLocaleString()}\n`;
    summary += `\nTOTAL CASH TO PAY AT BORDER: N$ ${calculations.taxesOnly.toLocaleString()}\n`;
    summary += `\nESTIMATED LANDED PRICE PER UNIT: N$ ${(calculations.totalInvestment / (items.reduce((s, i) => s + (parseFloat(i.quantity) || 1), 0) || 1)).toFixed(2)}\n`;
    summary += `MINIMUM SELL PRICE (@${profitMargin}% PROFIT): N$ ${calculations.suggestionPerUnit.toFixed(2)}\n`;

    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NamRA_SME_Summary_${date.replace(/\//g, '-')}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-8 border-b border-gray-100 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                <BadgeCheck className="w-3 h-3" /> SME Compliance Intelligence
              </div>
              <button 
                onClick={() => setLang(lang === 'en' ? 'os' : 'en')}
                className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                <Languages className="w-3 h-3" /> {lang === 'en' ? 'Oshiwambo' : 'English'}
              </button>
            </div>
            
            <h1 className="text-6xl font-light tracking-tight leading-tight">
              {t.header}. <span className="font-semibold italic text-blue-600">Secure.</span>
            </h1>
            <p className="text-gray-400 max-w-xl text-lg leading-relaxed">
              {t.tagline}
            </p>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative group overflow-hidden min-w-[280px]">
              <div className="text-right z-10 relative">
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-end gap-2">
                   <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {isLoadingRates ? 'Syncing...' : 'Real-Time Rate'}
                </div>
                <div className="font-mono font-bold text-2xl flex items-center justify-end gap-2">
                  {selectedCurrency.code} 1 <ArrowRightLeft className="w-5 h-5 text-blue-400" /> <span className="text-blue-600">NAD {activeExchangeRate.toFixed(4)}</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-blue-50/0 group-hover:bg-blue-50/50 transition-colors pointer-events-none" />
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-12">
            
            {/* Advice Banner */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                  <div className="p-5 bg-white/20 rounded-[2rem] backdrop-blur-md">
                     <Info className="w-8 h-8 text-blue-100" />
                  </div>
                  <div className="space-y-2">
                     <h3 className="text-xl font-bold flex items-center gap-2">{t.advice}</h3>
                     <p className="text-blue-100 text-sm leading-relaxed max-w-lg">
                        Shopping from China? Expect a combined tax of **61.5%** on clothes and shoes. 
                        Always check if your supplier has a **Certificate of Origin** to potentially save on duties.
                     </p>
                  </div>
               </div>
            </section>

            {/* Currency Selector */}
            <section className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-gray-100 space-y-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="w-full md:w-auto">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase mb-5 ml-1 tracking-widest">Base Currency</label>
                  <div className="flex flex-wrap gap-2">
                    {exchangeRates.map((cur, idx) => (
                      <button
                        key={cur.code}
                        onClick={() => {
                          setCurrencyIndex(idx);
                          setCustomRate('');
                        }}
                        className={`px-8 py-3.5 text-xs font-bold rounded-2xl transition-all ${
                          currencyIndex === idx 
                            ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' 
                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                        }`}
                      >
                        {cur.code}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full md:w-72">
                   <label className="block text-[11px] font-bold text-gray-400 uppercase mb-5 ml-1 tracking-widest">Bank Rate Override</label>
                   <div className="relative">
                      <input 
                        type="text"
                        inputMode="decimal"
                        value={customRate}
                        onChange={(e) => validateNumeric(e.target.value, setCustomRate)}
                        placeholder={selectedCurrency.rate.toFixed(4)}
                        className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-mono text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold uppercase italic">NAD</span>
                   </div>
                </div>
              </div>
            </section>

            {/* The Basket */}
            <section className="space-y-8">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Package className="w-7 h-7 text-blue-500" /> {t.items}
                </h2>
                <button 
                  onClick={addItem}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-blue-100"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="space-y-6">
                <AnimatePresence initial={false}>
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-[2.5rem] p-10 shadow-[0_4px_30px_rgb(0,0,0,0.02)] border border-gray-100 space-y-10 relative group hover:shadow-xl transition-all duration-500"
                    >
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                              {idx + 1}
                            </span>
                            <input 
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              className="text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-100"
                              placeholder="Product name..."
                            />
                         </div>
                         {items.length > 1 && (
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="p-3 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                         )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                         <div className="space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                               <div className="grid grid-cols-2 gap-4">
                                  <div>
                                     <label className="block text-[10px] font-bold text-gray-300 uppercase mb-2 ml-1 tracking-widest">Quantity</label>
                                     <input 
                                       type="text" 
                                       inputMode="decimal"
                                       value={item.quantity}
                                       onChange={(e) => validateNumeric(e.target.value, (val) => updateItem(item.id, 'quantity', val))}
                                       placeholder="1"
                                       className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-mono focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                     />
                                  </div>
                                  <div>
                                     <label className="block text-[10px] font-bold text-gray-300 uppercase mb-2 ml-1 tracking-widest">UnitPrice({selectedCurrency.code})</label>
                                     <div className="relative">
                                       <span className="absolute left-5 top-1/2 -translate-y-1/2 font-mono font-bold text-blue-500">{selectedCurrency.symbol}</span>
                                       <input 
                                         type="text" 
                                         inputMode="decimal"
                                         value={item.price}
                                         onChange={(e) => validateNumeric(e.target.value, (val) => updateItem(item.id, 'price', val))}
                                         placeholder="0.00"
                                         className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-4 font-mono focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                       />
                                     </div>
                                  </div>
                               </div>
                               <div>
                                  <label className="block text-[10px] font-bold text-gray-300 uppercase mb-2 ml-1 tracking-widest">Shipping Portion ({selectedCurrency.code})</label>
                                  <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-mono font-bold text-blue-500">{selectedCurrency.symbol}</span>
                                    <input 
                                      type="text" 
                                      inputMode="decimal"
                                      value={item.shipping}
                                      onChange={(e) => validateNumeric(e.target.value, (val) => updateItem(item.id, 'shipping', val))}
                                      placeholder="0.00"
                                      className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-10 pr-4 font-mono focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                  </div>
                               </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="block text-[10px] font-bold text-gray-300 uppercase mb-1 ml-1 tracking-widest">{t.categories}</label>
                            <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                               {CATEGORIES.map((cat, cIdx) => (
                                  <button
                                    key={cat.name}
                                    onClick={() => updateItem(item.id, 'categoryIndex', cIdx)}
                                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all ${
                                      item.categoryIndex === cIdx 
                                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-sm' 
                                        : 'border-gray-50 hover:border-gray-200 text-gray-500'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center text-[11px] font-bold mb-1 uppercase tracking-tight">
                                      {cat.name}
                                      {cat.duty !== null && (
                                        <span className={`px-2 py-0.5 rounded-md ${cat.duty >= 0.4 ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'}`}>
                                          {(cat.duty * 100)}% {t.duty}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] opacity-60 leading-snug">{cat.description}</p>
                                  </button>
                               ))}
                            </div>
                         </div>
                      </div>

                      {/* Item Summary Stats */}
                      <div className="pt-6 border-t border-gray-50 grid grid-cols-2 md:grid-cols-4 gap-6">
                         <div className="space-y-1">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Border Value</div>
                            <div className="font-mono font-bold text-sm">N$ {calculations.itemCalculations[idx].customsValue.toLocaleString()}</div>
                         </div>
                         <div className="space-y-1">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">All Taxes</div>
                            <div className="font-mono font-bold text-sm text-blue-600">N$ {(calculations.itemCalculations[idx].duty + calculations.itemCalculations[idx].vat).toLocaleString()}</div>
                         </div>
                         <div className="space-y-1">
                            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Landed Price/Unit</div>
                            <div className="font-mono font-bold text-sm text-gray-900">N$ {calculations.itemCalculations[idx].totalPerItem.toFixed(2)}</div>
                         </div>
                         <div className="flex items-center justify-end">
                            {CATEGORIES[item.categoryIndex].duty && CATEGORIES[item.categoryIndex].duty >= 0.4 && (
                               <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold border border-red-100">
                                  <AlertCircle className="w-3 h-3" /> High Tax Warning
                               </div>
                            )}
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </section>

            {/* SME Profit Planner */}
            <section className="bg-gray-900 rounded-[3rem] p-12 text-white space-y-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                  <Banknote className="w-64 h-64" />
               </div>
               
               <div className="relative z-10 space-y-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                     <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                           <TrendingUp className="w-3 h-3" /> SME Intelligence
                        </div>
                        <h2 className="text-3xl font-bold uppercase">{t.profit}</h2>
                        <p className="text-gray-400 text-sm max-w-sm">Protect your margins by calculating the right selling prices across your entire basket.</p>
                     </div>
                     <div className="bg-white/5 rounded-[2rem] p-8 border border-white/10 min-w-[280px]">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase mb-4 tracking-widest">Profit Margin (%)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            inputMode="decimal"
                            value={profitMargin}
                            onChange={(e) => validateNumeric(e.target.value, setProfitMargin)}
                            placeholder="30"
                            className="w-full bg-white/5 border border-transparent rounded-2xl py-4 px-6 text-2xl font-bold font-mono focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          />
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xl font-bold text-blue-500">%</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/5">
                     <div className="space-y-8">
                        <div className="space-y-2">
                           <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Suggested Sale Price/Unit</div>
                           <div className="text-6xl font-light tracking-tighter text-blue-400">N$ {calculations.suggestionPerUnit.toFixed(2)}</div>
                           <p className="text-[10px] text-gray-500 italic">Sell at this price to make a {profitMargin}% profit after taxes.</p>
                        </div>
                        
                        <div className="flex gap-10">
                           <div className="space-y-1">
                              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Estimated Profit</div>
                              <div className="text-2xl font-bold text-white">N$ {calculations.margin.toLocaleString()}</div>
                           </div>
                           <div className="space-y-1">
                              <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Total Investment</div>
                              <div className="text-2xl font-bold text-gray-500">N$ {calculations.totalInvestment.toLocaleString()}</div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 flex gap-4">
                           <div className="p-3 bg-blue-500/10 rounded-2xl h-fit">
                              <HelpCircle className="w-5 h-5 text-blue-400" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-sm font-bold">Total Mark-up Logic</h4>
                              <p className="text-xs text-gray-400 leading-relaxed">
                                 The landed unit price accounts for cost price + shipping + duties + VAT. 
                                 Your margin is applied **on top** of the total landed cost.
                              </p>
                           </div>
                        </div>
                        <div className="bg-red-500/10 rounded-3xl p-6 border border-red-500/20 flex gap-4">
                           <div className="p-3 bg-red-500/10 rounded-2xl h-fit">
                              <AlertCircle className="w-5 h-5 text-red-400" />
                           </div>
                           <div className="space-y-1">
                              <h4 className="text-sm font-bold text-red-200">Surprise Fee Alert</h4>
                              <p className="text-xs text-red-400/70 leading-relaxed">
                                 Always add a buffer for **surprising courier storage fees** which NamRA doesn't control but will affect your profit.
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </section>
          </div>

          {/* Fixed Right Results Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <aside className="sticky top-10 space-y-6">
              <section className="bg-white rounded-[3rem] p-10 shadow-[0_20px_60px_rgb(0,0,0,0.06)] border border-gray-100 flex flex-col gap-12 group overflow-hidden relative">
                <div className="absolute top-0 right-[-10%] w-32 h-32 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 space-y-12">
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-blue-600">Total NamRA Due</h2>
                         <button 
                           onClick={() => setIsBusiness(!isBusiness)}
                           className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all ${isBusiness ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                         >
                           {isBusiness ? t.reclaim : 'SME Mode'}
                         </button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-mono text-gray-300">N$</span>
                          <span className="text-7xl font-light tracking-tighter leading-none text-gray-900 group-hover:text-blue-600 transition-colors duration-500">
                            {calculations.taxesOnly.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-3xl font-mono text-blue-600">
                            .{((calculations.taxesOnly % 1) * 100).toFixed(0).padStart(2, '0').substring(0, 2)}
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{t.pay} (CASH/CARD)</p>
                      </div>
                   </div>

                   <div className="space-y-6 pt-10 border-t border-gray-50 font-medium">
                      {[
                        { label: 'Basket Value (VDP)', value: calculations.customsValue, icon: Receipt },
                        { label: t.duty, value: calculations.duty, icon: Truck, accent: calculations.duty > calculations.customsValue * 0.4 ? 'text-red-500' : 'text-blue-600' },
                        { label: 'NamRA 10% Levy', value: calculations.uplift, icon: ShieldCheck },
                        { label: t.vat, value: calculations.vat, icon: TrendingUp, accent: isBusiness ? 'text-green-500' : 'text-blue-600' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 flex items-center gap-3">
                            <item.icon className="w-4 h-4 opacity-30" /> {item.label}
                          </span>
                          <span className={`font-mono font-bold ${item.accent || ''}`}>N${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      
                      <div className="pt-6 mt-6 border-t border-dashed border-gray-100 space-y-4">
                        <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest">Global Agent Fees (NAD)</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            inputMode="decimal"
                            value={agentFee}
                            onChange={(e) => validateNumeric(e.target.value, setAgentFee)}
                            placeholder="0.00"
                            className="w-full bg-gray-50 border-none rounded-2xl py-3 px-5 font-mono text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                          />
                        </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <button 
                        onClick={exportSummary}
                        className="w-full flex items-center justify-center gap-3 py-6 bg-blue-600 text-white rounded-3xl text-sm font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-blue-100"
                      >
                        <Download className="w-5 h-5" /> Export {t.ready} Summary
                      </button>
                      <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">Verified SAD 500 Formula</p>
                   </div>
                </div>
              </section>

              <div className="bg-red-50 border border-red-100 rounded-[2.5rem] p-8 space-y-4">
                 <div className="flex items-center gap-3 text-red-600">
                    <ShieldCheck className="w-5 h-5" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Seizure Prevention</h3>
                 </div>
                 <p className="text-[11px] text-red-900/70 leading-relaxed italic">
                    NamRA may burn or seize goods like used tires or uncertified honey. Always ensure your invoice values are not suspiciously low compared to market price.
                 </p>
              </div>
            </aside>
          </div>
        </main>

        <footer className="pt-20 pb-10 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-blue-600">SME Border Logic Pro</div>
              <div className="text-[10px] text-gray-400 font-mono tracking-tighter">Unified Compliance & Profit Suite</div>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-2">
             <p className="text-[10px] text-gray-400 font-mono text-center md:text-right max-w-sm">
                &copy; {new Date().getFullYear()} Not an official NamRA tool. Formulated using SAD 500 standards and SME research.
             </p>
             <div className="flex items-center justify-center md:justify-end gap-3 grayscale opacity-30">
                <div className="text-[10px] font-bold border border-gray-300 px-2 rounded tracking-widest">NamRA COMPLIANT</div>
                <div className="text-[10px] font-bold border border-gray-300 px-2 rounded tracking-widest">SAD 500 READY</div>
             </div>
          </div>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
      `}} />
    </div>
  );
}
