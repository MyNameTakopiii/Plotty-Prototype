/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  Vote,
  Sparkles,
  BarChart3,
  CloudSun,
  Stethoscope,
  TrendingUp,
  Calculator,
  Leaf,
  Box,
  Award,
  Send,
  RotateCcw,
} from 'lucide-react';

export interface FeatureOption {
  id: string;
  titleThai: string;
  titleEnglish: string;
  descriptionThai: string;
  icon: React.ComponentType<{ className?: string }>;
  colorBg: string;
  colorText: string;
  colorBorder: string;
  badgeThai: string;
  currentVotePercent: number;
}

interface FeatureSurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'th' | 'en';
}

export const SURVEY_FEATURES: FeatureOption[] = [
  {
    id: 'weather',
    titleThai: '1. รายงานสภาพอากาศรายชั่วโมง & ดัชนีพ่นสาร',
    titleEnglish: 'Hourly Weather & Spraying Index',
    descriptionThai: 'เช็กสภาพอากาศ อ.บางคล้า รายชั่วโมง ประเมินช่วงเวลาพ่นยาลมสงบปลอดภัย และคำนวณปริมาณน้ำรดสวนตามดัชนีอากาศ',
    icon: CloudSun,
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-800',
    colorBorder: 'border-amber-200',
    badgeThai: 'เกษตรอัจฉริยะ',
    currentVotePercent: 38,
  },
  {
    id: 'advisor',
    titleThai: '2. หมอพืชมะม่วง สแกนตรวจโรค & โฉนด ส.ป.ก. 4-01',
    titleEnglish: 'Plant Doctor AI & ALRO Land Audit',
    descriptionThai: 'อัปโหลดรูปถ่ายใบ/ผลมะม่วง ตรวจวิเคราะห์โรคพร้อมยารับรองจากกรมวิชาการเกษตร (DOA) และเช็กสิทธิ์โฉนด ส.ป.ก.',
    icon: Stethoscope,
    colorBg: 'bg-amber-50',
    colorText: 'text-amber-800',
    colorBorder: 'border-amber-200',
    badgeThai: 'อารักขาพืช & กฎหมาย',
    currentVotePercent: 42,
  },
  {
    id: 'forecast',
    titleThai: '3. พยากรณ์ราคามะม่วงส่งออก 12 เดือน',
    titleEnglish: '12-Month Export Price Forecaster',
    descriptionThai: 'กราฟแนวโน้มราคามะม่วงน้ำดอกไม้ มหาชนก เขียวสามรส วิเคราะห์จังหวะทำสัญญาซื้อขายล่วงหน้ากับล้งพรีเมียม',
    icon: TrendingUp,
    colorBg: 'bg-blue-50',
    colorText: 'text-blue-800',
    colorBorder: 'border-blue-200',
    badgeThai: 'การตลาดส่งออก',
    currentVotePercent: 29,
  },
  {
    id: 'planner',
    titleThai: '4. คำนวณสินเชื่อ ธ.ก.ส. & วางแผนผลผลิต',
    titleEnglish: 'BAAC Loan Calculator & Yield Planner',
    descriptionThai: 'ประเมินคะแนนสินเชื่อ Grade A+ วงเงินกู้สูงสุด ฿2.5M จากหลักประกันไม้ยืนต้น 2,595 ต้น พร้อมคำนวณค่างวดผ่อนชำระ',
    icon: Calculator,
    colorBg: 'bg-emerald-50',
    colorText: 'text-emerald-800',
    colorBorder: 'border-emerald-200',
    badgeThai: 'สินเชื่อหลักประกัน',
    currentVotePercent: 35,
  },
  {
    id: 'carbon',
    titleThai: '5. คำนวณคาร์บอนเครดิต T-VER & โซลาร์เซลล์',
    titleEnglish: 'ESG Carbon Credit & Solar Calculator',
    descriptionThai: 'ประเมินปริมาณการกักเก็บคาร์บอน (303 tCO₂e/ปี) คำนวณรายได้เสริมคาร์บอนเครดิต และจุดคุ้มทุนแผงโซลาร์ปั๊มน้ำ',
    icon: Leaf,
    colorBg: 'bg-teal-50',
    colorText: 'text-teal-800',
    colorBorder: 'border-teal-200',
    badgeThai: 'เกษตรยั่งยืน ESG',
    currentVotePercent: 22,
  },
  {
    id: '3d',
    titleThai: '6. โมเดล 3D Digital Twin ส่องสวนแยกแปลง',
    titleEnglish: '3D Digital Twin Plot Twin',
    descriptionThai: 'ส่องสวนมะม่วง 3D เสมือนจริงแยกแปลง A, B, C แสดงตำแหน่งต้นไม้ 2,595 ต้น ระบุพิกัดและสุขภาพต้นไม้เรียลไทม์',
    icon: Box,
    colorBg: 'bg-slate-100',
    colorText: 'text-slate-800',
    colorBorder: 'border-slate-300',
    badgeThai: 'ดิจิทัลทวิน 3D',
    currentVotePercent: 31,
  },
];

