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
  Tv,
  RotateCcw,
  MousePointerClick,
  FileText,
  Box,
  TrendingUp,
  Stethoscope,
  Calculator,
  ArrowDown,
} from 'lucide-react';

interface HappyPathPlayerProps {
  isActive: boolean;
  onClose: () => void;
  lang: 'th' | 'en';
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const HappyPathPlayer: React.FC<HappyPathPlayerProps> = ({
  isActive,
  onClose,
  lang,
  currentTab,
  setCurrentTab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [stepTimerSeconds, setStepTimerSeconds] = useState<number>(8);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [spotlightRect, setSpotlightRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const steps = [
    {
      id: 'step-1',
      titleTh: '1. แดชบอร์ดสวนมะม่วง 70 ไร่ & คะแนนสินเชื่อ Agri-Credit',
      titleEn: '1. 70-Rai Mango Orchard & Agri-Credit Score',
      tab: 'home',
      pitchBadge: 'Agri-Credit Rating 94/100',
      sectionLabelTh: 'ปุ่มสำคัญ: ตรวจรับรองคะแนนสินเชื่อ & เปิดหนังสือรับรองดิจิทัล',
      sectionLabelEn: 'Key Feature: Agri-Credit Score & Digital Asset Passport',
      targetSelector: '#tour-step-1',
      actionLabelTh: 'กดเพื่อเปิดใบรับรองสินทรัพย์ดิจิทัล (ลองกดดูเอง)',
      actionLabelEn: 'Click to Open Digital Asset Passport',
      pitchHighlightTh:
        'ประมวลผลข้อมูลสวนมะม่วง 4 แปลง 70 ไร่ (1,750 ต้น) ใน อ.บางคล้า จ.ฉะเชิงเทรา คำนวณคะแนนสินเชื่อ Agri-Credit 94/100 (เกรด A+) ปลดล็อกวงเงินสินเชื่อ ธ.ก.ส. ฿2.5M และประเมินผลผลิต 101.3 ตัน',
      pitchHighlightEn:
        '70-rai Mango orchard overview with 1,750 trees, Agri-Credit Rating 94/100 (Grade A+), unlocking ฿2.5M BAAC credit line.',
      actionType: 'open_passport',
    },
    {
      id: 'step-2',
      titleTh: '2. 3D Digital Twin ตรวจรับรองแปลงทางไกล & ปักหมุดแผนที่ดาวเทียม 2D',
      titleEn: '2. 3D Digital Twin Remote Asset Audit & 2D Satellite Mapper',
      tab: 'simulator',
      pitchBadge: 'Deep Tech & 2D/3D Satellite',
      sectionLabelTh: 'ปุ่มสำคัญ: โมเดล 3D สวนมะม่วง & ปักหมุดสีแดงแผนที่ดาวเทียม 2D',
      sectionLabelEn: 'Key Feature: 3D Mango Orchard Model & 2D Satellite Red Pin Mapper',
      targetSelector: '#tour-step-2',
      actionLabelTh: 'กดเพื่อสลับโหมดปักหมุดสีแดงแผนที่ดาวเทียม 2D (ลองกดดูเอง)',
      actionLabelEn: 'Click to Switch 2D Satellite Boundary Mapper',
      pitchHighlightTh:
        'ฉายภาพแปลงสู่แบบจำลอง 3D ตรวจนับผลมะม่วงบนกิ่งจริงสำหรับสัญญาซื้อขายล่วงหน้า จำลองการเติบโต 10 ปี พร้อมปักหมุดสีแดงบนแผนที่ดาวเทียม 2D คำนวณเนื้อที่ดิน ไร่-งาน-วา อัตโนมัติ',
      pitchHighlightEn:
        'Transforms orchard data into 3D Digital Twin with fruit counting for export contracts and 2D Satellite Red Pin Mapper.',
      actionType: 'toggle_satellite_mode',
    },
    {
      id: 'step-3',
      titleTh: '3. พยากรณ์ราคามะม่วงส่งออก 12 เดือน (Export Price Forecaster)',
      titleEn: '3. 12-Month Mango Export Price Forecast & Trade Windows',
      tab: 'forecast',
      pitchBadge: 'Export Price Intelligence',
      sectionLabelTh: 'ปุ่มสำคัญ: กราฟพยากรณ์ราคา Monte Carlo & สัญญาซื้อขายล่วงหน้า',
      sectionLabelEn: 'Key Feature: Monte Carlo Export Forecast & Pre-Harvest Contract',
      targetSelector: '#tour-step-3',
      actionLabelTh: 'กดเพื่อดูคำนวณราคารับซื้อล่วงหน้าล้งส่งออก (ลองกดดูเอง)',
      actionLabelEn: 'Click to Calculate Export Fair Contract Price',
      pitchHighlightTh:
        'วิเคราะห์แนวโน้มราคามะม่วงน้ำดอกไม้สีทองและมหาชนกด้วยโมเดล Monte Carlo พร้อมกรอบความเชื่อมั่น 80% แนะนำช่วงเวลาตัดขายล่วงหน้า (Pre-harvest) ให้ตลาดญี่ปุ่นและเกาหลีใต้เพื่อราคาพรีเมียม',
      pitchHighlightEn:
        'Monte Carlo price prediction curves for export mangoes with 80% confidence corridors guiding peak export harvest windows.',
      actionType: 'trigger_price_calc',
    },
    {
      id: 'step-4',
      titleTh: '4. หมอพืช AI สแกนแอนแทรคโนส & ปลดล็อกสิทธิ์ที่ดิน ส.ป.ก.',
      titleEn: '4. Anthracnose Detection & ALRO Land Rights Shield',
      tab: 'advisor',
      pitchBadge: 'Disease Diagnostic & ALRO Rights',
      sectionLabelTh: 'ปุ่มสำคัญ: สแกนใบพืช AI & ที่ปรึกษากฎหมายที่ดิน ส.ป.ก. 4-01',
      sectionLabelEn: 'Key Feature: AI Leaf Scan & ALRO Land Title Advisory',
      targetSelector: '#tour-step-4',
      actionLabelTh: 'กดถามผู้ช่วยกฎหมายเรื่องโฉนด ส.ป.ก. 4-01 (ลองกดดูเอง)',
      actionLabelEn: 'Click to Ask ALRO Title Conditions',
      pitchHighlightTh:
        'ตรวจจับโรคแอนแทรคโนสและราแป้งทันทีด้วย AI Vision พร้อมผู้ช่วยกฎหมายรับรองสิทธิ ส.ป.ก. 4-01 ตามระเบียบปี 2566 เพื่อการันตีความปลอดภัยก่อนยื่นกู้ธนาคาร',
      pitchHighlightEn:
        'Instant AI diagnosis of Anthracnose and powdery mildew paired with ALRO land title compliance verification for bank loan eligibility.',
      actionType: 'ask_legal_ai',
    },
    {
      id: 'step-5',
      titleTh: '5. ประเมินหลักทรัพย์ไม้ยืนต้น ฿3.88M & คาร์บอนเครดิต T-VER',
      titleEn: '5. ฿3.88M Living Tree Appraisal & T-VER Carbon Credits',
      tab: 'planner',
      pitchBadge: 'BAAC Asset Valuation & ESG',
      sectionLabelTh: 'ปุ่มสำคัญ: วางแผนผลผลิต & คำนวณคาร์บอนเครดิต T-VER',
      sectionLabelEn: 'Key Feature: Yield Planner & T-VER Carbon Credit Offset',
      targetSelector: '#tour-step-5',
      actionLabelTh: 'กดคำนวณคาร์บอนเครดิตและประหยัดค่าปุ๋ย (ลองกดดูเอง)',
      actionLabelEn: 'Click to Calculate Carbon Offsets & Savings',
      pitchHighlightTh:
        'ประเมินมูลค่าต้นมะม่วง 1,750 ต้น เป็นหลักประกันทางธุรกิจตามกฎหมายมูลค่า ฿3,887,500 ควบคู่การสร้างรายได้คาร์บอนเครดิต T-VER ฿121,200/ปี ตอบโจทย์ความยั่งยืนทางการเงินและสิ่งแวดล้อม',
      pitchHighlightEn:
        'Calculates carbon credit offsets and fertilizer cost savings, directly supporting national Agri Net Zero sustainability targets.',
      actionType: 'toggle_esg_savings',
    },
  ];

  // Reset tour state whenever activated
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
      setIsCompleted(false);
      setIsPlaying(true);
      setStepTimerSeconds(8);
    }
  }, [isActive]);

