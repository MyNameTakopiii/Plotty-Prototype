/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { FarmerHome } from './components/FarmerHome';
import { PriceForecaster } from './components/PriceForecaster';
import { FarmSimulator3D } from './components/FarmSimulator3D';
import { UnifiedAgriAdvisor } from './components/UnifiedAgriAdvisor';
import { CropYieldPlanner } from './components/CropYieldPlanner';
import { HappyPathPlayer } from './components/HappyPathPlayer';
import {
  Menu,
  Sprout,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [lang, setLang] = useState<'th' | 'en'>('th');
  const [selectedProvince, setSelectedProvince] = useState<string>('ระยอง');
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);
  const [isHappyPathActive, setIsHappyPathActive] = useState<boolean>(false);

  // Plot state to pass from FarmDashboard directly into 3D Simulator
  const [target3DPlot, setTarget3DPlot] = useState<{
    cropId: string;
    areaRai: number;
    name: string;
  } | null>(null);

  const handleSelectPlotFor3D = (plot: { cropId: string; areaRai: number; name: string }) => {
    setTarget3DPlot(plot);
    setCurrentTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* 1. Sleek Left Sidebar (Replacing Top Navbar) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        selectedProvince={selectedProvince}
        setSelectedProvince={setSelectedProvince}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Navigation Bar (< md screens) */}
        <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-amber-200/60 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsOpenMobile(true)}
              className="p-2 -ml-1 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-amber-50 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-emerald-600 flex items-center justify-center text-white shadow-xs">
                <Sprout className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-slate-900 text-base">Plotty</span>
              <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.2 rounded">มะม่วง</span>
            </div>
          </div>

          <button
            onClick={() => setIsHappyPathActive(true)}
            className="px-3 py-1.5 text-slate-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer border border-amber-400/50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-900" />
            <span>{lang === 'th' ? 'สาธิต Happy Path' : 'Live Demo'}</span>
          </button>
        </header>

        {/* Top Desktop Live Market Ticker & Happy Path Demo Launcher Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-200 py-2.5 px-4 sm:px-6 lg:px-8 border-b border-amber-400/20 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-bold text-amber-400">
                {lang === 'th' ? 'ตลาดมะม่วงส่งออก & ล้งรับซื้อ:' : 'Mango Market Ticker:'}
              </span>
              <span className="text-slate-200 truncate font-sans">
                {lang === 'th'
                  ? 'น้ำดอกไม้สีทองเกรดพรีเมียม ฿45/กก. (+4.5%) · มหาชนกส่งออก ฿55/กก. (+6.2%) · เขียวสามรส ฿25/กก. · True 5G IoT: ออนไลน์ 100%'
                  : 'Nam Dok Mai Export ฿45/kg (+4.5%) · Mahachanok ฿55/kg (+6.2%) · Green Three-Flavor ฿25/kg · True 5G IoT: Online 100%'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsHappyPathActive(true)}
                className="text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-105 px-3 py-1 rounded-lg text-xs font-sans font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-amber-300/80"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                <span>{lang === 'th' ? 'สาธิตระบบ 35 วินาที' : '35s System Demo'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Routed Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'home' && (
            <FarmerHome
              lang={lang}
              setCurrentTab={setCurrentTab}
              selectedProvince={selectedProvince}
              setSelectedProvince={setSelectedProvince}
              onSelectPlotFor3D={handleSelectPlotFor3D}
            />
          )}

          {currentTab === 'simulator' && (
            <FarmSimulator3D lang={lang} initialPlot={target3DPlot} />
          )}

          {currentTab === 'forecast' && <PriceForecaster lang={lang} />}

          {currentTab === 'advisor' && <UnifiedAgriAdvisor lang={lang} />}

          {currentTab === 'planner' && (
            <CropYieldPlanner lang={lang} selectedProvince={selectedProvince} />
          )}
        </main>

        {/* Clean Farmer-First Footer */}
        <footer className="bg-white border-t border-slate-200 py-5 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-800">
                {lang === 'th' ? 'Plotty (พลอตตี้)' : 'Plotty Smart Plot Platform'}
              </span>
              <span>·</span>
              <span>{lang === 'th' ? 'แพลตฟอร์มเกษตรแม่นยำสำหรับชาวไร่ยุคใหม่' : 'Next-Gen Farming for Modern Growers'}</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
              <span>{lang === 'th' ? 'กรมวิชาการเกษตร' : 'DOA'}</span>
              <span>·</span>
              <span>{lang === 'th' ? 'กรมการค้าภายใน' : 'DIT'}</span>
              <span>·</span>
              <span>{lang === 'th' ? 'สำนักงานการปฏิรูปที่ดินเพื่อเกษตรกรรม (ส.ป.ก.)' : 'ALRO'}</span>
              <span>·</span>
              <span>{lang === 'th' ? 'ธ.ก.ส.' : 'BAAC'}</span>
            </div>
          </div>
        </footer>
      </div>

      {/* 3. Interactive Hands-Free Happy Path Live Tour Player */}
      <HappyPathPlayer
        isActive={isHappyPathActive}
        onClose={() => setIsHappyPathActive(false)}
        lang={lang}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
    </div>
  );
}