export const FeatureSurveyModal: React.FC<FeatureSurveyModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [userComment, setUserComment] = useState<string>('');

  if (!isOpen) return null;

  // Toggle Selection (Max 2 items)
  const handleToggleOption = (id: string) => {
    if (selectedFeatureIds.includes(id)) {
      setSelectedFeatureIds(selectedFeatureIds.filter((item) => item !== id));
    } else {
      if (selectedFeatureIds.length >= 2) {
        // Already selected 2 items, ignore or replace first
        return;
      }
      setSelectedFeatureIds([...selectedFeatureIds, id]);
    }
  };

  // Submit Survey
  const handleSubmitSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFeatureIds.length === 0) return;
    setHasSubmitted(true);
  };

  // Reset Form
  const handleResetSurvey = () => {
    setSelectedFeatureIds([]);
    setHasSubmitted(false);
    setUserComment('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 border border-slate-200 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-200 my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Survey Header */}
        <div className="text-center space-y-1.5 border-b border-slate-100 pb-4">
          <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-900 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
            <Vote className="w-4 h-4 text-emerald-600" />
            <span>แบบสำรวจความพึงพอใจฟีเจอร์สวนมะม่วง (Feature Value Poll)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ฟีเจอร์ไหนมีประโยชน์ต่อแปลงของท่านที่สุด?
          </h2>
          <p className="text-xs font-bold text-amber-800 bg-amber-50 py-1 px-3 rounded-lg inline-block border border-amber-200">
            📌 เลือกฟีเจอร์ที่ชอบที่สุดได้ **สูงสุด 2 ข้อ** ({selectedFeatureIds.length}/2 เลือกแล้ว)
          </p>
        </div>

        {/* FORM STATE OR RESULT STATE */}
        {!hasSubmitted ? (
          <form onSubmit={handleSubmitSurvey} className="space-y-4">
            {/* Feature Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[55vh] overflow-y-auto pr-1">
              {SURVEY_FEATURES.map((feature) => {
                const isSelected = selectedFeatureIds.includes(feature.id);
                const isDisabled = !isSelected && selectedFeatureIds.length >= 2;

                return (
                  <div
                    key={feature.id}
                    onClick={() => !isDisabled && handleToggleOption(feature.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-400/50 shadow-xs'
                        : isDisabled
                        ? 'opacity-40 border-slate-200 bg-slate-50 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    {/* Top Row: Icon + Badge + Checkbox */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl border ${feature.colorBg} ${feature.colorBorder} ${feature.colorText}`}>
                          <feature.icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {feature.badgeThai}
                        </span>
                      </div>

                      {/* Checkbox Circle */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                        {feature.titleThai}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {feature.descriptionThai}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optional Comment Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                ข้อเสนอแนะเพิ่มเติมสำหรับสวนของท่าน (ถ้ามี):
              </label>
              <input
                type="text"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="เช่น อยากให้เพิ่มระบบแจ้งเตือนทาง SMS/Line หรือเซนเซอร์วัดค่าปุ๋ย..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-xs text-slate-500 font-bold">
                {selectedFeatureIds.length === 0
                  ? 'กรุณาคลิกเลือกอย่างน้อย 1 ข้อ'
                  : `เลือกแล้ว ${selectedFeatureIds.length} จากสูงสุด 2 ข้อ`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={selectedFeatureIds.length === 0}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>ส่งคำตอบแบบสำรวจ</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* RESULT CONFIRMATION VIEW */
          <div className="space-y-5 py-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-emerald-950">
                ขอบคุณสำหรับคำตอบแบบสำรวจครับ!
              </h3>
              <p className="text-xs text-emerald-800 font-medium">
                คำตอบของท่านถูกบันทึกเข้าระบบประเมินคุณค่าฟีเจอร์เรียบร้อยแล้ว
              </p>
            </div>

            {/* Selected Options Summary */}
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>ฟีเจอร์ที่ท่านเลือกชอบมากที่สุด (2 ข้อ):</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SURVEY_FEATURES.filter((f) => selectedFeatureIds.includes(f.id)).map((feature) => (
                  <div
                    key={feature.id}
                    className="p-3 bg-white rounded-xl border border-emerald-300 shadow-2xs flex items-center gap-2.5"
                  >
                    <div className={`p-2 rounded-lg border ${feature.colorBg} ${feature.colorBorder} ${feature.colorText} shrink-0`}>
                      <feature.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-xs text-slate-900">{feature.titleThai}</h5>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        อันดับยอดนิยม
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Community Vote Breakdown Chart */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
              <span className="font-bold text-slate-800 block">
                📊 สถิติความนิยมฟีเจอร์จากเกษตรกรชาวสวนมะม่วงทั้งหมด:
              </span>

              <div className="space-y-2">
                {SURVEY_FEATURES.map((feature) => {
                  const isUserPick = selectedFeatureIds.includes(feature.id);
                  const displayPct = isUserPick ? feature.currentVotePercent + 5 : feature.currentVotePercent;

                  return (
                    <div key={feature.id} className="space-y-1">
                      <div className="flex justify-between items-center text-[11px] font-bold">
                        <span className={isUserPick ? 'text-emerald-800 font-black' : 'text-slate-700'}>
                          {feature.titleThai.split('.')[1].trim()} {isUserPick && '✓ (ที่คุณเลือก)'}
                        </span>
                        <span className="font-mono text-slate-900">{displayPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isUserPick ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                          style={{ width: `${displayPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={handleResetSurvey}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ทำแบบสำรวจอีกครั้ง</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