  // Synchronize parent tab safely when currentStep or isActive changes
  useEffect(() => {
    if (!isActive) return;
    const targetTab = steps[currentStep]?.tab;
    if (targetTab && currentTab !== targetTab) {
      setCurrentTab(targetTab);
    }
  }, [currentStep, isActive, currentTab, setCurrentTab]);

  // Smooth auto scroll & spotlight rect calculation loop
  useEffect(() => {
    if (!isActive) {
      setSpotlightRect(null);
      return;
    }

    const updateAndScrollSpotlight = () => {
      const activeItem = steps[currentStep];
      if (!activeItem) return;

      const element = document.querySelector(activeItem.targetSelector);
      if (element) {
        // Smoothly scroll element into view center
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const rect = element.getBoundingClientRect();
        setSpotlightRect({
          top: Math.max(12, rect.top),
          left: Math.max(12, rect.left),
          width: Math.min(window.innerWidth - 24, rect.width),
          height: Math.min(window.innerHeight - 32, rect.height),
        });
      } else {
        setSpotlightRect({
          top: 80,
          left: Math.max(12, (window.innerWidth - 1000) / 2),
          width: Math.min(window.innerWidth - 24, 1000),
          height: Math.min(window.innerHeight - 200, 500),
        });
      }
    };

    // Scroll immediately + run smooth animation frame updates
    updateAndScrollSpotlight();
    let frameId: number;
    let startTime = Date.now();

    const animateSpotlight = () => {
      updateAndScrollSpotlight();
      if (Date.now() - startTime < 800) {
        frameId = requestAnimationFrame(animateSpotlight);
      }
    };
    frameId = requestAnimationFrame(animateSpotlight);

    window.addEventListener('resize', updateAndScrollSpotlight);
    window.addEventListener('scroll', updateAndScrollSpotlight, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', updateAndScrollSpotlight);
      window.removeEventListener('scroll', updateAndScrollSpotlight);
    };
  }, [isActive, currentStep, currentTab]);

