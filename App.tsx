import React, { useState, useEffect, useMemo } from 'react';
import { fetchPriceData } from './services/sheetService';
import { PriceDatabase, DiscountState, VersionData } from './types';
import { CheckboxRow } from './components/CheckboxRow';
import { SummaryModal } from './components/SummaryModal';
import { Loader2, Camera, ChevronRight, Tag, NotebookPen, Store, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [db, setDb] = useState<PriceDatabase>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selections
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [selectedPriceKey, setSelectedPriceKey] = useState<string>('');
  
  // Discounts
  const [discounts, setDiscounts] = useState<DiscountState>({
    PurchaseBonus: true,
    TaxScrap: true,
    ScrapRefund: true,
    TaxNew: true,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Data
  useEffect(() => {
    fetchPriceData()
      .then(data => {
        setDb(data);
        setLoading(false);
      })
      .catch(err => {
        setError('無法載入價格資料，請檢查網路連線');
        setLoading(false);
      });
  }, []);

  // Derived Data
  const modelNames = useMemo(() => Object.keys(db), [db]);
  const versionNames = useMemo(() => selectedModel ? Object.keys(db[selectedModel] || {}) : [], [db, selectedModel]);
  
  const currentVersionData: VersionData | null = useMemo(() => {
    if (selectedModel && selectedVersion) {
      return db[selectedModel][selectedVersion];
    }
    return null;
  }, [db, selectedModel, selectedVersion]);

  // Pricing Options Grouping
  const pricingOptions = useMemo(() => {
    if (!currentVersionData) return { cash: [], installment: [] };
    
    const cash: { key: string; price: number; label: string }[] = [];
    // Extend type to include period details for rendering
    const installment: { key: string; price: number; label: string; period: number; pricePerPeriod: number }[] = [];

    Object.entries(currentVersionData.Prices).forEach(([key, price]) => {
      if (price === 0) return; // Skip invalid prices

      if (key.includes('現金')) {
        cash.push({ key, price, label: `現金價 ${price.toLocaleString()} 元` });
      } else if (key.includes('#') && key.includes('期')) {
        const periodMatch = key.match(/#(\d+)/);
        const period = periodMatch ? parseInt(periodMatch[1]) : 0;
        // 使用 Math.ceil 進行無條件進位
        const pricePerPeriod = period > 0 ? Math.ceil(price / period) : 0;
        
        installment.push({ 
          key, 
          price, 
          period,
          pricePerPeriod,
          label: `${period}期：每期${pricePerPeriod.toLocaleString()}元` 
        });
      } else {
        cash.push({ key, price, label: `${key}: ${price.toLocaleString()} 元` });
      }
    });

    return { cash, installment };
  }, [currentVersionData]);

  // Calculate Totals
  const basePrice = useMemo(() => {
    if (!currentVersionData || !selectedPriceKey) return 0;
    return currentVersionData.Prices[selectedPriceKey] || 0;
  }, [currentVersionData, selectedPriceKey]);

  const totalDiscount = useMemo(() => {
    if (!currentVersionData) return 0;
    let total = 0;
    if (discounts.PurchaseBonus) total += Math.abs(currentVersionData.PurchaseBonus);
    if (discounts.TaxScrap) total += Math.abs(currentVersionData.TaxScrap);
    if (discounts.ScrapRefund) total += Math.abs(currentVersionData.ScrapRefund);
    if (discounts.TaxNew) total += Math.abs(currentVersionData.TaxNew);
    return total;
  }, [currentVersionData, discounts]);

  const finalPrice = Math.max(0, basePrice - totalDiscount);

  // Handlers
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
    setSelectedVersion('');
    setSelectedPriceKey('');
  };

  const toggleDiscount = (key: keyof DiscountState) => {
    setDiscounts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Pre-select first options if available
  useEffect(() => {
    if (versionNames.length > 0 && !selectedVersion) {
      setSelectedVersion(versionNames[0]);
    }
  }, [versionNames]);

  useEffect(() => {
    if (pricingOptions.cash.length > 0 && !selectedPriceKey) {
      setSelectedPriceKey(pricingOptions.cash[0].key);
    } else if (pricingOptions.installment.length > 0 && !selectedPriceKey) {
       setSelectedPriceKey(pricingOptions.installment[0].key);
    }
  }, [pricingOptions, selectedVersion]);


  // --- Render ---

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-milk-bg text-milk-dark">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-rounded font-bold">正在翻閱報價單...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-soft-red font-bold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 max-w-lg mx-auto shadow-2xl bg-white relative">
      {/* Header */}
      <header className="bg-milk-accent/20 p-6 rounded-b-[30px] mb-6 relative">
        <button 
          onClick={() => window.location.reload()}
          className="absolute top-4 right-4 text-milk-dark/40 hover:text-milk-dark transition-all duration-500 active:rotate-180"
          aria-label="重新整理"
        >
          <RotateCcw size={18} />
        </button>

        <div className="flex items-center justify-center gap-3 mb-2">
          {/* 使用 Store 圖示代表車行，保持與右側 NotebookPen 風格一致 */}
          <Store className="text-milk-dark opacity-90" size={28} strokeWidth={2.5} />
          
          <h1 className="text-2xl font-bold text-milk-dark tracking-wide flex items-center gap-2">
            皇昌車業
          </h1>
          
          <NotebookPen className="text-milk-dark opacity-90" size={28} strokeWidth={2.5} />
        </div>
        <div className="text-center">
           <span className="inline-block bg-white/80 px-4 py-1 rounded-full text-sm text-milk-dark/80 font-bold shadow-sm">
             115年 1月 報價單
           </span>
        </div>
      </header>

      <main className="px-5 space-y-6">
        
        {/* 1. Model Selection (Card) */}
        <section className="bg-paper-white border-2 border-milk-dark/20 rounded-2xl p-4 shadow-paper relative">
            <div className="absolute -top-3 left-4 bg-milk-dark text-white text-xs px-3 py-1 rounded-lg font-bold shadow-sm">
              步驟 1
            </div>
            <label className="block text-milk-dark font-bold mb-2 mt-2">選擇車款</label>
            <div className="relative">
              <select 
                value={selectedModel} 
                onChange={handleModelChange}
                className="w-full appearance-none bg-milk-bg border border-milk-dark/30 rounded-xl px-4 py-3 pr-10 text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-milk-accent transition-all"
              >
                <option value="" disabled>請點擊選擇...</option>
                {modelNames.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-milk-dark">
                <ChevronRight className="rotate-90" size={20} />
              </div>
            </div>
        </section>

        {/* 2. Version & Price Selection */}
        {selectedModel && (
          <section className="bg-paper-white border-2 border-milk-dark/20 rounded-2xl p-4 shadow-paper relative animate-fade-in-up">
            <div className="absolute -top-3 left-4 bg-milk-dark text-white text-xs px-3 py-1 rounded-lg font-bold shadow-sm">
              步驟 2
            </div>
            
            {/* Version Pills */}
            <div className="mt-3 mb-6 overflow-x-auto no-scrollbar pb-2">
               <label className="block text-milk-dark font-bold mb-2 text-sm">車款版本</label>
               <div className="flex gap-2">
                 {versionNames.map(ver => (
                   <button
                    key={ver}
                    onClick={() => {
                        setSelectedVersion(ver);
                        setSelectedPriceKey(''); // Reset price
                    }}
                    className={`
                      whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all border-2
                      ${selectedVersion === ver 
                        ? 'bg-milk-accent border-milk-accent text-white shadow-md transform scale-105' 
                        : 'bg-white border-gray-200 text-gray-500 hover:border-milk-accent/50'}
                    `}
                   >
                     {ver}
                   </button>
                 ))}
               </div>
            </div>

            {/* Price Options */}
            {selectedVersion && (
              <div className="space-y-4">
                 {/* Cash Section */}
                 {pricingOptions.cash.length > 0 && (
                   <div>
                     <span className="text-xs font-bold text-milk-dark/60 mb-2 block ml-1">現金方案</span>
                     <div className="space-y-2">
                       {pricingOptions.cash.map(opt => (
                         <label key={opt.key} className={`
                           flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all
                           ${selectedPriceKey === opt.key 
                             ? 'border-milk-accent bg-milk-bg ring-1 ring-milk-accent' 
                             : 'border-gray-100 hover:bg-gray-50'}
                         `}>
                           <input 
                              type="radio" 
                              name="price" 
                              className="hidden" 
                              value={opt.key}
                              checked={selectedPriceKey === opt.key} 
                              onChange={(e) => setSelectedPriceKey(e.target.value)}
                            />
                            <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 ${selectedPriceKey === opt.key ? 'border-milk-accent' : 'border-gray-300'}`}>
                              {selectedPriceKey === opt.key && <div className="w-2 h-2 rounded-full bg-milk-accent" />}
                            </div>
                            <span className="font-bold text-gray-700 font-rounded">{opt.label}</span>
                         </label>
                       ))}
                     </div>
                   </div>
                 )}

                 {/* Installment Section */}
                 {pricingOptions.installment.length > 0 && (
                   <div>
                     <span className="text-xs font-bold text-milk-dark/60 mb-2 block ml-1 mt-4">分期方案</span>
                     <div className="grid grid-cols-1 gap-2">
                       {pricingOptions.installment.map(opt => (
                         <label key={opt.key} className={`
                           flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all
                           ${selectedPriceKey === opt.key 
                             ? 'border-milk-accent bg-milk-bg ring-1 ring-milk-accent' 
                             : 'border-gray-100 hover:bg-gray-50'}
                         `}>
                           <div className="flex items-center">
                              <input 
                                  type="radio" 
                                  name="price" 
                                  className="hidden" 
                                  value={opt.key}
                                  checked={selectedPriceKey === opt.key} 
                                  onChange={(e) => setSelectedPriceKey(e.target.value)}
                                />
                                <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center flex-shrink-0 ${selectedPriceKey === opt.key ? 'border-milk-accent' : 'border-gray-300'}`}>
                                  {selectedPriceKey === opt.key && <div className="w-2 h-2 rounded-full bg-milk-accent" />}
                                </div>
                                <span className="font-bold text-gray-700 text-lg whitespace-nowrap">{opt.period} 期</span>
                           </div>
                           
                           <div className="text-right flex flex-col sm:block font-rounded font-bold text-milk-dark">
                             <span className="text-lg">{opt.price.toLocaleString()}元</span>
                             <span className="hidden sm:inline text-gray-400 mx-1">/</span>
                             <span className="text-sm sm:text-base text-soft-red">每期 {opt.pricePerPeriod.toLocaleString()}元</span>
                           </div>
                         </label>
                       ))}
                     </div>
                   </div>
                 )}
              </div>
            )}
          </section>
        )}

        {/* 3. Details & Discounts */}
        {currentVersionData && (
          <section className="bg-paper-white border-2 border-milk-dark/20 rounded-2xl p-5 shadow-paper relative">
            <div className="absolute -top-3 left-4 bg-milk-dark text-white text-xs px-3 py-1 rounded-lg font-bold shadow-sm">
              補助與贈品
            </div>
            
            <div className="mt-4 space-y-1">
              <CheckboxRow 
                label="公司購車金(事後匯款)" 
                value={currentVersionData.PurchaseBonus} 
                checked={discounts.PurchaseBonus} 
                onChange={() => toggleDiscount('PurchaseBonus')}
              />
              <CheckboxRow 
                label="汰舊貨物稅減免" 
                value={currentVersionData.TaxScrap} 
                checked={discounts.TaxScrap} 
                onChange={() => toggleDiscount('TaxScrap')}
              />
              <CheckboxRow 
                label="報廢回收金" 
                value={currentVersionData.ScrapRefund} 
                checked={discounts.ScrapRefund} 
                onChange={() => toggleDiscount('ScrapRefund')}
              />
              <CheckboxRow 
                label="新購貨物稅減免" 
                value={currentVersionData.TaxNew} 
                checked={discounts.TaxNew} 
                onChange={() => toggleDiscount('TaxNew')}
              />
            </div>

            {/* Gift Note */}
            <div className="mt-6 bg-[#FFFBEB] p-4 rounded-xl border border-dashed border-milk-accent relative">
              <div className="absolute -top-3 left-3 bg-[#FFFBEB] px-2 text-milk-accent">
                <Tag size={18} />
              </div>
              <p className="text-sm text-milk-dark leading-relaxed font-bold">
                 {currentVersionData.GiftNote || '此版本無特殊贈品備註。'}
              </p>
            </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-milk-dark/10 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] z-40 max-w-lg mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold mb-1">
              {basePrice > 0 ? '折扣後總價' : '尚未選擇'}
            </span>
            <div className="flex items-baseline gap-1 text-soft-red font-rounded font-bold leading-none">
              <span className="text-4xl">{finalPrice.toLocaleString()}</span>
              <span className="text-lg text-gray-500">元</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            disabled={!currentVersionData || !selectedPriceKey}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-all active:scale-95
              ${currentVersionData && selectedPriceKey
                ? 'bg-milk-dark text-white hover:bg-milk-accent' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            <Camera size={20} />
            <span>明細</span>
          </button>
        </div>
      </div>

      <SummaryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modelName={selectedModel}
        versionName={selectedVersion}
        priceTypeLabel={pricingOptions.cash.find(c => c.key === selectedPriceKey)?.label || pricingOptions.installment.find(i => i.key === selectedPriceKey)?.label || selectedPriceKey}
        basePrice={basePrice}
        finalPrice={finalPrice}
        versionData={currentVersionData}
        discounts={discounts}
      />

    </div>
  );
};

export default App;
