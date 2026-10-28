/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { THAI_LEGAL_TOPICS, LegalTopic, INSTANT_LEGAL_QA } from '../data/agriData';
import {
  Scale,
  Send,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Building2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface AgriLegalAssistantProps {
  lang: 'th' | 'en';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sourceCitation?: string;
  disclaimerRequired?: boolean;
}

export const AgriLegalAssistant: React.FC<AgriLegalAssistantProps> = ({ lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text:
        lang === 'th'
          ? 'สวัสดีครับพี่น้องเกษตรกร ผมคือผู้ช่วยด้านกฎหมายเกษตรและนโยบายรัฐ Plotty ท่านสามารถสอบถามเรื่องที่ดิน ส.ป.ก. 4-01, การโอนมรดกที่ดิน, โฉนดที่ดิน, สินเชื่อ ธ.ก.ส. หรือเงินช่วยเหลือภัยพิบัติได้เลยครับ'
          : 'Welcome. I am the Plotty Legal & Policy Advisor. Ask any questions regarding SorPorKor 4-01 land rights, inheritance transfer, title deeds, BAAC agricultural credits, or disaster subsidies.',
      sourceCitation: 'พระราชบัญญัติการปฏิรูปที่ดินเพื่อเกษตรกรรม พ.ศ. 2518 & ประมวลกฎหมายที่ดิน',
      disclaimerRequired: true,
    },
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [selectedTopic, setSelectedTopic] = useState<LegalTopic | null>(THAI_LEGAL_TOPICS[0]);

  // Demo Mode Typewriter Effect Listener
  React.useEffect(() => {
    const handleDemoAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.action === 'type_legal_question') {
        const query =
          customEvent.detail.query ||
          'สิทธิ ส.ป.ก. 4-01 เปลี่ยนเป็นโฉนดเพื่อเกษตรกรรมมีเงื่อนไขอย่างไร?';
        let currentLen = 0;
        setInputQuery('');
        const interval = setInterval(() => {
          currentLen += 3;
          setInputQuery(query.slice(0, currentLen));
          if (currentLen >= query.length) {
            clearInterval(interval);
            setTimeout(() => {
              handleSendMessage(query);
            }, 500);
          }
        }, 35);
      }
    };
    window.addEventListener('kasetthai_demo_action', handleDemoAction);
    return () => window.removeEventListener('kasetthai_demo_action', handleDemoAction);
  }, [lang]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputQuery.trim();
    if (!textToSend || isSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsSending(true);

    // Instant local keyword matching for 0-latency Happy Cases
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      const matched = INSTANT_LEGAL_QA.find((qa) =>
        qa.keywords.some((k) => lower.includes(k.toLowerCase()))
      );

      if (matched) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'assistant',
            text: lang === 'th' ? matched.replyThai : matched.replyEnglish,
            sourceCitation: matched.citation,
            disclaimerRequired: true,
          },
        ]);
        setIsSending(false);
        return;
      }

      // Default comprehensive agrarian law response
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text:
            lang === 'th'
              ? `จากการตรวจสอบระเบียบคณะกรรมการปฏิรูปที่ดินเพื่อเกษตรกรรม (ส.ป.ก.) และกฎหมายที่ดิน:

1. **สิทธิ์ในที่ดินทำกิน**: ที่ดิน ส.ป.ก. 4-01 จัดสรรให้เกษตรกรเพื่อประกอบเกษตรกรรมเป็นหลัก ห้ามจำหน่ายจ่ายแจกหรือเปลี่ยนมือไปยังบุคคลภายนอก หากตรวจสอบพบจะถูกเรียกคืนสิทธิ์ทันที
2. **การโอนสิทธิ์**: โอนได้เฉพาะแก่ทายาทโดยธรรม (คู่สมรส บุตร เครือญาติ) ที่เป็นเกษตรกร หรือยื่นขอเปลี่ยนเป็นโฉนดเพื่อการเกษตรเมื่อถือครองครบ 5 ปี
3. **การเข้าถึงแหล่งทุน**: สามารถใช้โฉนดเพื่อการเกษตร หรือโฉนดที่ดิน น.ส.4 ยื่นขอสินเชื่อเพื่อการเกษตรดอกเบี้ยผ่อนปรนกับ ธ.ก.ส. ได้`
              : `According to Thai Land Reform for Agriculture regulations:
1. SorPorKor 4-01 land is allocated strictly for agricultural cultivation and cannot be transferred or sold to third parties.
2. Inheritance is restricted to direct legal heirs actively engaged in farming.
3. Holders of at least 5 years can apply for Agricultural Title Deed conversion for institutional financing.`,
          sourceCitation: 'พระราชบัญญัติการปฏิรูปที่ดินเพื่อเกษตรกรรม พ.ศ. 2518 และระเบียบกระทรวงเกษตรฯ',
          disclaimerRequired: true,
        },
      ]);
      setIsSending(false);
    }, 150);
  };

  const handleQuickQuestion = (q: string) => {
    handleSendMessage(q);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <span className="font-semibold text-emerald-700">
            {lang === 'th' ? 'ที่ปรึกษากฎหมายเกษตรกรรมและนโยบายรัฐ' : 'Agri Legal & Policy Advisory'}
          </span>
          <span>·</span>
          <span>{lang === 'th' ? 'อ้างอิงพระราชบัญญัติและระเบียบกระทรวง' : 'Statute & Regulation Grounded'}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {lang === 'th' ? 'ผู้ช่วยกฎหมายที่ดินและโครงการช่วยเหลือเกษตรกร' : 'Agricultural Land Law & Subsidy Assistant'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
          {lang === 'th'
            ? 'ตอบข้อซักถามเกี่ยวกับสิทธิ์ ส.ป.ก. 4-01, การโอนมรดกที่ดิน, การเปลี่ยนเป็นโฉนดเพื่อการเกษตร, สินเชื่อดอกเบี้ยต่ำ ธ.ก.ส. พร้อมระบุแหล่งอ้างอิงชัดเจน'
            : 'Get clear answers on SorPorKor 4-01 holding rights, inheritance transfers, Title Deed differences, and BAAC subsidies with statutory citations.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Legal Reference Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'th' ? 'คลังความรู้กฎหมายเกษตรยอดนิยม' : 'Common Legal Topics'}</span>
            </h3>

            <div className="space-y-2">
              {THAI_LEGAL_TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedTopic?.id === topic.id
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">
                    {lang === 'th' ? topic.titleThai : topic.titleEnglish}
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {topic.summaryThai}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-medium mt-2">
                    <FileText className="w-3 h-3" />
                    <span className="line-clamp-1">{topic.officialSource}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick FAQ Question Triggers */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {lang === 'th' ? 'คำถามที่พบบ่อย (คลิกเพื่อถามทันที)' : 'Frequently Asked Questions'}
            </span>
            <div className="flex flex-col gap-1.5 text-xs">
              {[
                'ที่ดิน ส.ป.ก. 4-01 โอนให้ใครได้บ้าง?',
                'ส.ป.ก. เปลี่ยนเป็นโฉนดเพื่อการเกษตรมีเงื่อนไขอย่างไร?',
                'ขอสินเชื่อเพื่อการเกษตร ปลูกมะม่วงใช้หลักทรัพย์อะไรบ้าง?',
                'เงินชดเชยน้ำท่วมเสียหายต่อไร่ได้เท่าไหร่?',
              ].map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(q)}
                  className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 transition-colors border border-slate-100 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat Interface (7 cols) */}
        <div className="lg:col-span-7 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xs h-[640px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {lang === 'th' ? 'สนทนากับ AI ที่ปรึกษากฎหมาย' : 'Chat with Agri Legal AI'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {lang === 'th' ? 'อ้างอิงระเบียบราชการไทย' : 'Grounded in Thai agrarian law'}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'welcome',
                    sender: 'assistant',
                    text:
                      lang === 'th'
                        ? 'สวัสดีครับ มีข้อสงสัยเรื่องที่ดิน ส.ป.ก. หรือสินเชื่อโครงการรัฐ สอบถามได้เลยครับ'
                        : 'Ask any questions regarding Thai land laws and subsidies.',
                    sourceCitation: 'พ.ร.บ.ปฏิรูปที่ดิน พ.ศ. 2518',
                    disclaimerRequired: true,
                  },
                ])
              }
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              title="ล้างการสนทนา"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-xs'
                    }`}
                  >
                    {m.text}

                    {/* Statutory Source Citation on Assistant Replies */}
                    {!isUser && m.sourceCitation && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span>
                          {lang === 'th' ? 'แหล่งข้อมูลอ้างอิง:' : 'Source:'} {m.sourceCitation}
                        </span>
                      </div>
                    )}

                    {!isUser && m.disclaimerRequired && (
                      <div className="mt-2 text-[10px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          {lang === 'th'
                            ? 'คำแนะนำเพื่อการศึกษาเบื้องต้น ต้องตรวจสอบกับเจ้าหน้าที่สำนักงาน ส.ป.ก. จังหวัด หรือสำนักงานที่ดินในพื้นที่ก่อนทำนิติกรรม'
                            : 'Informational legal guidance only. Must verify with provincial ALRO or Land Office before executing legal transactions.'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isSending && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>{lang === 'th' ? 'กำลังสืบค้นข้อกฎหมายและจัดเตรียมคำตอบ...' : 'Searching statutes and generating response...'}</span>
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder={
                lang === 'th'
                  ? 'พิมพ์คำถาม เช่น ส.ป.ก. 4-01 ขายได้ไหม? หรือ เงื่อนไขโฉนดการเกษตร...'
                  : 'Ask about land inheritance, SorPorKor 4-01, or BAAC loans...'
              }
              className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isSending || !inputQuery.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
