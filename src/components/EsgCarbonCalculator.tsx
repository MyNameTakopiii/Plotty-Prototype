/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Leaf,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Flame,
  Sprout,
  CheckCircle2,
  Building2,
  Info,
  Sliders,
  Award,
} from 'lucide-react';

interface CropCarbonData {
  cropId: string;
  nameTh: string;
  nameEn: string;
  rai: number;
  baseSequestrationRate: number; // tCO2e / rai / yr
}

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
  // Sustainable Practice Toggles
  const [useAzollaFertilizer, setUseAzollaFertilizer] = useState<boolean>(true);
  const [useZeroBurningPolicy, setUseZeroBurningPolicy] = useState<boolean>(true);
  const [useCoverCrops, setUseCoverCrops] = useState<boolean>(true);
  const [useAwdRice, setUseAwdRice] = useState<boolean>(true);

  // Carbon Market Price per tCO2e (Default 400 THB - TGO VCM Average)
  const [carbonPriceThb, setCarbonPriceThb] = useState<number>(400);

  // 4 Durian Orchard Zones & Living Biomass Sequestration Rates
  const farmCrops: CropCarbonData[] = [
    {
      cropId: 'durian_a',
      nameTh: 'ทุเรียนหมอนทอง (Plot A)',
      nameEn: 'Monthong Durian (Plot A)',
      rai: 25,
      baseSequestrationRate: 3.2, // tCO2e/rai/yr (Mature fruit tree biomass)
    },
    {
      cropId: 'durian_b',
      nameTh: 'ทุเรียนก้านยาวเมืองนนท์ (Plot B)',
      nameEn: 'Kanyao Durian (Plot B)',
      rai: 15,
      baseSequestrationRate: 3.6, // Mature heritage 12Y trees
    },
    {
      cropId: 'durian_c',
      nameTh: 'ชะนี & พวงมณี (Plot C)',
      nameEn: 'Chanee & Puangmanee (Plot C)',
      rai: 18,
      baseSequestrationRate: 2.8,
    },
    {
      cropId: 'durian_d',
      nameTh: 'ทุเรียนแปลงขยาย (Plot D)',
      nameEn: 'Young Orchard (Plot D)',
      rai: 12,
      baseSequestrationRate: 1.5,
    },
  ];

  // Calculate Crop Baseline Carbon Sequestration
  const cropBaselineTons = farmCrops.reduce(
    (sum, crop) => sum + crop.rai * crop.baseSequestrationRate,
    0
  );

  // Additional Practice Credits
  const azollaCredits = useAzollaFertilizer ? totalFarmRai * 0.85 : 0;
  const zeroBurnCredits = useZeroBurningPolicy ? totalFarmRai * 1.20 : 0;
  const coverCropCredits = useCoverCrops ? totalFarmRai * 0.65 : 0;
  
  // Smart Drip Irrigation in Durian Orchard (70 Rai)
  const smartDripCredits = useAwdRice ? totalFarmRai * 0.80 : 0;

  const totalCarbonTons = Math.round(
    cropBaselineTons + azollaCredits + zeroBurnCredits + coverCropCredits + smartDripCredits
  );

  const totalEsgIncomeThb = totalCarbonTons * carbonPriceThb;

  // Notify parent component if callback provided
  React.useEffect(() => {
    if (onTotalCalculated) {
      onTotalCalculated({ totalTons: totalCarbonTons, totalIncomeThb: totalEsgIncomeThb });
    }
  }, [totalCarbonTons, totalEsgIncomeThb, onTotalCalculated]);

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Leaf className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
              {lang === 'th'
                ? 'เครื่องมือคำนวณคาร์บอนเครดิตเกษตรยั่งยืน (Sustainable Farm Calculator)'
                : 'Sustainable Farm Carbon Credit Calculator'}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {lang === 'th'
              ? 'ประเมินปริมาณการกักเก็บคาร์บอน (tCO₂e) และประมาณการรายได้เสริม ESG ตามประเภทพืชและมาตรการลดก๊าซเรือนกระจก'
              : 'Estimate carbon sequestration and potential annual ESG revenue based on selected crop plots and eco-friendly practices.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-xs self-start sm:self-auto shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span className="text-emerald-800 font-bold">
            {lang === 'th' ? 'มาตรฐาน TGO Premium T-VER' : 'TGO Premium T-VER Compliant'}
          </span>
        </div>
      </div>

      {/* Main KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Carbon Credits */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-slate-500 font-medium block mb-1">
            {lang === 'th' ? 'ปริมาณคาร์บอนเครดิตรวม' : 'Total Est. Carbon Credits'}
          </span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl font-black text-slate-900 tracking-tight font-mono tabular-nums">
              {totalCarbonTons.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-600">tCO₂e / {lang === 'th' ? 'ปี' : 'yr'}</span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            {lang === 'th'
              ? `คิดเป็น ${(totalCarbonTons / totalFarmRai).toFixed(2)} tCO₂e / ไร่ / ปี`
              : `${(totalCarbonTons / totalFarmRai).toFixed(2)} tCO₂e / rai / yr`}
          </span>
        </div>

        {/* Potential ESG Income Card (Highlighted) */}
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
          <span className="text-xs text-emerald-800 font-bold block mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {lang === 'th' ? 'รายได้เสริม ESG คาดการณ์' : 'Potential Annual ESG Income'}
          </span>
          <div className="flex items-baseline gap-1.5 my-1">
            <span className="text-3xl font-black text-emerald-700 tracking-tight font-mono tabular-nums">
              ฿{totalEsgIncomeThb.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-800">/ {lang === 'th' ? 'ปี' : 'yr'}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold block">
            {lang === 'th'
              ? `อิงราคาตลาด TGO VCM ฿${carbonPriceThb} / tCO₂e`
              : `At TGO VCM Rate ฿${carbonPriceThb} / tCO₂e`}
          </span>
        </div>

        {/* Farm ESG Rating */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-xs text-amber-800 font-medium block mb-1">
            {lang === 'th' ? 'ระดับคะแนน Net Zero' : 'Net Zero Rating'}
          </span>
          <div className="flex items-center gap-2 my-1">
            <span className="text-3xl font-black text-amber-700 tracking-tight font-mono">
              Grade A+
            </span>
            <span className="text-xs bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md font-bold">
              Gold
            </span>
          </div>
          <span className="text-[11px] text-amber-800 font-medium block">
            {lang === 'th' ? 'ผ่านมาตรฐาน C.P. Carbon Neutral' : 'C.P. Carbon Neutral Certified'}
          </span>
        </div>
      </div>

      {/* Sustainable Practices Checkboxes */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>
              {lang === 'th'
                ? 'มาตรการเกษตรยั่งยืน (เลือกปรับใช้ในแปลง):'
                : 'Sustainable Agriculture Practices:'}
            </span>
          </h3>

          {/* Carbon Market Price Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-medium">
              {lang === 'th' ? 'ราคาตลาดคาร์บอน:' : 'Carbon Price:'}
            </span>
            <select
              value={carbonPriceThb}
              onChange={(e) => setCarbonPriceThb(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-800 text-xs font-mono font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              <option value={300}>฿300 / tCO₂e (Domestic Base)</option>
              <option value={400}>฿400 / tCO₂e (TGO Standard)</option>
              <option value={600}>฿600 / tCO₂e (Gold Standard)</option>
              <option value={800}>฿800 / tCO₂e (EU ETS Premium)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Practice 1: Azolla Bio-fertilizer */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
            useAzollaFertilizer
              ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={useAzollaFertilizer}
              onChange={(e) => setUseAzollaFertilizer(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 bg-white cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-900 block">
                {lang === 'th'
                  ? 'ลดปุ๋ยเคมี & ใช้แหนแดงชีวภาพ'
                  : 'Reduce Chemical Fertilizer & Apply Azolla'}
              </span>
              <span className="text-[11px] text-slate-600 leading-relaxed block mt-1">
                {lang === 'th'
                  ? 'ลดการปลดปล่อย N₂O ได้ +0.85 tCO₂e / ไร่ / ปี (+59.5 tCO₂e)'
                  : 'Reduces N₂O emissions by +0.85 tCO₂e / rai / yr (+59.5 tCO₂e)'}
              </span>
            </div>
          </label>

          {/* Practice 2: Zero Burning */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
            useZeroBurningPolicy
              ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={useZeroBurningPolicy}
              onChange={(e) => setUseZeroBurningPolicy(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 bg-white cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-900 block">
                {lang === 'th'
                  ? 'นโยบายปลอดการเผาเศษวัสดุ (Zero Burning)'
                  : 'Zero-Burning Policy & Stubble Tilling'}
              </span>
              <span className="text-[11px] text-slate-600 leading-relaxed block mt-1">
                {lang === 'th'
                  ? 'ไถกลบตอซัง ลดควัน PM2.5 ได้ +1.20 tCO₂e / ไร่ / ปี (+84 tCO₂e)'
                  : 'Offsets PM2.5 and sequesters +1.20 tCO₂e / rai / yr (+84 tCO₂e)'}
              </span>
            </div>
          </label>

          {/* Practice 3: Cover Crops */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
            useCoverCrops
              ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={useCoverCrops}
              onChange={(e) => setUseCoverCrops(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 bg-white cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-900 block">
                {lang === 'th'
                  ? 'ปลูกพืชคลุมดินตระกูลถั่ว & Biochar'
                  : 'Legume Cover Crops & Biochar Integration'}
              </span>
              <span className="text-[11px] text-slate-600 leading-relaxed block mt-1">
                {lang === 'th'
                  ? 'เพิ่มคาร์บอนอินทรีย์ในดิน +0.65 tCO₂e / ไร่ / ปี (+45.5 tCO₂e)'
                  : 'Enhances soil organic carbon +0.65 tCO₂e / rai / yr (+45.5 tCO₂e)'}
              </span>
            </div>
          </label>

          {/* Practice 4: AWD Rice */}
          <label className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
            useAwdRice
              ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 shadow-2xs'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}>
            <input
              type="checkbox"
              checked={useAwdRice}
              onChange={(e) => setUseAwdRice(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 bg-white cursor-pointer"
            />
            <div>
              <span className="font-bold text-slate-900 block">
                {lang === 'th'
                  ? 'ระบบน้ำหยดอัจฉริยะ Smart Precision Drip (70 ไร่)'
                  : 'Precision Drip Irrigation (70 Rai)'}
              </span>
              <span className="text-[11px] text-slate-600 leading-relaxed block mt-1">
                {lang === 'th'
                  ? 'ลดการใช้พลังงานปั๊มน้ำและคุมความชื้น +0.80 tCO₂e / ไร่ / ปี (+56 tCO₂e)'
                  : 'Saves pump energy and controls soil moisture +0.80 tCO₂e / rai / yr (+56 tCO₂e)'}
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* Crop Breakdown Table */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
          <span>{lang === 'th' ? 'รายละเอียดคาร์บอนเครดิตแยกรายแปลงสวนทุเรียน (70 ไร่)' : 'Carbon Credit Breakdown by Durian Plot'}</span>
          <span className="text-emerald-700 font-mono text-[11px] font-bold">{cropBaselineTons} tCO₂e (Baseline)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {farmCrops.map((crop) => {
            const cropTons = Math.round(crop.rai * crop.baseSequestrationRate);
            const cropRevenue = cropTons * carbonPriceThb;
            return (
              <div
                key={crop.cropId}
                className="p-3 bg-white border border-slate-200/90 rounded-xl space-y-1.5 shadow-2xs"
              >
                <div className="font-bold text-slate-900 truncate">
                  {lang === 'th' ? crop.nameTh : crop.nameEn}
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-slate-600">
                  <span>{lang === 'th' ? `พื้นที่ ${crop.rai} ไร่` : `${crop.rai} Rai`}</span>
                  <span className="font-mono font-bold text-emerald-700">{cropTons} tCO₂e</span>
                </div>
                <div className="flex justify-between items-baseline text-[10px] text-slate-500 border-t border-slate-100 pt-1">
                  <span>{lang === 'th' ? 'มูลค่า ESG' : 'ESG Value'}</span>
                  <span className="font-mono font-semibold text-slate-900">฿{cropRevenue.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corporate Offset Note & Standard Seal */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>
            {lang === 'th'
              ? 'เชื่อมต่อระบบรับซื้อคาร์บอนเครดิตภาคเกษตร กับ C.P. Group Net Zero Supply Chain'
              : 'Direct integration with C.P. Group Net Zero Agricultural Supply Chain Buying Program'}
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
          <Award className="w-3.5 h-3.5 text-emerald-700" />
          <span>Verified Carbon Standard 2026</span>
        </div>
      </div>
    </div>
  );
};
