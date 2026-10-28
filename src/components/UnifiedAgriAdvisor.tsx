/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PlantHealthScanner } from './PlantHealthScanner';
import { AgriLegalAssistant } from './AgriLegalAssistant';
import { Stethoscope, Scale, Sparkles, ShieldCheck, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

interface UnifiedAgriAdvisorProps {
  lang: 'th' | 'en';
  defaultSection?: 'health' | 'legal';
}

export const UnifiedAgriAdvisor: React.FC<UnifiedAgriAdvisorProps> = ({
  lang,
  defaultSection = 'health',
}) => {
  const [activeAdvisor, setActiveAdvisor] = useState<'health' | 'legal'>(defaultSection);

  // Demo Mode Switcher Listener
  React.useEffect(() => {
    const handleDemoAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.action === 'switch_to_legal') {
        setActiveAdvisor('legal');
      }
    };
    window.addEventListener('kasetthai_demo_action', handleDemoAction);
    return () => window.removeEventListener('kasetthai_demo_action', handleDemoAction);
  }, []);

  return (
    <div id="tour-step-4" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 md:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Sparkles className="w-4 h-4" />
              </span>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {lang === 'th'
                  ? 'หมอพืช & ที่ปรึกษากฎหมายเกษตร'
                  : 'AI Plant Doctor & Agri Legal Advisory'}
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              {lang === 'th'
                ? 'วินิจฉัยโรคพืชและศัตรูพืชจากรูปถ่าย พร้อมบริการให้คำปรึกษาสิทธิ์ที่ดิน ส.ป.ก. 4-01 สัญญาเช่า และเงินช่วยเหลือภาครัฐ'
                : 'Diagnose crop diseases instantly with AI vision, alongside instant legal guidance on land reform, contracts, and agricultural aid.'}
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveAdvisor('health')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeAdvisor === 'health'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>{lang === 'th' ? 'หมอพืช AI ตรวจโรค' : 'AI Plant Doctor'}</span>
            </button>

            <button
              onClick={() => setActiveAdvisor('legal')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeAdvisor === 'legal'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span>{lang === 'th' ? 'กฎหมาย & สิทธิ์ที่ดิน' : 'Agri-Legal Q&A'}</span>
            </button>
          </div>
        </div>

        {/* Quick Context Tip */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {activeAdvisor === 'health'
                ? lang === 'th'
                  ? 'แนวทางรักษาอ้างอิงคู่มือการจัดการศัตรูพืช กรมวิชาการเกษตร (DOA)'
                  : 'Treatments certified under Thai Department of Agriculture pest guidelines'
                : lang === 'th'
                  ? 'อ้างอิง พ.ร.บ.การปฏิรูปที่ดินเพื่อเกษตรกรรม, พ.ร.บ.การเช่าที่ดินเพื่อเกษตรกรรม และระเบียบ ส.ป.ก.'
                  : 'Cites ALRO 2518 Land Reform Act, Farmland Lease Act, and ministerial decrees'}
            </span>
          </div>

          <button
            onClick={() => setActiveAdvisor(activeAdvisor === 'health' ? 'legal' : 'health')}
            className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
          >
            <span>
              {activeAdvisor === 'health'
                ? lang === 'th'
                  ? 'มีข้อพิพาทที่ดินหรือต้องการเงินชดเชยภัยพิบัติ? สลับไปคุยเรื่องกฎหมาย'
                  : 'Land dispute or disaster aid? Switch to Legal Q&A'
                : lang === 'th'
                  ? 'พบอาการใบเหลืองหรือโรคระบาด? สลับไปตรวจโรคพืช'
                  : 'Yellow leaves or pest outbreak? Switch to Plant Doctor'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render Selected Tool */}
      <div>
        {activeAdvisor === 'health' ? (
          <PlantHealthScanner lang={lang} />
        ) : (
          <AgriLegalAssistant lang={lang} />
        )}
      </div>
    </div>
  );
};
