/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Calendar, AlertCircle, Layers, Sliders, ArrowUpRight, Award } from 'lucide-react';

interface PriceForecasterProps {
  lang: 'th' | 'en';
}

interface PlotOption {
  id: string;
  name: string;
  cropName: string;
  areaRai: number;
  treeCount: number;
  avgYieldPerRaiKg: number;
  currentPricePerKg: number;
  peakPricePerKg: number;
  costPerRai: number;
}

const USER_PLOTS: PlotOption[] = [
  {
    id: 'all',
    name: 'รวมทุกแปลงในสวน (All 3 Plots)',
    cropName: 'มะม่วง 3 สายพันธุ์ (น้ำดอกไม้, มหาชนก, เขียวสามรส)',
    areaRai: 105,
    treeCount: 2595,
    avgYieldPerRaiKg: 2450,
    currentPricePerKg: 45,
    peakPricePerKg: 62.5,
    costPerRai: 17500,
  },
  {
    id: 'plot_a',
    name: 'แปลง A — น้ำดอกไม้สีทอง',
    cropName: 'มะม่วงน้ำดอกไม้สีทอง (Export Grade)',
    areaRai: 70,
    treeCount: 1750,
    avgYieldPerRaiKg: 2500,
    currentPricePerKg: 45,
    peakPricePerKg: 65,
    costPerRai: 18000,
  },
  {
    id: 'plot_b',
    name: 'แปลง B — มหาชนกส่งออก',
    cropName: 'มะม่วงมหาชนก (Premium Rainbow)',
    areaRai: 25,
    treeCount: 625,
    avgYieldPerRaiKg: 2200,
    currentPricePerKg: 55,
    peakPricePerKg: 72,
    costPerRai: 20000,
  },
  {
    id: 'plot_c',
    name: 'แปลง C — เขียวสามรส',
    cropName: 'มะม่วงเขียวสามรส & ฟ้าลั่น',
    areaRai: 10,
    treeCount: 220,
    avgYieldPerRaiKg: 3000,
    currentPricePerKg: 28,
    peakPricePerKg: 35,
    costPerRai: 15000,
  },
];

export const PriceForecaster: React.FC<PriceForecasterProps> = ({ lang }) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>('all');
  const [customRai, setCustomRai] = useState<number>(70);

  const selectedPlot = USER_PLOTS.find((p) => p.id === selectedPlotId) || USER_PLOTS[0];

  const activeRai = selectedPlotId === 'custom' ? customRai : selectedPlot.areaRai;
  const totalYieldKg = activeRai * selectedPlot.avgYieldPerRaiKg;
  const currentRevenueTHB = totalYieldKg * selectedPlot.currentPricePerKg;
  const peakRevenueTHB = totalYieldKg * selectedPlot.peakPricePerKg;
  const totalCostTHB = activeRai * selectedPlot.costPerRai;
  const netProfitPeakTHB = peakRevenueTHB - totalCostTHB;

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      {/* Title Header */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-start gap-2.5 text-blue-900">
        <TrendingUp className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold block text-sm">
            {lang === 'th' ? 'แบบจำลองพยากรณ์ราคามะม่วง & รายได้ล่วงหน้า 12 เดือน' : '12-Month Export Mango Revenue Forecast'}
          </span>
          <span className="text-xs text-blue-800 font-medium">
            {lang === 'th'
              ? 'คำนวณรายได้คาดการณ์จากข้อมูลแปลงจริงของเกษตรกร ร่วมกับดัชนีราคารับซื้อล้งส่งออกพรีเมียม'
              : 'Calculates projected revenue from user plot data & export market indices.'}
          </span>
        </div>
      </div>

      {/* User Plot Selection Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>เลือกแปลงสวนมะม่วงสำหรับคำนวณรายได้:</span>
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            พิกัด: อ.บางคล้า จ.ฉะเชิงเทรา
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {USER_PLOTS.map((plot) => (
            <button
              key={plot.id}
              onClick={() => setSelectedPlotId(plot.id)}
              className={`p-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                selectedPlotId === plot.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              <div className="truncate">{plot.name}</div>
              <div className="text-[10px] font-mono opacity-80 mt-0.5">
                {plot.areaRai} ไร่ ({plot.treeCount.toLocaleString()} ต้น)
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Calculations Cards derived from user plot */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-slate-500 text-xs block font-bold">ผลผลิตประเมิน ({activeRai} ไร่)</span>
          <span className="text-xl font-black text-slate-900 font-mono">
            {totalYieldKg.toLocaleString()} กก.
          </span>
          <span className="text-[11px] text-slate-600 block">
            เฉลี่ย {selectedPlot.avgYieldPerRaiKg.toLocaleString()} กก./ไร่
          </span>
        </div>

        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-emerald-900 text-xs font-bold block">คาดการณ์รายได้สูงสุด (ช่วง Peak)</span>
          <span className="text-xl font-black text-emerald-700 font-mono">
            ฿{peakRevenueTHB.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-800 font-bold block">
            @ ฿{selectedPlot.peakPricePerKg}/กก. (ส่งออกญี่ปุ่น/เกาหลี)
          </span>
        </div>

        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 shadow-2xs">
          <span className="text-amber-900 text-xs font-bold block">กำไรสุทธิประมาณการ</span>
          <span className="text-xl font-black text-amber-900 font-mono">
            ฿{netProfitPeakTHB.toLocaleString()}
          </span>
          <span className="text-[11px] text-amber-800 block font-medium">
            หลังหักต้นทุนรวม ฿{totalCostTHB.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 12 Months Price & Revenue Schedule */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
          <span>ตารางคาดการณ์ราคา & รายได้รายเดือน ({selectedPlot.name})</span>
          <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono">
            อิงปริมาณผลผลิต {totalYieldKg.toLocaleString()} กก.
          </span>
        </div>

        <div className="divide-y divide-slate-100 font-mono text-xs">
          {[
            { month: 'มกราคม 2569', price: '42.00 - 46.00', avgP: 44, trend: 'เพิ่มขึ้น', color: 'text-emerald-700' },
            { month: 'กุมภาพันธ์ 2569', price: '48.00 - 52.00', avgP: 50, trend: 'เพิ่มขึ้น', color: 'text-emerald-700' },
            { month: 'มีนาคม 2569', price: '52.00 - 58.00', avgP: 55, trend: 'สูงชัน', color: 'text-emerald-700 font-bold' },
            { month: 'เมษายน 2569 (Peak)', price: '58.00 - 65.00', avgP: 61.5, trend: 'สูงสุดปี', color: 'text-emerald-800 font-black' },
            { month: 'พฤษภาคม 2569', price: '50.00 - 55.00', avgP: 52.5, trend: 'ชะลอตัว', color: 'text-amber-700' },
            { month: 'มิถุนายน 2569', price: '32.00 - 38.00', avgP: 35, trend: 'ปรับฐาน', color: 'text-slate-600' },
          ].map((item, idx) => {
            const monthlyRevenue = Math.round(totalYieldKg * (item.avgP / 6) * 0.4); // distributed harvest
            return (
              <div key={idx} className="px-4 py-2.5 flex justify-between items-center hover:bg-slate-50">
                <span className="font-sans font-semibold text-slate-800 min-w-[120px]">{item.month}</span>
                <span className="font-bold text-slate-900">฿{item.price}/กก.</span>
                <span className={`text-[11px] ${item.color}`}>{item.trend}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
