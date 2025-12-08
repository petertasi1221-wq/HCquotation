import React from 'react';
import { X, Camera } from 'lucide-react';
import { DiscountState, VersionData } from '../types';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string;
  versionName: string;
  priceTypeLabel: string;
  basePrice: number;
  finalPrice: number;
  versionData: VersionData | null;
  discounts: DiscountState;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  modelName,
  versionName,
  priceTypeLabel,
  basePrice,
  finalPrice,
  versionData,
  discounts,
}) => {
  if (!isOpen) return null;

  // Helper to get selected discounts for list
  const activeDiscounts = [
    { label: '購車金 (公司折扣)', value: versionData?.PurchaseBonus || 0, active: discounts.PurchaseBonus },
    { label: '汰舊貨物稅減免', value: versionData?.TaxScrap || 0, active: discounts.TaxScrap },
    { label: '報廢回收金', value: versionData?.ScrapRefund || 0, active: discounts.ScrapRefund },
    { label: '新購貨物稅減免', value: versionData?.TaxNew || 0, active: discounts.TaxNew },
  ].filter(d => d.active && d.value !== 0);

  const totalDiscount = activeDiscounts.reduce((acc, curr) => acc + Math.abs(curr.value), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-paper-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative border-4 border-milk-accent/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tape effect */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-milk-accent/40 rotate-1 shadow-sm z-10"></div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-milk-dark hover:text-soft-red transition-colors z-20"
        >
          <X size={28} />
        </button>

        <div className="p-6 pt-10">
          <h2 className="text-2xl font-bold text-center text-milk-dark mb-6 border-b-2 border-milk-accent pb-2">
            車輛報價單
          </h2>

          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between items-baseline">
              <span className="text-gray-500">車種</span>
              <span className="font-bold text-lg text-milk-dark">{modelName}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-gray-500">版本</span>
              <span className="font-bold text-lg text-milk-dark">{versionName}</span>
            </div>
            <div className="flex justify-between items-baseline border-b border-dashed border-gray-300 pb-3">
              <span className="text-gray-500">方案</span>
              <span className="font-bold text-milk-dark bg-milk-bg px-2 py-0.5 rounded text-right max-w-[60%] leading-tight">
                {priceTypeLabel}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2">
              <span className="text-gray-500">售價</span>
              <span className="font-rounded text-lg font-bold">{basePrice.toLocaleString()} 元</span>
            </div>

            {activeDiscounts.length > 0 && (
              <div className="bg-milk-bg/50 rounded-lg p-3 mt-2 space-y-1">
                <p className="text-xs font-bold text-milk-dark mb-2">包含折扣：</p>
                {activeDiscounts.map((d, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{d.label}</span>
                    <span className="text-soft-red font-bold font-rounded">-{Math.abs(d.value).toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-milk-dark/20 mt-2 pt-1 flex justify-between text-xs font-bold text-soft-red">
                  <span>共省下</span>
                  <span className="font-rounded">{totalDiscount.toLocaleString()} 元</span>
                </div>
              </div>
            )}

            {versionData?.GiftNote && (
              <div className="mt-4 p-3 border border-dashed border-milk-accent rounded-lg bg-[#FFFBEB] text-xs leading-relaxed text-milk-dark">
                <span className="font-bold">🎁 贈品活動：</span>
                {versionData.GiftNote}
              </div>
            )}
          </div>

          <div className="mt-8 pt-4 border-t-2 border-milk-dark/10 text-center">
             <p className="text-sm text-gray-500 mb-1">車輛價格</p>
             <p className="font-rounded text-4xl font-bold text-soft-red">{finalPrice.toLocaleString()} <span className="text-xl text-gray-400">元</span></p>
          </div>
          
          <div className="mt-6 text-center text-[10px] text-gray-400">
            實際價格依門市為主
          </div>
        </div>
      </div>
    </div>
  );
};