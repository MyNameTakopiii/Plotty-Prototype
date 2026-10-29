import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { FarmerHome, PlotSelectionData } from './components/FarmerHome';
import { FarmSimulator3D } from './components/FarmSimulator3D';
import { Menu, X, Box, Bot, Globe } from 'lucide-react';
import { MangoIcon } from './components/MangoIcon';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [lang, setLang] = useState<'th' | 'en'>('th');
  const [selectedProvince, setSelectedProvince] = useState<string>('ฉะเชิงเทรา');
  const [selectedPlotFor3D, setSelectedPlotFor3D] = useState<PlotSelectionData | null>(null);

  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  const handleSelectPlotFor3D = (plot: PlotSelectionData) => {
    setSelectedPlotFor3D(plot);
    setCurrentTab('simulator');
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col text-slate-900 font-sans antialiased overflow-hidden">
      {/* Navigation Sidebar Drawer */}
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

      {/* Main Content Area */}
      <main
        className={`flex-1 min-w-0 h-full transition-all overflow-hidden flex flex-col ${
          currentTab === 'simulator'
            ? 'p-2 sm:p-4 max-w-full overflow-x-hidden'
            : 'w-full'
        }`}
      >
        {currentTab === 'home' && (
          <FarmerHome
            lang={lang}
            setCurrentTab={setCurrentTab}
            selectedProvince={selectedProvince}
            setSelectedProvince={setSelectedProvince}
            onSelectPlotFor3D={handleSelectPlotFor3D}
            onOpenSidebar={() => setIsOpenMobile(true)}
          />
        )}

        {currentTab === 'simulator' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsOpenMobile(true)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <span className="font-black text-slate-900 text-sm">3D Digital Twin & สวนมะม่วง</span>
              </div>
              <button
                onClick={() => setCurrentTab('home')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                กลับหน้าแชท AI
              </button>
            </div>
            <FarmSimulator3D
              lang={lang}
              initialPlot={selectedPlotFor3D}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
