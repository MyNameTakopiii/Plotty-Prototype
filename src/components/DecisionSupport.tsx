/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FARM_SCENARIOS, ScenarioModel } from '../data/agriData';
import {
  GitCompare,
  TrendingUp,
  AlertTriangle,
  Droplets,
  DollarSign,
  Clock,
  ShieldCheck,
  Printer,
  Sliders,
  CheckCircle2,
} from 'lucide-react';

interface DecisionSupportProps {
  lang: 'th' | 'en';
}

export const DecisionSupport: React.FC<DecisionSupportProps> = ({ lang }) => {
  const [scenarios] = useState<ScenarioModel[]>(FARM_SCENARIOS);
  const [priceStressModifier, setPriceStressModifier] = useState<number>(0); // -20%, 0%, +20%
  const [selectedPlanId, setSelectedPlanId] = useState<string>('durian_coffee_orchard');

  const activePlan = scenarios.find((s) => s.id === selectedPlanId) || scenarios[1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">
              {lang === 'th' ? 'ระบบสนับสนุนการตัดสินใจเชิงเศรษฐศาสตร์' : 'Farm Economics & Risk Engine'}
            </span>
            <span>·</span>
            <span>{lang === 'th' ? 'เปรียบเทียบพหุฉากทัศน์' : 'Multi-Scenario Trade-offs'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {lang === 'th' ? 'เปรียบเทียบแผนการเพาะปลูก ผลตอบแทน และความเสี่ยง' : 'Farm Scenario Comparison & Decision Support'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {lang === 'th'
              ? 'เปรียบเทียบข้อดี-ข้อเสีย ระหว่างการปลูกพืชเชิงเดี่ยว พืชทนแล้ง และไม้ผลมูลค่าสูง วิเคราะห์จุดคุ้มทุน การใช้น้ำ และความเสี่ยงราคา'
              : 'Compare trade-offs between monoculture staples, drought-resilient cash crops, and high-value agroforestry orchards.'}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-xs self-start md:self-auto cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>{lang === 'th' ? 'พิมพ์รายงานแผนฟาร์ม' : 'Export / Print Plan'}</span>
        </button>
      </div>

      {/* Stress Test Slider Card */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <Sliders className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">
            {lang === 'th' ? 'จำลองแรงกดดันราคาตลาด (Market Price Sensitivity Stress Test):' : 'Price Stress Sensitivity Test:'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {[-20, -10, 0, 10, 20].map((val) => (
            <button
              key={val}
              onClick={() => setPriceStressModifier(val)}
              className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border transition-all ${
                priceStressModifier === val
                  ? val > 0
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : val < 0
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {val > 0 ? `+${val}%` : `${val}%`}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Comparison Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scenarios.map((sc) => {
          const isSelected = selectedPlanId === sc.id;
          const stressedYear5 = Math.round(sc.year5ProfitTHB * (1 + priceStressModifier / 100));
          const stressedCumulative10 = Math.round(sc.year10CumulativeNetTHB * (1 + priceStressModifier / 100));

          return (
            <div
              key={sc.id}
              onClick={() => setSelectedPlanId(sc.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-600 ring-2 ring-emerald-500/30 bg-white shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      isSelected ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {lang === 'th' ? `ขนาดแปลง ${sc.landRai} ไร่` : `${sc.landRai} Rai`}
                  </span>
                  {isSelected && (
                    <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{lang === 'th' ? 'แผนที่เลือก' : 'Active'}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {lang === 'th' ? sc.titleThai : sc.titleEnglish}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{sc.summaryThai}</p>

                {/* Key Financial KPIs */}
                <div className="space-y-2 py-3 border-y border-slate-100 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === 'th' ? 'เงินลงทุนเริ่มแรก (Capex):' : 'Initial Capex:'}</span>
                    <span className="font-bold text-slate-800">฿{sc.capexTHB.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === 'th' ? 'ต้นทุนรายปี (Opex):' : 'Annual Opex:'}</span>
                    <span className="font-bold text-slate-800">฿{sc.annualOpexTHB.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === 'th' ? 'กำไรสะสมปีที่ 5:' : 'Year 5 Profit:'}</span>
                    <span
                      className={`font-bold ${
                        stressedYear5 >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      ฿{stressedYear5.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === 'th' ? 'กำไรสุทธิสะสม 10 ปี:' : '10-Yr Total Net:'}</span>
                    <span className="font-bold text-emerald-800 text-sm">
                      ฿{stressedCumulative10.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{lang === 'th' ? 'ระยะเวลาคืนทุน:' : 'Payback Period:'}</span>
                    <span className="font-bold text-slate-900">{sc.paybackPeriodYears} {lang === 'th' ? 'ปี' : 'Years'}</span>
                  </div>
                </div>

                {/* Risk Radar Strip */}
                <div className="pt-3 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span>{lang === 'th' ? 'ความเสี่ยงขาดแคลนน้ำ:' : 'Water Stress Risk:'}</span>
                    </span>
                    <span
                      className={`font-semibold ${
                        sc.waterStressRisk === 'high'
                          ? 'text-rose-600'
                          : sc.waterStressRisk === 'medium'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {sc.waterStressRisk === 'high' ? (lang === 'th' ? 'สูง' : 'High') : sc.waterStressRisk === 'medium' ? (lang === 'th' ? 'ปานกลาง' : 'Med') : (lang === 'th' ? 'ต่ำ' : 'Low')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" />
                      <span>{lang === 'th' ? 'ความผันผวนของราคา:' : 'Price Volatility:'}</span>
                    </span>
                    <span
                      className={`font-semibold ${
                        sc.priceVolatilityRisk === 'high'
                          ? 'text-rose-600'
                          : sc.priceVolatilityRisk === 'medium'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {sc.priceVolatilityRisk === 'high' ? (lang === 'th' ? 'สูง' : 'High') : sc.priceVolatilityRisk === 'medium' ? (lang === 'th' ? 'ปานกลาง' : 'Med') : (lang === 'th' ? 'ต่ำ' : 'Low')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <button
                  className={`w-full py-2 rounded-xl text-xs font-bold transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {isSelected ? (lang === 'th' ? 'ดูรายละเอียดแผนนี้' : 'Active Plan') : (lang === 'th' ? 'เลือกแผนนี้' : 'Select Plan')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep Dive on Active Selected Plan */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-emerald-600" />
          <span>
            {lang === 'th' ? 'ข้อแนะนำเชิงกลยุทธ์สำหรับแผน:' : 'Strategic Advice for:'} {lang === 'th' ? activePlan.titleThai : activePlan.titleEnglish}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 block font-semibold">
              {lang === 'th' ? '1. การจัดการเงินทุนและกระแสเงินสด' : '1. Capital & Cashflow Management'}
            </strong>
            <p className="leading-relaxed">
              {activePlan.id === 'durian_coffee_orchard'
                ? lang === 'th'
                  ? 'ช่วง 1-4 ปีแรกไม่มีรายได้จากทุเรียน ควรปลูกกล้วยน้ำว้าหรือฟักทองแซมระหว่างร่องเพื่อสร้างรายได้หมุนเวียน และกู้สินเชื่อปรับเปลี่ยนการผลิต ธ.ก.ส. ปลอดเงินต้น 4 ปี'
                  : 'Intercrop bananas or pumpkins in years 1-4 to generate bridge cash flow while trees mature. Apply for BAAC 4-year principal grace period.'
                : lang === 'th'
                ? 'ต้นทุนต่ำ สามารถหมุนเวียนเงินได้ภายใน 4-10 เดือน เหมาะกับเกษตรกรที่ไม่มีเงินสำรองก้อนใหญ่'
                : 'Low capital requirement with quick 4-10 month liquidity turnover.'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 block font-semibold">
              {lang === 'th' ? '2. การป้องกันความเสี่ยงด้านสภาพอากาศ' : '2. Climate & Water Risk Mitigation'}
            </strong>
            <p className="leading-relaxed">
              {activePlan.waterStressRisk === 'high'
                ? lang === 'th'
                  ? 'ต้องขุดสระเก็บน้ำขนาดไม่ต่ำกว่า 1,200 ลบ.ม. ต่อพื้นที่ 5 ไร่ หรือติดตั้งระบบน้ำหยด/มินิสปริงเกลอร์ที่ควบคุมด้วยโซลาร์เซลล์'
                  : 'Requires retention pond > 1,200 m³ per 5 Rai or solar-powered mini-sprinklers.'
                : lang === 'th'
                ? 'ทนแล้งสูง หากฝนทิ้งช่วง 1-2 เดือน พืชยังสามารถฟื้นตัวได้ดีเมื่อได้รับน้ำ'
                : 'High drought tolerance; plants recover rapidly after dry spells.'}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <strong className="text-slate-900 block font-semibold">
              {lang === 'th' ? '3. การทำสัญญาและการตลาด' : '3. Off-take Marketing & Contracts'}
            </strong>
            <p className="leading-relaxed">
              {lang === 'th'
                ? 'ควรเข้าร่วมกลุ่มวิสาหกิจชุมชนหรือสหกรณ์การเกษตรเพื่อทำสัญญาข้อตกลงซื้อขายล่วงหน้า (Contract Farming) ป้องกันการถูกกดราคาช่วงเก็บเกี่ยวหนาแน่น'
                : 'Join local farmer cooperatives to secure forward delivery contracts and hedge against seasonal wholesale troughs.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
