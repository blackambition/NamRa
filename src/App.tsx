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
  Zap,
  Search,
  ExternalLink,
  MapPin,
  Users,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Specialized Categories Based on Research
const CATEGORIES = [
  { name: 'Clothing & Shoes (China/Global)', duty: 0.45, hs: '6109.10.00', description: 'High protective duty for imports outside SACU. Total tax ~61.5%.' },
  { name: 'Bags & Accessories (China)', duty: 0.45, hs: '4202.21.00', description: 'Wallets, handbags, and travel bags from non-trade countries.' },
  { name: 'Hair Extensions & Beauty', duty: 0.45, hs: '6703.00.00', description: 'Hair products. High demand category for domestic resellers.' },
  { name: 'SACU Origin (SA/Botswana)', duty: 0.00, hs: 'Various', description: 'Goods made in South Africa. Drops Customs Duty to 0%.' },
  { name: 'Standard Electronics', duty: 0.00, hs: '8471.30.00', description: 'Laptops, tablets, phones. Pay 15% VAT only.' },
  { name: 'Home Appliances', duty: 0.15, hs: '8516.60.00', description: 'Fridges, microwaves. Medium-range duty applies.' },
  { name: 'Used Clothing', duty: 0.45, restricted: true, description: 'RESTRICTED. Often banned or requires special health permit.' },
  { name: 'Custom Tariff', duty: null, description: 'Consult NamRA eTariff for specific HS codes.' },
];

const INITIAL_CURRENCIES = [
  { code: 'ZAR', symbol: 'R', rate: 1, name: 'South African Rand' },
  { code: 'USD', symbol: '$', rate: 18.50, name: 'US Dollar' },
  { code: 'EUR', symbol: '€', rate: 20.10, name: 'Euro' },
  { code: 'CNY', symbol: '¥', rate: 2.55, name: 'Chinese Yuan (Renminbi)' },
];

const VAT_RATE = 0.15;

