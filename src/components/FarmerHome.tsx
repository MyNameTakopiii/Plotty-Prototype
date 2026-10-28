/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ProvinceWeatherWidget } from './ProvinceWeatherWidget';
import { EsgCarbonCalculator } from './EsgCarbonCalculator';
import {
  Activity,
  Leaf,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Box,
  Calculator,
  Stethoscope,
  ChevronRight,
  TrendingDown,
  DollarSign,
  Droplets,
  Calendar,
  Sparkles,
  CheckCircle2,
  Sliders,
  Coins,
  ShieldCheck,
  FileText,
  Award,
  Building2,
  X,
  MapPin,
} from 'lucide-react';
import { LandBoundary2DPreview, PRESET_BANGKRUAI_25_RAI } from './InteractiveLandBoundaryPicker';

interface FarmerHomeProps {
  lang: 'th' | 'en';
  setCurrentTab: (tab: string) => void;
  selectedProvince: string;
  setSelectedProvince?: (province: string) => void;
  onSelectPlotFor3D?: (plot: { cropId: string; areaRai: number; name: string }) => void;
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({
  lang,
  setCurrentTab,
  selectedProvince,
  setSelectedProvince,
  onSelectPlotFor3D,
}) => {
  const [selectedPlotId, setSelectedPlotId] = useState<string>('plot-a');
  const [profitPriceMultiplier, setProfitPriceMultiplier] = useState<number>(1.0); // 0.9 (-10%) to 1.15 (+15%)
  const [isOrganicSavingsApplied, setIsOrganicSavingsApplied] = useState<boolean>(true);
  const [esgTotals, setEsgTotals] = useState<{ totalTons: number; totalIncomeThb: number }>({
    totalTons: 303,
    totalIncomeThb: 121200,
  });

  // Demo Mode Action Listener
  React.useEffect(() => {
    const handleDemoAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.action === 'highlight_plot') {
        const plotId = customEvent.detail.plotId || 'plot-b';
        setSelectedPlotId(plotId);
      } else if (customEvent.detail?.action === 'open_passport_modal') {
        setShowPassportModal(true);
      }
    };
    window.addEventListener('kasetthai_demo_action', handleDemoAction);
    return () => window.removeEventListener('kasetthai_demo_action', handleDemoAction);
  }, []);

  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);

  // 4 Mango Farm Plots (Total 70 Rai, 3,150 Trees in Bang Khla, Chachoengsao)
  const farmPlots = [
    {
      id: 'plot-a',
      cropId: 'mango_namdokmai',
      nameTh: 'แปลง A — มะม่วงน้ำดอกไม้สีทอง (อายุ 6 ปี)',
      nameEn: 'Plot A — Nam Dok Mai Sri Thong (6Y Mature)',
      cropTh: 'มะม่วงน้ำดอกไม้สีทอง (เกรดส่งออก Premium)',
      cropEn: 'Nam Dok Mai Sri Thong (Export Grade)',
      areaRai: 25,
      treeCount: 1125,
      treeValueThb: 1687500, // 1,500 THB/tree collateral
      stageTh: 'ระยะติดผลผลิต & ห่อผลป้องกันแมลง',
      stageEn: 'Fruit Set & Bagging Stage',
      status: 'normal',
      statusLabelTh: 'เกรด A+ ผ่านเกณฑ์',
      statusLabelEn: 'Grade A+ Passed',
      statusBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accentColor: 'bg-emerald-500',
      score: 95,
      scoreBarColor: 'bg-emerald-500',
      estimatedYieldKg: 62500,
      estimatedYieldText: '62,500 kg (เกรดส่งออก)',
      baseRevenueThb: 2812500,
      baseCostThb: 450000,
    },
    {
      id: 'plot-b',
      cropId: 'mango_mahachanok',
      nameTh: 'แปลง B — มะม่วงมหาชนก (อายุ 8 ปี พรีเมียม)',
      nameEn: 'Plot B — Mahachanok (8Y Premium)',
      cropTh: 'มะม่วงมหาชนก (สีรุ้งพรีเมียม)',
      cropEn: 'Mahachanok (Rainbow Premium)',
      areaRai: 15,
      treeCount: 675,
      treeValueThb: 1350000, // 2,000 THB/tree
      stageTh: 'ระยะพัฒนาสีผล & ควบคุมความหวาน',
      stageEn: 'Color Development & Brix Stage',
      status: 'normal',
      statusLabelTh: 'ปกติ สมบูรณ์',
      statusLabelEn: 'Normal & Thriving',
      statusBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accentColor: 'bg-emerald-500',
      score: 92,
      scoreBarColor: 'bg-emerald-500',
      estimatedYieldKg: 33000,
      estimatedYieldText: '33,000 kg',
      baseRevenueThb: 1815000,
      baseCostThb: 300000,
    },
    {
      id: 'plot-c',
      cropId: 'mango_rad',
      nameTh: 'แปลง C — เขียวสามรส & ฟ้าลั่น (อายุ 5 ปี)',
      nameEn: 'Plot C — Green Three-Flavor & Falan (5Y)',
      cropTh: 'มะม่วงเขียวสามรส & ฟ้าลั่น',
      cropEn: 'Green Three-Flavor & Falan',
      areaRai: 18,
      treeCount: 810,
      treeValueThb: 972000, // 1,200 THB/tree
      stageTh: 'ระยะสะสมอาหาร & คุมน้ำหยด IoT',
      stageEn: 'Nutrition & IoT Drip Stage',
      status: 'watch',
      statusLabelTh: 'เฝ้าระวังราแป้ง',
      statusLabelEn: 'Watch Powdery Mildew',
      statusBadgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      accentColor: 'bg-amber-500',
      score: 79,
      scoreBarColor: 'bg-amber-500',
      estimatedYieldKg: 54000,
      estimatedYieldText: '54,000 kg',
      baseRevenueThb: 1350000,
      baseCostThb: 270000,
    },
    {
      id: 'plot-d',
      cropId: 'mango_young',
      nameTh: 'แปลง D — แปลงปลูกใหม่ Smart Drip (อายุ 1 ปี)',
      nameEn: 'Plot D — Young Orchard (1Y Smart Drip)',
      cropTh: 'มะม่วงน้ำดอกไม้ปลูกใหม่ (สมาร์ทดริป)',
      cropEn: 'Young Nam Dok Mai Mango',
      areaRai: 12,
      treeCount: 540,
      treeValueThb: 432000, // 800 THB/tree
      stageTh: 'ระยะสร้างทรงพุ่ม & โซลาร์เซลล์',
      stageEn: 'Canopy Formation & Solar Drip',
      status: 'normal',
      statusLabelTh: 'ปกติ',
      statusLabelEn: 'Normal',
      statusBadgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      accentColor: 'bg-emerald-500',
      score: 88,
      scoreBarColor: 'bg-emerald-500',
      estimatedYieldKg: 0,
      estimatedYieldText: 'ระยะสะสมกิ่ง (0 kg)',
      baseRevenueThb: 0,
      baseCostThb: 144000,
    },
  ];

  // Farm Alerts matching Mango Orchard focus
  const alerts = [
    {
      id: 'alert-1',
      titleTh: 'แปลง C — ความชื้นสูงเสี่ยงโรคราแป้งช่อดอก',
      titleEn: 'Plot C — High Humidity Powdery Mildew Risk',
      descTh: 'เซนเซอร์ True 5G IoT แจ้งเตือนความชื้นสัมพัทธ์ในแปลงสูง แนะนำพ่นสารป้องกันกำจัดเชื้อราก่อนดอกบาน',
      descEn: 'True 5G IoT sensor reports high humidity. Spray protective fungicide before bloom.',
      timeTh: '1 ชม. ที่แล้ว',
      timeEn: '1 hr ago',
      iconType: 'warning',
      actionTab: 'advisor',
    },
    {
      id: 'alert-2',
      titleTh: 'ล้งรับซื้อส่งออกเปิดสัญญาซื้อมะม่วงน้ำดอกไม้ล่วงหน้า (Pre-harvest)',
      titleEn: 'Export Packing House Pre-harvest Contract Opened',
      descTh: 'เสนอราคาประกันเกรดส่งออกขั้นต่ำ ฿45/กก. พร้อมใช้รายงาน 3D Digital Twin ยืนยันปริมาณผลผลิตในสัญญา',
      descEn: 'Minimum export price guarantee at ฿45/kg backed by 3D Digital Twin tree audit in sales agreement.',
      timeTh: '3 ชม. ที่แล้ว',
      timeEn: '3 hrs ago',
      iconType: 'info',
      actionTab: 'forecast',
    },
    {
      id: 'alert-3',
      titleTh: 'แปลง A มะม่วงน้ำดอกไม้ — ระยะห่อผลป้องกันแมลงวันทอง',
      titleEn: 'Plot A Nam Dok Mai — Fruit Bagging Window',
      descTh: 'แนะนำห่อผลมะม่วงด้วยถุงกระดาษคาร์บอนเมื่ออายุผลได้ 45-50 วัน เพื่อผิวผลสวยเกรดส่งออกญี่ปุ่น',
      descEn: 'Bag developing mango fruits with carbon paper bags at 45-50 days for flawless export skin.',
      timeTh: '1 วันที่แล้ว',
      timeEn: '1 day ago',
      iconType: 'info',
      actionTab: 'simulator',
    },
    {
      id: 'alert-4',
      titleTh: 'โฉนดเพื่อเกษตรกรรม ส.ป.ก. ผ่านการรับรองสิทธิ์',
      titleEn: 'ALRO Agricultural Title Verified for Credit',
      descTh: 'แปลงที่ดิน 70 ไร่ ตรวจสอบระเบียบปี 2566 พร้อมประเมินต้นมะม่วงเป็นหลักทรัพย์ตามเกณฑ์สินเชื่อดอกเบี้ยพิเศษ',
      descEn: '70-rai land meets 2023 ALRO decree, eligible for living tree collateral loan evaluation.',
      timeTh: '2 วันที่แล้ว',
      timeEn: '2 days ago',
      iconType: 'info',
      actionTab: 'advisor',
    },
  ];

  // Live Mango Wholesale Market Prices
  const marketPrices = [
    {
      cropTh: 'มะม่วงน้ำดอกไม้สีทอง (เกรดส่งออก)',
      cropEn: 'Nam Dok Mai Sri Thong (Export)',
      price: '45.00',
      unit: 'THB/กก.',
      change: '+4.50%',
      isPositive: true,
      changeTextTh: '▲ 4.50% ตลาดญี่ปุ่น/เกาหลี',
      changeTextEn: '▲ 4.50% Japan/Korea export demand',
    },
    {
      cropTh: 'มะม่วงมหาชนก (สีรุ้งพรีเมียม)',
      cropEn: 'Mahachanok (Rainbow Premium)',
      price: '55.00',
      unit: 'THB/กก.',
      change: '+6.20%',
      isPositive: true,
      changeTextTh: '▲ 6.20% ห้างโมเดิร์นทรีต',
      changeTextEn: '▲ 6.20% Modern retail premium',
    },
    {
      cropTh: 'มะม่วงเขียวสามรส & ฟ้าลั่น (บริโภคสด)',
      cropEn: 'Green Three-Flavor & Falan',
      price: '25.00',
      unit: 'THB/กก.',
      change: '+1.80%',
      isPositive: true,
      changeTextTh: '▲ 1.80% ตลาดค้าส่งผลไม้สด',
      changeTextEn: '▲ 1.80% Fresh wholesale market',
    },
  ];

  // Profit calculation for the whole 70-rai farm
  const totalBaseRevenue = farmPlots.reduce((sum, p) => sum + p.baseRevenueThb, 0);
  const costSavingsFactor = isOrganicSavingsApplied ? 0.88 : 1.0; // 12% savings with precision fertilizer
  const totalBaseCost = farmPlots.reduce((sum, p) => sum + p.baseCostThb, 0) * costSavingsFactor;

  const adjustedRevenue = Math.round(totalBaseRevenue * profitPriceMultiplier);
  const adjustedCost = Math.round(totalBaseCost);
  const netProfit = adjustedRevenue - adjustedCost;
  const profitMargin = Math.round((netProfit / adjustedRevenue) * 100);

  const handleLaunch3DForPlot = (plot: (typeof farmPlots)[0]) => {
    if (onSelectPlotFor3D) {
      onSelectPlotFor3D({
        cropId: plot.cropId,
        areaRai: plot.areaRai,
        name: plot.nameTh,
      });
    }
    setCurrentTab('simulator');
  };

  return (
    <div id="tour-step-1" className="space-y-6">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lang === 'th' ? 'แดชบอร์ดสวนมะม่วง & สินเชื่อดิจิทัล' : 'Mango Farm & Agri-Credit OS'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'th'
              ? 'ประเมินหลักทรัพย์ไม้ยืนต้น 1,750 ต้น • ตรวจสอบสิทธิ์ ส.ป.ก. • สุขภาพแปลง True 5G IoT • ประมาณการวงเงินสินเชื่อ'
              : 'Living Asset Collateral (1,750 Trees) • ALRO Land Title • True 5G IoT • Estimated Credit Limit'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 shadow-2xs self-start sm:self-auto flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-800">
            {selectedProvince === 'ฉะเชิงเทรา'
              ? (lang === 'th' ? 'พิกัดแปลง: อ.บางคล้า จ.ฉะเชิงเทรา' : 'Location: Bang Khla, Chachoengsao')
              : (lang === 'th' ? `พิกัดแปลง: จ.${selectedProvince}` : `Location: ${selectedProvince}`)}
          </span>
          {selectedProvince === 'ฉะเชิงเทรา' && (
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
              {lang === 'th' ? 'พื้นที่นำร่อง' : 'Pilot Area'}
            </span>
          )}
          <span className="text-slate-300">|</span>
          <span className="text-slate-500">
            {lang === 'th' ? 'อัปเดตล่าสุด: วันนี้' : 'Updated: Today'}
          </span>
        </div>
      </div>

      {/* 2. Real-time Province Agri-Weather Widget */}
      <ProvinceWeatherWidget
        lang={lang}
        selectedProvince={selectedProvince}
        onSelectProvince={setSelectedProvince}
      />

      {/* 3. Hero Feature: Agri-Credit & Living Asset Collateral Score Bar (Signature White + Mango Green + Mango Gold Theme) */}
      <div className="bg-white text-slate-900 rounded-2xl p-5 sm:p-6 shadow-sm border border-amber-200/80 ring-1 ring-amber-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                {lang === 'th'
                  ? 'พ.ร.บ.หลักประกันทางธุรกิจ พ.ศ. 2558'
                  : 'Business Collateral Act 2558'}
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {lang === 'th'
                  ? 'ประเมินต้นมะม่วงตามเกณฑ์สินเชื่อไม้ยืนต้น'
                  : 'Audited Living Asset for Bank Collateral'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>{lang === 'th' ? 'ดัชนีความน่าเชื่อถือสินเชื่อแปลงเกษตร:' : 'Plot Agri-Credit Rating:'}</span>
              <span className="text-emerald-700 font-mono">94 / 100</span>
              <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-md shadow-xs border border-amber-500/40">
                GRADE A+
              </span>
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed font-medium">
              {lang === 'th'
                ? 'แปลงสวนมะม่วง 70 ไร่ ผ่านการตรวจสอบ 3D Digital Twin, สิทธิ์ที่ดิน ส.ป.ก. ถูกระเบียบ 2566, เซนเซอร์ True 5G IoT ยืนยันความชื้นดิน และปลอดโรคแอนแทรคโนส พร้อมสำหรับนำข้อมูลไปยื่นขอสินเชื่อดอกเบี้ยพิเศษ'
                : '70-Rai Mango orchard audited via 3D Digital Twin, compliant ALRO title, True 5G IoT telemetry, zero Anthracnose.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200 text-right">
              <span className="text-[10px] text-slate-600 block font-semibold">
                {lang === 'th' ? 'ประมาณการวงเงินสินเชื่อ (อิงเกณฑ์ ธ.ก.ส.)' : 'Estimated Credit Limit (BAAC Criteria)'}
              </span>
              <span className="text-lg font-black text-amber-900 font-mono">
                ฿2,500,000
              </span>
              <span className="text-[10px] text-emerald-800 block font-mono font-bold">
                MRR - 2.25% (3.75%/ปี)
              </span>
            </div>

            <button
              onClick={() => setShowPassportModal(true)}
              className="px-4 py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer hover:scale-[1.02] border border-amber-300/40"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>{lang === 'th' ? 'เปิดเอกสารสรุปสินทรัพย์ดิจิทัล' : 'Digital Farm Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Top 5 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: พื้นที่สวนทุเรียน */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1">
              {lang === 'th' ? 'พื้นที่สวนมะม่วงรวม' : 'Total Orchard Area'}
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {lang === 'th' ? '70 ไร่' : '70 Rai'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'th' ? '1,750 ต้น (4 แปลง)' : '1,750 Trees (4 Plots)'}
            </div>
          </div>
        </div>

        {/* Card 2: คะแนนสุขภาพเฉลี่ย */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1">
              {lang === 'th' ? 'สุขภาพแปลงเฉลี่ย' : 'Avg. Orchard Health'}
            </div>
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              91/100
            </div>
            <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">
              {lang === 'th' ? 'ผ่านเกณฑ์พรีเมียม' : 'Premium Certified'}
            </div>
          </div>
        </div>

        {/* Card 3: ผลผลิตโดยประมาณ */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1">
              {lang === 'th' ? 'ผลผลิตมะม่วงคาดการณ์' : 'Estimated Harvest'}
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              101.3 ตัน
            </div>
            <div className="text-[11px] text-blue-600 mt-0.5 font-medium">
              {lang === 'th' ? '~20,260 ผลเกรด AB' : '~20,260 Fruits'}
            </div>
          </div>
        </div>

        {/* Card 4: Potential ESG Income (Clean Light Theme) */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-300/80 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Coins className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1 flex items-center gap-1">
              <span>{lang === 'th' ? 'คาร์บอนเครดิต T-VER' : 'T-VER Carbon Income'}</span>
            </div>
            <div className="text-2xl font-black text-emerald-700 tracking-tight font-mono tabular-nums">
              ฿{esgTotals.totalIncomeThb.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-mono mt-0.5 font-medium">
              {esgTotals.totalTons} tCO₂e / {lang === 'th' ? 'ปี' : 'yr'}
            </div>
          </div>
        </div>

        {/* Card 5: มูลค่าหลักทรัพย์ไม้ยืนต้น */}
        <div className="bg-white rounded-2xl p-5 border border-amber-300/80 shadow-2xs flex flex-col justify-between">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Building2 className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium mb-1">
              {lang === 'th' ? 'หลักทรัพย์ไม้ยืนต้น' : 'Living Tree Asset'}
            </div>
            <div className="text-2xl font-black text-amber-800 tracking-tight font-mono">
              ฿3.88M
            </div>
              <div className="text-[11px] text-amber-700 mt-0.5 font-medium">
                {lang === 'th' ? 'อิงเกณฑ์หลักประกันไม้ยืนต้น' : 'Collateral Basis'}
              </div>
            </div>
          </div>
        </div>

      {/* 3. Main Grid: Left "แปลงเกษตรของฉัน" (7 cols) + Right "การแจ้งเตือนสำคัญ" (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: แปลงเกษตรของฉัน */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {lang === 'th' ? 'แปลงเกษตรของฉัน' : 'My Farm Plots'}
            </h2>
            <button
              onClick={() => setCurrentTab('simulator')}
              className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1 group transition-colors"
            >
              <span>{lang === 'th' ? 'จำลอง 3D' : 'Simulate 3D'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Plot List */}
          <div className="space-y-3.5 pt-1">
            {farmPlots.map((plot) => {
              const isSelected = selectedPlotId === plot.id;
              return (
                <div
                  key={plot.id}
                  onClick={() => setSelectedPlotId(plot.id)}
                  className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                      : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Content Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-base">
                            {lang === 'th' ? plot.nameTh : plot.nameEn}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            · {lang === 'th' ? plot.statusLabelTh : plot.statusLabelEn}
                          </span>
                        </div>

                        {/* Estimated yield on right */}
                        <div className="text-right">
                          <span className="text-[11px] text-slate-400 block font-medium">
                            {lang === 'th' ? 'ผลผลิตโดยประมาณ' : 'Estimated Yield'}
                          </span>
                          <span className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                            {plot.estimatedYieldText}
                          </span>
                        </div>
                      </div>

                      {/* Subtitle crop & area details */}
                      <p className="text-xs text-slate-500 font-medium mb-3">
                        {lang === 'th'
                          ? `${plot.cropTh} · ${plot.areaRai} ไร่ · ${plot.stageTh}`
                          : `${plot.cropEn} · ${plot.areaRai} Rai · ${plot.stageEn}`}
                      </p>

                      {/* Health Progress Bar with Number on right */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${plot.scoreBarColor}`}
                            style={{ width: `${plot.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-8 text-right font-mono tabular-nums">
                          {plot.score}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Actions on Selection */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="text-slate-500 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>
                          {lang === 'th'
                            ? `รายได้คาดการณ์: ฿${plot.baseRevenueThb.toLocaleString()} บาท`
                            : `Expected Revenue: ฿${plot.baseRevenueThb.toLocaleString()}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentTab('advisor');
                          }}
                          className="px-2.5 py-1 text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 font-medium flex items-center gap-1"
                        >
                          <Stethoscope className="w-3 h-3 text-emerald-600" />
                          <span>{lang === 'th' ? 'ตรวจสุขภาพใบ' : 'Health Check'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunch3DForPlot(plot);
                          }}
                          className="px-2.5 py-1 text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg font-semibold flex items-center gap-1 shadow-2xs"
                        >
                          <Box className="w-3 h-3" />
                          <span>{lang === 'th' ? 'เปิด 3D แปลงนี้' : 'Simulate in 3D'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: การแจ้งเตือนสำคัญ */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {lang === 'th' ? 'การแจ้งเตือนสำคัญ' : 'Important Alerts'}
            </h2>
            <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-bold">
              {alerts.length} รายการ
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setCurrentTab(alert.actionTab)}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="mt-0.5 shrink-0">
                    {alert.iconType === 'warning' ? (
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Info className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Text details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1">
                        {lang === 'th' ? alert.titleTh : alert.titleEn}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {lang === 'th' ? alert.descTh : alert.descEn}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{lang === 'th' ? alert.timeTh : alert.timeEn}</span>
                      <span className="text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        {lang === 'th' ? 'ดูแนวทางจัดการ' : 'Action'}
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: "ราคาพืชผลวันนี้ (ข้อมูลตัวอย่าง)" */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {lang === 'th' ? 'ราคาพืชผลวันนี้ (ข้อมูลตัวอย่าง)' : 'Today Crop Market Prices (Sample)'}
            </h2>
          </div>

          <button
            onClick={() => setCurrentTab('forecast')}
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1 group transition-colors"
          >
            <span>{lang === 'th' ? 'ดูพยากรณ์' : 'View Forecast'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 3 Live Price Cards matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {marketPrices.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-50/60 rounded-xl p-4 border border-slate-200/70 hover:bg-slate-50 transition-colors"
            >
              <div className="text-xs text-slate-600 font-medium mb-1.5 truncate">
                {lang === 'th' ? item.cropTh : item.cropEn}
              </div>
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {item.price}
                </span>
                <span className="text-xs text-slate-500 font-medium">{item.unit}</span>
              </div>
              <div
                className={`text-xs font-semibold flex items-center gap-1 ${
                  item.isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                <span>{lang === 'th' ? item.changeTextTh : item.changeTextEn}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Integrated Farm Yield & Profit Planning Widget (Clean Light Theme) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-2xs border border-slate-200/90 space-y-5 text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Calculator className="w-4 h-4" />
              </span>
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                {lang === 'th'
                  ? 'วางแผนคำนวณผลผลิตและกำไรฟาร์ม 70 ไร่'
                  : 'Farm Yield & Profit Planning (70 Rai)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'th'
                ? 'คำนวณรายได้ ต้นทุนปุ๋ย/ยา/แรงงาน และประมาณการกำไรสุทธิรวมทั้ง 4 แปลงแบบอัตโนมัติ'
                : 'Automated revenue, fertilizer/labor expenses, and net profit projections across all 4 plots.'}
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('planner')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs cursor-pointer"
          >
            <span>{lang === 'th' ? 'เปิดโปรแกรมวางแผนเต็มรูปแบบ' : 'Open Full Planner'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Big Metric Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 block mb-1">
              {lang === 'th' ? 'รวมรายได้คาดการณ์' : 'Gross Revenue'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight font-mono tabular-nums">
              ฿{adjustedRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {lang === 'th' ? 'จาก 4 แปลงผลผลิต' : 'Across 4 plots'}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <span className="text-[11px] text-slate-500 block mb-1">
              {lang === 'th' ? 'รวมต้นทุนดำเนินการ' : 'Operating Expenses'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight font-mono tabular-nums">
              ฿{adjustedCost.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {isOrganicSavingsApplied
                ? lang === 'th'
                  ? 'ลดต้นทุนปุ๋ยสั่งตัด 12%'
                  : '12% precision savings'
                : lang === 'th'
                  ? 'ต้นทุนปกติ'
                  : 'Standard costs'}
            </span>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
            <span className="text-[11px] text-emerald-800 block mb-1 font-semibold">
              {lang === 'th' ? 'กำไรสุทธิประมาณการ' : 'Estimated Net Profit'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight font-mono tabular-nums">
              ฿{netProfit.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium block mt-0.5">
              {lang === 'th' ? `อัตรากำไร ~${profitMargin}%` : `Margin ~${profitMargin}%`}
            </span>
          </div>
        </div>

        {/* Interactive Scenario Controls */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              {lang === 'th'
                ? 'จำลองสถานการณ์ราคาตลาด:'
                : 'Market Price Sensitivity Scenario:'}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setProfitPriceMultiplier(0.9)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  profitPriceMultiplier === 0.9
                    ? 'bg-rose-100 border border-rose-300 text-rose-800 font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lang === 'th' ? 'ตลาดซบเซา (-10%)' : 'Bearish (-10%)'}
              </button>
              <button
                onClick={() => setProfitPriceMultiplier(1.0)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  profitPriceMultiplier === 1.0
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lang === 'th' ? 'ราคาฐานปกติ (0%)' : 'Base Case'}
              </button>
              <button
                onClick={() => setProfitPriceMultiplier(1.15)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  profitPriceMultiplier === 1.15
                    ? 'bg-teal-100 border border-teal-300 text-teal-800 font-bold'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {lang === 'th' ? 'ตลาดส่งออกสดใส (+15%)' : 'Bullish (+15%)'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-600">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOrganicSavingsApplied}
                onChange={(e) => setIsOrganicSavingsApplied(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 bg-white"
              />
              <span className="text-slate-700">
                {lang === 'th'
                  ? 'ใช้สูตรปุ๋ยสั่งตัด & แหนแดงเสริม (ประหยัดค่าปุ๋ยเคมี 12%)'
                  : 'Apply customized fertilizer & azolla green manure (-12% cost)'}
              </span>
            </label>
            <span className="text-emerald-700 font-semibold text-[11px]">
              {isOrganicSavingsApplied
                ? lang === 'th'
                  ? 'ประหยัด ฿50,000+ บาท'
                  : 'Saved ฿50,000+'
                : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 6. Sustainable Farm Carbon Calculator Module */}
      <EsgCarbonCalculator
        lang={lang}
        totalFarmRai={70}
        onTotalCalculated={setEsgTotals}
      />

      {/* 7. Digital Farm Passport & BAAC Agri-Credit Audit Modal */}
      {showPassportModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-emerald-800 text-white p-5 sm:p-6 flex items-start justify-between border-b border-emerald-900">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="p-1.5 rounded-lg bg-emerald-700/80 text-emerald-200 border border-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                    Digital Farm Asset Profile & Summary
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {lang === 'th'
                    ? 'เอกสารสรุปข้อมูลสินทรัพย์สวนมะม่วงดิจิทัล'
                    : 'Digital Mango Farm Asset Profile'}
                </h3>
                <p className="text-xs text-emerald-100 mt-1 font-mono">
                  Reference ID: PLOTTY-CHA-2026-0042 · แบบจำลองประเมิน Agri-Credit (อิงเกณฑ์ พ.ร.บ.หลักประกันฯ)
                </p>
              </div>

              <button
                onClick={() => setShowPassportModal(false)}
                className="p-2 text-emerald-200 hover:text-white rounded-xl hover:bg-emerald-700 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto text-slate-900 text-xs sm:text-sm">
              {/* Box 1: Owner and Land Title Info */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    {lang === 'th' ? '1. ข้อมูลแปลงและสิทธิ์ที่ดิน' : '1. Land & Rights Verification'}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {lang === 'th' ? 'สิทธิ์ถูกต้อง 100%' : '100% Compliant'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">ชื่อผู้ถือครอง / ผู้ขอสินเชื่อ:</span>
                    <span className="font-bold text-slate-900">นายสมศักดิ์ สวนมะม่วงไทย (Smart Farmer)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">ตำแหน่งและพิกัดแปลง:</span>
                    <span className="font-bold text-slate-900">อ.บางคล้า จ.ฉะเชิงเทรา (พื้นที่นำร่อง 70 ไร่)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">สถานะเอกสารสิทธิ์ที่ดิน:</span>
                    <span className="font-bold text-slate-900">โฉนดเพื่อเกษตรกรรม ส.ป.ก. 4-01 เลขที่ 241/2560</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">ความพร้อมทางกฎหมาย:</span>
                    <span className="font-semibold text-emerald-700">ผ่านเกณฑ์ระเบียบปี 2566 นำไม้ยืนต้นค้ำประกันได้</span>
                  </div>
                </div>
              </div>

              {/* Box 1.5: 2D Satellite Cadastral Boundary Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 flex items-center gap-2 text-xs sm:text-sm">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    {lang === 'th' ? 'ผังแผนที่ดาวเทียมรังวัดพิกัด 2D (Cadastral Boundary Map)' : '2D Satellite Cadastral Boundary Map'}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-slate-500">
                    พิกัดนำร่อง อ.บางคล้า จ.ฉะเชิงเทรา
                  </span>
                </div>
                <LandBoundary2DPreview
                  pins={PRESET_BANGKRUAI_25_RAI}
                  plotName="แปลงสวนมะม่วงน้ำดอกไม้ & มหาชนก นำร่อง (70 ไร่)"
                  lang={lang}
                  showDetails={true}
                />
              </div>

              {/* Box 2: Living Asset Valuation Table */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-amber-600" />
                    {lang === 'th' ? '2. การประเมินมูลค่าสินทรัพย์ไม้ยืนต้น (พ.ร.บ.หลักประกันทางธุรกิจ 2558)' : '2. Living Tree Collateral Appraisal'}
                  </span>
                  <span className="text-xs font-bold text-amber-800 font-mono">
                    รวม 1,750 ต้น
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-200">
                        <th className="pb-2 font-medium">แปลง / สายพันธุ์มะม่วง</th>
                        <th className="pb-2 font-medium">อายุ / ระยะ</th>
                        <th className="pb-2 font-medium text-center">จำนวนต้น</th>
                        <th className="pb-2 font-medium text-right">ราคาประเมิน/ต้น</th>
                        <th className="pb-2 font-medium text-right">มูลค่ารวม (บาท)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2 font-bold text-slate-900">แปลง A — มะม่วงน้ำดอกไม้สีทอง (25 ไร่)</td>
                        <td className="py-2 text-slate-600">6 ปี (ให้ผลผลิตเต็มที่)</td>
                        <td className="py-2 text-center font-mono">625</td>
                        <td className="py-2 text-right font-mono text-slate-600">฿2,500</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">฿1,562,500</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-slate-900">แปลง B — มะม่วงมหาชนก (15 ไร่)</td>
                        <td className="py-2 text-slate-600">8 ปี (พรีเมียมสีรุ้ง)</td>
                        <td className="py-2 text-center font-mono">375</td>
                        <td className="py-2 text-right font-mono text-slate-600">฿3,000</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">฿1,125,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-slate-900">แปลง C — เขียวสามรส & ฟ้าลั่น (18 ไร่)</td>
                        <td className="py-2 text-slate-600">5 ปี (สมบูรณ์)</td>
                        <td className="py-2 text-center font-mono">450</td>
                        <td className="py-2 text-right font-mono text-slate-600">฿2,000</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">฿900,000</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-bold text-slate-900">แปลง D — แปลงปลูกใหม่ Smart Drip (12 ไร่)</td>
                        <td className="py-2 text-slate-600">1 ปี (ทรงพุ่ม)</td>
                        <td className="py-2 text-center font-mono">300</td>
                        <td className="py-2 text-right font-mono text-slate-600">฿1,000</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">฿300,000</td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-slate-300 font-bold">
                        <td colSpan={2} className="pt-2 text-slate-900">รวมมูลค่าสินทรัพย์ค้ำประกันไม้ยืนต้นทั้งสิ้น:</td>
                        <td className="pt-2 text-center font-mono text-slate-900">1,750 ต้น</td>
                        <td className="pt-2 text-right font-mono text-slate-500">-</td>
                        <td className="pt-2 text-right font-mono text-emerald-700 text-sm">฿3,887,500</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Box 3: 4-Dimension Due Diligence Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">สิทธิ์ที่ดิน ส.ป.ก. ผ่านเกณฑ์</span>
                    <span className="text-slate-600 text-[11px]">ปลอดภาระผูกพัน แปลงรังวัด GPS ตรงตามผังระวาง</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">ปลอดโรคแอนแทรคโนสระบาด</span>
                    <span className="text-slate-600 text-[11px]">AI ตรวจสุขภาพใบผ่านเกณฑ์ความปลอดภัยผลผลิต 94%</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">โครงข่าย True 5G IoT ยืนยันข้อมูล</span>
                    <span className="text-slate-600 text-[11px]">ความชื้นดิน 68.4% และ pH 6.5 อัปเดตตลอด 24 ชม.</span>
                  </div>
                </div>

                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 block">คาร์บอนเครดิต T-VER รองรับ</span>
                    <span className="text-slate-600 text-[11px]">กักเก็บ 303 tCO₂e/ปี เป็นกระแสเงินสดสำรองชำระหนี้</span>
                  </div>
                </div>
              </div>

              {/* Box 4: Estimated Agri-Loan Package */}
              <div className="bg-emerald-50 text-slate-900 rounded-2xl p-5 border border-emerald-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-800 block mb-1">
                    Estimated Agri-Loan Assessment (BAAC Criteria)
                  </span>
                  <h4 className="text-lg font-black text-slate-900">
                    ประมาณการวงเงินสินเชื่อเพื่อการลงทุน (อิงเกณฑ์ ธ.ก.ส.): ฿2,500,000
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    อัตราดอกเบี้ยพิเศษ MRR-2.25% (3.75%/ปี) ผ่อนชำระตามรอบการเก็บเกี่ยวผลผลิตมะม่วง
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowPassportModal(false);
                    setCurrentTab('simulator');
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
                >
                  <Box className="w-4 h-4" />
                  <span>ตรวจรับรอง 3D ทางไกล</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="text-slate-600 font-mono text-[11px] font-semibold">
                  จัดทำโดย: ระบบจำลองและประเมินข้อมูล Plotty (อิงเกณฑ์ พ.ร.บ.หลักประกันทางธุรกิจ 2558)
                </p>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  * แบบจำลองเพื่อการวางแผนเบื้องต้นของเกษตรกร มิใช่เอกสารสิทธิ์หรือการอนุมัติสินเชื่อเป็นทางการจากหน่วยงานรัฐหรือสถาบันการเงิน *
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowPassportModal(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
