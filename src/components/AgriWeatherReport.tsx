import React, { useState } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Sun,
  CloudRain,
  Sliders,
  Search,
  ChevronRight,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface AgriWeatherReportProps {
  lang: 'th' | 'en';
  selectedProvince?: string;
  onSelectProvince?: (province: string) => void;
}

const LOCATIONS = [
  { id: 'ฉะเชิงเทรา', nameTh: 'ฉะเชิงเทรา (อ.บางคล้า - พื้นที่สวนหลัก)', nameEn: 'Chachoengsao (Bang Khla)', temp: 32, humidity: 78, rainChance: 35, wind: 12, riskLevel: 'moderate' },
  { id: 'นนทบุรี', nameTh: 'นนทบุรี (อ.บางกรวย - นำร่อง)', nameEn: 'Nonthaburi (Bang Kruai)', temp: 33, humidity: 72, rainChance: 25, wind: 10, riskLevel: 'low' },
  { id: 'พิษณุโลก', nameTh: 'พิษณุโลก (อ.เนินมะปราง)', nameEn: 'Phitsanulok (Noen Maprang)', temp: 34, humidity: 65, rainChance: 15, wind: 14, riskLevel: 'low' },
  { id: 'อุดรธานี', nameTh: 'อุดรธานี (อ.กุมภวาปี)', nameEn: 'Udon Thani (Kumphawapi)', temp: 35, humidity: 60, rainChance: 10, wind: 16, riskLevel: 'low' },
  { id: 'จันทบุรี', nameTh: 'จันทบุรี (อ.เมือง - ผลไม้ภาคตะวันออก)', nameEn: 'Chanthaburi (Muang)', temp: 30, humidity: 85, rainChance: 60, wind: 18, riskLevel: 'high' },
  { id: 'เชียงใหม่', nameTh: 'เชียงใหม่ (อ.พร้าว)', nameEn: 'Chiang Mai (Phrao)', temp: 28, humidity: 70, rainChance: 20, wind: 8, riskLevel: 'low' },
];

const HOURLY_TIMELINE = [
  { time: '06:00 น.', temp: 25, humidity: 88, wind: 6, rainProb: 15, status: 'optimal', adviceTh: 'ช่วงเวลาทอง: เหมาะพ่นฮอร์โมนดึงดอก & สารชีวภัณฑ์' },
  { time: '09:00 น.', temp: 29, humidity: 76, wind: 10, rainProb: 20, status: 'good', adviceTh: 'เหมาะพ่นสารบำรุงทรงพุ่มก่อนอุณหภูมิสูง' },
  { time: '12:00 น.', temp: 34, humidity: 62, wind: 16, rainProb: 35, status: 'avoid', adviceTh: 'หลีกเลี่ยงการพ่นยา: แดดจัด UV สูง อาจทำให้เกสรไหม้' },
  { time: '15:00 น.', temp: 33, humidity: 68, wind: 18, rainProb: 45, status: 'avoid', adviceTh: 'เฝ้าระวังกลุ่มเมฆฝนคะนอง ลมกระโชกแรง' },
  { time: '18:00 น.', temp: 29, humidity: 80, wind: 8, rainProb: 25, status: 'optimal', adviceTh: 'เหมาะเปิดระบบน้ำหยด/มินิสปริงเกลอร์รดโคนต้น' },
  { time: '21:00 น.', temp: 27, humidity: 85, wind: 5, rainProb: 10, status: 'good', adviceTh: 'ความชื้นสะสมสูง ควรตรวจเช็กระบบระบายน้ำร่องสวน' },
];

const SEVEN_DAY_FORECAST = [
  { day: 'วันนี้', date: '29 ต.ค.', tempMax: 33, tempMin: 25, rainProb: 35, condition: 'มีเมฆบางส่วน', risk: 'เฝ้าระวังราแป้ง' },
  { day: 'พฤหัสบดี', date: '30 ต.ค.', tempMax: 34, tempMin: 26, rainProb: 20, condition: 'แจ่มใส', risk: 'ปกติ' },
  { day: 'ศุกร์', date: '31 ต.ค.', tempMax: 32, tempMin: 24, rainProb: 65, condition: 'ฝนฟ้าคะนอง 60%', risk: 'ระวังแอนแทรคโนส' },
  { day: 'เสาร์', date: '1 พ.ย.', tempMax: 31, tempMin: 24, rainProb: 40, condition: 'ฝนกระจายตัว', risk: 'ระวังแอนแทรคโนส' },
  { day: 'อาทิตย์', date: '2 พ.ย.', tempMax: 33, tempMin: 25, rainProb: 15, condition: 'แดดจัด', risk: 'ปกติ' },
  { day: 'จันทร์', date: '3 พ.ย.', tempMax: 34, tempMin: 25, rainProb: 10, condition: 'ท้องฟ้าโปร่ง', risk: 'ปกติ' },
  { day: 'อังคาร', date: '4 พ.ย.', tempMax: 33, tempMin: 25, rainProb: 25, condition: 'มีเมฆมาก', risk: 'ปกติ' },
];

