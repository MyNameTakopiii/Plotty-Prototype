/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  TrendingUp,
  Box,
  Stethoscope,
  Calculator,
  ShieldCheck,
  Globe,
  Radio,
} from 'lucide-react';

interface PitchDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'th' | 'en';
  setCurrentTab: (tab: string) => void;
}

export const PitchDemoModal: React.FC<PitchDemoModalProps> = ({
  isOpen,
  onClose,
  lang,
  setCurrentTab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);

  const steps = [
    {
      id: 'step-1',
      titleTh: '1. แดชบอร์ดสินทรัพย์สวนทุเรียน 70 ไร่ & คะแนน Agri-Credit',
      titleEn: '1. 70-Rai Durian Asset Dashboard & Agri-Credit',
      tab: 'home',
      descTh:
        'ประมวลผลข้อมูลสวนทุเรียน 1,750 ต้น (อ.บางกรวย จ.นนทบุรี) คำนวณคะแนนสินเชื่อเกษตรกร 94/100 (เกรด A+) พร้อมประเมินวงเงินกู้ ธ.ก.ส. ฿2.5M และผลผลิต 101.3 ตัน',
      descEn:
        'Unified 70-rai durian orchard tracking 1,750 trees, Agri-Credit Rating 94/100 (Grade A+), and ฿2.5M pre-approved BAAC loan package.',
      badgeTh: 'True Hackathon Highlight',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'step-2',
      titleTh: '2. 3D Digital Twin ตรวจรับรองแปลงทางไกล & True 5G IoT',
      titleEn: '2. 3D Digital Twin Remote Asset Audit & True 5G IoT',
      tab: 'simulator',
      descTh:
        'แปลงภาพสวนเป็นโมเดล 3D ตรวจนับลูกทุเรียนบนกิ่งจริงสำหรับสัญญาซื้อขายล่วงหน้า พร้อมสถานีเซนเซอร์วัดดิน/อากาศ True 5G IoT และ Heatmap ดาวเทียม NDVI',
      descEn:
        'Converts land photos into realistic 3D Digital Twin with fruit-on-branch counting for export contracts and True 5G IoT sensor pole telemetry.',
      badgeTh: 'Deep Tech & 5G Ecosystem',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      id: 'step-3',
      titleTh: '3. ดัชนีสุขภาพพืชจากดาวเทียม (AI NDVI/NDWI Heatmap)',
      titleEn: '3. AI Satellite NDVI/NDWI Health & Water Heatmap',
      tab: 'simulator',
      descTh:
        'วิเคราะห์ความสมบูรณ์ของใบและความชื้นดินระดับดาวเทียม แสดงผลเป็น Heatmap สีช่วยระบุจุดเสี่ยงโรครากเน่าโคนเน่าก่อนลุกลามทั่วสวน',
      descEn:
        'Satellite-grade spatial heatmaps tracking chlorophyll density (NDVI) and soil moisture (NDWI) for early Phytophthora risk detection.',
      badgeTh: 'Spatial AI Analytics',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'step-4',
      titleTh: '4. พยากรณ์ราคาทุเรียนส่งออก 12 เดือน & จังหวะตัดขายล่วงหน้า',
      titleEn: '4. 12-Month Durian Export Price Forecast & Pre-Harvest Selling',
      tab: 'forecast',
      descTh:
        'กราฟพยากรณ์ราคาทุเรียนหมอนทองและก้านยาวล่วงหน้า 12 เดือน ด้วยโมเดล Monte Carlo พร้อมกรอบความเชื่อมั่น 80% แนะนำช่วงเวลาตัดขายล่วงหน้า (Pre-harvest) ให้ล้งจีน',
      descEn:
        '12-month export durian price forecast curves with 80% confidence corridors and AI commentary on seasonal harvest pricing.',
      badgeTh: 'Market Intelligence',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'step-5',
      titleTh: '5. ประเมินหลักทรัพย์ไม้ยืนต้น ฿3.88M, สิทธิ์ ส.ป.ก. & คาร์บอนเครดิต',
      titleEn: '5. ฿3.88M Living Tree Collateral, ALRO Rights & T-VER Credits',
      tab: 'advisor',
      descTh:
        'ประเมินมูลค่าต้นทุเรียนเป็นหลักประกันเงินกู้ตาม พ.ร.บ.หลักประกันทางธุรกิจ รับรองสิทธิที่ดิน ส.ป.ก. 4-01 และคำนวณคาร์บอนเครดิต T-VER ฿121,200/ปี ตอบโจทย์ความยั่งยืนทางการเงิน',
      descEn:
        'Living tree collateral appraisal under Business Collateral Act, ALRO title rights verification, and T-VER carbon credit offsets.',
      badgeTh: 'ESG & Social Impact',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
  ];

  // Auto progression
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = (prev + 1) % steps.length;
        setCurrentTab(steps[next].tab);
        return next;
      });
    }, 8000);
    return () => clearInterval(timer);
  }, [isOpen, isAutoPlaying, steps, setCurrentTab]);

  if (!isOpen) return null;

  const activeStep = steps[currentStep];

  const handleGoStep = (index: number) => {
    setCurrentStep(index);
    setCurrentTab(steps[index].tab);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                  {lang === 'th' ? 'โหมดนำเสนอกรรมการ 60 วินาที' : 'Interactive Pitching Tour (60s)'}
                </h3>
                <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full">
                  True Hackathon AI 2026
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'th'
                  ? 'ทัวร์ชมระบบอัตโนมัติ สรุป 5 ฟีเจอร์ยุทธศาสตร์ใน 1 นาที'
                  : 'Automated 1-minute highlight tour of 5 strategic AI features'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-5 gap-1.5">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleGoStep(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentStep
                  ? 'bg-rose-500 ring-2 ring-rose-400/50'
                  : idx < currentStep
                  ? 'bg-emerald-500'
                  : 'bg-slate-800'
              }`}
              title={s.titleTh}
            />
          ))}
        </div>

        {/* Active Step Content */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md ${activeStep.badgeColor}`}
            >
              {activeStep.badgeTh}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {currentStep + 1} / {steps.length}
            </span>
          </div>

          <h4 className="text-lg font-bold text-white tracking-tight">
            {lang === 'th' ? activeStep.titleTh : activeStep.titleEn}
          </h4>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {lang === 'th' ? activeStep.descTh : activeStep.descEn}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-emerald-400 font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {lang === 'th'
                  ? 'หน้าต่างด้านหลังได้สลับไปหน้าจอเกี่ยวข้องแล้ว'
                  : 'Background screen navigated automatically'}
              </span>
            </div>
            <button
              onClick={() => {
                setCurrentTab(activeStep.tab);
                onClose();
              }}
              className="text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-xl font-bold transition-colors flex items-center gap-1 shadow-sm"
            >
              <span>{lang === 'th' ? 'ลองใช้งานหน้าจอนี้' : 'Try Screen'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Navigation Controls & Auto-play Toggle */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-colors font-medium ${
              isAutoPlaying
                ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-rose-400" />
                <span>{lang === 'th' ? 'เล่นอัตโนมัติ (เปิดอยู่)' : 'Auto-Playing'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-300" />
                <span>{lang === 'th' ? 'กดเพื่อเล่นอัตโนมัติ' : 'Play Tour'}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            <button
              disabled={currentStep === 0}
              onClick={() => handleGoStep(currentStep - 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentStep === steps.length - 1}
              onClick={() => handleGoStep(currentStep + 1)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
