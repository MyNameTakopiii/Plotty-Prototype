import React, { useEffect, useRef } from 'react';
import { Leaf, Sparkles, Coins, Zap } from 'lucide-react';

interface EsgCarbonCalculatorProps {
  lang: 'th' | 'en';
  totalFarmRai?: number;
  onTotalCalculated?: (totals: { totalTons: number; totalIncomeThb: number }) => void;
}

export const EsgCarbonCalculator: React.FC<EsgCarbonCalculatorProps> = ({
  lang,
  totalFarmRai = 70,
  onTotalCalculated,
}) => {
  const calculatedTons = Math.round(totalFarmRai * 4.33); // 70 * 4.33 = 303 tons
  const calculatedIncome = calculatedTons * 400; // 303 * 400 = 121,200 THB

  const prevTotalsRef = useRef<{ totalTons: number; totalIncomeThb: number } | null>(null);

  useEffect(() => {
    if (onTotalCalculated) {
      const prev = prevTotalsRef.current;
      if (!prev || prev.totalTons !== calculatedTons || prev.totalIncomeThb !== calculatedIncome) {
        prevTotalsRef.current = { totalTons: calculatedTons, totalIncomeThb: calculatedIncome };
        onTotalCalculated({ totalTons: calculatedTons, totalIncomeThb: calculatedIncome });
      }
    }
  }, [calculatedTons, calculatedIncome, onTotalCalculated]);

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-teal-700" />
          <h4 className="font-extrabold text-slate-900 text-sm">
            {lang === 'th' ? 'ประมาณการคาร์บอนเครดิต T-VER & พลังงานโซลาร์ปั๊ม' : 'T-VER Carbon Credits & Solar Energy Calculator'}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-white rounded-xl border border-teal-200">
            <span className="text-slate-500 font-sans block text-[11px]">ปริมาณคาร์บอนกักเก็บรวม</span>
            <span className="text-lg font-black text-teal-700 block mt-1">{calculatedTons} tCO₂e / ปี</span>
            <span className="text-[10px] text-slate-500 font-sans">อิงมาตรฐานสวนไม้ยืนต้น 70 ไร่</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-teal-200">
            <span className="text-slate-500 font-sans block text-[11px]">รายได้ขายคาร์บอนเครดิต</span>
            <span className="text-lg font-black text-emerald-700 block mt-1">฿{calculatedIncome.toLocaleString()} / ปี</span>
            <span className="text-[10px] text-slate-500 font-sans">ราคาเฉลี่ย ฿400 / ตัน</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-teal-200">
            <span className="text-slate-500 font-sans block text-[11px]">ลดค่าไฟปั๊มน้ำด้วยโซลาร์</span>
            <span className="text-lg font-black text-blue-700 block mt-1">฿45,600 / ปี</span>
            <span className="text-[10px] text-slate-500 font-sans">ประหยัดพลังงาน 35%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