export const AgriWeatherReport: React.FC<AgriWeatherReportProps> = ({
  lang,
  selectedProvince = 'ฉะเชิงเทรา',
  onSelectProvince,
}) => {
  const [activeLocation, setActiveLocation] = useState<string>(selectedProvince);
  const [customSearchText, setCustomSearchText] = useState<string>('');
  const [farmRaiArea, setFarmRaiArea] = useState<number>(70);
  const [activeTab, setActiveTab] = useState<'today' | 'timeline' | '7days' | 'irrigation'>('today');

  const curLoc = LOCATIONS.find((l) => l.id === activeLocation) || LOCATIONS[0];

  const handleSelectLocation = (locId: string) => {
    setActiveLocation(locId);
    if (onSelectProvince) onSelectProvince(locId);
  };

  // Water need calculation: ~50 Liters per tree per day (25 trees/Rai = 1,250 Liters/Rai)
  const totalWaterRequirementLiters = farmRaiArea * 25 * 50;

  return (
    <div className="space-y-4 text-xs sm:text-sm animate-in fade-in duration-200">
      {/* Location Bar & Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 shrink-0">
              <CloudSun className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                {lang === 'th' ? 'รายงานสภาพอากาศสวนเกษตร & สภาพแวดล้อมจุลภาค' : 'Agri-Weather & Microclimate Intelligence'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'th' ? 'ข้อมูลสถานีอุตุนิยมวิทยาเพื่อการพ่นฮอร์โมน ตัดแต่งกิ่ง และให้น้ำสวนมะม่วง' : 'Microclimate station tracking for hormone spraying and irrigation timing'}
              </p>
            </div>
          </div>

          {/* Quick Location Select Box */}
          <div className="flex items-center gap-2 shrink-0">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={activeLocation}
              onChange={(e) => handleSelectLocation(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.nameTh}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom District Search Text Input */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={customSearchText}
              onChange={(e) => setCustomSearchText(e.target.value)}
              placeholder={lang === 'th' ? 'พิมพ์ค้นหาตำบล / อำเภอ / พิกัดแปลงสวนของท่าน...' : 'Search sub-district / district / GPS coordinates...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          {customSearchText && (
            <button
              onClick={() => {
                alert(`กำลังดึงข้อมูลสภาพอากาศดาวเทียมความละเอียดสูงสำหรับพื้นที่: ${customSearchText}`);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
            >
              ค้นหาพิกัด
            </button>
          )}
        </div>
      </div>

      {/* Sub-Tab Switcher */}
      <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 gap-1 text-xs">
        <button
          onClick={() => setActiveTab('today')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
            activeTab === 'today' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {lang === 'th' ? 'สภาพอากาศวันนี้' : 'Today Weather'}
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
            activeTab === 'timeline' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {lang === 'th' ? 'ช่วงเวลาฉีดพ่นประจำวัน' : 'Spraying Window'}
        </button>

        <button
          onClick={() => setActiveTab('7days')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
            activeTab === '7days' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {lang === 'th' ? 'พยากรณ์ 7 วัน' : '7-Day Forecast'}
        </button>

        <button
          onClick={() => setActiveTab('irrigation')}
          className={`flex-1 py-2 px-3 rounded-xl font-bold transition-all cursor-pointer text-center ${
            activeTab === 'irrigation' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {lang === 'th' ? 'คำนวณปริมาณน้ำ' : 'Irrigation Calc'}
        </button>
      </div>

      {/* TAB 1: TODAY DETAILED WEATHER & SENSORS */}
      {activeTab === 'today' && (
        <div className="space-y-3">
          {/* Main Weather Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Temperature */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-3.5 rounded-2xl border border-amber-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold">อุณหภูมิอากาศ</span>
                <Thermometer className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-2xl font-black text-slate-900 font-mono block">
                {curLoc.temp}°C
              </span>
              <span className="text-[10px] text-amber-800 font-semibold block">
                สูงสุด 34°C / ต่ำสุด 25°C
              </span>
            </div>

            {/* Humidity */}
            <div className="bg-gradient-to-br from-blue-50 to-sky-50/60 p-3.5 rounded-2xl border border-blue-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold">ความชื้นสัมพัทธ์</span>
                <Droplets className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-2xl font-black text-blue-950 font-mono block">
                {curLoc.humidity}%
              </span>
              <span className="text-[10px] text-blue-800 font-semibold block">
                {curLoc.humidity >= 75 ? 'ความชื้นสูง (เสี่ยงราแป้ง)' : 'ความชื้นเหมาะสม'}
              </span>
            </div>

            {/* Rain Chance */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold">โอกาสฝนตก</span>
                <CloudRain className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-2xl font-black text-emerald-950 font-mono block">
                {curLoc.rainChance}%
              </span>
              <span className="text-[10px] text-emerald-800 font-semibold block">
                ปริมาณฝนสะสม 12 mm
              </span>
            </div>

            {/* Wind Speed */}
            <div className="bg-gradient-to-br from-slate-50 to-teal-50/40 p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[11px] font-bold">ความเร็วลม</span>
                <Wind className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-2xl font-black text-slate-900 font-mono block">
                {curLoc.wind} <span className="text-xs font-normal">กม./ชม.</span>
              </span>
              <span className="text-[10px] text-slate-600 font-semibold block">
                ทิศตะวันออกเฉียงใต้
              </span>
            </div>
          </div>

          {/* Disease Risk Warning Banner */}
          <div className="p-3.5 bg-amber-50/90 border border-amber-300 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
            <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-extrabold text-amber-900 flex items-center gap-1.5">
                <span>คำเตือนดัชนีสภาพอากาศสำหรับสวนมะม่วง (บางคล้า ฉะเชิงเทรา):</span>
                <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold">
                  เฝ้าระวังโรคราแป้ง
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-900/90">
                ความชื้นสัมพัทธ์ช่วงเช้าสูงถึง 88% ร่วมกับอุณหภูมิ 25-29°C เป็นสภาวะที่เชื้อราแป้ง (Powdery Mildew) และเชื้อแอนแทรคโนสเจริญเติบโตได้ดี ควรตรวจดูช่อดอกและแทงช่อมะม่วง หากพบจุดสีขาวเทาให้ฉีดพ่นชีวภัณฑ์ไตรโคเดอร์มาหรือสารป้องกันกำจัดเชื้อราทันที
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOURLY SPRAYING & CROP ACTION TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="space-y-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>ตารางวิเคราะห์ช่วงเวลาฉีดพ่นสาร & รดน้ำรายชั่วโมง (Spraying Advisory):</span>
            </h4>

            <div className="space-y-2 pt-1">
              {HOURLY_TIMELINE.map((h, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs ${
                    h.status === 'optimal'
                      ? 'bg-emerald-50/80 border-emerald-300 text-slate-900'
                      : h.status === 'avoid'
                      ? 'bg-rose-50/80 border-rose-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-extrabold font-mono text-sm w-16 text-slate-900">{h.time}</span>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
                      <span>🌡️ {h.temp}°C</span>
                      <span>💧 {h.humidity}%</span>
                      <span>🌬️ {h.wind} km/h</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold shrink-0 ${
                        h.status === 'optimal'
                          ? 'bg-emerald-600 text-white'
                          : h.status === 'avoid'
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {h.status === 'optimal' ? 'แนะนำให้พ่นยา' : h.status === 'avoid' ? 'งดพ่นสาร' : 'เฝ้าระวัง'}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{h.adviceTh}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 7-DAY AGRI FORECAST */}
      {activeTab === '7days' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {SEVEN_DAY_FORECAST.map((d, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <div>
                    <span className="font-extrabold text-slate-900 text-xs block">{d.day}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{d.date}</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      d.rainProb > 50 ? 'bg-blue-100 text-blue-900' : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    ฝน {d.rainProb}%
                  </span>
                </div>

                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-600">{d.condition}</span>
                  <span className="font-extrabold text-slate-900">
                    {d.tempMin}°C - {d.tempMax}°C
                  </span>
                </div>

                <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-sans">ดัชนีเสี่ยง:</span>
                  <span
                    className={`font-bold ${
                      d.risk.includes('ระวัง') ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {d.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: IRRIGATION DOSAGE CALCULATOR SLIDER INPUT */}
      {activeTab === 'irrigation' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-sky-600" />
              <span>เครื่องคำนวณปริมาณน้ำสปริงเกลอร์รดโคนต้นประจำวัน</span>
            </h4>
            <span className="text-[10px] bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full font-bold">
              50 ลิตร/ต้น/วัน
            </span>
          </div>

          {/* Rai Input Slider */}
          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex justify-between items-center text-xs font-bold text-slate-800">
              <span>ปรับขนาดพื้นที่แปลงสวนมะม่วง (ไร่):</span>
              <span className="text-sm font-mono text-emerald-700">{farmRaiArea} ไร่</span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              step={5}
              value={farmRaiArea}
              onChange={(e) => setFarmRaiArea(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>5 ไร่ (125 ต้น)</span>
              <span>70 ไร่ (1,750 ต้น)</span>
              <span>200 ไร่ (5,000 ต้น)</span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-[10px] text-slate-500 font-sans block">จำนวนต้นไม้ในแปลง</span>
              <span className="text-base font-black text-emerald-900 font-mono">
                {(farmRaiArea * 25).toLocaleString()} ต้น
              </span>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
              <span className="text-[10px] text-slate-500 font-sans block">ปริมาณน้ำรวม/วัน</span>
              <span className="text-base font-black text-sky-900 font-mono">
                {totalWaterRequirementLiters.toLocaleString()} ลิตร
              </span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-500 font-sans block">เวลาเปิดปั๊มน้ำ (สปริงเกลอร์ 20 L/min)</span>
              <span className="text-base font-black text-amber-900 font-mono">
                {Math.round(totalWaterRequirementLiters / (20 * 60))} นาที / วัน
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
