/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calculator, Coins, TrendingUp, Building2, Layers, CheckCircle2, ShieldCheck } from 'lucide-react';

interface CropYieldPlannerProps {
  lang: 'th' | 'en';
  selectedProvince?: string;
}

interface PlotOption {
  id: string;
  name: string;
  areaRai: number;
  treeCount: number;
  valuePerTree: number;
  creditGrade: string;
}

const USER_PLOTS: PlotOption[] = [
  {
    id: 'all',
    name: 'รวมทุกแปลงในสวน (All 3 Plots)',
    areaRai: 105,
    treeCount: 2595,
    valuePerTree: 1457,
    creditGrade: 'GRADE A+',
  },
  {
    id: 'plot_a',
    name: 'แปลง A — น้ำดอกไม้สีทอง (70 ไร่)',
    areaRai: 70,
    treeCount: 1750,
    valuePerTree: 1600,
    creditGrade: 'GRADE A+',
  },
  {
    id: 'plot_b',
    name: 'แปลง B — มหาชนกส่งออก (25 ไร่)',
    areaRai: 25,
    treeCount: 625,
    valuePerTree: 1400,
    creditGrade: 'GRADE A',
  },
  {
    id: 'plot_c',
    name: 'แปลง C — เขียวสามรส (10 ไร่)',
    areaRai: 10,
    treeCount: 220,
    valuePerTree: 1100,
    creditGrade: 'GRADE B+',
  },
];

export const CropYieldPlanner: React.FC<CropYieldPlannerProps> = ({ lang }) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>('all');

  const selectedPlot = USER_PLOTS.find((p) => p.id === selectedPlotId) || USER_PLOTS[0];

  const totalAppraisedTreeValue = selectedPlot.treeCount * selectedPlot.valuePerTree;
  const maxBaacLoanAmount = Math.round(totalAppraisedTreeValue * 0.66);
  const estimatedMonthlyPayment = Math.round((maxBaacLoanAmount * 0.0525) / 12);

  return (
    <div className="space-y-4 text-xs sm:text-sm">
      {/* Title Card */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm">
                {lang === 'th' ? 'แบบคำนวณวงเงินสินเชื่อไม้ยืนต้นดิจิทัล (ธ.ก.ส.)' : 'BAAC Tree Credit Loan Calculator'}
              </h4>
              <span className="text-[11px] text-slate-600 block">
                คำนวณประเมินมูลค่าหลักประกันไม้ยืนต้นจริงตาม พ.ร.บ.หลักประกันทางธุรกิจ 2558
              </span>
            </div>
          </div>
          <span className="text-xs bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded shadow-2xs shrink-0">
            ดอกเบี้ยพิเศษ MRR - 2.25%
          </span>
        </div>

        {/* User Plot Selector */}
        <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2">
          <span className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>เลือกแปลงหลักประกันเพื่อประเมินวงเงินกู้:</span>
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {USER_PLOTS.map((plot) => (
              <button
                key={plot.id}
                onClick={() => setSelectedPlotId(plot.id)}
                className={`p-2 rounded-xl text-xs font-bold text-left transition-all cursor-pointer border ${
                  selectedPlotId === plot.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <div className="truncate">{plot.name.split('—')[0].trim()}</div>
                <div className="text-[10px] font-mono opacity-80 mt-0.5">
                  {plot.treeCount.toLocaleString()} ต้น ({plot.areaRai} ไร่)
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Calculated Loan Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
          <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-slate-500 font-sans block text-[11px]">จำนวนไม้ยืนต้นหลักประกัน</span>
            <span className="text-lg font-black text-slate-900 block mt-1">
              {selectedPlot.treeCount.toLocaleString()} ต้น
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              เนื้อที่รวม {selectedPlot.areaRai} ไร่ ({selectedPlot.creditGrade})
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs">
            <span className="text-slate-500 font-sans block text-[11px]">มูลค่าไม้ยืนต้นประเมินรวม</span>
            <span className="text-lg font-black text-emerald-700 block mt-1">
              ฿{totalAppraisedTreeValue.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 font-sans">
              เฉลี่ย ฿{selectedPlot.valuePerTree.toLocaleString()} / ต้น
            </span>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 shadow-2xs">
            <span className="text-amber-900 font-sans block text-[11px] font-bold">วงเงินกู้สูงสุด (LTV 66%)</span>
            <span className="text-lg font-black text-amber-900 block mt-1">
              ฿{maxBaacLoanAmount.toLocaleString()}
            </span>
            <span className="text-[10px] text-amber-800 font-sans font-bold">
              ระยะเวลาผ่อน 10-15 ปี
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-emerald-200/80 text-xs text-slate-700 space-y-1">
          <div className="flex justify-between">
            <span>ระยะเวลาปลอดชำระเงินต้น:</span>
            <span className="font-bold text-slate-900 font-mono">3 ปีแรก (ชำระเฉพาะดอกเบี้ย)</span>
          </div>
          <div className="flex justify-between">
            <span>ค่างวดผ่อนชำระประมาณการ (เดือน):</span>
            <span className="font-bold text-emerald-800 font-mono">
              ฿{estimatedMonthlyPayment.toLocaleString()} / เดือน
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
