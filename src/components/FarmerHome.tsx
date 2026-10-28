/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { ProvinceWeatherWidget } from './ProvinceWeatherWidget';
import { EsgCarbonCalculator } from './EsgCarbonCalculator';
import { PriceForecaster } from './PriceForecaster';
import { UnifiedAgriAdvisor } from './UnifiedAgriAdvisor';
import { CropYieldPlanner } from './CropYieldPlanner';
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
  Bot,
  Send,
  MessageSquare,
  Layers,
  Trees,
  Maximize2,
  Eye,
} from 'lucide-react';
import { LandBoundary2DPreview, PRESET_BANGKRUAI_25_RAI } from './InteractiveLandBoundaryPicker';

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
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  featureTool?: 'forecast' | 'advisor' | 'planner' | 'carbon' | '3d';
  plotAction?: PlotSelectionData;
}

export const FarmerHome: React.FC<FarmerHomeProps> = ({
  lang,
  setCurrentTab,
  selectedProvince,
  setSelectedProvince,
  onSelectPlotFor3D,
}) => {
  const [activeFeatureTab, setActiveFeatureTab] = useState<'overview' | 'chat' | 'forecast' | 'advisor' | 'planner' | 'carbon'>('overview');
  const [profitPriceMultiplier, setProfitPriceMultiplier] = useState<number>(1.0);
  const [isOrganicSavingsApplied, setIsOrganicSavingsApplied] = useState<boolean>(true);
  const [showPassportModal, setShowPassportModal] = useState<boolean>(false);

  // ESG Totals
  const [esgTotals, setEsgTotals] = useState<{ totalTons: number; totalIncomeThb: number }>({
    totalTons: 303,
    totalIncomeThb: 121200,
  });

  // AI Chat Messages State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: lang === 'th'
        ? 'สวัสดีครับผม Plotty AI ผู้ช่วยจัดการสวนมะม่วงและประเมินสินเชื่อดิจิทัล\n\nยินดีรับฟังคำถามเรื่อง:\n• พยากรณ์ราคามะม่วงส่งออก 12 เดือน\n• หมอพืชมะม่วง & ตรวจสิทธิ์ที่ดิน ส.ป.ก. 4-01\n• คำนวณวงเงินสินเชื่อ ธ.ก.ส. จากหลักประกันต้นไม้\n• ดูโมเดล 3D แปลง A (1,750 ต้น), แปลง B (625 ต้น), หรือ แปลง C (220 ต้น)'
        : 'Welcome! I am Plotty AI, your Smart Mango Orchard & Credit Assistant. How can I help your farm today?',
      timestamp: 'เมื่อครู่',
    },
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scroll Chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiLoading]);

  // Plots A, B, C Data with distinct tree counts and parameters
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

  const handleLaunch3DPlot = (plot: PlotSelectionData) => {
    if (onSelectPlotFor3D) {
      onSelectPlotFor3D(plot);
    }
    setCurrentTab('simulator');
  };

  // AI Chat Assistant Query Handler using Gemini API or Fallback Reasoning Engine
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

    // Determine Feature Action Chip or Tool Trigger
    let targetTool: 'forecast' | 'advisor' | 'planner' | 'carbon' | '3d' | undefined;
    let targetPlot: PlotSelectionData | undefined;

    if (lowerQ.includes('ราคา') || lowerQ.includes('แนวโน้ม') || lowerQ.includes('ส่งออก') || lowerQ.includes('forecast')) {
      targetTool = 'forecast';
    } else if (lowerQ.includes('หมอพืช') || lowerQ.includes('โรค') || lowerQ.includes('ส.ป.ก') || lowerQ.includes('โฉนด') || lowerQ.includes('สิทธิ์')) {
      targetTool = 'advisor';
    } else if (lowerQ.includes('สินเชื่อ') || lowerQ.includes('ธ.ก.ส') || lowerQ.includes('เงินกู้') || lowerQ.includes('ผลผลิต') || lowerQ.includes('loan')) {
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
        const ai = new GoogleGenAI({ apiKey });
        const systemPrompt = `คุณคือ Plotty AI ผู้เชี่ยวชาญด้านสวนมะม่วง (น้ำดอกไม้สีทอง, มหาชนก, เขียวสามรส) สิทธิ์ที่ดิน ส.ป.ก. 4-01 การประเมินสินเชื่อไม้ยืนต้น ธ.ก.ส. และ 3D Digital Twin ตอบอย่างกระชับ นอบน้อม และเป็นกันเองในภาษาไทย ให้คำแนะนำที่มีประโยชน์เชิงวิชาการเกษตรและสินเชื่อ`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nคำถามจากเกษตรกร: ${query}` }] },
          ],
        });
        replyText = response.text || '';
      }

      if (!replyText) {
        if (targetTool === 'forecast') {
          replyText = `**วิเคราะห์ราคามะม่วงส่งออก:**\nขณะนี้ราคามะม่วงน้ำดอกไม้สีทองเกรดพรีเมียมทรงตัวที่ ฿45/กก. (+4.5%) และคาดว่าจะแตะจุดสูงสุด ฿55-65/กก. ในช่วงเดือนเมษายน-พฤษภาคม (ฤดูกาลส่งออกตลาดญี่ปุ่นและเกาหลีใต้) กดปุ่มด้านล่างเพื่อเปิดกราฟพยากรณ์ 12 เดือนครับ`;
        } else if (targetTool === 'advisor') {
          replyText = `**ตรวจสุขภาพใบ & สิทธิ์ที่ดิน ส.ป.ก.:**\n• แปลง A และ B ผ่านเกณฑ์ปลอดโรคแอนแทรคโนส 94%\n• แปลง C ควรเฝ้าระวังความชื้นสัมพัทธ์สูง เสี่ยงโรคราแป้ง\n• โฉนด ส.ป.ก. 4-01 ของท่านได้รับการรับรองสิทธิ์เพื่อนำไม้ยืนต้นไปค้ำประกันสินเชื่อได้ถูกต้องตามกฎหมายแล้วครับ`;
        } else if (targetTool === 'planner') {
          replyText = `**ประเมินวงเงินสินเชื่อไม้ยืนต้น ธ.ก.ส.:**\n• แปลง A (1,750 ต้น): ประเมินมูลค่าไม้ยืนต้น ฿2,625,000\n• แปลง B (625 ต้น): ประเมินมูลค่า ฿937,500\n• แปลง C (220 ต้น): ประเมินมูลค่า ฿220,000\nรวมวงเงินสินเชื่อประเมินสูงสุด ฿2,500,000 ดอกเบี้ยพิเศษ MRR-2.25%`;
        } else if (targetTool === 'carbon') {
          replyText = `**ประเมินคาร์บอนเครดิต T-VER & โซลาร์:**\nสวนมะม่วง 70 ไร่ กักเก็บคาร์บอนได้ประมาณ 303 tCO₂e/ปี สร้างรายได้เสริมประมาณ 121,200 บาท/ปี พร้อมประหยัดค่าไฟปั๊มน้ำด้วยโซลาร์เซลล์ 35%`;
        } else if (targetPlot) {
          replyText = `**ระบบกำลังเตรียมแสดง 3D ${targetPlot.name}:**\nจำนวนต้นมะม่วงในโมเดล: **${targetPlot.treeCount.toLocaleString()} ต้น** (${targetPlot.areaRai} ไร่) กดปุ่มเปิด 3D เพื่อส่องกล้องเข้าชมแปลงได้ทันทีครับ`;
        } else {
          replyText = `**ยินดีให้บริการครับ!** Plotty AI พร้อมช่วยเหลือในการวิเคราะห์สวนมะม่วง 70 ไร่ ตรวจโรคพืช คำนวณราคาส่งออก และจำลองสวน 3D สำหรับแปลง A, B, และ C ครับ`;
        }
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
        featureTool: targetTool,
        plotAction: targetPlot,
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setChatMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `ขอบคุณสำหรับคำถามครับ! ท่านสามารถใช้ปุ่มทางลัดด้านล่างเพื่อเข้าถึงฟีเจอร์ที่ต้องการได้ทันที`,
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          featureTool: targetTool,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. Main Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>{lang === 'th' ? 'แดชบอร์ด & AI เกษตร' : 'Dashboard & AI Assistant'}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-1 rounded-full border border-emerald-200">
              Plotty Smart OS
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {lang === 'th'
              ? 'รวมผู้ช่วย AI วิเคราะห์ราคาส่งออก ตรวจสิทธิ์ที่ดิน ส.ป.ก. สินเชื่อ ธ.ก.ส. และ 3D Digital Twin'
              : 'Integrated AI Assistant, Price Forecasting, ALRO Title Audit & 3D Digital Twin'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 shadow-2xs self-start sm:self-auto flex-wrap">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium text-slate-800">
            {lang === 'th' ? 'พิกัดสวน: อ.บางคล้า จ.ฉะเชิงเทรา (นำร่อง 70 ไร่)' : 'Location: Bang Khla, Chachoengsao'}
          </span>
        </div>
      </div>

      {/* 2. Weather Widget */}
      <ProvinceWeatherWidget
        lang={lang}
        selectedProvince={selectedProvince}
        onSelectProvince={setSelectedProvince}
      />

      {/* 3. 3D Digital Twin Plot Launcher Cards (Plots A, B, C - White Theme) */}
      <div className="bg-white text-slate-900 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200/90 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                {lang === 'th' ? 'เลือกแปลงเพื่อเข้าชม 3D Digital Twin' : 'Select Plot for 3D Digital Twin'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {lang === 'th' ? 'แปลงสวนมะม่วง 3 แปลง (ปรับปริมาณต้นใน 3D ตามแปลง)' : '3 Orchard Plots (Dynamic 3D Tree Counts)'}
            </h2>
          </div>
          <button
            onClick={() => setCurrentTab('simulator')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer self-start md:self-auto"
          >
            <Box className="w-4 h-4" />
            <span>{lang === 'th' ? 'เปิดแบบจำลองสวน 3D รวม' : 'Open Full 3D Simulator'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Plot A Card */}
          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/90 hover:border-emerald-400 transition-all flex flex-col justify-between group shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                  {lang === 'th' ? 'แปลง A (นำร่อง)' : 'Plot A (Pilot)'}
                </span>
                <span className="text-[11px] text-emerald-800 font-mono font-bold">เกรด A+ (94/100)</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                {lang === 'th' ? 'มะม่วงน้ำดอกไม้สีทอง' : 'Nam Dok Mai Sri Thong'}
              </h3>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">เนื้อที่:</span>
                  <span className="font-bold text-slate-900">70 ไร่</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">จำนวนต้น 3D:</span>
                  <span className="font-bold text-emerald-700">1,750 ต้น (ทรงพุ่มใหญ่)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">อายุต้นไม้:</span>
                  <span className="text-slate-800">8 ปี (เต็มวัย)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">วงเงินประเมิน:</span>
                  <span className="text-amber-800 font-bold">฿2,450,000</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleLaunch3DPlot(plotsData[0])}
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4" />
              <span>{lang === 'th' ? 'ดู 3D แปลง A (1,750 ต้น)' : 'View 3D Plot A'}</span>
            </button>
          </div>

          {/* Plot B Card */}
          <div className="bg-teal-50/50 rounded-2xl p-4 border border-teal-200/90 hover:border-teal-400 transition-all flex flex-col justify-between group shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold bg-teal-600 text-white px-2.5 py-0.5 rounded-full">
                  {lang === 'th' ? 'แปลง B' : 'Plot B'}
                </span>
                <span className="text-[11px] text-teal-800 font-mono font-bold">เกรด A (88/100)</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                {lang === 'th' ? 'มะม่วงมหาชนกส่งออก' : 'Mahachanok Export'}
              </h3>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">เนื้อที่:</span>
                  <span className="font-bold text-slate-900">25 ไร่</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">จำนวนต้น 3D:</span>
                  <span className="font-bold text-teal-700">625 ต้น (ทรงพุ่มกลาง)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">อายุต้นไม้:</span>
                  <span className="text-slate-800">5 ปี</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">วงเงินประเมิน:</span>
                  <span className="text-amber-800 font-bold">฿875,000</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleLaunch3DPlot(plotsData[1])}
              className="mt-4 w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4" />
              <span>{lang === 'th' ? 'ดู 3D แปลง B (625 ต้น)' : 'View 3D Plot B'}</span>
            </button>
          </div>

          {/* Plot C Card */}
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200/90 hover:border-amber-400 transition-all flex flex-col justify-between group shadow-2xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                  {lang === 'th' ? 'แปลง C (เฝ้าระวัง)' : 'Plot C (Watch)'}
                </span>
                <span className="text-[11px] text-amber-900 font-mono font-bold">เกรด B+ (78/100)</span>
              </div>
              <h3 className="text-base font-black text-slate-900 group-hover:text-amber-800 transition-colors">
                {lang === 'th' ? 'มะม่วงเขียวสามรส' : 'Green Three-Flavor'}
              </h3>
              <div className="text-xs text-slate-600 space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">เนื้อที่:</span>
                  <span className="font-bold text-slate-900">10 ไร่</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">จำนวนต้น 3D:</span>
                  <span className="font-bold text-amber-800">220 ต้น (ต้นเล็กวัยรุ่น)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">อายุต้นไม้:</span>
                  <span className="text-slate-800">2 ปี</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">วงเงินประเมิน:</span>
                  <span className="text-amber-800 font-bold">฿308,000</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleLaunch3DPlot(plotsData[2])}
              className="mt-4 w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <Eye className="w-4 h-4" />
              <span>{lang === 'th' ? 'ดู 3D แปลง C (220 ต้น)' : 'View 3D Plot C'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Integrated Feature Tool Switcher Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex flex-wrap gap-1">
        <button
          onClick={() => setActiveFeatureTab('overview')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeFeatureTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>{lang === 'th' ? 'Plotty AI Chat & สรุปภาพรวม' : 'Plotty AI Chat & Hub'}</span>
        </button>

        <button
          onClick={() => setActiveFeatureTab('forecast')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeFeatureTab === 'forecast'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>{lang === 'th' ? 'พยากรณ์ราคามะม่วง' : 'Price Forecast'}</span>
        </button>

        <button
          onClick={() => setActiveFeatureTab('advisor')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeFeatureTab === 'advisor'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>{lang === 'th' ? 'หมอพืช & สิทธิ์ ส.ป.ก.' : 'Plant Doctor & Rights'}</span>
        </button>

        <button
          onClick={() => setActiveFeatureTab('planner')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeFeatureTab === 'planner'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>{lang === 'th' ? 'วางแผนสินเชื่อ ธ.ก.ส.' : 'Yield & BAAC Loan'}</span>
        </button>

        <button
          onClick={() => setActiveFeatureTab('carbon')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer ${
            activeFeatureTab === 'carbon'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Leaf className="w-4 h-4" />
          <span>{lang === 'th' ? 'คาร์บอนเครดิต ESG' : 'ESG Carbon'}</span>
        </button>
      </div>

      {/* 5. Render Active Feature Tool or Overview Chat */}
      {activeFeatureTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Chat Box Section (2 columns) */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-md p-5 flex flex-col h-[560px]">
            {/* Chat Title Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <span>Plotty AI Assistant</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h3>
                  <span className="text-[11px] text-slate-500 block">
                    {lang === 'th' ? 'สอบถามเรื่องราคาสินค้า สุขภาพพืช สินเชื่อ และโมเดล 3D' : 'Ask about prices, diseases, loans & 3D models'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-2 py-1 rounded-md">
                Gemini 3.8 Engine
              </span>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white font-medium rounded-br-xs shadow-xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/80'
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div
                      className={`text-[9px] mt-1.5 font-mono ${
                        msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp}
                    </div>

                    {/* Integrated Tool Trigger Action Buttons inside Chat */}
                    {msg.featureTool && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1.5">
                        {msg.featureTool === 'forecast' && (
                          <button
                            onClick={() => setActiveFeatureTab('forecast')}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{lang === 'th' ? 'เปิดกราฟพยากรณ์ราคา 12 เดือน' : 'Open Price Forecast'}</span>
                          </button>
                        )}
                        {msg.featureTool === 'advisor' && (
                          <button
                            onClick={() => setActiveFeatureTab('advisor')}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>{lang === 'th' ? 'เปิดระบบหมอพืช & ตรวจสิทธิ์ที่ดิน' : 'Open Plant Doctor'}</span>
                          </button>
                        )}
                        {msg.featureTool === 'planner' && (
                          <button
                            onClick={() => setActiveFeatureTab('planner')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Calculator className="w-3.5 h-3.5" />
                            <span>{lang === 'th' ? 'เปิดเครื่องคำนวณสินเชื่อ ธ.ก.ส.' : 'Open Loan Planner'}</span>
                          </button>
                        )}
                        {msg.featureTool === 'carbon' && (
                          <button
                            onClick={() => setActiveFeatureTab('carbon')}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Leaf className="w-3.5 h-3.5" />
                            <span>{lang === 'th' ? 'เปิดคำนวณคาร์บอนเครดิต T-VER' : 'Open Carbon Calculator'}</span>
                          </button>
                        )}
                        {msg.plotAction && (
                          <button
                            onClick={() => handleLaunch3DPlot(msg.plotAction!)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Box className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{lang === 'th' ? `ชม 3D ${msg.plotAction.name}` : 'View 3D Model'}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl p-3 text-xs text-slate-600 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                    <span>Plotty AI กำลังวิเคราะห์ข้อมูลสวน...</span>
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Feature Action Chips Bar */}
            <div className="py-2 overflow-x-auto flex items-center gap-1.5 border-t border-slate-100 no-scrollbar">
              <span className="text-[10px] text-slate-400 font-bold shrink-0">ทางลัด:</span>
              <button
                onClick={() => handleSendMessage('พยากรณ์ราคามะม่วงน้ำดอกไม้ 12 เดือน')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-full shrink-0 cursor-pointer transition-colors"
              >
                พยากรณ์ราคา
              </button>
              <button
                onClick={() => handleSendMessage('ตรวจสุขภาพใบและสิทธิ์โฉนด ส.ป.ก. 4-01')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-full shrink-0 cursor-pointer transition-colors"
              >
                หมอพืช & ส.ป.ก.
              </button>
              <button
                onClick={() => handleSendMessage('คำนวณวงเงินสินเชื่อ ธ.ก.ส. แปลง 70 ไร่')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-full shrink-0 cursor-pointer transition-colors"
              >
                คำนวณสินเชื่อ
              </button>
              <button
                onClick={() => handleSendMessage('ดู 3D แปลง A 1,750 ต้น')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-full shrink-0 cursor-pointer transition-colors"
              >
                3D แปลง A
              </button>
            </div>

            {/* Chat Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={lang === 'th' ? 'พิมพ์คำถามเกี่ยวกับการเกษตร สินเชื่อ หรือแปลง 3D...' : 'Ask Plotty AI anything...'}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim() || isAiLoading}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition-all cursor-pointer shrink-0 shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Metrics Summary Sidebar Card */}
          <div className="space-y-4">
            {/* Agri-Credit Score Bar */}
            <div className="bg-white rounded-3xl p-5 border border-amber-200/80 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">คะแนนสินเชื่อแปลงเกษตร</span>
                <span className="text-xs bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded shadow-2xs">
                  GRADE A+
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 font-mono">94</span>
                <span className="text-xs text-slate-500">/ 100</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-amber-400 to-emerald-600 h-full w-[94%]" />
              </div>
              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>วงเงินประเมิน ธ.ก.ส.:</span>
                  <span className="font-bold text-amber-900 font-mono">฿2,500,000</span>
                </div>
                <div className="flex justify-between">
                  <span>ไม้ยืนต้นหลักประกัน:</span>
                  <span className="font-bold text-emerald-800 font-mono">2,595 ต้น</span>
                </div>
                <div className="flex justify-between">
                  <span>ระเบียบ ส.ป.ก.:</span>
                  <span className="font-bold text-emerald-700">ผ่านเกณฑ์ปี 2566</span>
                </div>
              </div>

              <button
                onClick={() => setShowPassportModal(true)}
                className="mt-2 w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>ออกใบรับรองสินทรัพย์ & สรุปการขาย</span>
              </button>
            </div>

            {/* Quick Export Price Ticker Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span>ราคามะม่วงส่งออกวันนี้</span>
                </span>
                <button
                  onClick={() => setActiveFeatureTab('forecast')}
                  className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  ดูทั้งหมด →
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-sans font-semibold text-slate-800">น้ำดอกไม้สีทอง (เกรดส่งออก)</span>
                  <span className="font-bold text-emerald-700">฿45/กก.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-sans font-semibold text-slate-800">มะม่วงมหาชนก (เกรด A)</span>
                  <span className="font-bold text-emerald-700">฿55/กก.</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between">
                  <span className="font-sans font-semibold text-slate-800">เขียวสามรส</span>
                  <span className="font-bold text-slate-700">฿25/กก.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Render Sub-Feature Views inline inside Dashboard */}
      {activeFeatureTab === 'forecast' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md animate-fade-in">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span>พยากรณ์ราคามะม่วงล่วงหน้า 12 เดือน</span>
            </h2>
            <button
              onClick={() => setActiveFeatureTab('overview')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              aria-label="Close feature window"
            >
              <X className="w-4 h-4" />
              <span>ปิด</span>
            </button>
          </div>
          <PriceForecaster lang={lang} />
        </div>
      )}

      {activeFeatureTab === 'advisor' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md animate-fade-in">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-amber-600" />
              <span>หมอพืชมะม่วง & ตรวจสอบสิทธิ์ที่ดิน ส.ป.ก. 4-01</span>
            </h2>
            <button
              onClick={() => setActiveFeatureTab('overview')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              aria-label="Close feature window"
            >
              <X className="w-4 h-4" />
              <span>ปิด</span>
            </button>
          </div>
          <UnifiedAgriAdvisor lang={lang} />
        </div>
      )}

      {activeFeatureTab === 'planner' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md animate-fade-in">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-emerald-600" />
              <span>วางแผนผลผลิต & เครื่องคำนวณสินเชื่อไม้ยืนต้น ธ.ก.ส.</span>
            </h2>
            <button
              onClick={() => setActiveFeatureTab('overview')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              aria-label="Close feature window"
            >
              <X className="w-4 h-4" />
              <span>ปิด</span>
            </button>
          </div>
          <CropYieldPlanner lang={lang} selectedProvince={selectedProvince} />
        </div>
      )}

      {activeFeatureTab === 'carbon' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md animate-fade-in">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-teal-600" />
              <span>เครื่องคำนวณคาร์บอนเครดิต T-VER & พลังงานโซลาร์ปั๊ม</span>
            </h2>
            <button
              onClick={() => setActiveFeatureTab('overview')}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              aria-label="Close feature window"
            >
              <X className="w-4 h-4" />
              <span>ปิด</span>
            </button>
          </div>
          <EsgCarbonCalculator
            lang={lang}
            totalFarmRai={70}
            onTotalCalculated={(t: { totalTons: number; totalIncomeThb: number }) => setEsgTotals(t)}
          />
        </div>
      )}

      {/* Official Living Asset & Sales Certificate Modal */}
      {showPassportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
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
                <span className="text-slate-500 block mt-1">พิกัดแปลง: อ.บางคล้า จ.ฉะเชิงเทรา (70 ไร่)</span>
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
                <span className="text-[10px] text-slate-600 block">3 แปลงย่อย (70 ไร่)</span>
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
