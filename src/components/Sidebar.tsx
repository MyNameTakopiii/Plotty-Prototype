/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  Box,
  TrendingUp,
  Stethoscope,
  Calculator,
  Sprout,
  MapPin,
  Globe,
  CheckCircle2,
  AlertTriangle,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  lang: 'th' | 'en';
  setLang: (lang: 'th' | 'en') => void;
  selectedProvince: string;
  setSelectedProvince: (province: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

const PROVINCES = [
  { id: 'นนทบุรี', th: 'อ.บางกรวย จ.นนทบุรี (พื้นที่นำร่อง)', en: 'Bang Kruai, Nonthaburi (Pilot)' },
  { id: 'ระยอง', th: 'ระยอง (ภาคตะวันออก)', en: 'Rayong (Eastern)' },
  { id: 'จันทบุรี', th: 'จันทบุรี (ภาคตะวันออก)', en: 'Chanthaburi (Eastern)' },
  { id: 'นครราชสีมา', th: 'นครราชสีมา (อีสาน)', en: 'Nakhon Ratchasima (NE)' },
  { id: 'ขอนแก่น', th: 'ขอนแก่น (อีสาน)', en: 'Khon Kaen (NE)' },
  { id: 'สุพรรณบุรี', th: 'สุพรรณบุรี (ภาคกลาง)', en: 'Suphan Buri (Central)' },
  { id: 'สุราษฎร์ธานี', th: 'สุราษฎร์ธานี (ภาคใต้)', en: 'Surat Thani (Southern)' },
  { id: 'เชียงใหม่', th: 'เชียงใหม่ (ภาคเหนือ)', en: 'Chiang Mai (Northern)' },
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  selectedProvince,
  setSelectedProvince,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const menuItems = [
    {
      id: 'home',
      icon: LayoutDashboard,
      labelTh: 'แดชบอร์ดสวน & สินเชื่อ',
      labelEn: 'Mango Farm & Credit',
      badgeTh: 'เกรด A+',
      badgeEn: 'Grade A+',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'simulator',
      icon: Box,
      labelTh: 'จำลองสวน 3D & สินทรัพย์',
      labelEn: '3D Digital Twin & Asset',
      badgeTh: 'ตรวจรับรองแปลง',
      badgeEn: 'Asset Audit',
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'forecast',
      icon: TrendingUp,
      labelTh: 'พยากรณ์ราคามะม่วง',
      labelEn: 'Mango Price Forecast',
      badgeTh: 'ล่วงหน้า 12 เดือน',
      badgeEn: '12M Export',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'advisor',
      icon: Stethoscope,
      labelTh: 'หมอพืชมะม่วง & สิทธิ์ที่ดิน',
      labelEn: 'Mango Doctor & Rights',
      badgeTh: 'ลดความเสี่ยง',
      badgeEn: 'Risk Clearance',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'planner',
      icon: Calculator,
      labelTh: 'วางแผนผลผลิต & สินเชื่อ',
      labelEn: 'Yield & BAAC Loan Plan',
      badgeTh: 'คำนวณรายได้',
      badgeEn: 'Income Calc',
      badgeColor: 'bg-slate-100 text-slate-700',
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-white border-r border-slate-200 z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-amber-100/60 bg-gradient-to-r from-amber-50/40 via-white to-emerald-50/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-amber-500/25 ring-2 ring-amber-200">
              <Sprout className="w-6 h-6 text-white drop-shadow-xs" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                  Plotty
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-black px-1.5 py-0.5 rounded-full border border-amber-200">
                  MANGO GOLD
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {lang === 'th' ? 'ระบบฝาแฝดดิจิทัลสวนมะม่วง & สินเชื่อ' : 'Mango Digital Twin & Credit OS'}
              </p>
            </div>
          </div>

          {/* Close Button on Mobile */}
          <button
            onClick={() => setIsOpenMobile(false)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Farm Status Bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 animate-pulse" />
            <span className="font-semibold text-slate-800">
              {lang === 'th' ? 'สวนมะม่วง 70 ไร่ (1,750 ต้น)' : 'Mango 70 Rai (1,750 Trees)'}
            </span>
          </div>
          <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            {lang === 'th' ? 'เครดิต A+' : 'Credit A+'}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {lang === 'th' ? 'เมนูหลักเกษตรกร' : 'Main Menu'}
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-sm shadow-emerald-700/25 font-semibold ring-1 ring-amber-300/40'
                    : 'text-slate-700 hover:bg-amber-50/70 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                        : 'bg-amber-50 text-emerald-800 border border-amber-100 group-hover:bg-amber-100 group-hover:text-emerald-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{lang === 'th' ? item.labelTh : item.labelEn}</span>
                </div>

                {item.badgeTh && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 shrink-0 ${
                      isActive ? 'bg-amber-300 text-amber-950' : item.badgeColor
                    }`}
                  >
                    {lang === 'th' ? item.badgeTh : item.badgeEn}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Preferences & Province Settings */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          {/* Province Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {lang === 'th' ? 'พื้นที่ฟาร์มของคุณ' : 'Farm Location'}
              </span>
            </label>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              {PROVINCES.map((p) => (
                <option key={p.id} value={p.id}>
                  {lang === 'th' ? p.th : p.en}
                </option>
              ))}
            </select>
          </div>

          {/* Language Toggle & System Mode */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
              className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-medium shadow-2xs hover:bg-slate-100"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'th' ? 'ภาษา: ไทย' : 'Lang: EN'}</span>
            </button>

            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {lang === 'th' ? 'โหมดด่วนพร้อมใช้' : 'Fast Mode'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
