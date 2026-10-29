/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AgriWeatherReport } from './AgriWeatherReport';
import { EsgCarbonCalculator } from './EsgCarbonCalculator';
import { PriceForecaster } from './PriceForecaster';
import { UnifiedAgriAdvisor } from './UnifiedAgriAdvisor';
import { CropYieldPlanner } from './CropYieldPlanner';
import { FarmSimulator3D } from './FarmSimulator3D';
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
  X,
  MapPin,
  Send,
  Trees,
  Maximize2,
  Eye,
  Sun,
  CloudSun,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Plus,
  Mic,
  PlusCircle,
  ArrowUpRight,
  Menu,
} from 'lucide-react';
import { MangoIcon } from './MangoIcon';

export interface PlotSelectionData {
  plotId: string;
  cropId: string;
  areaRai: number;
  treeCount: number;
  name: string;
  treeAgeYears: number;
  healthScore: number;
}

interface FarmerHomeProps {
  lang: 'th' | 'en';
  setCurrentTab: (tab: string) => void;
  selectedProvince: string;
  setSelectedProvince?: (province: string) => void;
  onSelectPlotFor3D?: (plot: PlotSelectionData) => void;
  onOpenSidebar?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  featureTool?: 'weather' | 'forecast' | 'advisor' | 'planner' | 'carbon' | '3d';
  plotAction?: PlotSelectionData;
  showDashboardOverview?: boolean;
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({
  lang,
  setCurrentTab,
  selectedProvince,
  setSelectedProvince,
  onSelectPlotFor3D,
  onOpenSidebar,
}) => {
  const [previewPlotFor3D, setPreviewPlotFor3D] = useState<PlotSelectionData | null>(null);
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);

  // Map of message ID -> boolean (whether inline interactive tool is expanded)
  const [expandedInlineTools, setExpandedInlineTools] = useState<Record<string, boolean>>({
    'msg-welcome': true,
  });

  // ESG Totals
  const [esgTotals, setEsgTotals] = useState<{ totalTons: number; totalIncomeThb: number }>({
    totalTons: 303,
    totalIncomeThb: 121200,
  });

  const handleEsgTotalsCalculated = React.useCallback((t: { totalTons: number; totalIncomeThb: number }) => {
    setEsgTotals(t);
  }, []);

