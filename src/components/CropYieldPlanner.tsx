/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CROPS, raiNganWaToSqm, sqmToString } from '../data/agriData';
import { EsgCarbonCalculator } from './EsgCarbonCalculator';
import {
  Compass,
  Sprout,
  Droplets,
  DollarSign,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sliders,
  HelpCircle,
} from 'lucide-react';

interface CropYieldPlannerProps {
  lang: 'th' | 'en';
  selectedProvince: string;
}

export const CropYieldPlanner: React.FC<CropYieldPlannerProps> = ({
  lang,
  selectedProvince,
}) => {
  const [rai, setRai] = useState<number>(5);
  const [ngan, setNgan] = useState<number>(0);
  const [wa, setWa] = useState<number>(0);
  const [soilType, setSoilType] = useState<string>('sandy_loam');
  const [waterAccess, setWaterAccess] = useState<string>('pond_well');
  const [farmingGoal, setFarmingGoal] = useState<string>('high_profit');
  const defaultCropId = 'mango_namdokmai';
  const [chosenCropId, setChosenCropId] = useState<string>(defaultCropId);

  // Demo Mode Action Listener
  React.useEffect(() => {
    const handleDemoAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.action === 'set_planner_rai') {
        const targetRai = customEvent.detail.rai || 20;
        let currentRai = 5;
        const interval = setInterval(() => {
          currentRai += 1;
          setRai(currentRai);
          if (currentRai >= targetRai) {
            clearInterval(interval);
          }
        }, 50);
      }
    };
    window.addEventListener('kasetthai_demo_action', handleDemoAction);
    return () => window.removeEventListener('kasetthai_demo_action', handleDemoAction);
  }, []);

  const totalSqm = raiNganWaToSqm(rai, ngan, wa);
  const selectedCrop = CROPS[chosenCropId] || CROPS[defaultCropId] || Object.values(CROPS)[0];

  // Compute suitability scores for crops based on inputs
  const suitabilityScores = Object.values(CROPS).map((c) => {
    let score = 85;

    // Soil compatibility
    if (soilType === 'sandy_loam' && (c.id === 'durian' || c.id === 'durian_kanyao')) {
      score += 12;
    } else if (soilType === 'clay_ditch' && c.id === 'durian_kanyao') {
      score += 14;
    } else if (soilType === 'mound' && c.id === 'durian_young') {
      score += 10;
    }

    // Water compatibility
    if (waterAccess === 'canal' && (c.id === 'durian' || c.id === 'durian_kanyao')) {
      score += 8;
    } else if (waterAccess === 'rainfed' && c.waterRequirement === 'high') {
      score -= 20;
    }

    // Goal alignment
    if (farmingGoal === 'export_quality' && c.id === 'durian') score += 5;
    if (farmingGoal === 'heritage_premium' && c.id === 'durian_kanyao') score += 8;

    return {
      crop: c,
      score: Math.min(98, Math.max(55, score)),
    };
  }).sort((a, b) => b.score - a.score);

  // Financial calculations
  const totalRai = rai + ngan / 4 + wa / 400;
  const costPerRai = selectedCrop.costPerRaiTHB;
  const totalEstimatedCost = Math.round(costPerRai * totalRai);

  const minYieldKg = Math.round(selectedCrop.avgYieldPerRaiKg * 0.8 * totalRai);
  const expYieldKg = Math.round(selectedCrop.avgYieldPerRaiKg * totalRai);
  const maxYieldKg = Math.round(selectedCrop.avgYieldPerRaiKg * 1.25 * totalRai);

  const price = selectedCrop.currentPrice;

  // Revenue calculation for Durian
  const expRevenue = selectedCrop.unit.includes('ผล')
    ? Math.round(expYieldKg * price) // Fruit count for Kanyao
    : Math.round(expYieldKg * price);

  const expNetProfit = expRevenue - totalEstimatedCost;

  return (
    <div id="tour-step-5" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span className="font-semibold text-emerald-700">
            {lang === 'th' ? 'ระบบวางแผนสวนทุเรียนอัจฉริยะ' : 'Precision Durian Agro-Planning'}
          </span>
          <span>·</span>
          <span>{lang === 'th' ? `พื้นที่เป้าหมาย: ${selectedProvince}` : `Target: ${selectedProvince}`}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {lang === 'th' ? 'วางแผนการจัดการสวนทุเรียน ประเมินผลผลิต และต้นทุน' : 'Durian Orchard Yield & Financial Planner'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          {lang === 'th'
            ? 'วิเคราะห์ความเหมาะสมของสายพันธุ์ทุเรียน ชนิดดิน แหล่งน้ำ และเป้าหมายการทำสวน เพื่อคำนวณต้นทุนการผลิต คาดการณ์ผลผลิตส่งออก และกำไรสุทธิ'
            : 'Evaluate durian varieties, soil drainage, precision irrigation, and market goals for data-backed yield projections.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Farm Parameters Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'th' ? '1. ข้อมูลสภาพพื้นที่และเป้าหมายสวนทุเรียน' : '1. Durian Orchard Parameters'}</span>
            </h3>

            {/* Thai Land Measurements */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                {lang === 'th' ? 'ขนาดพื้นที่ทำกิน (ไร่ - งาน - ตารางวา)' : 'Land Area (Rai - Ngan - Sq.Wa)'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">{lang === 'th' ? 'ไร่ (Rai)' : 'Rai'}</span>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={rai}
                    onChange={(e) => setRai(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">{lang === 'th' ? 'งาน (Ngan)' : 'Ngan'}</span>
                  <input
                    type="number"
                    min="0"
                    max="3"
                    value={ngan}
                    onChange={(e) => setNgan(Math.min(3, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block mb-0.5">{lang === 'th' ? 'ตารางวา (Wa)' : 'Sq.Wa'}</span>
                  <input
                    type="number"
                    min="0"
                    max="399"
                    value={wa}
                    onChange={(e) => setWa(Math.min(399, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full text-xs font-mono font-bold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <span className="text-[11px] text-slate-500 font-mono mt-1.5 block">
                = {totalSqm.toLocaleString()} {lang === 'th' ? 'ตารางเมตร' : 'sq.m.'} ({sqmToString(totalSqm, lang)})
              </span>
            </div>

            {/* Soil Type Picker */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {lang === 'th' ? 'ลักษณะเนื้อดินและการเตรียมแปลง' : 'Soil & Drainage Setup'}
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="sandy_loam">ดินร่วนปนทรายยกร่องลูกฟูก (Sandy Loam - ระบายน้ำดีเยี่ยม)</option>
                <option value="clay_ditch">ดินร่วนท้องร้องสวนนนทบุรี (Rich Alluvial - รักษาระดับน้ำร่องสวน)</option>
                <option value="mound">ยกร่องสูง 80 ซม. พร้อมระบบน้ำหยดโซลาร์ (Solar Drip Mound)</option>
              </select>
            </div>

            {/* Water Access */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {lang === 'th' ? 'ความมั่นคงของแหล่งน้ำสวนทุเรียน' : 'Water Security'}
              </label>
              <select
                value={waterAccess}
                onChange={(e) => setWaterAccess(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="canal">คลองส่งน้ำชลประทาน + บ่อพักสระประจำแปลง (High Security)</option>
                <option value="pond_well">สระกักเก็บน้ำ + บ่อบาดาลโซลาร์เซลล์ True 5G Smart Drip (Optimal)</option>
                <option value="rainfed">อาศัยสระกักเก็บน้ำฝนธรรมชาติ (Rainfed Storage)</option>
              </select>
            </div>

            {/* Goal */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {lang === 'th' ? 'เป้าหมายการทำสวนทุเรียน' : 'Primary Durian Market Goal'}
              </label>
              <select
                value={farmingGoal}
                onChange={(e) => setFarmingGoal(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="export_quality">ส่งออกตลาดจีนเกรด AB (Export AB Grade Monthong)</option>
                <option value="heritage_premium">ทุเรียนก้านยาวพรีเมียมเฉพาะถิ่น (Nonthaburi Heritage Pre-order)</option>
                <option value="expansion">ขยายแปลงปลูกใหม่ใช้เป็นหลักประกันเงินกู้ (New Young Orchard Collateral)</option>
              </select>
            </div>
          </div>

          {/* Suitability Ranking List */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {lang === 'th' ? 'คะแนนความเหมาะสมตามสภาพแปลง' : 'Crop Suitability Index'}
            </span>
            <div className="space-y-2">
              {suitabilityScores.map(({ crop: c, score }) => (
                <button
                  key={c.id}
                  onClick={() => setChosenCropId(c.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    chosenCropId === c.id
                      ? 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-semibold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: c.color }}
                    />
                    <span className="text-xs">{lang === 'th' ? c.nameThai : c.nameEnglish}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <span
                      className={`font-bold ${
                        score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-amber-700' : 'text-slate-500'
                      }`}
                    >
                      {score}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {score >= 80 ? (lang === 'th' ? 'เหมาะมาก' : 'Optimal') : (lang === 'th' ? 'พอใช้' : 'Fair')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Breakdown & Seasonal Calendar (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            {/* Header: Chosen Crop Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs text-slate-500">
                  {lang === 'th' ? 'ประมาณการสำหรับแปลงขนาด' : 'Projection for'} {rai} {lang === 'th' ? 'ไร่' : 'Rai'}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-0.5">
                  {lang === 'th' ? selectedCrop.nameThai : selectedCrop.nameEnglish}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">{lang === 'th' ? 'ราคาอ้างอิงหน้าสวน' : 'Benchmark Price'}</span>
                <div className="text-lg font-bold font-mono text-emerald-700 tabular-nums">
                  ฿{selectedCrop.currentPrice.toLocaleString()} {selectedCrop.priceUnit}
                </div>
              </div>
            </div>

            {/* Financial Projection KPI Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">
                  {lang === 'th' ? 'ต้นทุนรวมต่อฤดูกาล/ปี' : 'Total Est. Production Cost'}
                </span>
                <span className="text-lg font-bold font-mono text-rose-600 tabular-nums mt-1 block">
                  ฿{totalEstimatedCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400">
                  (฿{costPerRai.toLocaleString()} {lang === 'th' ? 'บาท/ไร่' : 'THB/Rai'})
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 block">
                  {lang === 'th' ? 'ผลผลิตที่คาดว่าจะได้' : 'Expected Harvest Volume'}
                </span>
                <span className="text-lg font-bold font-mono text-slate-900 tabular-nums mt-1 block">
                  {expYieldKg.toLocaleString()} {lang === 'th' ? 'กก.' : 'kg'}
                </span>
                <span className="text-[10px] text-slate-400">
                  ({minYieldKg.toLocaleString()} - {maxYieldKg.toLocaleString()} kg)
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block">
                  {lang === 'th' ? 'กำไรสุทธิโดยประมาณ' : 'Est. Net Annual Profit'}
                </span>
                <span className="text-lg font-bold font-mono text-emerald-700 tabular-nums mt-1 block">
                  ฿{expNetProfit.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-600 font-medium">
                  {expNetProfit > 0
                    ? `+${((expNetProfit / totalEstimatedCost) * 100).toFixed(0)}% ROI`
                    : 'ระยะสะสมต้นทุน'}
                </span>
              </div>
            </div>

            {/* Cost Breakdown Sheet */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800">
                {lang === 'th' ? 'รายละเอียดโครงสร้างต้นทุนการผลิต (Cost Structure per Rai)' : 'Cost Structure per Rai'}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">{lang === 'th' ? 'เตรียมดิน/ยกร่อง' : 'Tillage & Prep'}</span>
                  <span className="font-semibold text-slate-700 font-mono">20%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">{lang === 'th' ? 'ปุ๋ย & ชีวภัณฑ์' : 'Fertilizers'}</span>
                  <span className="font-semibold text-slate-700 font-mono">35%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">{lang === 'th' ? 'แรงงานดูแล/ตัดแต่ง' : 'Labor & Pruning'}</span>
                  <span className="font-semibold text-slate-700 font-mono">30%</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block">{lang === 'th' ? 'พลังงานสูบน้ำ' : 'Irrigation Energy'}</span>
                  <span className="font-semibold text-slate-700 font-mono">15%</span>
                </div>
              </div>
            </div>

            {/* Seasonal Crop Calendar */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'th' ? 'ปฏิทินฤดูกาลเพาะปลูกและเก็บเกี่ยว' : 'Seasonal Agronomic Calendar'}</span>
              </span>

              <div className="grid grid-cols-12 gap-1 text-center font-mono text-[10px]">
                {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map((m, idx) => {
                  const monthNum = idx + 1;
                  const isPeak = monthNum === selectedCrop.peakHarvestMonth;
                  const isHarvestSeason =
                    selectedCrop.id === 'durian' ? monthNum >= 4 && monthNum <= 7 :
                    selectedCrop.id === 'rice' ? monthNum >= 11 && monthNum <= 12 :
                    selectedCrop.id === 'cassava' ? monthNum >= 12 || monthNum <= 3 :
                    selectedCrop.id === 'mango' ? monthNum >= 3 && monthNum <= 5 : true;

                  return (
                    <div
                      key={m}
                      className={`p-1.5 rounded-md border flex flex-col items-center justify-center ${
                        isPeak
                          ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                          : isHarvestSeason
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                          : 'bg-slate-50 text-slate-400 border-slate-100'
                      }`}
                    >
                      <span>{m}</span>
                      <span className="text-[8px] mt-0.5">
                        {isPeak ? 'ยอด' : isHarvestSeason ? 'เก็บ' : '-'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600 inline-block" />
                <span>{lang === 'th' ? 'เดือนผลผลิตสูงสุด (Peak Harvest)' : 'Peak Harvest'}</span>
                <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-300 inline-block ml-2" />
                <span>{lang === 'th' ? 'ช่วงเก็บเกี่ยวทั่วไป' : 'Harvest Window'}</span>
              </div>
            </div>
          </div>

          {/* ESG Net Zero Carbon Credit Calculator Card */}
          <EsgCarbonCalculator lang={lang} totalFarmRai={rai} />
        </div>
      </div>
    </div>
  );
};