  // Live happy path timer countdown
  useEffect(() => {
    if (!isActive || !isPlaying || isCompleted) return;

    const interval = setInterval(() => {
      setStepTimerSeconds((prev) => {
        if (prev <= 1) {
          setCurrentStep((step) => {
            if (step < steps.length - 1) {
              return step + 1;
            } else {
              setIsCompleted(true);
              setIsPlaying(false);
              return step;
            }
          });
          return 8;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPlaying, isCompleted, steps.length]);

  if (!isActive) return null;

  const activeStep = steps[currentStep];

  const handleSelectStep = (idx: number) => {
    setCurrentStep(idx);
    setIsCompleted(false);
    setIsPlaying(true);
    setStepTimerSeconds(8);
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setIsCompleted(false);
    setIsPlaying(true);
    setStepTimerSeconds(8);
  };

  // Execute interactive step action directly
  const handleExecuteStepAction = () => {
    const action = activeStep.actionType;
    if (action === 'open_passport') {
      window.scrollTo({ top: 320, behavior: 'smooth' });
      // Dispatch action to open Digital Asset Passport
      window.dispatchEvent(
        new CustomEvent('kasetthai_demo_action', { detail: { action: 'open_passport_modal' } })
      );
    } else if (action === 'toggle_satellite_mode') {
      window.scrollTo({ top: 220, behavior: 'smooth' });
      window.dispatchEvent(
        new CustomEvent('kasetthai_demo_action', { detail: { action: 'set_3d_satellite', mode: 'ndvi' } })
      );
    } else if (action === 'trigger_price_calc') {
      window.scrollTo({ top: 280, behavior: 'smooth' });
      window.dispatchEvent(
        new CustomEvent('kasetthai_demo_action', { detail: { action: 'open_fair_price_calc' } })
      );
    } else if (action === 'ask_legal_ai') {
      window.scrollTo({ top: 300, behavior: 'smooth' });
      window.dispatchEvent(
        new CustomEvent('kasetthai_demo_action', { detail: { action: 'switch_to_legal' } })
      );
    } else if (action === 'toggle_esg_savings') {
      window.scrollTo({ top: 350, behavior: 'smooth' });
      window.dispatchEvent(
        new CustomEvent('kasetthai_demo_action', { detail: { action: 'set_planner_rai', rai: 25 } })
      );
    }
  };

  return (
    <>
      {/* 1. Full-Screen Backdrop with Smooth Spotlight Focus Ring */}
      <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden transition-all duration-500">
        {spotlightRect ? (
          <div
            className="absolute rounded-2xl ring-4 ring-emerald-600 shadow-[0_0_0_9999px_rgba(15,23,42,0.40),0_0_50px_rgba(16,185,129,0.30)] transition-all duration-500 ease-out"
            style={{
              top: `${Math.max(8, spotlightRect.top - 6)}px`,
              left: `${Math.max(8, spotlightRect.left - 6)}px`,
              width: `${Math.min(window.innerWidth - 16, spotlightRect.width + 12)}px`,
              height: `${Math.min(window.innerHeight - 16, spotlightRect.height + 12)}px`,
            }}
          >
            {/* Animated Target Section Callout Pointer Pill */}
            <div className="absolute -top-11 left-2 sm:left-4 bg-emerald-700 text-white font-bold text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-500 animate-bounce-short">
              <MousePointerClick className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span>{lang === 'th' ? activeStep.sectionLabelTh : activeStep.sectionLabelEn}</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-xs transition-opacity duration-300" />
        )}
      </div>

      {/* 2. Tour Control Player HUD Docked at Bottom (Clean Light Theme) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-4xl transition-all duration-300 animate-fade-in pointer-events-auto">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 text-slate-900 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3 relative overflow-hidden ring-1 ring-slate-200">
          {/* Top Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-100">
            <div
              className="h-full bg-emerald-600 transition-all duration-1000 ease-linear shadow-xs"
              style={{
                width: `${((currentStep + (8 - stepTimerSeconds) / 8) / steps.length) * 100}%`,
              }}
            />
          </div>

          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 pt-1 border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <Tv className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight truncate">
                    {lang === 'th' ? 'โหมดยื่นนำเสนอสาธิตระบบอัจฉริยะ (Interactive Pitch)' : 'Interactive System Demo'}
                  </span>
                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {activeStep.pitchBadge}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                {isCompleted ? (
                  <span>{lang === 'th' ? 'นำเสนอเสร็จสิ้น' : 'Finished'}</span>
                ) : isPlaying ? (
                  <span>{stepTimerSeconds}s</span>
                ) : (
                  <span>{lang === 'th' ? 'พักไว้' : 'Paused'}</span>
                )}
              </span>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title={lang === 'th' ? 'ปิดโหมดสาธิต' : 'Close Demo'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Step Indicator Bar */}
          <div className="grid grid-cols-5 gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => handleSelectStep(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStep
                    ? 'bg-emerald-600 ring-2 ring-emerald-300'
                    : idx < currentStep
                    ? 'bg-emerald-300'
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
                title={s.titleTh}
              />
            ))}
          </div>

          {/* Live Step Explanation & Interactive Click Callout Card */}
          {isCompleted ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>
                  {lang === 'th'
                    ? 'จบการนำเสนอสาธิตระบบอัตโนมัติเรียบร้อยแล้ว'
                    : 'Interactive Pitch Tour Completed'}
                </span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                {lang === 'th'
                  ? 'กรรมการและผู้เยี่ยมชมสามารถกดทดลองปุ่มต่างๆ สลับภาพ 2D/3D ปักหมุดที่ดิน พยากรณ์ราคา หรือคำนวณคาร์บอนเครดิตได้อย่างอิสระ'
                  : 'Judges can now freely interact with all 3D controls, satellite boundary mapper, and ESG calculators.'}
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={handleRestart}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'th' ? 'เล่นนำเสนออีกครั้ง' : 'Replay Tour'}</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {lang === 'th' ? 'ทดลองใช้งานระบบจริง' : 'Interact Freely'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 sm:p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 tracking-tight">
                  {lang === 'th' ? activeStep.titleTh : activeStep.titleEn}
                </h4>
                
                {/* Interactive Direct Action Button */}
                <button
                  onClick={handleExecuteStepAction}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto hover:scale-[1.02]"
                >
                  <MousePointerClick className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
                  <span>{lang === 'th' ? activeStep.actionLabelTh : activeStep.actionLabelEn}</span>
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {lang === 'th' ? activeStep.pitchHighlightTh : activeStep.pitchHighlightEn}
              </p>
            </div>
          )}

          {/* Bottom Playback Controls */}
          <div className="flex items-center justify-between pt-0.5 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-1.5 rounded-xl font-bold border transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isPlaying
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-500'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-rose-600" />
                    <span>{lang === 'th' ? 'หยุดชั่วคราว' : 'Pause'}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-white" />
                    <span>{lang === 'th' ? 'เล่นต่อ' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleRestart}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                title={lang === 'th' ? 'เริ่มใหม่ตั้งแต่ต้น' : 'Restart'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentStep === 0}
                onClick={() => handleSelectStep(currentStep - 1)}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={currentStep === steps.length - 1}
                onClick={() => handleSelectStep(currentStep + 1)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1 shadow-2xs disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
              >
                <span>{lang === 'th' ? 'ถัดไป' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