  // Markdown Formatter Helper for Chat Messages
  const renderFormattedMarkdown = (content: string, isUserMessage: boolean = false) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong
              key={pIdx}
              className={isUserMessage ? 'font-black text-white' : 'font-extrabold text-slate-900'}
            >
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      const trimmed = line.trim();
      if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
        const textAfterBullet = trimmed.slice(1).trim();
        const bulletParts = textAfterBullet.split(/(\*\*.*?\*\*)/g);
        const formattedBullet = bulletParts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong
                key={pIdx}
                className={isUserMessage ? 'font-black text-white' : 'font-extrabold text-emerald-800'}
              >
                {part.slice(2, -2)}
              </strong>
            );
          }
          return part;
        });

        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className={`font-black shrink-0 ${isUserMessage ? 'text-emerald-200' : 'text-emerald-600'}`}>•</span>
            <div className="leading-snug">{formattedBullet}</div>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <div key={idx} className="my-0.5 leading-relaxed">
          {formattedLine}
        </div>
      );
    });
  };

  // Plots A, B, C Data
  const plotsData: PlotSelectionData[] = [
    {
      plotId: 'plot_a',
      cropId: 'mango_namdokmai',
      name: lang === 'th' ? 'แปลง A — มะม่วงน้ำดอกไม้สีทอง (70 ไร่)' : 'Plot A — Nam Dok Mai Sri Thong (70 Rai)',
      areaRai: 70,
      treeCount: 1750,
      treeAgeYears: 8,
      healthScore: 94,
    },
    {
      plotId: 'plot_b',
      cropId: 'mango_mahachanok',
      name: lang === 'th' ? 'แปลง B — มะม่วงมหาชนกส่งออก (25 ไร่)' : 'Plot B — Mahachanok Export (25 Rai)',
      areaRai: 25,
      treeCount: 625,
      treeAgeYears: 5,
      healthScore: 88,
    },
    {
      plotId: 'plot_c',
      cropId: 'mango_keiawsamros',
      name: lang === 'th' ? 'แปลง C — มะม่วงเขียวสามรส (10 ไร่ — เฝ้าระวัง)' : 'Plot C — Green Three-Flavor (10 Rai)',
      areaRai: 10,
      treeCount: 220,
      treeAgeYears: 2,
      healthScore: 78,
    },
  ];

  // Initial Welcome Message
  const initialWelcomeMessage: ChatMessage = {
    id: 'msg-welcome',
    sender: 'ai',
    text: lang === 'th'
      ? 'สวัสดีครับคุณสมพงษ์! ผมคือ **Plotty AI** ผู้ช่วยสวนเกษตรและสินเชื่อไม้ยืนต้นดิจิทัล\n\nระบบประมวลผลข้อมูลแปลงสวนมะม่วงบางคล้า 105 ไร่ (2,595 ต้น) เรียบร้อยแล้ว พร้อมสรุปสภาพอากาศ พยากรณ์ราคา และวงเงินกู้ ธ.ก.ส. ด้านล่างครับ:'
      : 'Welcome to Plotty AI! Your 105-Rai mango orchard data (2,595 trees) has been synchronized below:',
    timestamp: 'วันนี้ 08:00 น.',
    showDashboardOverview: true,
  };

  // Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([initialWelcomeMessage]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll Chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Navigate directly to dedicated 3D Tab
  const handleLaunch3DPlot = (plot: PlotSelectionData) => {
    if (onSelectPlotFor3D) {
      onSelectPlotFor3D(plot);
    }
    setCurrentTab('simulator');
  };

  // Toggle inline tool expansion for a specific message
  const toggleInlineTool = (msgId: string) => {
    setExpandedInlineTools((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === false ? true : false,
    }));
  };

  // Helper metadata for feature tools
  const getToolMeta = (tool?: string) => {
    switch (tool) {
      case 'weather':
        return { title: 'รายงานสภาพอากาศสวนเกษตรรายชั่วโมง & ดัชนีพ่นสาร', icon: CloudSun, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'forecast':
        return { title: 'พยากรณ์ราคามะม่วงส่งออก 12 เดือน (คำนวณตามรายแปลง)', icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'advisor':
        return { title: 'หมอพืชมะม่วง & ตรวจสอบโฉนด ส.ป.ก. 4-01', icon: Stethoscope, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'planner':
        return { title: 'คำนวณวงเงินกู้สินเชื่อ ธ.ก.ส. (2,595 ต้นหลักประกัน)', icon: Calculator, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'carbon':
        return { title: 'เครื่องคำนวณคาร์บอนเครดิต T-VER & โซลาร์', icon: Leaf, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' };
      case '3d':
        return { title: 'โมเดล 3D Digital Twin (ส่องแปลง)', icon: Box, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      default:
        return null;
    }
  };

  // Open Tool INLINE inside the Chat Stream
  const handleOpenTool = (tool: 'weather' | 'forecast' | 'advisor' | 'planner' | 'carbon' | '3d', plot?: PlotSelectionData) => {
    if (plot) setPreviewPlotFor3D(plot);
    const msgId = `tool-msg-${Date.now()}`;
    const toolInfo = getToolMeta(tool);

    let introText = `เปิดใช้งาน **${toolInfo?.title}** แบบโต้ตอบสดในแชท:`;
    if (tool === 'weather') introText = `รายงานสภาพอากาศรายชั่วโมง อ.บางคล้า จ.ฉะเชิงเทรา คำนวณช่วงเวลาพ่นสารและปริมาณน้ำรดแปลง 105 ไร่:`;
    else if (tool === 'advisor') introText = `เปิดระบบหมอพืชมะม่วง อัปโหลดรูปภาพตรวจโรคใบ/ผล และตรวจสอบโฉนด ส.ป.ก. 4-01:`;
    else if (tool === 'forecast') introText = `เปิดกราฟวิเคราะห์ราคามะม่วงส่งออก 12 เดือน คำนวณรายได้ประเมินจากแปลงของคุณสมพงษ์:`;
    else if (tool === 'planner') introText = `เปิดเครื่องคำนวณวงเงินกู้สินเชื่อ ธ.ก.ส. อิงหลักประกันไม้ยืนต้น 2,595 ต้น (วงเงินสูงสุด ฿2,500,000):`;
    else if (tool === 'carbon') introText = `เปิดเครื่องคำนวณคาร์บอนเครดิต T-VER ประเมินการกักเก็บ 303 tCO₂e/ปี และแผงโซลาร์ปั๊มน้ำ:`;
    else if (tool === '3d') introText = `เปิดระบบส่องสวน 3D Digital Twin สำหรับ ${plot ? plot.name : 'แปลง A (1,750 ต้น)'}:`;

    const newMsg: ChatMessage = {
      id: msgId,
      sender: 'ai',
      text: introText,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      featureTool: tool,
      plotAction: plot,
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setExpandedInlineTools((prev) => ({ ...prev, [msgId]: true }));
  };

  // Reset chat conversation
  const handleResetChat = () => {
    if (window.confirm('คุณต้องการรีเซ็ตประวัติการสนทนาในหน้านี้ใช่หรือไม่?')) {
      setChatMessages([initialWelcomeMessage]);
      setExpandedInlineTools({ 'msg-welcome': true });
    }
  };

  // AI Chat Query Handler using Gemini or Fallback Agro-Logic
  const handleSendMessage = async (customQuery?: string) => {
    const query = (customQuery || inputQuery).trim();
    if (!query || isAiLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!customQuery) setInputQuery('');
    setIsAiLoading(true);

    const lowerQ = query.toLowerCase();

    // Determine Feature Tool Trigger
    let targetTool: 'weather' | 'forecast' | 'advisor' | 'planner' | 'carbon' | '3d' | undefined;
    let targetPlot: PlotSelectionData | undefined;

    if (lowerQ.includes('สภาพอากาศ') || lowerQ.includes('อากาศ') || lowerQ.includes('ฝน') || lowerQ.includes('พ่น') || lowerQ.includes('weather')) {
      targetTool = 'weather';
    } else if (lowerQ.includes('ราคา') || lowerQ.includes('แนวโน้ม') || lowerQ.includes('ส่งออก') || lowerQ.includes('forecast')) {
      targetTool = 'forecast';
    } else if (lowerQ.includes('หมอพืช') || lowerQ.includes('โรค') || lowerQ.includes('ส.ป.ก') || lowerQ.includes('โฉนด') || lowerQ.includes('สิทธิ์')) {
      targetTool = 'advisor';
    } else if (lowerQ.includes('สินเชื่อ') || lowerQ.includes('ธ.ก.ส') || lowerQ.includes('เงินกู้') || lowerQ.includes('คะแนน') || lowerQ.includes('loan')) {
      targetTool = 'planner';
    } else if (lowerQ.includes('คาร์บอน') || lowerQ.includes('esg') || lowerQ.includes('โซลาร์') || lowerQ.includes('carbon')) {
      targetTool = 'carbon';
    } else if (lowerQ.includes('แปลง a') || lowerQ.includes('1750') || lowerQ.includes('1,750')) {
      targetTool = '3d';
      targetPlot = plotsData[0];
    } else if (lowerQ.includes('แปลง b') || lowerQ.includes('625')) {
      targetTool = '3d';
      targetPlot = plotsData[1];
    } else if (lowerQ.includes('แปลง c') || lowerQ.includes('220')) {
      targetTool = '3d';
      targetPlot = plotsData[2];
    }

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      let replyText = '';

      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const systemPrompt = `คุณคือ Plotty AI ผู้ช่วยเกษตรกรอัจฉริยะ (Smart Agro-Twin Assistant) ประจำสวนมะม่วงบางคล้า ฉะเชิงเทรา (105 ไร่, 2,595 ต้น) ครอบคลุมมะม่วงน้ำดอกไม้สีทอง มหาชนก และเขียวสามรส คำนวณราคาส่งออกและสินเชื่อ ธ.ก.ส. จากข้อมูลแปลงจริงของคุณสมพงษ์ ให้คำตอบกระชับ ตรงประเด็น สุภาพ`;

          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nคำถามจากเกษตรกร: ${query}` }] },
            ],
          });
          replyText = response.text || '';
        } catch (apiErr) {
          console.warn('Gemini API call failed or rate limit exceeded, using built-in Agro-Engine fallback:', apiErr);
        }
      }

      if (!replyText) {
        if (targetTool === 'weather') {
          replyText = `**รายงานสภาพอากาศสวนเกษตรรายชั่วโมงวันนี้:**\n• ฉะเชิงเทรา - อ.บางคล้า: **32°C แจ่มใส**\n• ความชื้นสัมพัทธ์: **72%** | ลม: **12 km/h**\n• ช่วงเวลาพ่นสารบำรุงที่แนะนำ: **16:00 - 18:00 น.** (หน้าต่างลมสงบ)\nเปิดใช้งานเครื่องมือสภาพอากาศแบบโต้ตอบสดด้านล่างได้เลยครับ:`;
        } else if (targetTool === 'forecast') {
          replyText = `**วิเคราะห์ราคามะม่วงส่งออกคำนวณจากแปลง 105 ไร่ของคุณ:**\n• มะม่วงน้ำดอกไม้สีทอง (70 ไร่ / 1,750 ต้น): **฿45/กก.** (คาดการณ์สูงสุดช่วงเม.ย. ฿65/กก.)\n• มะม่วงมหาชนก (25 ไร่ / 625 ต้น): **฿55/กก.**\n• ประมาณการรายได้รวมสูงสุดช่วง Peak: **฿4,375,000**\nเปิดใช้งานเครื่องมือคำนวณราคาและรายได้แบบโต้ตอบสดด้านล่างได้เลยครับ:`;
        } else if (targetTool === 'advisor') {
          replyText = `**ตรวจสุขภาพใบ & สิทธิ์ที่ดิน ส.ป.ก.:**\n• แปลง A และ B ผ่านเกณฑ์ปลอดโรคแอนแทรคโนส 94%\n• แปลง C ควรเฝ้าระวังความชื้นสัมพัทธ์สูง เสี่ยงโรคราแป้ง\n• โฉนด ส.ป.ก. 4-01 ของท่านได้รับการรับรองสิทธิ์เรียบร้อยแล้ว\nเปิดใช้งานระบบหมอพืชพร้อมอัปโหลดรูปภาพด้านล่างได้เลยครับ:`;
        } else if (targetTool === 'planner') {
          replyText = `**สรุปดัชนีสินเชื่อ & วงเงินกู้ ธ.ก.ส. คำนวณจากแปลงของคุณ:**\n• ไม้ยืนต้นหลักประกันรวม: **2,595 ต้น** (มูลค่าประเมิน ฿3,782,500)\n• ดัชนีสินเชื่อ: **GRADE A+ (94/100)**\n• วงเงินสินเชื่อประเมินสูงสุด (LTV 66%): **฿2,500,000**\nเปิดใช้งานเครื่องมือคำนวณสินเชื่อ ธ.ก.ส. ด้านล่างได้เลยครับ:`;
        } else if (targetTool === 'carbon') {
          replyText = `**ประเมินคาร์บอนเครดิต T-VER & โซลาร์เซลล์ คำนวณจากแปลง 70 ไร่:**\n• กักเก็บคาร์บอนได้ประมาณ: **303 tCO₂e/ปี** (สร้างรายได้เสริม ฿121,200/ปี)\nเปิดใช้งานเครื่องมือคำนวณคาร์บอนด้านล่างได้เลยครับ:`;
        } else if (targetPlot) {
          replyText = `**ระบบเตรียมแสดงโมเดล 3D ${targetPlot.name}:**\nจำนวนต้นมะม่วงในโมเดล: **${targetPlot.treeCount.toLocaleString()} ต้น** (${targetPlot.areaRai} ไร่) สุขภาพแปลง ${targetPlot.healthScore}%\nเปิดใช้งานโมเดล 3D ส่องสวนด้านล่างได้เลยครับ:`;
        } else {
          replyText = `**ยินดีให้บริการครับ!** Plotty AI พร้อมประมวลผลข้อมูลสวนมะม่วง 105 ไร่ เรื่องสภาพอากาศ ราคาส่งออก และวงเงินกู้ ธ.ก.ส. พิมพ์ถามหรือคลิกปุ่มตัวเลือกด่วนด้านล่างได้เลยครับ`;
        }
      }

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        featureTool: targetTool,
        plotAction: targetPlot,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      if (targetTool) {
        setExpandedInlineTools((prev) => ({ ...prev, [aiMsgId]: true }));
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `ขอบคุณสำหรับคำถามครับ! ท่านสามารถใช้ปุ่มทางลัดคำสั่งด่วนด้านล่างเพื่อเปิดใช้งานเครื่องมือได้ทันที`,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          featureTool: targetTool,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white text-slate-900 overflow-hidden relative font-sans">
      {/* 1. SCROLLABLE CHAT MESSAGES AREA */}
      <div className="relative z-10 flex-1 overflow-y-auto p-3 sm:p-5 bg-white scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-4">
            {chatMessages.map((msg) => {
              const toolMeta = getToolMeta(msg.featureTool);
              const isToolOpen = expandedInlineTools[msg.id] !== false;

              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}
                >
                  <div className="flex items-start gap-3 max-w-[100%] sm:max-w-[95%] w-full">
                    {msg.sender === 'ai' && (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-50/90 border border-amber-200/80 p-1 flex items-center justify-center shrink-0 mt-0.5 shadow-sm hover:scale-105 transition-transform">
                        <MangoIcon className="w-full h-full object-cover rounded-xl" />
                      </div>
                    )}

                    <div
                      className={`flex-1 rounded-3xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white font-medium rounded-tr-xs ml-auto max-w-[85%]'
                          : 'bg-slate-50 text-slate-900 rounded-tl-xs border border-slate-200'
                      }`}
                    >
                      <div>{renderFormattedMarkdown(msg.text, msg.sender === 'user')}</div>

                      {/* 4-IN-1 UNIFIED DASHBOARD CARD INSIDE INITIAL CHAT MESSAGE */}
                      {msg.showDashboardOverview && (
                        <div className="mt-4 pt-4 border-t border-slate-200 space-y-3.5">
                          {/* Module 1: Daily Farm Weather */}
                          <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200 shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                              <span className="flex items-center gap-1.5">
                                <Sun className="w-4 h-4 text-amber-600" />
                                <span>1. สภาพอากาศสวนเกษตรประจำวัน (ฉะเชิงเทรา - อ.บางคล้า)</span>
                              </span>
                              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                                32°C แจ่มใส
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono pt-0.5">
                              <div className="bg-white p-2.5 rounded-xl text-center border border-amber-200/80 shadow-2xs">
                                <span className="text-slate-500 text-[10px] block font-sans">อุณหภูมิ</span>
                                <span className="font-black text-amber-700 text-sm">32°C</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl text-center border border-amber-200/80 shadow-2xs">
                                <span className="text-slate-500 text-[10px] block font-sans">ความชื้นสัมพัทธ์</span>
                                <span className="font-black text-cyan-700 text-sm">72%</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl text-center border border-amber-200/80 shadow-2xs">
                                <span className="text-slate-500 text-[10px] block font-sans">ความเร็วลม</span>
                                <span className="font-black text-slate-800 text-sm">12 km/h</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-xl text-center border border-amber-200/80 shadow-2xs">
                                <span className="text-slate-500 text-[10px] block font-sans">คำแนะนำแปลง</span>
                                <span className="font-bold text-emerald-700 text-[11px] font-sans">เหมาะพ่นบำรุง</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleOpenTool('weather')}
                              className="mt-1 w-full py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                            >
                              <CloudSun className="w-3.5 h-3.5" />
                              <span>ดูรายงานสภาพอากาศรายชั่วโมง & ดัชนีพ่นสารในแชท</span>
                            </button>
                          </div>

                          {/* Module 2: 3 Mango Plots with Direct 3D Launch Links */}
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                              <span className="flex items-center gap-1.5">
                                <Box className="w-4 h-4 text-emerald-600" />
                                <span>2. แปลงสวนมะม่วง 3 แปลง (ส่อง 3D แยกแปลง)</span>
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                                รวม 2,595 ต้น (105 ไร่)
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              {/* Plot A */}
                              <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-2xs flex flex-col justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">แปลง A</span>
                                    <span className="text-[10px] font-bold text-emerald-700">เกรด A+</span>
                                  </div>
                                  <span className="font-black text-slate-900 text-xs block truncate">น้ำดอกไม้สีทอง</span>
                                  <div className="text-[11px] text-slate-600 font-mono">
                                    <div>เนื้อที่: <strong>70 ไร่</strong></div>
                                    <div>ต้นไม้ 3D: <strong className="text-emerald-700 font-bold">1,750 ต้น</strong></div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleLaunch3DPlot(plotsData[0])}
                                  className="mt-2.5 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>ส่อง 3D แปลง A</span>
                                </button>
                              </div>

                              {/* Plot B */}
                              <div className="bg-white rounded-xl p-3 border border-cyan-200 shadow-2xs flex flex-col justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black bg-cyan-600 text-white px-2 py-0.5 rounded-full">แปลง B</span>
                                    <span className="text-[10px] font-bold text-cyan-700">เกรด A</span>
                                  </div>
                                  <span className="font-black text-slate-900 text-xs block truncate">มหาชนกส่งออก</span>
                                  <div className="text-[11px] text-slate-600 font-mono">
                                    <div>เนื้อที่: <strong>25 ไร่</strong></div>
                                    <div>ต้นไม้ 3D: <strong className="text-cyan-700 font-bold">625 ต้น</strong></div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleLaunch3DPlot(plotsData[1])}
                                  className="mt-2.5 w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[11px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>ส่อง 3D แปลง B</span>
                                </button>
                              </div>

                              {/* Plot C */}
                              <div className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs flex flex-col justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">แปลง C</span>
                                    <span className="text-[10px] font-bold text-amber-700">เฝ้าระวัง</span>
                                  </div>
                                  <span className="font-black text-slate-900 text-xs block truncate">เขียวสามรส</span>
                                  <div className="text-[11px] text-slate-600 font-mono">
                                    <div>เนื้อที่: <strong>10 ไร่</strong></div>
                                    <div>ต้นไม้ 3D: <strong className="text-amber-700 font-bold">220 ต้น</strong></div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleLaunch3DPlot(plotsData[2])}
                                  className="mt-2.5 w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-black text-[11px] rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>ส่อง 3D แปลง C</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Module 3 & 4: Credit Score & Today's Export Prices Side-by-Side */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Credit Score */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                                <span className="flex items-center gap-1.5">
                                  <Award className="w-4 h-4 text-amber-600" />
                                  <span>3. คะแนนสินเชื่อไม้ยืนต้น</span>
                                </span>
                                <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded font-black">
                                  GRADE A+
                                </span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-black text-slate-900 font-mono">94</span>
                                <span className="text-xs text-slate-500">/ 100</span>
                                <span className="text-xs text-amber-800 font-bold ml-auto font-mono">วงเงิน ฿2.5M</span>
                              </div>
                              <div className="flex gap-1.5 pt-1">
                                <button
                                  onClick={() => handleOpenTool('planner')}
                                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all shadow-2xs"
                                >
                                  <Calculator className="w-3 h-3" />
                                  <span>คำนวณเงินกู้</span>
                                </button>
                                <button
                                  onClick={() => setShowPassportModal(true)}
                                  className="py-1.5 px-2.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-all border border-slate-300"
                                  title="ออกใบรับรองสินทรัพย์"
                                >
                                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                                  <span>ใบรับรอง</span>
                                </button>
                              </div>
                            </div>

                            {/* Export Prices Today */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-1.5">
                              <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                                <span className="flex items-center gap-1.5">
                                  <TrendingUp className="w-4 h-4 text-cyan-600" />
                                  <span>4. ราคามะม่วงส่งออกวันนี้</span>
                                </span>
                                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                                  +4.5% ปรับขึ้น
                                </span>
                              </div>
                              <div className="space-y-0.5 text-xs font-mono">
                                <div className="flex justify-between items-center text-slate-700">
                                  <span>น้ำดอกไม้สีทอง:</span>
                                  <span className="font-extrabold text-emerald-700">฿45/กก.</span>
                                </div>
                                <div className="flex justify-between items-center text-slate-700">
                                  <span>มหาชนกส่งออก:</span>
                                  <span className="font-extrabold text-emerald-700">฿55/กก.</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleOpenTool('forecast')}
                                className="mt-1 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>คำนวณรายได้ประเมินรายแปลง</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div
                        className={`text-[9px] mt-2 font-mono ${
                          msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>

                      {/* INLINE INTERACTIVE FEATURE TOOL WIDGET EMBEDDED DIRECTLY IN CHAT STREAM */}
                      {msg.featureTool && (
                        <div className="mt-4 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-md text-slate-900">
                          {/* Inline Tool Card Header */}
                          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 text-slate-900">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {toolMeta && (
                                <div className={`p-1.5 rounded-lg border ${toolMeta.color} shrink-0`}>
                                  <toolMeta.icon className="w-4 h-4" />
                                </div>
                              )}
                              <span className="font-extrabold text-xs text-slate-900 truncate">
                                {toolMeta?.title}
                              </span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded-full shrink-0">
                                โต้ตอบได้ในแชท
                              </span>
                            </div>

                            <button
                              onClick={() => toggleInlineTool(msg.id)}
                              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
                              title={isToolOpen ? 'ย่อหน้าต่าง' : 'ขยายหน้าต่าง'}
                            >
                              <span>{isToolOpen ? 'ย่อ' : 'ขยาย'}</span>
                              {isToolOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Inline Tool Content Body */}
                          {isToolOpen && (
                            <div className="p-3 sm:p-5 bg-white rounded-b-2xl">
                              {msg.featureTool === 'weather' && (
                                <AgriWeatherReport
                                  lang={lang}
                                  selectedProvince={selectedProvince}
                                  onSelectProvince={setSelectedProvince}
                                />
                              )}
                              {msg.featureTool === 'forecast' && <PriceForecaster lang={lang} />}
                              {msg.featureTool === 'advisor' && <UnifiedAgriAdvisor lang={lang} />}
                              {msg.featureTool === 'planner' && (
                                <CropYieldPlanner lang={lang} selectedProvince={selectedProvince} />
                              )}
                              {msg.featureTool === 'carbon' && (
                                <EsgCarbonCalculator
                                  lang={lang}
                                  totalFarmRai={70}
                                  onTotalCalculated={handleEsgTotalsCalculated}
                                />
                              )}
                              {msg.featureTool === '3d' && (
                                <div className="space-y-3">
                                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <span className="font-bold text-xs text-slate-800">
                                      โมเดล 3D Digital Twin: {msg.plotAction?.name || plotsData[0].name}
                                    </span>
                                    <button
                                      onClick={() => handleLaunch3DPlot(msg.plotAction || plotsData[0])}
                                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                                    >
                                      <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span>เปิดเต็มจอในแท็บ 3D</span>
                                    </button>
                                  </div>
                                  <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                                    <FarmSimulator3D lang={lang} initialPlot={msg.plotAction || plotsData[0]} />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {isAiLoading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-slate-100 text-slate-800 rounded-2xl p-3 text-xs border border-slate-200 shadow-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span className="font-medium">Plotty AI กำลังประมวลผลข้อมูลแปลง...</span>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>
        </div>

      {/* 3. PINNED BOTTOM PROMPT INPUT CONTAINER */}
      <div className="shrink-0 bg-white border-t border-slate-200 p-2 sm:p-3.5 pb-3 sm:pb-4 z-20 shadow-md">
        <div className="max-w-3xl mx-auto space-y-2">
          {/* QUICK ACTION PROMPT CHIPS (PLACEMENT ABOVE INPUT BOX LIKE GEMINI UI) */}
          <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto scrollbar-none py-1 text-xs px-2 sm:px-1 max-w-full">
            <button
              onClick={() => handleOpenTool('weather')}
              className="px-3 py-1.5 bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 hover:scale-105 active:scale-95"
            >
              <CloudSun className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>สภาพอากาศวันนี้</span>
            </button>

            <button
              onClick={() => handleOpenTool('advisor')}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 hover:scale-105 active:scale-95"
            >
              <Stethoscope className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>หมอพืช & ตรวจโฉนด</span>
            </button>

            <button
              onClick={() => handleOpenTool('forecast')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 hover:scale-105 active:scale-95"
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>พยากรณ์ราคาส่งออก</span>
            </button>

            <button
              onClick={() => handleOpenTool('planner')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 hover:scale-105 active:scale-95"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>วงเงินกู้ ธ.ก.ส. (2.5M)</span>
            </button>

            <button
              onClick={() => handleOpenTool('carbon')}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 hover:scale-105 active:scale-95"
            >
              <Leaf className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>คาร์บอนเครดิต</span>
            </button>

            <button
              onClick={() => handleOpenTool('3d', plotsData[0])}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs shrink-0 hover:scale-105 active:scale-95"
            >
              <Box className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>ส่อง 3D แปลง A</span>
            </button>
          </div>

          {/* CENTERED PROMPT CONTAINER */}
          <div className="bg-slate-50 border border-slate-300 rounded-3xl p-2.5 sm:p-3 shadow-xs relative">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="space-y-2"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  placeholder={
                    lang === 'th'
                      ? 'พิมพ์สั่งงาน Plotty AI เช่น "คำนวณราคาส่งออก", "คำนวณเงินกู้", "หมอพืช"...'
                      : 'Ask Plotty AI to manage your orchard or loans...'
                  }
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none font-medium px-2 py-0.5"
                />
              </div>

              <div className="flex items-center justify-between pt-1.5 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  {/* Round Hamburger Menu Button on Bottom Left (Mobile Only) */}
                  <button
                    type="button"
                    onClick={onOpenSidebar}
                    className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95 shrink-0 md:hidden"
                    title="เปิดเมนูหลัก"
                    aria-label="Open menu"
                  >
                    <Menu className="w-4 h-4 text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenTool('advisor')}
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
                    title="อัปโหลดรูปภาพโรคพืช"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                    105 ไร่ · 2,595 ต้น
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenTool('planner')}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-slate-200 cursor-pointer shadow-2xs"
                  >
                    <span>ประมวลผล</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  <button
                    type="submit"
                    disabled={!inputQuery.trim() || isAiLoading}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 text-white rounded-xl transition-all cursor-pointer shadow-xs"
                    title="ส่งข้อความ"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Official Living Asset & Sales Certificate Modal */}
      {showPassportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto text-slate-900">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200 my-8">
            {/* Close Button */}
            <button
              onClick={() => setShowPassportModal(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Certificate Official Header */}
            <div className="text-center space-y-2 border-b border-slate-200 pb-5">
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full border border-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ใบรับรองหลักประกันสินทรัพย์ไม้ยืนต้นดิจิทัล (Digital Asset Certificate)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                หนังสือรับรองมูลค่าไม้ยืนต้น & ประวัติการรับซื้อผลผลิต
              </h2>
              <div className="text-xs text-slate-500 font-mono flex flex-wrap items-center justify-center gap-3 pt-1">
                <span>รหัสใบรับรอง: <strong className="text-slate-800">CERT-PLOTTY-2026-0892</strong></span>
                <span>•</span>
                <span>วันที่ออกเอกสาร: <strong className="text-slate-800">28 ตุลาคม 2569</strong></span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">สถานะ: ผ่านการตรวจสอบแล้ว</span>
              </div>
            </div>

            {/* Borrower & Land Details */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">เจ้าของแปลง / ผู้ขอรับรอง:</span>
                <span className="font-bold text-slate-900 text-sm">นายสมพงษ์ มะม่วงทอง</span>
                <span className="text-slate-500 block mt-1">พิกัดแปลง: อ.บางคล้า จ.ฉะเชิงเทรา (105 ไร่)</span>
              </div>
              <div>
                <span className="text-slate-500 block">สถานะสิทธิ์ที่ดิน ส.ป.ก. 4-01:</span>
                <span className="font-bold text-emerald-700 text-sm">ผ่านเกณฑ์ระเบียบปี 2566</span>
                <span className="text-slate-500 block mt-1">นำไม้ยืนต้นใช้เป็นหลักประกันเงินกู้ได้ถูกต้อง</span>
              </div>
            </div>

            {/* Credit Score & Asset Valuation Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-center">
                <span className="text-[11px] text-emerald-800 font-bold block">ดัชนีสินเชื่อ (Credit Score)</span>
                <span className="text-2xl font-black text-emerald-700 font-mono block my-1">94 / 100</span>
                <span className="text-[10px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full">GRADE A+</span>
              </div>

              <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200 text-center">
                <span className="text-[11px] text-amber-900 font-bold block">วงเงินประเมิน ธ.ก.ส.</span>
                <span className="text-2xl font-black text-amber-900 font-mono block my-1">฿2,500,000</span>
                <span className="text-[10px] text-amber-800 font-semibold block">อิง พ.ร.บ.หลักประกัน 2558</span>
              </div>

              <div className="bg-slate-100 rounded-2xl p-3.5 border border-slate-200 text-center">
                <span className="text-[11px] text-slate-700 font-bold block">จำนวนไม้ยืนต้นหลักประกัน</span>
                <span className="text-2xl font-black text-slate-900 font-mono block my-1">2,595 ต้น</span>
                <span className="text-[10px] text-slate-600 block">3 แปลงย่อย (105 ไร่)</span>
              </div>
            </div>

            {/* Sales & Market Revenue Verification Section */}
            <div className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-white">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>ประวัติการขายผลผลิต & สัญญาซื้อขายล่วงหน้า (Verified Sales History)</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  ยืนยันผ่านสลิป & ใบเสร็จล้ง
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block font-sans">1. สัญญาซื้อขายล่วงหน้าล้งส่งออกพรีเมียม (Export Contract)</span>
                    <span className="text-[11px] text-slate-500 font-sans">มะม่วงน้ำดอกไม้สีทอง 25,000 กก. @ ฿45/กก.</span>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">฿1,125,000</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block font-sans">2. สัญญาป้อนห้างโมเดิร์นเทรด & ตลาดไท (Retail Contract)</span>
                    <span className="text-[11px] text-slate-500 font-sans">มะม่วงมหาชนก 11,250 กก. @ ฿55/กก.</span>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">฿618,750</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-900 block font-sans">3. ยอดขายมะม่วงสดหน้าแปลงสะสม 12 เดือน (Local Sales)</span>
                    <span className="text-[11px] text-slate-500 font-sans">มะม่วงเขียวสามรส & ผลผลิตเกรด B</span>
                  </div>
                  <span className="font-black text-emerald-700 text-sm">฿406,250</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-800">
                <span>รวมรายได้จากการขายผลผลิตรอบ 12 เดือนที่ผ่านมา:</span>
                <span className="text-base text-emerald-800 font-mono font-black">฿2,150,000 / ปี</span>
              </div>
            </div>

            {/* Official Digital Signature & Print Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>รับรองข้อมูลโดย แพลตฟอร์ม Plotty Asset Audit Engine ร่วมกับฐานข้อมูลเกษตร</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => window.print()}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>พิมพ์ใบรับรอง</span>
                </button>
                <button
                  onClick={() => setShowPassportModal(false)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
