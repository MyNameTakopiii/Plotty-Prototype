/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sprout, Globe, MapPin } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: 'th' | 'en';
  setLang: (lang: 'th' | 'en') => void;
  selectedProvince: string;
  setSelectedProvince: (province: string) => void;
}

const PROVINCES = [
  'นนทบุรี (Nonthaburi - อ.บางกรวย)',
  'จันทบุรี (Chanthaburi)',
  'ระยอง (Rayong)',
  'เชียงใหม่ (Chiang Mai)',
  'นครราชสีมา (Nakhon Ratchasima)',
  'สุราษฎร์ธานี (Surat Thani)',
  'ขอนแก่น (Khon Kaen)',
  'สุพรรณบุรี (Suphan Buri)',
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  selectedProvince,
  setSelectedProvince,
}) => {
  const navItems = [
    { id: 'home', labelTh: 'หน้าหลัก', labelEn: 'Home' },
    { id: 'health', labelTh: 'ตรวจโรคพืช', labelEn: 'Plant Doctor' },
    { id: 'forecast', labelTh: 'เช็คราคา & แนวโน้ม', labelEn: 'Price Forecast' },
    { id: 'simulator', labelTh: 'จำลองสวน 3D', labelEn: '3D Farm' },
    { id: 'planner', labelTh: 'วางแผนเพาะปลูก', labelEn: 'Plan Crop' },
    { id: 'scenarios', labelTh: 'เปรียบเทียบกำไร', labelEn: 'Compare Scenarios' },
    { id: 'legal', labelTh: 'ที่ดิน ส.ป.ก. & เงินช่วยเหลือ', labelEn: 'Land & Legal' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-sm">
              <Sprout className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 block">
                  Plotty
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full hidden sm:inline-block">
                  SMART PLOT
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium hidden sm:block">
                {lang === 'th' ? 'ระบบจัดการแปลงและเกษตรแม่นยำอัจฉริยะ' : 'Precision AgriTech & Smart Plot OS'}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-2 text-xs xl:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {lang === 'th' ? item.labelTh : item.labelEn}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Province Selector & Language Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Province Picker */}
            <div className="relative flex items-center text-xs bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 mr-1.5 shrink-0" />
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer pr-1 text-slate-800"
              >
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov.split(' ')[0]}>
                    {lang === 'th' ? prov.split(' ')[0] : prov.split('(')[1]?.replace(')', '') || prov}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              title="สลับภาษา / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'th' ? 'EN' : 'ไทย'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex overflow-x-auto py-2 gap-1 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lang === 'th' ? item.labelTh : item.labelEn}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