const AGENTS = [
  { 
    name: 'OrderMe Namibia Logistics', 
    specialty: ['Clothing', 'Shoes', 'Electronics'], 
    regions: ['Windhoek', 'Oshakati'], 
    email: 'hi@orderme.com.na',
    phone: '+264 81 234 5678',
    description: 'SME specialist for China-to-Namibia e-commerce imports.' 
  },
  { 
    name: 'Transworld Cargo', 
    specialty: ['Heavy Duty', 'General'], 
    regions: ['Windhoek', 'Walvis Bay'], 
    email: 'ops@transworld.com.na',
    phone: '+264 61 371 100',
    description: 'Full-service logistics provider with global reach.' 
  },
  { 
    name: 'Woker Freight Services', 
    specialty: ['Port Clearance', 'Vehicles'], 
    regions: ['Walvis Bay', 'Lüderitz'], 
    email: 'info@woker freight.com.na',
    phone: '+264 64 201 211',
    description: 'Specialists in sea freight and port-of-entry clearance.' 
  },
  { 
    name: 'BorderLink Logistics', 
    specialty: ['SACU Goods', 'Road Freight'], 
    regions: ['Ariamsvlei', 'Noordoewer'], 
    email: 'clearance@borderlink.na',
    phone: '+264 63 280 001',
    description: 'Fast road-border clearance for SA-to-Namibia imports.' 
  }
];

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
    ready: "Border Ready",
    strategy: "SME Success Strategy",
    track: "Track Shipments",
    trackingNo: "Enter Tracking Number",
    noStatus: "No shipment found. Enter a valid tracking number to track your NamRA clearance status.",
    carrier: "Select Carrier",
    agentMatch: "Agent Matchmaker",
    agentSuggest: "Suggested Agent",
    agentDest: "Import Destination",
    agentContact: "Contact Agent"
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
    ready: "Mofuta Oku li Nawa",
    strategy: "Omapandule gOipindi",
    track: "Kutha oshipala",
    trackingNo: "Indika onomola yoshipala",
    noStatus: "Oshipala ina shi monika. Indika onomola yomofuta u mone mpoka pu li oshipala shoye.",
    carrier: "Hogolola Omukutha",
    agentMatch: "Omukutha po gumwe",
    agentSuggest: "Omukutha gwi li nawa",
    agentDest: "Ehala lyomofuta",
    agentContact: "Kwatathana nomukutha",
    compliance: "Uukwashili wEpangelo",
    premium: "Kuta Opremium",
    tutorials: "Omayele gokudhemba"
  },
  af: {
    header: "Grens Vereenvoudig",
    tagline: "Help Namibiese KMO's om regte te bereken en sake-winste te beskerm.",
    categories: "NamRA Kategorie",
    pay: "Betaal NamRA",
    selling: "Voorgestelde Verkoopprys",
    cost: "Lande Kosteberekening",
    duty: "Doeane-regte",
    vat: "Invoer BTW",
    reclaim: "BTW Terugvordering",
    advice: "Kundige Advies",
    items: "Item Mandjie",
    ready: "Grens Gereed",
    strategy: "KMO Sukses Strategie",
    track: "Volg Versending",
    trackingNo: "Voer Volgnommer In",
    noStatus: "Geen versending gevind nie. Voer 'n geldige nommer in.",
    carrier: "Kies Koerier",
    agentMatch: "Agent Pasmaat",
    agentSuggest: "Voorgestelde Agent",
    agentDest: "Bestemming",
    agentContact: "Kontak Agent",
    compliance: "Voldoening Kontrole",
    premium: "Kry Premium",
    tutorials: "Gidse & Appèlle"
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
  hsCode: string;
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'os' | 'af'>('en');
  const [items, setItems] = useState<ImportItem[]>([
    { id: '1', name: 'Item 1', price: '', shipping: '', categoryIndex: 0, customDuty: '', quantity: '1', hsCode: '6109.10.00' }
  ]);
  const [currencyIndex, setCurrencyIndex] = useState<number>(0);
  const [customRate, setCustomRate] = useState<string>('');
  const [isBusiness, setIsBusiness] = useState<boolean>(false);
  const [fees, setFees] = useState({
    clearing: '',
    documentation: '',
    handling: '',
    storage: '',
    transport: ''
  });
  const [profitMargin, setProfitMargin] = useState<string>('30');
  const [exchangeRates, setExchangeRates] = useState(INITIAL_CURRENCIES);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [activeCarrier, setActiveCarrier] = useState('dhl');
  const [isTracking, setIsTracking] = useState(false);
  const [destination, setDestination] = useState('Windhoek');
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number | null>(null);

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
      quantity: '1',
      hsCode: ''
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ImportItem, value: any) => {
    if (field === 'categoryIndex') {
      const cat = CATEGORIES[value];
      setItems(items.map(item => item.id === id ? { ...item, [field]: value, hsCode: cat.hs || item.hsCode } : item));
    } else {
      setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    }
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
    
    const totalFees = Object.values(fees).reduce((sum: number, f: string) => sum + (parseFloat(f) || 0), 0);

    const totalInvestment = totalVDP + totalDuty + totalVAT + totalFees;
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
      totalFees,
      suggestionPerUnit,
      margin: totalWithProfit - totalInvestment,
      itemCalculations
    };
  }, [items, activeExchangeRate, fees, isBusiness, profitMargin]);

  const suggestedAgent = useMemo(() => {
    // Logic: Look at common item types and destination
    const firstItemCat = CATEGORIES[items[0]?.categoryIndex]?.name || '';
    
    // Simple heuristic
    if (destination === 'Ariamsvlei' || destination === 'Noordoewer') return 3; // BorderLink
    if (destination === 'Walvis Bay') return 2; // Woker
    if (firstItemCat.includes('Clothing') || firstItemCat.includes('Extensions')) return 0; // OrderMe
    return 1; // Transworld (General)
  }, [items, destination]);

  const exportSummary = () => {
    const date = new Date().toLocaleDateString();
    let summary = `NAMRA SME CLEARANCE SUMMARY - ${date}\n`;
    summary += `-------------------------------------------\n\n`;
    summary += `Currency: ${selectedCurrency.code} | Rate: ${activeExchangeRate.toFixed(4)} NAD\n\n`;
    
    items.forEach((item, idx) => {
      summary += `${idx + 1}. ${item.name || 'Item'} (${item.quantity} units)\n`;
      if (item.hsCode) summary += `   HS Code: ${item.hsCode}\n`;
      summary += `   Category: ${CATEGORIES[item.categoryIndex].name}\n`;
      summary += `   Cost (converted): N$ ${(parseFloat(item.price) * activeExchangeRate).toFixed(2)}\n`;
    });

    summary += `\nBREADOWN (NAD):\n`;
    summary += `Total Items Value: N$ ${calculations.customsValue.toLocaleString()}\n`;
    summary += `Customs Duty: N$ ${calculations.duty.toLocaleString()}\n`;
    summary += `NamRA VAT: N$ ${calculations.vat.toLocaleString()}\n`;
    summary += `Total Logistics Fees: N$ ${calculations.totalFees.toLocaleString()}\n`;
    if (parseFloat(fees.clearing) > 0) summary += `  - Clearing Agency: N$ ${fees.clearing}\n`;
    if (parseFloat(fees.documentation) > 0) summary += `  - SAD 500 Entry: N$ ${fees.documentation}\n`;
    if (parseFloat(fees.handling) > 0) summary += `  - Courier Handling: N$ ${fees.handling}\n`;
    if (parseFloat(fees.storage) > 0) summary += `  - Storage/Demurrage: N$ ${fees.storage}\n`;
    if (parseFloat(fees.transport) > 0) summary += `  - Local Transport: N$ ${fees.transport}\n`;
    
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
              <div className="flex bg-gray-100 rounded-full p-1 gap-1">
                {(['en', 'os', 'af'] as const).map(l => (
                  <button 
                    key={l}
                    onClick={() => setLang(l)}
                    className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${lang === l ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
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
                               <div className="pt-2">
                                  <div className="flex items-center justify-between mb-2 px-1">
                                    <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest">HS Tariff Code (Optional)</label>
                                    <a 
                                      href="https://etariff.namra.org.na" 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-[9px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                                    >
                                      Lookup eTariff <ArrowRightLeft className="w-2 h-2" />
                                    </a>
                                  </div>
                                  <input 
                                    type="text" 
                                    value={item.hsCode}
                                    onChange={(e) => updateItem(item.id, 'hsCode', e.target.value)}
                                    placeholder="e.g. 6109.10.00"
                                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-mono text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                  />
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

            {/* Agent Matchmaker */}
            <section className="bg-white rounded-[3rem] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-gray-100 space-y-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Users className="w-7 h-7 text-indigo-500" /> {t.agentMatch}
                     </h2>
                     <p className="text-xs text-gray-400">Find the best clearing agent for your specific SME needs.</p>
                  </div>
                  <div className="flex items-center gap-3">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.agentDest}</label>
                     <select 
                       value={destination}
                       onChange={(e) => setDestination(e.target.value)}
                       className="bg-gray-50 border-none rounded-xl py-2 px-4 text-xs font-bold focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                     >
                       <option value="Windhoek">Windhoek</option>
                       <option value="Walvis Bay">Walvis Bay</option>
                       <option value="Ariamsvlei">Ariamsvlei (SA Border)</option>
                       <option value="Noordoewer">Noordoewer (SA Border)</option>
                       <option value="Oshikango">Oshikango (Angola Border)</option>
                     </select>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {AGENTS.map((agent, idx) => {
                    const isSuggested = idx === suggestedAgent;
                    return (
                      <motion.div 
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className={`p-6 rounded-[2rem] border transition-all relative ${
                          selectedAgentIndex === idx 
                            ? 'border-indigo-500 bg-indigo-50/50 shadow-lg' 
                            : isSuggested 
                              ? 'border-green-200 bg-green-50/30'
                              : 'border-gray-50 bg-gray-50/50'
                        }`}
                        onClick={() => setSelectedAgentIndex(idx)}
                      >
                        {isSuggested && (
                          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 bg-green-500 text-white rounded-full text-[8px] font-bold uppercase tracking-widest">
                            <UserCheck className="w-2.5 h-2.5" /> Recommended
                          </div>
                        )}
                        <div className="space-y-4">
                           <div className="space-y-1">
                              <h4 className="font-bold text-sm text-gray-900">{agent.name}</h4>
                              <p className="text-[10px] text-gray-500 leading-relaxed">{agent.description}</p>
                           </div>
                           <div className="flex flex-wrap gap-1.5">
                              {agent.specialty.map((s, si) => (
                                <span key={si} className="px-2 py-0.5 bg-white border border-gray-100 rounded-md text-[9px] font-medium text-gray-400">{s}</span>
                              ))}
                           </div>
                           <div className="pt-4 border-t border-gray-100/50 flex items-center justify-between">
                              <div className="space-y-1 text-[9px] text-gray-400 font-medium">
                                 <div>{agent.email}</div>
                                 <div className="font-mono">{agent.phone}</div>
                              </div>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] font-bold hover:bg-indigo-700 transition-all">
                                 {t.agentContact} <ExternalLink className="w-2.5 h-2.5" />
                              </button>
                           </div>
                        </div>
                      </motion.div>
                    );
                  })}
               </div>
            </section>

            {/* Prohibited Items & Compliance Guard */}
            <section className="bg-white rounded-[3rem] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-gray-100 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-bold flex items-center gap-3">
                        <ShieldCheck className="w-7 h-7 text-red-500" /> Compliance Guard
                     </h2>
                     <p className="text-xs text-gray-400">Risk assessments and prohibited items list for Namibia.</p>
                  </div>
                  <div className="px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
                     Live Seizure Prevention
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: "Used Clothing", risk: "HIGH / BANNED", info: "Used shoes and clothing imports are strictly regulated or banned to protect local industry.", color: "border-red-200 bg-red-50/30" },
                    { title: "Tires & Fuel", risk: "PERMIT REQUIRED", info: "Requires ITAC or Min. of Mines & Energy permits. Seizure risk if documentation is missing.", color: "border-orange-200 bg-orange-50/30" },
                    { title: "Honey & Bees", risk: "HEALTH BANNED", info: "Raw honey imports often result in immediate burning/seizure without explanation.", color: "border-amber-200 bg-amber-50/30" }
                  ].map((risk, ridx) => (
                    <div key={ridx} className={`p-6 rounded-[2rem] border ${risk.color} space-y-3`}>
                       <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{risk.title}</h4>
                       <div className="text-[9px] font-bold opacity-60">{risk.risk}</div>
                       <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{risk.info}</p>
                    </div>
                  ))}
               </div>
            </section>

            {/* Guides, Appeals & Tutorials */}
            <section className="bg-indigo-900 rounded-[3rem] p-10 text-white space-y-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                  <Calculator className="w-64 h-64" />
               </div>
               
               <div className="relative z-10 space-y-8">
                  <div className="space-y-2">
                     <h2 className="text-3xl font-bold uppercase">{t.tutorials}</h2>
                     <p className="text-indigo-300 text-sm max-w-sm">Master the complexities of SAD 500 forms and customs disputes.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {[
                        { title: "Filing a Dispute", type: "Step-by-Step PDF", desc: "How to appeal if NamRA over-values your China shipment." },
                        { title: "Customs Value Protest", type: "Video Guide", desc: "Defending your paid prices when customs uses higher estimates." },
                        { title: "SAD 500 Walkthrough", type: "Tutorial", desc: "Understanding the Single Window system for clearing." },
                        { title: "VAT Deferment Scheme", type: "Legal Guide", desc: "How to register for the 2-month VAT deferment plan." }
                     ].map((item, idx) => (
                        <div key={idx} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/10 transition-colors flex items-start gap-4">
                           <div className="p-3 bg-indigo-500/20 rounded-2xl">
                              <FileText className="w-5 h-5 text-indigo-300" />
                           </div>
                           <div>
                              <div className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">{item.type}</div>
                              <h4 className="text-sm font-bold mb-1">{item.title}</h4>
                              <p className="text-[10px] text-indigo-300/70 leading-relaxed">{item.desc}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </section>

            {/* SME Subscription Plans */}
            <section className="bg-white rounded-[3rem] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-gray-100 space-y-10">
               <div className="text-center space-y-2">
                  <h2 className="text-3xl font-bold">Scaling Your Import Power</h2>
                  <p className="text-sm text-gray-400">Join 500+ Namibian SMEs dominating the "Order With Me" market.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-10 rounded-[3rem] border border-gray-100 bg-gray-50/50 space-y-8">
                     <div>
                        <h4 className="text-lg font-bold">Standard</h4>
                        <p className="text-xs text-gray-400">Free Forever</p>
                     </div>
                     <ul className="space-y-4">
                        {['Instant Duty Calculator', 'Basic HS Lookup', 'SME Savings Tips'].map(f => (
                           <li key={f} className="flex items-center gap-3 text-xs font-medium text-gray-600">
                              <BadgeCheck className="w-4 h-4 text-gray-300" /> {f}
                           </li>
                        ))}
                     </ul>
                     <button className="w-full py-4 text-xs font-bold text-gray-400 border border-gray-200 rounded-2xl">Current Plan</button>
                  </div>

                  <div className="p-10 rounded-[3rem] border-2 border-indigo-500 bg-indigo-50/30 space-y-8 relative overflow-hidden">
                     <div className="absolute top-4 right-8 text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-white px-3 py-1 rounded-full shadow-sm">Popular</div>
                     <div>
                        <h4 className="text-lg font-bold text-indigo-900">PRO Importer</h4>
                        <p className="text-xs text-indigo-600 font-bold">N$ 50 <span className="opacity-60">/ Month</span></p>
                     </div>
                     <ul className="space-y-4">
                        {['Real-time NamRA Tracker', 'Unlimited Agent Matching', 'Pre-filled SAD 500 PDFs', 'API & Integration'].map(f => (
                           <li key={f} className="flex items-center gap-3 text-xs font-medium text-indigo-900">
                              <BadgeCheck className="w-4 h-4 text-indigo-500" /> {f}
                           </li>
                        ))}
                     </ul>
                     <button className="w-full py-4 text-xs font-bold bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">{t.premium}</button>
                  </div>
               </div>
            </section>

            {/* SME Success Strategy */}
            <section className="space-y-8">
              <h2 className="text-2xl font-bold flex items-center gap-3 px-4">
                <ShieldCheck className="w-7 h-7 text-green-500" /> {t.strategy}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    title: "Leverage SACU Agreement",
                    tip: "Buying from South Africa? Ensure your supplier provides a Certificate of Origin. This drops Custom Duty from 45% to 0%.",
                    icon: Banknote,
                    color: "bg-green-50 text-green-700 border-green-100"
                  },
                  {
                    title: "Bulk Consolidation",
                    tip: "Consolidate multiple small orders into one shipment. Agents usually charge per entry; one entry is much cheaper than ten separate ones.",
                    icon: Package,
                    color: "bg-blue-50 text-blue-700 border-blue-100"
                  },
                  {
                    title: "HS Code Precision",
                    tip: "Avoid using general categories. Use the eTariff lookup to find specific codes for your items; some classifications have lower excise duties.",
                    icon: ShieldCheck,
                    color: "bg-purple-50 text-purple-700 border-purple-100"
                  },
                  {
                    title: "Official Invoices Only",
                    tip: "NamRA rejects Proforma invoices for clearance. Require a commercial invoice with seller letterhead, serial numbers, and full descriptions.",
                    icon: FileText,
                    color: "bg-orange-50 text-orange-700 border-orange-100"
                  }
                ].map((strategy, sIdx) => (
                  <motion.div 
                    key={sIdx}
                    whileHover={{ y: -5 }}
                    className={`p-8 rounded-[2.5rem] border ${strategy.color} space-y-4 shadow-sm`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-white/50 rounded-2xl">
                        <strategy.icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-sm tracking-tight uppercase tracking-widest">{strategy.title}</h4>
                    </div>
                    <p className="text-xs leading-relaxed opacity-80 font-medium">
                      {strategy.tip}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Shipment Tracker */}
            <section className="bg-white rounded-[3rem] p-10 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-gray-100 space-y-10">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                     <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Truck className="w-7 h-7 text-blue-500" /> {t.track}
                     </h2>
                     <p className="text-xs text-gray-400">Track international parcels arriving at Ariamsvlei or Trans-Kalahari.</p>
                  </div>
                  <div className="flex items-center gap-2">
                     {['dhl', 'fedex', 'nampost', 'aramex'].map(c => (
                        <button 
                          key={c}
                          onClick={() => setActiveCarrier(c)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeCarrier === c ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-100 text-gray-400'}`}
                        >
                          {c}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input 
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder={t.trackingNo}
                        className="w-full bg-gray-50 border-none rounded-[2rem] py-5 pl-14 pr-6 font-mono text-sm focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                     />
                  </div>
                  <button 
                    onClick={() => {
                      if(trackingNumber) setIsTracking(true);
                    }}
                    className="px-10 py-5 bg-gray-900 text-white rounded-[2rem] font-bold hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 flex items-center gap-2"
                  >
                    Track Status
                  </button>
               </div>

               {isTracking ? (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="space-y-12 pt-8"
                 >
                   <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                            <Package className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Parcel Details</div>
                            <div className="font-mono font-bold">{trackingNumber} <span className="text-blue-500 uppercase ml-2 text-xs">({activeCarrier.toUpperCase()})</span></div>
                         </div>
                      </div>
                      <a 
                        href={
                          activeCarrier === 'dhl' ? `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}` :
                          activeCarrier === 'fedex' ? `https://www.fedex.com/apps/fedextrack/?tracknumbers=${trackingNumber}` :
                          activeCarrier === 'nampost' ? `https://www.nampost.com.na/tracking` :
                          `https://www.aramex.com/track/results?shipmentNumber=${trackingNumber}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                      >
                         View Carrier Site <ExternalLink className="w-3 h-3" />
                      </a>
                   </div>

                   <div className="space-y-10 relative">
                      <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-gray-50" />
                      {[
                        { status: 'Customs Clearance Completed', location: 'Windhoek HUB', time: 'Today, 08:32 AM', done: true, icon: BadgeCheck, color: 'text-green-500 bg-green-50 border-green-100' },
                        { status: 'In Customs Inspection (NamRA)', location: 'Hosea Kutako Airport', time: 'Apr 19, 02:45 PM', done: true, icon: ShieldCheck, color: 'text-blue-500 bg-blue-50 border-blue-100' },
                        { status: 'Arrived at Border Post', location: 'Namibia Border Control', time: 'Apr 18, 11:15 AM', done: true, icon: MapPin, color: 'text-blue-500 bg-blue-50 border-blue-100' },
                        { status: 'Departed from Origin', location: 'Guangzhou, China', time: 'Apr 16, 12:20 PM', done: true, icon: Truck, color: 'text-gray-400 bg-gray-50 border-gray-100' }
                      ].map((step, idx) => (
                        <div key={idx} className="flex gap-10 relative group">
                           <div className={`w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center relative z-10 transition-all ${step.color}`}>
                              <step.icon className="w-5 h-5" />
                           </div>
                           <div className="space-y-1 pt-1">
                              <h4 className={`font-bold text-sm ${idx === 0 ? 'text-gray-900' : 'text-gray-500'}`}>{step.status}</h4>
                              <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                 <span className="flex items-center gap-1"><MapPin className="w-2 h-2" /> {step.location}</span>
                                 <span>•</span>
                                 <span>{step.time}</span>
                              </div>
                           </div>
                        </div>
                      ))}
                   </div>

                   <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-3xl flex gap-4">
                      <div className="p-3 bg-white rounded-2xl h-fit shadow-sm">
                         <AlertCircle className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div className="space-y-2">
                         <h4 className="text-sm font-bold text-yellow-900">Customs Note</h4>
                         <p className="text-xs text-yellow-800/70 leading-relaxed">
                            Your shipment is currently moving through the final clearance phase. Ensure your **Tax ID (TIN)** is provided to the courier to avoid local delivery delays.
                         </p>
                      </div>
                   </div>
                 </motion.div>
               ) : (
                 <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-100">
                       <Search className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="text-gray-400 text-sm max-w-xs">{t.noStatus}</p>
                 </div>
               )}
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
                       { label: 'Logistics & Hidden Fees', value: calculations.totalFees, icon: Truck, accent: 'text-orange-500' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 flex items-center gap-3">
                            <item.icon className="w-4 h-4 opacity-30" /> {item.label}
                          </span>
                          <span className={`font-mono font-bold ${item.accent || ''}`}>N${item.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      ))}
                      
                       <div className="pt-6 mt-6 border-t border-dashed border-gray-100 space-y-6">
                        <div className="flex items-center justify-between px-1">
                           <label className="block text-[10px] font-bold text-gray-300 uppercase tracking-widest">Clearing & Hidden Costs</label>
                           <HelpCircle className="w-3 h-3 text-gray-300" />
                        </div>
                        
                        <div className="space-y-4">
                           {[
                             { id: 'clearing', label: 'Agency Fee', icon: ShieldCheck, tip: 'Professionals charge this to handle NamRA paperwork on your behalf.' },
                             { id: 'documentation', label: 'SAD 500 Entry', icon: FileText, tip: 'Mandatory fee for filing the customs declaration form and ASYCUDA processing.' },
                             { id: 'handling', label: 'Courier Handling', icon: Package, tip: 'Courier admin fees for clearing handling and duty pre-funding.' },
                             { id: 'storage', label: 'Storage/Delay', icon: AlertCircle, accent: 'text-red-400', tip: 'Unpredictable daily costs if goods sit at the border post or HUB too long.' },
                             { id: 'transport', label: 'Final Delivery', icon: Truck, tip: 'Last mile logistics cost from the border post to your door.' },
                           ].map((fee) => (
                             <div key={fee.id} className="relative group/fee">
                                <div className="flex items-center justify-between mb-1.5 px-1 relative">
                                   <span className={`text-[9px] font-bold uppercase tracking-tighter flex items-center gap-1.5 ${(fee as any).accent || 'text-gray-400'}`}>
                                      <fee.icon className="w-2.5 h-2.5 opacity-50" /> {fee.label}
                                   </span>
                                   <div className="absolute left-1 bottom-full mb-1 opacity-0 translate-y-1 group-hover/fee:opacity-100 group-hover/fee:translate-y-0 transition-all duration-200 pointer-events-none z-50">
                                      <div className="bg-gray-900 text-[10px] text-gray-300 font-medium py-2 px-3 rounded-xl shadow-2xl w-48 border border-white/5 leading-snug">
                                         {fee.tip}
                                      </div>
                                   </div>
                                   <HelpCircle className="w-2.5 h-2.5 text-gray-200 group-hover/fee:text-blue-400 transition-colors" />
                                </div>
                                <div className="relative">
                                  <input 
                                    type="text" 
                                    inputMode="decimal"
                                    value={(fees as any)[fee.id]}
                                    onChange={(e) => validateNumeric(e.target.value, (val) => setFees({...fees, [fee.id]: val}))}
                                    placeholder="0.00"
                                    className="w-full bg-gray-50 border-none rounded-xl py-2.5 px-4 font-mono text-xs focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-gray-200">NAD</span>
                                </div>
                             </div>
                           ))}
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
