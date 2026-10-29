import React from 'react';
import { CloudSun, Droplets, Wind, Thermometer, MapPin } from 'lucide-react';

interface ProvinceWeatherWidgetProps {
  lang: 'th' | 'en';
  selectedProvince: string;
  onSelectProvince?: (province: string) => void;
}

export const ProvinceWeatherWidget: React.FC<ProvinceWeatherWidgetProps> = ({
  lang,
  selectedProvince,
  onSelectProvince,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-extrabold text-slate-800">
            {lang === 'th' ? 'สภาพอากาศสวนเกษตรประจำวัน' : 'Daily Agri-Weather Forecast'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          <select
            value={selectedProvince}
            onChange={(e) => onSelectProvince && onSelectProvince(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
          >
            <option value="ฉะเชิงเทรา">ฉะเชิงเทรา (อ.บางคล้า)</option>
            <option value="พิษณุโลก">พิษณุโลก (อ.เนินมะปราง)</option>
            <option value="อุดรธานี">อุดรธานี (อ.กุมภวาปี)</option>
            <option value="เชียงใหม่">เชียงใหม่ (อ.พร้าว)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-sans block">อุณหภูมิ</span>
            <span className="font-extrabold text-slate-900 text-sm">32°C</span>
          </div>
          <Thermometer className="w-4 h-4 text-amber-600" />
        </div>

        <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-sans block">ความชื้นสัมพัทธ์</span>
            <span className="font-extrabold text-blue-900 text-sm">68%</span>
          </div>
          <Droplets className="w-4 h-4 text-blue-600" />
        </div>

        <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-sans block">ความเร็วลม</span>
            <span className="font-extrabold text-emerald-900 text-sm">12 กม./ชม.</span>
          </div>
          <Wind className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-200/80 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-500 font-sans block">ดัชนีความเสี่ยงโรค</span>
            <span className="font-extrabold text-teal-800 text-sm">ต่ำ (ปกติ)</span>
          </div>
          <CloudSun className="w-4 h-4 text-teal-600" />
        </div>
      </div>
    </div>
  );
};
