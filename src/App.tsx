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
  UserCheck,
  Eye,
  Settings,
  Scale,
  BrainCircuit,
  LayoutTemplate,
  PieChart,
  ClipboardCheck,
  Printer,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Specific SACU/NamRA Categories with HS Code Precision
const CATEGORIES = [
  { name: 'Apparel (T-Shirts, Knitted)', duty: 0.45, hs: '6109.10.00', description: 'Standard China/Global clothing. Protective rate applies.', permits: [] },
  { name: 'Apparel (Baby/Infant)', duty: 0.45, hs: '6111.20.00', description: 'Cotton baby clothes. Same duty, but size limits apply.', permits: [] },
  { name: 'Apparel (Hats/Caps)', duty: 0.20, hs: '6505.00.90', description: 'Lower duty (20%) for headwear compared to shirts.', permits: [] },
  { name: 'Bags (Leather Handbags)', duty: 0.45, hs: '4202.21.00', description: 'High duty on finished luxury/utility bags.', permits: [] },
  { name: 'Footwear (Sports/Sneakers)', duty: 0.30, hs: '6404.11.00', description: 'Textile uppers. Lower than clothing but still high.', permits: [] },
  { name: 'Hair Extensions (Synthetic)', duty: 0.45, hs: '6703.00.00', description: 'Major SME category from China. High duty.', permits: [] },
  { name: 'Beauty (Lip/Eye Makeup)', duty: 0.20, hs: '3304.10.00', description: 'Specific cosmetics often have lower customs duty (20%).', permits: [] },
  { name: 'Electronics (Phones/Tablets)', duty: 0.00, hs: '8517.13.00', description: 'DUTY FREE. Pay 15% VAT only. Large advantage.', permits: [] },
  { name: 'Electronics (Laptops/PC)', duty: 0.00, hs: '8471.30.00', description: 'DUTY FREE. Essential business equipment.', permits: [] },
  { name: 'Renewable (Solar Panels)', duty: 0.00, hs: '8541.42.00', description: 'DUTY FREE. Encouraged green energy import.', permits: [] },
  { name: 'Renewable (Solar Batteries)', duty: 0.00, hs: '8506.50.00', description: 'DUTY FREE. Lithium batteries for solar setups.', permits: [] },
  { name: 'Home Appliances (Microwaves)', duty: 0.15, hs: '8516.50.00', description: 'Medium duty (15%) for white goods.', permits: [] },
  { name: 'Home Appliances (Fridges)', duty: 0.15, hs: '8418.10.00', description: 'Standard 15% duty for cooling appliances.', permits: [] },
  { name: 'Auto Spares (Brake Pads)', duty: 0.20, hs: '8708.30.00', description: 'General automotive replacement parts rate.', permits: [] },
  { name: 'Sports Goods (Gym/Fitness)', duty: 0.075, hs: '9506.91.00', description: 'LOW DUTY (7.5%). High advantage for fitness SMEs.', permits: [] },
  { name: 'Toys (Plastic Action Figures)', duty: 0.175, hs: '9503.00.11', description: 'Lower duty (17.5%) than textiles/bags.', permits: [] },
  { name: 'Education (Printed Books)', duty: 0.00, vat: 0.00, hs: '4901.99.00', description: 'ZERO RATED. 0% Duty + 0% VAT. Essential.', permits: [] },
  { name: 'Medical (Wheelchairs)', duty: 0.00, hs: '8713.10.00', description: 'DUTY FREE. Humanitarian/Medical assistance.', permits: [] },
  { name: 'Honey & Foodstuffs', duty: 0.20, hs: '0409.00.00', description: 'Requires AMTA/Agriculture permits. High seizure risk if missing.', permits: ['Agriculture Permit', 'AMTA Entry'] },
  { name: 'Used Clothing (Bales)', duty: 0.45, hs: '6309.00.00', description: 'STRICTLY REGULATED. Risk of health inspection and fumigation certs.', permits: ['Health Certificate', 'Fumigation Certificate'] },
  { name: 'SACU Origin (SA/Botswana)', duty: 0.00, hs: 'Varied', description: '0% CUSTOMS DUTY. Requires SADC/SACU Certificate.', permits: ['SADC Certificate of Origin'] },
  { name: 'Custom HS Code', duty: null, description: 'Consult NamRA eTariff for specific excise/duty.', permits: [] },
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
    description: 'SME specialist for China-to-Namibia e-commerce imports.',
    baseFee: 450
  },
  { 
    name: 'Transworld Cargo', 
    specialty: ['Heavy Duty', 'General'], 
    regions: ['Windhoek', 'Walvis Bay'], 
    email: 'ops@transworld.com.na',
    phone: '+264 61 371 100',
    description: 'Full-service logistics provider with global reach.',
    baseFee: 1250
  },
  { 
    name: 'Woker Freight Services', 
    specialty: ['Port Clearance', 'Vehicles'], 
    regions: ['Walvis Bay', 'Lüderitz'], 
    email: 'info@woker-freight.com.na',
    phone: '+264 64 201 211',
    description: 'Specialists in sea freight and port-of-entry clearance.',
    baseFee: 850
  },
  { 
    name: 'BorderLink Logistics', 
    specialty: ['SACU Goods', 'Road Freight'], 
    regions: ['Ariamsvlei', 'Noordoewer'], 
    email: 'clearance@borderlink.na',
    phone: '+264 63 280 001',
    description: 'Fast road-border clearance for SA-to-Namibia imports.',
    baseFee: 650
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
  retailPrice: string;
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'os' | 'af'>('en');
  const [activeTab, setActiveTab ] = useState<'basket' | 'profit' | 'groupage' | 'tracking' | 'agents' | 'compliance' | 'sad500' | 'strategies'>('basket');
  const [items, setItems] = useState<ImportItem[]>([
    { id: '1', name: 'Item 1', price: '', shipping: '', categoryIndex: 0, customDuty: '', quantity: '1', hsCode: '6109.10.00', retailPrice: '' }
  ]);
  const [participants, setParticipants] = useState<{ id: string; name: string; itemId: string }[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<{ hsCode: string; duty: number; reason: string } | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiDraftItem, setAiDraftItem] = useState('');
  const [sad500Field, setSad500Field] = useState<number | null>(null);
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
      hsCode: '',
      retailPrice: ''
    }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    if (field === 'categoryIndex') {
      const cat = CATEGORIES[value];
      setItems(items.map(item => item.id === id ? { ...item, [field]: value, hsCode: cat.hs || item.hsCode } : item));
    } else {
      setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
    }
  };

  const findHSCodeWithAI = async () => {
    if (!aiDraftItem) return;
    setIsAiLoading(true);
    try {
      const prompt = `Identify the NamRA (Namibia) HS Code and Customs Duty Rate for this item: "${aiDraftItem}". 
      Return MUST be a JSON object with: 
      "hsCode" (string), 
      "duty" (number, 0 to 1), 
      "reason" (string, explaining why this code).
      Focus on SACU tariff common for China imports.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hsCode: { type: Type.STRING },
              duty: { type: Type.NUMBER },
              reason: { type: Type.STRING }
            },
            required: ["hsCode", "duty", "reason"]
          }
        }
      });

      const data = JSON.parse(result.text);
      setAiAnalysis(data);
    } catch (error) {
      console.error("AI Finder failed:", error);
    } finally {
      setIsAiLoading(false);
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
      const category = CATEGORIES[item.categoryIndex];
      const dutyRate = category.duty !== null 
        ? category.duty! 
        : (parseFloat(item.customDuty) / 100 || 0);

      const pNAD = pRaw * activeExchangeRate;
      const sNAD = sRaw * activeExchangeRate;
      const customsValue = pNAD + sNAD;
      const duty = customsValue * dutyRate;
      
      // NAMRA VAT: 15% on (VDP + Duty + 10% VDP)
      const uplift = customsValue * 0.10;
      const vatBase = customsValue + duty + uplift;
      const vatRate = (category as any).vat !== undefined ? (category as any).vat : VAT_RATE;
      const vat = vatBase * vatRate;

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
    // Priority logic for SME matching
    const hasClothing = items.some(i => CATEGORIES[i.categoryIndex].name.includes('Apparel') || CATEGORIES[i.categoryIndex].name.includes('Hair'));
    const hasVehicles = items.some(i => CATEGORIES[i.categoryIndex].name.includes('Auto'));
    const hasSACU = items.some(i => CATEGORIES[i.categoryIndex].name.includes('SACU'));

    if (destination === 'Ariamsvlei' || destination === 'Noordoewer') return 3; // BorderLink
    if (destination === 'Walvis Bay') return 2; // Woker
    if (hasSACU) return 3; // BorderLink specialist for SACU
    if (hasClothing) return 0; // OrderMe
    if (hasVehicles) return 2; // Woker
    return 1; // Transworld
  }, [items, destination]);

  // Apply Agent Fee automatically when selected
  useEffect(() => {
    if (selectedAgentIndex !== null) {
      const agent = AGENTS[selectedAgentIndex];
      setFees(prev => ({ ...prev, clearing: agent.baseFee.toString() }));
    }
  }, [selectedAgentIndex]);

  const printCertificate = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#1A1A1A] font-sans selection:bg-blue-100 p-4 md:p-8 print:p-0 print:bg-white">
      {/* Print-only Certificate View */}
      <div className="hidden print:block p-10 space-y-8 bg-white text-black min-h-screen w-full">
         <div className="flex justify-between items-start border-b-2 border-black pb-8">
            <div className="space-y-2">
               <h1 className="text-3xl font-black uppercase tracking-tighter italic">SME Border Logic Pro</h1>
               <div className="text-xs font-bold text-gray-500">Official Customs Readiness Summary</div>
            </div>
            <div className="text-right space-y-1">
               <div className="font-bold text-sm">Issue Date: {new Date().toLocaleDateString()}</div>
               <div className="text-[10px] text-gray-400">Ref: BORDER-{Math.random().toString(36).substr(2,6).toUpperCase()}</div>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-10">
            <div className="space-y-6">
               <h3 className="font-bold border-b border-gray-100 pb-2 uppercase text-xs tracking-widest">Importer Details</h3>
               <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Type:</span> <span className="font-bold">{isBusiness ? 'Registered SME' : 'Individual'}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Target Region:</span> <span className="font-bold uppercase italic">{destination}</span></div>
                  {selectedAgentIndex !== null && (
                    <div className="flex justify-between"><span className="text-gray-500">Selected Agent:</span> <span className="font-bold">{AGENTS[selectedAgentIndex].name}</span></div>
                  )}
               </div>
            </div>
            <div className="space-y-6">
               <h3 className="font-bold border-b border-gray-100 pb-2 uppercase text-xs tracking-widest">Financial Summary</h3>
               <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Investment:</span> <span className="font-bold">N$ {calculations.totalInvestment.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Taxes to Pay:</span> <span className="font-bold text-blue-600 underline">N$ {calculations.taxesOnly.toLocaleString()}</span></div>
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <h3 className="font-bold bg-black text-white px-4 py-2 uppercase text-[10px] tracking-widest">Item Declaration</h3>
            <table className="w-full text-xs">
               <thead>
                  <tr className="border-b-2 border-gray-100 text-left">
                     <th className="py-2">Item</th>
                     <th className="py-2">HS Code</th>
                     <th className="py-2">Qty</th>
                     <th className="py-2">Duty</th>
                     <th className="py-2">VAT</th>
                     <th className="py-2 text-right">Unit Landed</th>
                  </tr>
               </thead>
               <tbody>
                  {items.map((item, i) => {
                     const calc = calculations.itemCalculations[i];
                     return (
                        <tr key={i} className="border-b border-gray-50">
                           <td className="py-3 font-bold">{item.name}</td>
                           <td className="py-3 font-mono">{item.hsCode || '-'}</td>
                           <td className="py-3">{item.quantity}</td>
                           <td className="py-3">N$ {calc.duty.toFixed(2)}</td>
                           <td className="py-3">N$ {calc.vat.toFixed(2)}</td>
                           <td className="py-3 text-right font-bold">N$ {calc.totalPerItem.toFixed(2)}</td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>

         <div className="pt-20 text-[8px] text-gray-400 text-center italic">
            This document is a readiness guide generated by SME Border Logic Pro. NamRA final assessments may vary based on inspection.
         </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-10 print:hidden relative">
        {/* Modern Interactive Sidebar (Floating Desktop / Fixed Mobile) */}
        <div className="fixed left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-2 p-2 bg-white/80 backdrop-blur-xl border border-gray-100 rounded-[3rem] shadow-2xl z-50">
           {[
             { id: 'basket', icon: LayoutTemplate, label: 'Calculator', color: 'text-blue-500' },
             { id: 'profit', icon: PieChart, label: 'Margins', color: 'text-emerald-500' },
             { id: 'groupage', icon: Users, label: 'Groupage', color: 'text-indigo-500' },
             { id: 'sad500', icon: FileText, label: 'SAD 500', color: 'text-amber-500' },
             { id: 'strategies', icon: Lightbulb, label: 'Strategies', color: 'text-yellow-500' },
             { id: 'compliance', icon: ShieldCheck, label: 'Risk Guard', color: 'text-red-500' },
             { id: 'tracking', icon: Truck, label: 'Tracker', color: 'text-cyan-500' },
             { id: 'agents', icon: UserCheck, label: 'Agents', color: 'text-purple-500' },
           ].map((btn) => (
             <button
               key={btn.id}
               onClick={() => setActiveTab(btn.id as any)}
               className={`group relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${activeTab === btn.id ? 'bg-black text-white shadow-xl' : 'hover:bg-gray-50'}`}
             >
               <btn.icon className={`w-5 h-5 ${activeTab === btn.id ? 'text-white' : btn.color}`} />
               <span className="absolute left-full ml-4 px-3 py-1.5 bg-black text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest z-[60]">
                 {btn.label}
               </span>
               {activeTab === btn.id && (
                 <motion.div layoutId="side-blob" className="absolute -left-1 w-1 h-6 bg-white rounded-r-full" />
               )}
             </button>
           ))}
        </div>

        {/* Mobile Mini Nav */}
        <div className="xl:hidden flex overflow-x-auto gap-4 pb-4 no-scrollbar border-b border-gray-50">
           {[
             { id: 'basket', label: 'Items' },
             { id: 'profit', label: 'Margins' },
             { id: 'groupage', label: 'Groupage' },
             { id: 'sad500', label: 'SAD500' },
             { id: 'strategies', label: 'Strategies' },
             { id: 'compliance', label: 'Guard' },
           ].map((btn) => (
             <button
               key={btn.id}
               onClick={() => setActiveTab(btn.id as any)}
               className={`px-6 py-2 rounded-full whitespace-nowrap text-xs font-bold uppercase tracking-widest transition-all ${activeTab === btn.id ? 'bg-black text-white' : 'bg-gray-100 text-gray-400'}`}
             >
               {btn.label}
             </button>
           ))}
        </div>
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-8 border-b border-gray-100 pb-12 xl:pl-20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
               <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                  <BadgeCheck className="w-3 h-3" /> SME Border Logic Pro
               </div>
               <button 
                 onClick={printCertificate}
                 className="flex items-center gap-2 px-3 py-1 bg-gray-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
               >
                 <Printer className="w-3 h-3" /> Certificate
               </button>
            </div>
            
            <h1 className="text-6xl font-light tracking-tight leading-tight">
              {activeTab === 'basket' ? 'Item Basket' : activeTab === 'profit' ? 'Profit Margin' : activeTab === 'groupage' ? 'Order With Me' : activeTab === 'sad500' ? 'SAD 500 Entry' : activeTab === 'compliance' ? 'Compliance' : activeTab === 'strategies' ? 'SME Strategies' : 'Border Hub'}
            </h1>
          </div>
          
          <div className="flex flex-col items-end gap-3 shrink-0">
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

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:pl-20">
          <div className="lg:col-span-8 space-y-12">
            
            {/* View Switching Logic */}
            <AnimatePresence mode="wait">
              {activeTab === 'basket' && (
                <motion.div 
                  key="basket" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  {/* AI HS Finder Interface */}
                  <section className="bg-indigo-900 rounded-[3rem] p-10 text-white relative overflow-hidden">
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                           <BrainCircuit className="w-6 h-6 text-indigo-300" />
                        </div>
                        <h2 className="text-2xl font-bold italic">AI HS Code Intelligence</h2>
                      </div>
                      <p className="text-indigo-200 text-xs max-w-lg leading-relaxed">
                        Describe what you are importing (e.g. "Cotton socks for men"), and Gemini will find the exact NamRA duty rate automatically.
                      </p>
                      
                      <div className="flex gap-4">
                        <input 
                          value={aiDraftItem}
                          onChange={(e) => setAiDraftItem(e.target.value)}
                          placeholder="e.g. Used leather handbags from UK..."
                          className="flex-1 bg-white/10 border-none rounded-2xl py-5 px-8 text-white placeholder:text-indigo-400 focus:ring-2 focus:ring-indigo-400 outline-none transition-all"
                        />
                        <button 
                          onClick={findHSCodeWithAI}
                          disabled={isAiLoading || !aiDraftItem}
                          className="bg-white text-indigo-900 px-10 py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                          {isAiLoading ? 'Analyzing...' : 'Analyze'}
                        </button>
                      </div>

                      {aiAnalysis && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white/10 backdrop-blur-md rounded-[2rem] p-8 border border-white/10 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                             <div className="space-y-1">
                                <div className="text-[10px] font-bold text-indigo-300 uppercase">Suggested HS Code</div>
                                <div className="text-3xl font-mono font-black">{aiAnalysis.hsCode}</div>
                             </div>
                             <div className="text-right space-y-1">
                                <div className="text-[10px] font-bold text-indigo-300 uppercase">Customs Duty</div>
                                <div className="text-3xl font-black text-emerald-400">{(aiAnalysis.duty * 100)}%</div>
                             </div>
                          </div>
                          <div className="pt-4 border-t border-white/5 text-xs text-indigo-100 italic leading-relaxed">
                             " {aiAnalysis.reason} "
                          </div>
                        </motion.div>
                      )}
                    </div>
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px]" />
                  </section>

                  {/* Namibian Importer's Advice */}
                  <section className="bg-amber-50 border border-amber-100 rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-10 group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/2 group-hover:rotate-12 transition-transform duration-700">
                      <Truck className="w-64 h-64 text-amber-900" />
                    </div>
                    <div className="relative z-10 space-y-6 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-200">
                          <AlertCircle className="w-5 h-5 text-amber-900" />
                        </div>
                        <h3 className="text-amber-900 font-bold uppercase tracking-widest text-xs">NamRA Pro-Tip</h3>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-2xl font-bold text-amber-950 uppercase tracking-tighter">Clothing attracts 45% Duty</h4>
                        <p className="text-amber-900/60 text-xs leading-relaxed font-black uppercase tracking-widest">
                          Items from China often hit 61.5% total tax (45% Duty + 16.5% VAT). 
                          <span className="text-amber-600 ml-1">Always ask for Certificate of Origin for SADC items.</span>
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 space-y-3 relative z-10 w-full md:w-auto">
                      <button className="w-full px-8 py-5 bg-amber-950 text-white rounded-[1.5rem] text-[10px] font-bold uppercase tracking-[0.2em] hover:shadow-2xl hover:bg-black transition-all">
                        {t.checkSADC}
                      </button>
                    </div>
                  </section>

                  {/* Item Basket Stats Overlay (Floating on mobile) */}
                  <div className="md:hidden fixed bottom-6 left-6 right-6 z-[100]">
                     <button 
                       onClick={() => setActiveTab('profit')}
                       className="w-full bg-black text-white p-6 rounded-[2rem] shadow-2xl flex justify-between items-center"
                     >
                        <div className="flex items-center gap-3">
                           <Calculator className="w-5 h-5 text-blue-400" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Total Due</span>
                        </div>
                        <div className="text-xl font-black">N$ {calculations.taxesOnly.toLocaleString()}</div>
                     </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'profit' && (
                <motion.div 
                  key="profit" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-8">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                           <Scale className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                           <h2 className="text-2xl font-bold">Local Price Benchmarking</h2>
                           <p className="text-xs text-gray-400">Compare your landed cost against Namibian retail prices.</p>
                        </div>
                     </div>

                     <div className="space-y-6">
                        {items.map((item, idx) => {
                          const calc = calculations.itemCalculations[idx];
                          const localRetail = parseFloat(item.retailPrice) || 0;
                          const margin = localRetail - calc.totalPerItem;
                          const marginPct = localRetail > 0 ? (margin / localRetail) * 100 : 0;

                          return (
                            <div key={item.id} className="p-6 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
                               <div className="flex-1 space-y-1 text-center md:text-left">
                                  <div className="text-xs font-bold text-gray-400 uppercase">{item.name || `Item ${idx+1}`}</div>
                                  <div className="text-lg font-bold">Landed: N$ {calc.totalPerItem.toFixed(2)}</div>
                               </div>
                               <div className="flex-1 w-full">
                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Local Retail Price (N$)</label>
                                  <input 
                                    value={item.retailPrice}
                                    onChange={(e) => updateItem(item.id, 'retailPrice', e.target.value)}
                                    placeholder="e.g. 599.00"
                                    className="w-full bg-white border-none rounded-xl py-3 px-4 font-mono text-sm focus:ring-1 focus:ring-emerald-500 outline-none shadow-sm"
                                  />
                               </div>
                               <div className={`flex-1 text-center p-4 rounded-2xl min-w-[140px] ${margin > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                  <div className="text-[10px] uppercase font-bold">{margin > 0 ? 'Potential Profit' : 'Loss / Low Margin'}</div>
                                  <div className="text-xl font-black">N$ {Math.abs(margin).toFixed(2)}</div>
                                  <div className="text-[10px] font-bold">{marginPct.toFixed(1)}% Margin</div>
                               </div>
                            </div>
                          );
                        })}
                     </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'groupage' && (
                <motion.div 
                  key="groupage" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                              <Users className="w-6 h-6 text-indigo-500" />
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold">Order With Me: Cost Split</h2>
                              <p className="text-xs text-gray-400">Share logistics costs across multiple group participants.</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => setParticipants([...participants, { id: Math.random().toString(), name: `Member ${participants.length + 1}`, itemId: items[0]?.id || '' }])}
                          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:shadow-lg transition-all"
                        >
                          Add Member
                        </button>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {participants.length === 0 ? (
                           <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem] text-gray-400 text-sm italic">
                              Add members to start splitting costs for this shipment.
                           </div>
                        ) : participants.map((p, pIdx) => {
                           const sharedLogistics = calculations.totalFees / participants.length;
                           const itemIdx = items.findIndex(i => i.id === p.itemId);
                           const itemCalc = itemIdx !== -1 ? calculations.itemCalculations[itemIdx] : null;
                           const totalMemberCost = (itemCalc?.customsValue || 0) + (itemCalc?.duty || 0) + (itemCalc?.vat || 0) + sharedLogistics;

                           return (
                             <div key={p.id} className="p-8 rounded-[2.5rem] border border-gray-100 bg-gray-50/50 space-y-6">
                                <div className="flex justify-between items-center">
                                   <input 
                                     value={p.name}
                                     onChange={(e) => setParticipants(participants.map(part => part.id === p.id ? { ...part, name: e.target.value } : part))}
                                     className="bg-transparent border-none font-bold text-gray-900 focus:ring-0 text-lg outline-none w-1/2"
                                   />
                                   <button onClick={() => setParticipants(participants.filter(part => part.id !== p.id))} className="text-red-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                </div>
                                <div className="space-y-4">
                                   <select 
                                     value={p.itemId}
                                     onChange={(e) => setParticipants(participants.map(part => part.id === p.id ? { ...part, itemId: e.target.value } : part))}
                                     className="w-full bg-white border-none rounded-2xl py-3 px-4 text-xs font-bold shadow-sm"
                                   >
                                      {items.map(i => <option key={i.id} value={i.id}>{i.name || `Item ${items.indexOf(i) + 1}`}</option>)}
                                   </select>
                                   <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                                      <div className="space-y-1">
                                         <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Share to Pay</div>
                                         <div className="text-2xl font-black text-indigo-600">N$ {totalMemberCost.toFixed(2)}</div>
                                      </div>
                                      <div className="text-right text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                         +N$ {sharedLogistics.toFixed(2)} LOGISTICS
                                      </div>
                                   </div>
                                </div>
                             </div>
                           )
                        })}
                     </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'sad500' && (
                <motion.div 
                  key="sad500" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-10"
                >
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <LayoutTemplate className="w-6 h-6 text-amber-500" />
                     </div>
                     <div>
                        <h2 className="text-2xl font-bold">NamRA SAD 500 Virtualizer</h2>
                        <p className="text-xs text-gray-400">Hover over the form fields to see where to enter your calculated data.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                     <div className="relative border-4 border-gray-300 rounded-xl p-8 bg-gray-50 aspect-[1/1.4] shadow-inner">
                        <div className="absolute top-4 left-4 h-8 w-1/3 bg-white border border-gray-200" />
                        <div className="absolute top-4 right-4 h-20 w-1/4 bg-white border border-gray-200" />
                        
                        <div 
                          onMouseEnter={() => setSad500Field(22)}
                          className={`absolute top-32 left-8 right-8 h-10 border-2 rounded transition-all cursor-help flex items-center px-4 ${sad500Field === 22 ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}
                        >
                           <span className="text-[8px] font-bold text-gray-400 uppercase">22. Total Invoice</span>
                        </div>

                        <div 
                          onMouseEnter={() => setSad500Field(33)}
                          className={`absolute top-52 left-8 w-1/3 h-10 border-2 rounded transition-all cursor-help flex items-center px-4 ${sad500Field === 33 ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}
                        >
                           <span className="text-[8px] font-bold text-gray-400 uppercase">33. HS Code</span>
                        </div>

                        <div 
                          onMouseEnter={() => setSad500Field(47)}
                          className={`absolute bottom-20 left-8 right-8 h-32 border-2 rounded transition-all cursor-help flex items-center justify-center ${sad500Field === 47 ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-white'}`}
                        >
                           <span className="text-[8px] font-bold text-gray-400 uppercase">47. Duty Breakdown</span>
                        </div>

                        <p className="absolute bottom-4 left-0 right-0 text-center text-[6px] text-gray-300 uppercase tracking-widest font-black italic">NamRA Official Declaration Mapper</p>
                     </div>

                     <div className="space-y-6">
                        <div className={`p-6 rounded-[2rem] border transition-all ${sad500Field === 22 ? 'border-amber-500 bg-amber-50 shadow-lg' : 'border-gray-50 bg-gray-50/50 opacity-60'}`}>
                           <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Field 22</div>
                           <div className="font-bold text-lg">Total CIF Invoice</div>
                           <p className="text-xs text-gray-500 mt-2">Enter your converted item value here: <span className="font-bold text-amber-600">N$ {calculations.customsValue.toLocaleString()}</span></p>
                        </div>
                        <div className={`p-6 rounded-[2rem] border transition-all ${sad500Field === 33 ? 'border-amber-500 bg-amber-50 shadow-lg' : 'border-gray-50 bg-gray-50/50 opacity-60'}`}>
                           <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Field 33</div>
                           <div className="font-bold text-lg">Harmonized Code</div>
                           <p className="text-xs text-gray-500 mt-2">Essential 8-digit tariff identifier. First item: <span className="font-mono font-bold text-amber-600">{items[0]?.hsCode || 'Not Set'}</span></p>
                        </div>
                        <div className={`p-6 rounded-[2rem] border transition-all ${sad500Field === 47 ? 'border-amber-500 bg-amber-50 shadow-lg' : 'border-gray-50 bg-gray-50/50 opacity-60'}`}>
                           <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Field 47</div>
                           <div className="font-bold text-lg">Taxes & Duties</div>
                           <div className="grid grid-cols-2 gap-6 mt-4">
                              <div className="space-y-1">
                                 <div className="text-[8px] text-gray-400 uppercase font-black tracking-widest">Duty (NAD)</div>
                                 <div className="text-lg font-black text-amber-600">N$ {calculations.duty.toFixed(2)}</div>
                              </div>
                              <div className="space-y-1">
                                 <div className="text-[8px] text-gray-400 uppercase font-black tracking-widest">VAT (NAD)</div>
                                 <div className="text-lg font-black text-amber-600">N$ {calculations.vat.toFixed(2)}</div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'compliance' && (
                <motion.div 
                  key="compliance" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-12"
                >
                  <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-8">
                     <div className="flex items-center justify-between">
                        <div className="space-y-1">
                           <h2 className="text-2xl font-bold flex items-center gap-3">
                              <ShieldCheck className="w-7 h-7 text-red-500" /> Permitting Requirement
                           </h2>
                           <p className="text-xs text-gray-400">Automated checklist of missing permits for your specific items.</p>
                        </div>
                        <div className="px-4 py-2 bg-red-50 text-red-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
                           Stop Seizures
                        </div>
                     </div>

                     <div className="space-y-4">
                        {items.flatMap(item => {
                          const cat = CATEGORIES[item.categoryIndex];
                          return (cat.permits || []).map(permit => ({ permit, itemName: item.name || `Item ${items.indexOf(item)+1}` }));
                        }).length === 0 ? (
                           <div className="p-12 text-center bg-emerald-50 text-emerald-700 rounded-[2.5rem] border-2 border-dashed border-emerald-100 italic text-sm font-medium">
                              No restrictive permits identified for this import basket. Proceed with caution.
                           </div>
                        ) : (
                           items.flatMap(item => {
                             const cat = CATEGORIES[item.categoryIndex];
                             return (cat.permits || []).map(permit => (
                               <div key={`${item.id}-${permit}`} className="flex items-center gap-6 p-8 bg-red-50 border border-red-100 rounded-[2.5rem] group hover:bg-white transition-all">
                                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                     <ClipboardCheck className="w-6 h-6 text-red-500" />
                                  </div>
                                  <div className="flex-1">
                                     <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1 italic">Required for: {item.name || 'this item'}</div>
                                     <div className="text-xl font-bold text-gray-900">{permit}</div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                     <a href="https://namra.org.na" target="_blank" className="px-6 py-3 bg-white rounded-xl text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-100 hover:bg-red-50 transition-colors shadow-sm">
                                        Source Form
                                     </a>
                                  </div>
                               </div>
                             ));
                           })
                        )}
                     </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'strategies' && (
                <motion.div 
                  key="strategies" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <section className="bg-yellow-50 border border-yellow-200 rounded-[3rem] p-12 space-y-12 relative overflow-hidden">
                    <div className="absolute top-[-5%] right-[-5%] opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                      <Rocket className="w-96 h-96 text-yellow-600" />
                    </div>
                    
                    <div className="relative z-10 space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400 text-black rounded-full text-[10px] font-bold uppercase tracking-widest">
                        <Lightbulb className="w-3 h-3" /> SME Profit Protection
                      </div>
                      <h2 className="text-4xl font-bold tracking-tight uppercase italic leading-none max-w-xl">Duty Avoidance &<br/>Optimization Strategies</h2>
                      <p className="text-sm text-yellow-900/60 max-w-sm leading-relaxed">Legal methods to reduce your NamRA bill and increase your margin on imported goods.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                      {/* Strategy 1: SACU Prioritization */}
                      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-yellow-200/50 space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center">
                           <Banknote className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-xl font-bold italic uppercase tracking-tighter">1. SACU Origin Advantage</h3>
                           <p className="text-xs text-gray-500 leading-relaxed font-medium">
                             Namibia is part of the Southern African Customs Union. Goods manufactured in **South Africa, Botswana, or Lesotho** carry **0% Customs Duty**.
                           </p>
                           <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex gap-3 italic">
                              <Info className="w-4 h-4 text-green-600 shrink-0" />
                              <p className="text-[10px] text-green-800 font-medium leading-relaxed">
                                 Sourcing from SA suppliers saves you ~45% compared to China. Require a **Certificate of Origin** to prove manufacturing location.
                              </p>
                           </div>
                        </div>
                      </div>

                      {/* Strategy 2: Classification Nuances */}
                      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-yellow-200/50 space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                           <BrainCircuit className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-xl font-bold italic uppercase tracking-tighter">2. The "Parts" Strategy</h3>
                           <p className="text-xs text-gray-500 leading-relaxed font-medium">
                             NamRA often taxes finished consumer goods higher than components. Correct classification can yield huge savings.
                           </p>
                           <div className="space-y-2">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest border-b border-gray-100 pb-2">
                                 <span>Item Category</span>
                                 <span>Typical Duty</span>
                              </div>
                              <div className="flex justify-between text-xs font-medium">
                                 <span className="text-red-500">Finished Handbag</span>
                                 <span className="font-bold">45%</span>
                              </div>
                              <div className="flex justify-between text-xs font-medium">
                                 <span className="text-emerald-500">Bag Components (Repair)</span>
                                 <span className="font-bold text-emerald-600">~20%</span>
                              </div>
                           </div>
                        </div>
                      </div>

                      {/* Strategy 3: AGOA & SADC */}
                      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-yellow-200/50 space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                           <Scale className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-xl font-bold italic uppercase tracking-tighter">3. Regional Trade Treaties</h3>
                           <p className="text-xs text-gray-500 leading-relaxed font-medium">
                             Leverage agreements like AGOA (US/EU Textile preferences) or SADC certificates for non-SACU regional members.
                           </p>
                           <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Actionable Tips:</p>
                           <ul className="space-y-2">
                              <li className="flex items-center gap-2 text-[10px] font-medium"><BadgeCheck className="w-3 h-3 text-indigo-500" /> Insist on a EUR.1 certificate from EU suppliers.</li>
                              <li className="flex items-center gap-2 text-[10px] font-medium"><BadgeCheck className="w-3 h-3 text-indigo-500" /> Factor in freight costs early (Duty applies to CIF).</li>
                           </ul>
                        </div>
                      </div>

                      {/* Strategy 4: Bulk Groupage */}
                      <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-yellow-200/50 space-y-6">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                           <Users className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="space-y-3">
                           <h3 className="text-xl font-bold italic uppercase tracking-tighter">4. Groupage Consolidation</h3>
                           <p className="text-xs text-gray-500 leading-relaxed font-medium">
                             The "Order With Me" model isn't just for community—it's for profit. Small parcels carry expensive fixed agent fees.
                           </p>
                           <div className="p-6 bg-orange-50 rounded-2xl space-y-2">
                              <div className="text-[10px] font-bold text-orange-900 uppercase">SME Pro Example</div>
                              <p className="text-[10px] text-orange-800 italic">"Consolidating 10 small air-freight parcels into 1 sea-freight entry saved our group N$ 9,500 in handling fees last month alone."</p>
                           </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Common SME Examples Table */}
                  <section className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-8">
                     <div className="space-y-1">
                        <h3 className="text-2xl font-bold italic uppercase tracking-tighter">High-Impact SME Examples</h3>
                        <p className="text-xs text-gray-400">Typical savings calculated for N$ 10,000 imports.</p>
                     </div>

                     <div className="overflow-x-auto rounded-[2rem] border border-gray-50">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-gray-50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100">
                                 <th className="px-8 py-5">Product Type</th>
                                 <th className="px-8 py-5">China (Non-SACU)</th>
                                 <th className="px-8 py-5">SA (SACU/SADC)</th>
                                 <th className="px-8 py-5">Potential Savings</th>
                              </tr>
                           </thead>
                           <tbody className="text-sm font-medium">
                              <tr className="border-b border-gray-50">
                                 <td className="px-8 py-6">Cotton T-Shirts</td>
                                 <td className="px-8 py-6 text-red-500 underline font-bold">45% Duty + VAT</td>
                                 <td className="px-8 py-6 text-emerald-600 font-bold">0% Duty + VAT</td>
                                 <td className="px-8 py-6">
                                    <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black">N$ 4,500.00</span>
                                 </td>
                              </tr>
                              <tr className="border-b border-gray-50">
                                 <td className="px-8 py-6">Personal Laptops</td>
                                 <td className="px-8 py-6">0% Duty (Global)</td>
                                 <td className="px-8 py-6">0% Duty (SACU)</td>
                                 <td className="px-8 py-6">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black">N$ 0.00 (Tariff Neutral)</span>
                                 </td>
                              </tr>
                              <tr>
                                 <td className="px-8 py-6 font-bold">Educational Books</td>
                                 <td className="px-8 py-6 font-black text-emerald-600 italic">VAT EXEMPT</td>
                                 <td className="px-8 py-6 font-black text-emerald-600 italic">VAT EXEMPT</td>
                                 <td className="px-8 py-6">
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black italic underline leading-none">MAXIMUM PROFIT</span>
                                 </td>
                              </tr>
                           </tbody>
                        </table>
                     </div>
                  </section>
                </motion.div>
              )}

              {activeTab === 'tracking' && (
                <motion.div 
                  key="tracking" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-[3rem] p-10 shadow-sm border border-gray-100 space-y-10"
                >
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                         <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Truck className="w-7 h-7 text-blue-500" /> NamRA Customs Tracker
                         </h2>
                         <p className="text-xs text-gray-400">Live inspection status for parcels arriving in Namibia.</p>
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
                         <input 
                           type="text" 
                           value={trackingNumber}
                           onChange={(e) => setTrackingNumber(e.target.value)}
                           placeholder="Enter Tracking ID (e.g. NAM-PRO-123)"
                           className="w-full bg-gray-50 border-none rounded-[1.8rem] py-6 px-10 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none transition-all pr-32"
                         />
                         <button 
                           onClick={() => { setIsTracking(true); setTimeout(() => setIsTracking(false), 1500); }}
                           className="absolute right-3 top-3 bottom-3 px-8 bg-blue-600 text-white rounded-[1.5rem] text-[10px] font-bold uppercase tracking-widest hover:scale-105 transition-all"
                         >
                            Check Customs
                         </button>
                      </div>
                   </div>

                   {trackingNumber === 'NAM-PRO-123' ? (
                     <div className="space-y-12">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                           <div className="space-y-1">
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected Release</div>
                              <div className="text-2xl font-black italic">Tuesday, 23 Apr</div>
                           </div>
                           <div className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100">
                             Clearing Successfully
                           </div>
                        </div>

                        <div className="space-y-12 relative">
                           <div className="absolute left-[23px] top-0 bottom-0 w-[2px] bg-gray-50" />
                           {[
                             { status: 'Customs Clearance Completed', location: 'Windhoek HUB', time: 'Today, 08:32 AM', done: true, icon: BadgeCheck, color: 'text-green-500 bg-green-50 border-green-100' },
                             { status: 'In Customs Inspection (NamRA)', location: 'Hosea Kutako Airport', time: 'Apr 19, 02:45 PM', done: true, icon: ShieldCheck, color: 'text-blue-500 bg-blue-50 border-blue-100' },
                             { status: 'Arrived at Border Post', location: 'Namibia Border Control', time: 'Apr 18, 11:15 AM', done: true, icon: MapPin, color: 'text-blue-500 bg-blue-50 border-blue-100' },
                           ].map((step, idx) => (
                             <div key={idx} className="flex gap-12 relative group">
                                <div className={`w-12 h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center relative z-10 transition-all ${step.color}`}>
                                   <step.icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-1.5 pt-1">
                                   <h4 className={`font-bold text-sm ${idx === 0 ? 'text-gray-900' : 'text-gray-400'}`}>{step.status}</h4>
                                   <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                      <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-blue-300" /> {step.location}</span>
                                      <span>{step.time}</span>
                                   </div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   ) : (
                     <div className="py-24 flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-28 h-28 rounded-[2.5rem] bg-gray-50 flex items-center justify-center border-4 border-dashed border-gray-100 group">
                           <Search className="w-10 h-10 text-gray-200 group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-900 font-bold">Search the NamRA Registry</p>
                          <p className="text-gray-400 text-xs max-w-xs leading-relaxed">Enter a valid tracking ID to pull your real-time clearance status from our integrated systems.</p>
                        </div>
                     </div>
                   )}
                </motion.div>
              )}

              {activeTab === 'agents' && (
                <motion.div 
                  key="agents" 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  <section className="bg-indigo-900 rounded-[3rem] p-12 text-white space-y-10 relative overflow-hidden group">
                     <div className="absolute top-[-10%] right-[-5%] p-10 opacity-10 group-hover:-rotate-12 transition-transform duration-700">
                        <Truck className="w-64 h-64 text-indigo-400" />
                     </div>
                     
                     <div className="relative z-10 space-y-8">
                        <div className="space-y-4">
                           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                              <UserCheck className="w-3 h-3 text-indigo-300" /> Agent Matchmaker
                           </div>
                           <h2 className="text-4xl font-bold italic tracking-tighter uppercase leading-none">Find Your Professional<br/>NamRA Clearing Agent</h2>
                           <div className="flex flex-col gap-4 pt-4">
                              <label className="block text-[10px] font-bold text-indigo-300 uppercase tracking-widest ml-1 opacity-60">Target Port / Destination</label>
                              <div className="flex flex-wrap gap-2">
                                {['Windhoek', 'Walvis Bay', 'Ariamsvlei', 'Noordoewer', 'Lüderitz', 'Oshakati'].map(loc => (
                                  <button 
                                    key={loc}
                                    onClick={() => setDestination(loc)}
                                    className={`px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${destination === loc ? 'bg-white text-indigo-900 shadow-2xl' : 'bg-white/5 text-indigo-200 border border-white/10 hover:bg-white/10'}`}
                                  >
                                    {loc}
                                  </button>
                                ))}
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {AGENTS.map((agent, idx) => {
                           const isSuggested = suggestedAgent === idx;
                           const isSelected = selectedAgentIndex === idx;

                           return (
                            <motion.div 
                              key={agent.name}
                              whileHover={{ y: -10 }}
                              onClick={() => setSelectedAgentIndex(idx)}
                              className={`p-10 rounded-[2.5rem] border-4 transition-all cursor-pointer relative group/card ${
                                 isSelected 
                                   ? 'border-white bg-white shadow-2xl scale-[1.02]' 
                                   : 'border-white/5 bg-white/5 backdrop-blur-sm hover:border-white/10 hover:bg-white/10'
                              }`}
                            >
                               {isSuggested && (
                                  <div className="absolute -top-4 right-10 px-5 py-2 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl z-20 flex items-center gap-2">
                                     <Zap className="w-3 h-3 fill-black text-black" /> recommended for you
                                  </div>
                                )}

                               <div className="space-y-8">
                                  <div className="flex justify-between items-start">
                                     <div className="space-y-2">
                                        <h4 className={`text-2xl font-bold leading-tight ${isSelected ? 'text-indigo-600' : 'text-white'}`}>
                                           {agent.name}
                                        </h4>
                                        <p className={`text-xs leading-relaxed font-medium ${isSelected ? 'text-gray-500' : 'text-indigo-200 opacity-60'}`}>{agent.description}</p>
                                     </div>
                                     <div className="text-right">
                                        <div className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-gray-400' : 'text-indigo-400'}`}>Base Fee</div>
                                        <div className={`text-2xl font-mono font-black ${isSelected ? 'text-indigo-600' : 'text-white'}`}>N$ {agent.baseFee}</div>
                                     </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                     {agent.specialty.map((s, si) => (
                                       <span key={si} className={`px-3 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider ${isSelected ? 'bg-indigo-50 text-indigo-600' : 'bg-white/5 text-indigo-200'}`}>{s}</span>
                                     ))}
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <MapPin className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-indigo-400'}`} />
                                     <div className="flex flex-wrap gap-3">
                                        {agent.regions.map((r, ri) => (
                                          <span key={ri} className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-gray-400' : 'text-indigo-300 opacity-40'}`}>{r}{ri < agent.regions.length - 1 ? ',' : ''}</span>
                                        ))}
                                     </div>
                                  </div>
                                  <div className={`pt-8 border-t flex items-center justify-between ${isSelected ? 'border-gray-100' : 'border-white/10'}`}>
                                     <div className="space-y-1">
                                        <div className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${isSelected ? 'text-gray-400' : 'text-indigo-400'}`}><Truck className="w-3 h-3" /> SME Logistics</div>
                                        <div className={`font-mono text-xs font-bold ${isSelected ? 'text-gray-900' : 'text-white'}`}>{agent.phone}</div>
                                     </div>
                                     <button 
                                       onClick={(e) => {
                                         e.stopPropagation();
                                         setSelectedAgentIndex(idx);
                                       }}
                                       className={`flex items-center gap-2.5 px-8 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-xl ${
                                         selectedAgentIndex === idx 
                                           ? 'bg-indigo-100 text-indigo-700' 
                                           : 'bg-white text-indigo-900 hover:scale-105 active:scale-95'
                                       }`}
                                     >
                                        {selectedAgentIndex === idx ? 'Selected' : 'Direct Hire'} <Zap className="w-3 h-3" />
                                     </button>
                                  </div>
                               </div>
                            </motion.div>
                           );
                        })}
                     </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
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
                        onClick={printCertificate}
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
