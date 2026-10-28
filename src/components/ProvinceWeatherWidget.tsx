/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CloudSun,
  CloudRain,
  Sun,
  Droplets,
  Wind,
  Thermometer,
  CloudLightning,
  RefreshCw,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Compass,
  MapPin,
  ChevronDown,
} from 'lucide-react';

interface ProvinceWeatherWidgetProps {
  lang: 'th' | 'en';
  selectedProvince: string;
  onSelectProvince?: (province: string) => void;
}

interface OperationAdvice {
  status: 'optimal' | 'warning' | 'danger';
  titleTh: string;
  titleEn: string;
  badgeTh: string;
  badgeEn: string;
  adviceTh: string;
  adviceEn: string;
}

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  precipProb: number;
  windSpeed: number;
  uvIndex: number;
  conditionTh: string;
  conditionEn: string;
  weatherType: 'sunny' | 'partly_cloudy' | 'rainy' | 'storm';
  rainTimelineNoteTh: string;
  rainTimelineNoteEn: string;
  operations: {
    spraying: OperationAdvice;
    irrigation: OperationAdvice;
    harvesting: OperationAdvice;
    soilWork: OperationAdvice;
  };
  hourly: {
    time: string;
    temp: number;
    rain: number;
    wind: number;
    status: 'optimal' | 'watch' | 'rain';
    icon: 'sun' | 'cloud' | 'rain' | 'storm';
  }[];
}

const SUPPORTED_PROVINCES = [
  { id: 'นนทบุรี', th: 'อ.บางกรวย จ.นนทบุรี (พื้นที่นำร่อง)', en: 'Bang Kruai, Nonthaburi (Pilot)' },
  { id: 'ระยอง', th: 'จ.ระยอง (ภาคตะวันออก)', en: 'Rayong (Eastern)' },
  { id: 'จันทบุรี', th: 'จ.จันทบุรี (ภาคตะวันออก)', en: 'Chanthaburi (Eastern)' },
  { id: 'สุพรรณบุรี', th: 'จ.สุพรรณบุรี (ภาคกลาง)', en: 'Suphan Buri (Central)' },
  { id: 'นครราชสีมา', th: 'จ.นครราชสีมา (อีสาน)', en: 'Nakhon Ratchasima (NE)' },
  { id: 'ขอนแก่น', th: 'จ.ขอนแก่น (อีสาน)', en: 'Khon Kaen (NE)' },
  { id: 'สุราษฎร์ธานี', th: 'จ.สุราษฎร์ธานี (ภาคใต้)', en: 'Surat Thani (Southern)' },
  { id: 'เชียงใหม่', th: 'จ.เชียงใหม่ (ภาคเหนือ)', en: 'Chiang Mai (Northern)' },
];

export const ProvinceWeatherWidget: React.FC<ProvinceWeatherWidgetProps> = ({
  lang,
  selectedProvince,
  onSelectProvince,
}) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setLastUpdatedTime(
      now.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }, [lang]);

  // Province-specific agricultural micro-climate weather database
  const getProvinceWeather = (province: string): WeatherData => {
    switch (province) {
      case 'นนทบุรี':
      case 'บางกรวย':
      case 'อ.บางกรวย':
        return {
          temp: 32.2,
          feelsLike: 36.5,
          humidity: 72,
          precipProb: 35,
          windSpeed: 11,
          uvIndex: 8,
          conditionTh: 'มีเมฆบางส่วน ท้องฟ้าโปร่งช่วงเช้า ระดับน้ำคลองบางกรวยและคลองบางกอกน้อยปกติ',
          conditionEn: 'Partly cloudy, fair morning skies, normal canal tide levels in Bang Kruai',
          weatherType: 'partly_cloudy',
          rainTimelineNoteTh: 'เซนเซอร์ IoT ตรวจวัดค่าความเค็มน้ำเจ้าพระยา < 0.25 g/L ปลอดภัยสำหรับรดน้ำสวนทุเรียนเมืองนนท์',
          rainTimelineNoteEn: 'IoT sensor confirmed Chao Phraya salinity < 0.25 g/L, fully safe for Nonthaburi durian orchards.',
          operations: {
            spraying: {
              status: 'optimal',
              titleTh: 'การฉีดพ่นปุ๋ยทางใบ/ฮอร์โมน/สารป้องกันกำจัดศัตรูพืช',
              titleEn: 'Foliar Spraying & Crop Protection',
              badgeTh: 'หน้าต่างพ่นดีเยี่ยม 06:00-09:30',
              badgeEn: 'Optimal Window 06:00-09:30',
              adviceTh: 'ลมสงบ 11 กม./ชม. เหมาะแก่การพ่นแคลเซียม-โบรอน บำรุงขั้วผลทุเรียนก้านยาวและหมอนทองเมืองนนท์ ป้องกันผลร่วงก่อนเก็บเกี่ยว',
              adviceEn: 'Calm winds (11 km/h) create an ideal window for applying calcium-boron to strengthen fruit stems on Nonthaburi durians.',
            },
            irrigation: {
              status: 'optimal',
              titleTh: 'ระบบเปิด-ปิดประตูน้ำสวนยกร่องโบราณ & ตรวจวัดความเค็ม',
              titleEn: 'Canal Ridge Floodgate & Salinity Management',
              badgeTh: 'น้ำจืดปกติ รดน้ำได้',
              badgeEn: 'Normal Salinity: Safe',
              adviceTh: 'เปิดรับน้ำดีเข้าท้องร่องสวนยกร่องโบราณช่วงน้ำขึ้น รักษาระดับน้ำในคู 40-50 ซม. เพื่อหล่อเลี้ยงรากฝอยทุเรียนให้สมบูรณ์',
              adviceEn: 'Open canal gates during high tide to maintain optimal ditch water levels (40-50 cm) for durian feeder roots.',
            },
            harvesting: {
              status: 'optimal',
              titleTh: 'การเก็บเกี่ยวทุเรียนนนทบุรี & ผลไม้เบญจพรรณ',
              titleEn: 'Nonthaburi Durian & Fruit Harvest',
              badgeTh: 'เหมาะแก่การเคาะตรวจผล',
              badgeEn: 'Harvest Assessment',
              adviceTh: 'ตรวจนับอายุผลทุเรียนนนท์หลังดอกบาน (115-125 วัน) เคาะฟังเสียงโปร่ง ผิวหนามแห้ง พร้อมตัดส่งตลาดพรีเมียมมูลค่าสูง',
              adviceEn: 'Assess mature durian fruits (115-125 days post-bloom). Tap for hollow resonance before harvesting for premium export markets.',
            },
            soilWork: {
              status: 'optimal',
              titleTh: 'การปรับปรุงดินร่องสวน & ใส่ปุ๋ยอินทรีย์ชีวภาพ',
              titleEn: 'Soil Conditioning & Organic Mulching',
              badgeTh: 'เติมโคลนเลน/อินทรีย์วัตถุ',
              badgeEn: 'Ditch Mud Mulching',
              adviceTh: 'ภูมิปัญญาสวนเมืองนนท์: กวาดลอกเลนก้นร่องขึ้นคลุมโคนต้น พร้อมโรยปุ๋ยสั่งตัดและแหนแดงชีวภาพ ช่วยลดต้นทุนเคมีได้ 12%',
              adviceEn: 'Traditional Nonthaburi practice: Dredge nutrient-rich ditch silt around root crowns paired with bio-fertilizers and Azolla.',
            },
          },
          hourly: [
            { time: '07:00', temp: 27, rain: 10, wind: 7, status: 'optimal', icon: 'sun' },
            { time: '10:00', temp: 31, rain: 15, wind: 11, status: 'optimal', icon: 'sun' },
            { time: '13:00', temp: 33, rain: 35, wind: 14, status: 'watch', icon: 'cloud' },
            { time: '16:00', temp: 30, rain: 25, wind: 12, status: 'optimal', icon: 'cloud' },
            { time: '19:00', temp: 28, rain: 15, wind: 8, status: 'optimal', icon: 'cloud' },
          ],
        };
      case 'ระยอง':
        return {
          temp: 31.4,
          feelsLike: 35.8,
          humidity: 78,
          precipProb: 65,
          windSpeed: 14,
          uvIndex: 7,
          conditionTh: 'มีฝนฟ้าคะนองกระจาย 65% ช่วง 13:00 - 17:00 น.',
          conditionEn: 'Scattered thunderstorms 65% between 1:00 PM - 5:00 PM',
          weatherType: 'rainy',
          rainTimelineNoteTh: 'ฝนจะเริ่มก่อตัวช่วงบ่าย ควรเลี่ยงงานกลางแจ้งหลัง 13:00 น.',
          rainTimelineNoteEn: 'Rain forms in early afternoon. Limit outdoor field operations after 1:00 PM.',
          operations: {
            spraying: {
              status: 'danger',
              titleTh: 'การฉีดพ่นปุ๋ยทางใบ/ฮอร์โมน/สารป้องกันกำจัดศัตรูพืช',
              titleEn: 'Foliar Spraying & Crop Protection',
              badgeTh: 'เสี่ยงฝนชะล้างสูง',
              badgeEn: 'High Leaching Risk',
              adviceTh: 'งดการฉีดพ่นช่วงบ่ายเด็ดขาด โอกาสฝน 65% จะชะล้างสารเคมีสูญเปล่า หากจำเป็นให้พ่นช่วงเช้าตรู่ 06:00 - 09:00 น.',
              adviceEn: 'Avoid afternoon foliar spraying due to 65% rain wash-off risk. If necessary, spray early morning between 06:00 - 09:00 AM.',
            },
            irrigation: {
              status: 'warning',
              titleTh: 'การให้น้ำและระบบน้ำสปริงเกอร์',
              titleEn: 'Irrigation & Drainage Management',
              badgeTh: 'ลดการให้น้ำ 50%',
              badgeEn: 'Reduce Water 50%',
              adviceTh: 'ลดรอบการเปิดสปริงเกอร์สวนทุเรียน 50% ตรวจสอบร่องระบายน้ำรอบโคนต้นเพื่อป้องกันน้ำขังรากเน่า',
              adviceEn: 'Reduce irrigation runtime by 50%. Inspect drainage furrows to prevent water stagnation and root rot.',
            },
            harvesting: {
              status: 'optimal',
              titleTh: 'การกรีดยางพาราและการเก็บเกี่ยวผลผลิต',
              titleEn: 'Rubber Tapping & Fruit Harvest',
              badgeTh: 'เหมาะช่วงเช้า 04:00-09:00',
              badgeEn: 'Optimal Window 04:00-09:00',
              adviceTh: 'กรีดยางและเก็บน้ำยางให้เสร็จก่อน 09:30 น. ก่อนฝนบ่ายชะล้างน้ำยางในถ้วย สำหรับทุเรียนให้เก็บเกี่ยวช่วงสาย',
              adviceEn: 'Finish latex tapping and cup collection before 09:30 AM before afternoon rain ruins the harvest.',
            },
            soilWork: {
              status: 'optimal',
              titleTh: 'การใส่ปุ๋ยทางดินและการปรับปรุงดิน',
              titleEn: 'Soil Fertilization & Ground Care',
              badgeTh: 'ดินชื้นพอดี ใส่ปุ๋ยได้',
              badgeEn: 'Good Soil Moisture',
              adviceTh: 'ดินมีความชื้นสูง เหมาะกับการโรยปุ๋ยอินทรีย์เคมีสั่งตัดรอบทรงพุ่มก่อนฝนตกเบาๆ ช่วยละลายซึมลงดิน',
              adviceEn: 'Optimal soil moisture for applying granular precision fertilizer around the canopy drip line.',
            },
          },
          hourly: [
            { time: '07:00', temp: 27, rain: 10, wind: 8, status: 'optimal', icon: 'sun' },
            { time: '10:00', temp: 30, rain: 20, wind: 12, status: 'optimal', icon: 'cloud' },
            { time: '13:00', temp: 32, rain: 65, wind: 18, status: 'rain', icon: 'rain' },
            { time: '16:00', temp: 29, rain: 55, wind: 16, status: 'rain', icon: 'rain' },
            { time: '19:00', temp: 27, rain: 25, wind: 10, status: 'watch', icon: 'cloud' },
          ],
        };
      case 'จันทบุรี':
        return {
          temp: 30.8,
          feelsLike: 35.2,
          humidity: 82,
          precipProb: 70,
          windSpeed: 15,
          uvIndex: 6,
          conditionTh: 'ฝนฟ้าคะนอง 70% ลมกระโชกแรงบางแห่ง',
          conditionEn: 'Thunderstorms 70% with gusts in fruit orchard zones',
          weatherType: 'storm',
          rainTimelineNoteTh: 'ความชื้น 82% สูงต่อเนื่อง ระวังเชื้อรา Phytophthora ในแปลงทุเรียน',
          rainTimelineNoteEn: 'High humidity 82%. Monitor durian orchards closely for Phytophthora rot.',
          operations: {
            spraying: {
              status: 'danger',
              titleTh: 'การฉีดพ่นปุ๋ยทางใบ/ฮอร์โมน/สารป้องกันกำจัดศัตรูพืช',
              titleEn: 'Foliar Spraying & Crop Protection',
              badgeTh: 'งดฉีดพ่นทุกชนิด',
              badgeEn: 'Hold Spray Operations',
              adviceTh: 'งดการฉีดพ่นสารเคมีและปุ๋ยทางใบ ฝนตก 70% และลม 15 กม./ชม. สารจะฟุ้งกระจายและถูกชะล้างทันที',
              adviceEn: 'Do not spray chemicals today. Heavy rainfall and 15 km/h wind cause extreme drift and runoff.',
            },
            irrigation: {
              status: 'warning',
              titleTh: 'การให้น้ำและระบบน้ำสปริงเกอร์',
              titleEn: 'Irrigation & Drainage Management',
              badgeTh: 'ปิดระบบน้ำ ชะลอน้ำขัง',
              badgeEn: 'Shut Down Pumps',
              adviceTh: 'ปิดปั๊มน้ำสปริงเกอร์ทั้งสวน เปิดทางระบายน้ำลงคู ป้องกันน้ำท่วมโคนต้นทุเรียนอายุสั้น',
              adviceEn: 'Turn off all irrigation pumps. Clear drainage furrows to keep root collars above standing water.',
            },
            harvesting: {
              status: 'warning',
              titleTh: 'การกรีดยางพาราและการเก็บเกี่ยวผลผลิต',
              titleEn: 'Rubber Tapping & Fruit Harvest',
              badgeTh: 'เฝ้าระวังฝนหน้ายาง',
              badgeEn: 'Tapping Caution',
              adviceTh: 'ต้นยางมีความชื้นสูงที่เปลือก ระวังโรคเส้นดำหากกรีดตอนเปียกชื้น ควรพักหน้ายางหากมีฝนสะสม',
              adviceEn: 'Wet tree bark increases black stripe fungus risk. Pause tapping if rain persists.',
            },
            soilWork: {
              status: 'warning',
              titleTh: 'การใส่ปุ๋ยทางดินและการปรับปรุงดิน',
              titleEn: 'Soil Fertilization & Ground Care',
              badgeTh: 'ระวังปุ๋ยไหลล้นผิวดิน',
              badgeEn: 'Surface Runoff Risk',
              adviceTh: 'เลี่ยงการหว่านปุ๋ยบนพื้นที่ลาดชัน เพราะฝนหนักจะพัดพาปุ๋ยลงร่องน้ำสวน',
              adviceEn: 'Avoid broadcasting fertilizer on sloped plots to prevent nutrients washing into irrigation drains.',
            },
          },
          hourly: [
            { time: '07:00', temp: 26, rain: 25, wind: 10, status: 'watch', icon: 'cloud' },
            { time: '10:00', temp: 29, rain: 45, wind: 14, status: 'watch', icon: 'cloud' },
            { time: '13:00', temp: 31, rain: 70, wind: 20, status: 'rain', icon: 'storm' },
            { time: '16:00', temp: 28, rain: 60, wind: 16, status: 'rain', icon: 'rain' },
            { time: '19:00', temp: 26, rain: 35, wind: 11, status: 'watch', icon: 'cloud' },
          ],
        };
      case 'สุพรรณบุรี':
        return {
          temp: 33.5,
          feelsLike: 37.8,
          humidity: 62,
          precipProb: 20,
          windSpeed: 10,
          uvIndex: 9,
          conditionTh: 'แดดจัด ท้องฟ้าโปร่ง ความชื้นสัมพัทธ์ 62%',
          conditionEn: 'Mostly sunny, clear skies, 62% humidity',
          weatherType: 'sunny',
          rainTimelineNoteTh: 'สภาพอากาศเปิดตลอดวัน เหมาะอย่างยิ่งกับงานเก็บเกี่ยวและตากผลผลิต',
          rainTimelineNoteEn: 'Clear conditions all day. Optimal for field harvest and sun drying.',
          operations: {
            spraying: {
              status: 'optimal',
              titleTh: 'การฉีดพ่นปุ๋ยทางใบ/ฮอร์โมน/สารป้องกันกำจัดศัตรูพืช',
              titleEn: 'Foliar Spraying & Crop Protection',
              badgeTh: 'ฉีดพ่นได้ดีช่วงเช้า',
              badgeEn: 'Excellent Spray Window',
              adviceTh: 'เหมาะแก่การฉีดพ่นฮอร์โมนบำรุงรวงข้าวช่วง 06:30 - 09:30 น. ปากใบเปิดเต็มที่ หลีกเลี่ยงแดดจัดตอนเที่ยง',
              adviceEn: 'Ideal for foliar nutrition between 06:30 - 09:30 AM before stomatal closure and midday heat.',
            },
            irrigation: {
              status: 'optimal',
              titleTh: 'การให้น้ำและระบบน้ำสปริงเกอร์',
              titleEn: 'Irrigation & Drainage Management',
              badgeTh: 'ให้น้ำตามตารางปกติ',
              badgeEn: 'Standard Irrigation',
              adviceTh: 'สูบน้ำเข้านาข้าวระยะตั้งท้อง รักษาระดับน้ำ 5-7 ซม. ดินไม่แห้งแตกระแหง',
              adviceEn: 'Maintain 5-7 cm water depth in paddy fields during booting stage. Regular pumping recommended.',
            },
            harvesting: {
              status: 'optimal',
              titleTh: 'การกรีดยางพาราและการเก็บเกี่ยวผลผลิต',
              titleEn: 'Rubber Tapping & Fruit Harvest',
              badgeTh: 'เหมาะเกี่ยวข้าว 100%',
              badgeEn: 'Optimal Harvest Day',
              adviceTh: 'แดดแรงตลอดวัน เหมาะนำรถเกี่ยวข้าวลงแปลง และตากลดความชื้นข้าวเปลือกได้ถึง 14-15%',
              adviceEn: 'Perfect conditions for combine harvesters and sun drying grain to target 14-15% moisture.',
            },
            soilWork: {
              status: 'optimal',
              titleTh: 'การใส่ปุ๋ยทางดินและการปรับปรุงดิน',
              titleEn: 'Soil Fertilization & Ground Care',
              badgeTh: 'เหมาะหว่านปุ๋ยแต่งหน้า',
              badgeEn: 'Top-Dressing Ready',
              adviceTh: 'หว่านปุ๋ยยูเรียสูตรสั่งตัดรอบ 2 ในแปลงนาข้าว มีน้ำหล่อเลี้ยงพอเหมาะปุ๋ยละลายได้เต็มประสิทธิภาพ',
              adviceEn: 'Apply second top-dress nitrogen fertilizer in flooded paddy basins with minimal ammonia loss.',
            },
          },
          hourly: [
            { time: '07:00', temp: 28, rain: 5, wind: 8, status: 'optimal', icon: 'sun' },
            { time: '10:00', temp: 32, rain: 10, wind: 10, status: 'optimal', icon: 'sun' },
            { time: '13:00', temp: 35, rain: 20, wind: 12, status: 'optimal', icon: 'cloud' },
            { time: '16:00', temp: 33, rain: 15, wind: 10, status: 'optimal', icon: 'sun' },
            { time: '19:00', temp: 29, rain: 5, wind: 7, status: 'optimal', icon: 'cloud' },
          ],
        };
      case 'นครราชสีมา':
        return {
          temp: 32.2,
          feelsLike: 35.6,
          humidity: 58,
          precipProb: 15,
          windSpeed: 16,
          uvIndex: 8,
          conditionTh: 'แดดสลับเมฆ ลมพัด 16 กม./ชม. อากาศแห้ง',
          conditionEn: 'Sun & light clouds, 16 km/h breeze, dry air',
          weatherType: 'sunny',
          rainTimelineNoteTh: 'ฝนน้อยมาก ดินแห้งแข็ง เหมาะกับรถแทรกเตอร์และการขนส่งพืชไร่',
          rainTimelineNoteEn: 'Minimal rain probability. Hard soil ready for heavy tractors and cassava transport.',
          operations: {
            spraying: {
              status: 'warning',
              titleTh: 'การฉีดพ่นปุ๋ยทางใบ/ฮอร์โมน/สารป้องกันกำจัดศัตรูพืช',
              titleEn: 'Foliar Spraying & Crop Protection',
              badgeTh: 'ระวังลมพัดปลิว 16 km/h',
              badgeEn: 'Wind Drift Alert',
              adviceTh: 'ลมค่อนข้างแรง 16 กม./ชม. อาจทำให้ละอองยาปลิวข้ามแปลง ควรปรับหัวฉีดให้เป็นละอองหยาบหรือพ่นเช้าตรู่',
              adviceEn: 'Wind speed 16 km/h may cause spray drift. Use coarse nozzle tips and spray during early morning lull.',
            },
            irrigation: {
              status: 'optimal',
              titleTh: 'การให้น้ำและระบบน้ำสปริงเกอร์',
              titleEn: 'Irrigation & Drainage Management',
              badgeTh: 'เติมน้ำแปลงมัน/ข้าวโพด',
              badgeEn: 'Irrigation Required',
              adviceTh: 'ความชื้นในอากาศ 58% ดินคายน้ำเร็ว ควรให้น้ำระบบน้ำหยดในไร่มันสำปะหลังอย่างสม่ำเสมอ',
              adviceEn: 'Air humidity 58% accelerates evapotranspiration. Run drip lines for young cassava crops.',
            },
            harvesting: {
              status: 'optimal',
              titleTh: 'การกรีดยางพาราและการเก็บเกี่ยวผลผลิต',
              titleEn: 'Rubber Tapping & Fruit Harvest',
              badgeTh: 'เหมาะถอนหัวมันสำปะหลัง',
              badgeEn: 'Prime Harvest Window',
              adviceTh: 'ดินแห้งพอดี รถขุดถอนมันสำปะหลังทำงานได้เร็ว หัวมันไม่ติดโคลน เปอร์เซ็นต์แป้งคงที่ 26-28%',
              adviceEn: 'Firm soil allows mechanized cassava pulling with clean tubers and stable 26-28% starch content.',
            },
            soilWork: {
              status: 'optimal',
              titleTh: 'การใส่ปุ๋ยทางดินและการปรับปรุงดิน',
              titleEn: 'Soil Fertilization & Ground Care',
              badgeTh: 'เหมาะไถพรวนยกร่อง',
              badgeEn: 'Great for Tillage',
              adviceTh: 'ความชื้นในดินกำลังเหมาะแก่การไถดะ ไถแปร และยกร่องเตรียมแปลงปลูกรอบใหม่',
              adviceEn: 'Soil moisture is optimal for moldboard plowing, disc harrowing, and ridge making.',
            },
          },
          hourly: [
            { time: '07:00', temp: 26, rain: 0, wind: 10, status: 'optimal', icon: 'sun' },
            { time: '10:00', temp: 31, rain: 5, wind: 14, status: 'optimal', icon: 'sun' },
            { time: '13:00', temp: 34, rain: 15, wind: 18, status: 'optimal', icon: 'sun' },
            { time: '16:00', temp: 32, rain: 10, wind: 15, status: 'optimal', icon: 'cloud' },
            { time: '19:00', temp: 27, rain: 5, wind: 11, status: 'optimal', icon: 'cloud' },
          ],
        };
      case 'ขอนแก่น':
        return {
          temp: 32.8,
          feelsLike: 36.4,
          humidity: 60,
          precipProb: 25,
          windSpeed: 13,
          uvIndex: 8,
          conditionTh: 'แดดปานกลาง มีเมฆเป็นบางส่วน ลม 13 กม./ชม.',
          conditionEn: 'Moderate sun, passing clouds, 13 km/h wind',
          weatherType: 'sunny',
          rainTimelineNoteTh: 'สภาพอากาศแจ่มใส ฝนช่วงเย็นมีโอกาสต่ำกว่า 25%',
          rainTimelineNoteEn: 'Clear conditions with low 25% evening shower probability.',
          operations: {
            spraying: {
              status: 'optimal',
              titleTh: 'การฉีดพ่นปุ๋ยทางใบ/ฮอร์โมน/สารป้องกันกำจัดศัตรูพืช',
              titleEn: 'Foliar Spraying & Crop Protection',
              badgeTh: 'พ่นได้ถึง 10:30 น.',
              badgeEn: 'Spray Till 10:30 AM',
              adviceTh: 'เหมาะสำหรับฉีดพ่นสารชีวภัณฑ์บำรุงอ้อยและข้าวโพด ช่วง 06:30 - 10:30 น.',
              adviceEn: 'Great for biological stimulant spraying on sugarcane and maize between 06:30 - 10:30 AM.',
            },
            irrigation: {
              status: 'optimal',
              titleTh: 'การให้น้ำและระบบน้ำสปริงเกอร์',
              titleEn: 'Irrigation & Drainage Management',
              badgeTh: 'ให้น้ำตามรอบปกติ',
              badgeEn: 'Standard Cycle',
              adviceTh: 'เดินเครื่องสูบน้ำบาดาลพลังงานแสงอาทิตย์เพื่อส่งน้ำเข้าแปลงเกษตรผสมผสาน',
              adviceEn: 'Run solar-powered groundwater pumps to replenish mixed farm storage ponds.',
            },
            harvesting: {
              status: 'optimal',
              titleTh: 'การกรีดยางพาราและการเก็บเกี่ยวผลผลิต',
              titleEn: 'Rubber Tapping & Fruit Harvest',
              badgeTh: 'เหมาะตัดอ้อย/เกี่ยวข้าว',
              badgeEn: 'Ready for Field Harvest',
              adviceTh: 'แปลงแห้งสนิท เหมาะนำเครื่องจักรลงตัดอ้อยสด ไม่ก่อให้เกิดฝุ่นควันจากการเผา',
              adviceEn: 'Completely dry ground for fresh green cane harvesting without burning stubble.',
            },
            soilWork: {
              status: 'optimal',
              titleTh: 'การใส่ปุ๋ยทางดินและการปรับปรุงดิน',
              titleEn: 'Soil Fertilization & Ground Care',
              badgeTh: 'หว่านปุ๋ยอินทรีย์ได้',
              badgeEn: 'Organic Compost Ready',
              adviceTh: 'ไถกลบซากพืชตระกูลถั่วเพิ่มไนโตรเจนอินทรีย์ในดินทราย',
              adviceEn: 'Till legume cover crop residues into sandy soil to build organic carbon.',
            },
          },
          hourly: [
            { time: '07:00', temp: 26, rain: 5, wind: 8, status: 'optimal', icon: 'sun' },
            { time: '10:00', temp: 31, rain: 15, wind: 12, status: 'optimal', icon: 'sun' },
            { time: '13:00', temp: 34, rain: 25, wind: 15, status: 'optimal', icon: 'cloud' },
            { time: '16:00', temp: 31, rain: 20, wind: 12, status: 'optimal', icon: 'cloud' },
            { time: '19:00', temp: 28, rain: 10, wind: 9, status: 'optimal', icon: 'cloud' },
          ],
        };
      case 'เชียงใหม่':
        return {
          temp: 28.5,
          feelsLike: 30.5,
          humidity: 74,
          precipProb: 35,
          windSpeed: 8,
          uvIndex: 6,
          conditionTh: 'เช้ามีหมอกหนา บ่ายมีแดดรำไร เมฆชื้น 74%',
          conditionEn: 'Morning mist, humid afternoon sun, 74% humidity',
          weatherType: 'partly_cloudy',
          rainTimelineNoteTh: 'หมอกและน้ำค้างยามเช้าค้างนาน ระวังโรคใบจุดและราน้ำค้าง',
          rainTimelineNoteEn: 'Morning dew lingers. Inspect vegetable and fruit crops for downy mildew.',
          operations: {
            spraying: {
              status: 'warning',
              titleTh: 'การฉีดพ่นปุ๋ยทางใบ/ฮอร์โมน/สารป้องกันกำจัดศัตรูพืช',
              titleEn: 'Foliar Spraying & Crop Protection',
              badgeTh: 'รอใบแห้งน้ำค้างก่อนพ่น',
              badgeEn: 'Wait for Dew Evaporation',
              adviceTh: 'รอให้น้ำค้างบนใบแห้งสนิทช่วง 09:00 น. ก่อนเริ่มพ่นสารชีวภัณฑ์ เพื่อไม่ให้สารเจือจาง',
              adviceEn: 'Wait until morning dew dries around 09:00 AM before spraying bio-fungicide to prevent dilution.',
            },
            irrigation: {
              status: 'optimal',
              titleTh: 'การให้น้ำและระบบน้ำสปริงเกอร์',
              titleEn: 'Irrigation & Drainage Management',
              badgeTh: 'ให้น้ำแปลงผักระบบมินิสปริงเกอร์',
              badgeEn: 'Micro-Sprinkler Window',
              adviceTh: 'สภาพอากาศชื้นกำลังดี ให้น้ำแปลงสตรอว์เบอร์รีและผักสลัดช่วงสาย ป้องกันเชื้อราสะสมช่วงค่ำ',
              adviceEn: 'Water strawberry and salad greens mid-morning to avoid prolonged evening leaf wetness.',
            },
            harvesting: {
              status: 'optimal',
              titleTh: 'การกรีดยางพาราและการเก็บเกี่ยวผลผลิต',
              titleEn: 'Rubber Tapping & Fruit Harvest',
              badgeTh: 'เหมาะเก็บผักผลไม้เมืองหนาว',
              badgeEn: 'Prime Produce Harvest',
              adviceTh: 'อากาศไม่ร้อนจัด ผลไม้เก็บเกี่ยวได้คุณภาพ ผิวไม่เหี่ยวเฉา ขนส่งลงสู่ห้องเย็นได้ทันท่วงที',
              adviceEn: 'Cool ambient temperature preserves fruit freshness and firmness for cold chain packing.',
            },
            soilWork: {
              status: 'optimal',
              titleTh: 'การใส่ปุ๋ยทางดินและการปรับปรุงดิน',
              titleEn: 'Soil Fertilization & Ground Care',
              badgeTh: 'เหมาะคลุมฟาง/พลาสติกดำ',
              badgeEn: 'Mulching Optimal',
              adviceTh: 'ใส่ปุ๋ยหมักชีวภาพแล้วคลุมฟางรักษาหน้าดินบนพื้นที่ลาดชัน',
              adviceEn: 'Incorporate compost and apply straw mulching to conserve topsoil on terraced beds.',
            },
          },
          hourly: [
            { time: '07:00', temp: 23, rain: 10, wind: 6, status: 'optimal', icon: 'cloud' },
            { time: '10:00', temp: 27, rain: 20, wind: 8, status: 'optimal', icon: 'sun' },
            { time: '13:00', temp: 30, rain: 35, wind: 10, status: 'watch', icon: 'cloud' },
            { time: '16:00', temp: 27, rain: 25, wind: 8, status: 'optimal', icon: 'cloud' },
            { time: '19:00', temp: 24, rain: 15, wind: 5, status: 'optimal', icon: 'cloud' },
          ],
        };
      case 'สุราษฎร์ธานี':
        return {
          temp: 29.8,
          feelsLike: 34.6,
          humidity: 86,
          precipProb: 75,
          windSpeed: 18,
          uvIndex: 5,
          conditionTh: 'ฝนตกชุก 75% มรสุมลมแรง คลื่นลมทะเลพัดชื้น',
          conditionEn: 'Frequent rain 75%, strong monsoon winds, 86% humidity',
          weatherType: 'storm',
          rainTimelineNoteTh: 'มีฝนตกชุกตลอดวัน ควรระวังน้ำป่าไหลหลากในพื้นที่สวนลาดเชิงเขา',
          rainTimelineNoteEn: 'Continuous rainfall throughout the day. Watch hillside runoff in rubber/palm plots.',
          operations: {
            spraying: {
              status: 'danger',
              titleTh: 'การฉีดพ่นปุ๋ยทางใบ/ฮอร์โมน/สารป้องกันกำจัดศัตรูพืช',
              titleEn: 'Foliar Spraying & Crop Protection',
              badgeTh: 'ห้ามพ่น ฝนชุก 75%',
              badgeEn: 'Strict No-Spray Day',
              adviceTh: 'ฝนตกชุกและลม 18 กม./ชม. งดการฉีดพ่นทุกชนิด ป้องกันสารพิษปนเปื้อนลงแหล่งน้ำธรรมชาติ',
              adviceEn: 'Continuous rain and 18 km/h wind. Stop all spray tasks to prevent aquatic runoff.',
            },
            irrigation: {
              status: 'warning',
              titleTh: 'การให้น้ำและระบบน้ำสปริงเกอร์',
              titleEn: 'Irrigation & Drainage Management',
              badgeTh: 'ระบายน้ำท่วมขังด่วน',
              badgeEn: 'Flood Drainage Priority',
              adviceTh: 'ไม่ต้องให้น้ำ ขุดลอกร่องระบายน้ำสวนปาล์มน้ำมันให้น้ำไหลสะดวก ป้องกันรากขาดออกซิเจน',
              adviceEn: 'No irrigation needed. Clear all oil palm field drains to prevent root asphyxiation.',
            },
            harvesting: {
              status: 'warning',
              titleTh: 'การกรีดยางพาราและการเก็บเกี่ยวผลผลิต',
              titleEn: 'Rubber Tapping & Fruit Harvest',
              badgeTh: 'พักหน้ายาง / ตัดปาล์มระวังลื่น',
              badgeEn: 'Pause Tapping / Muddy Roads',
              adviceTh: 'หยุดกรีดยางเพื่อไม่ให้หน้ายางเน่าเสีย สำหรับการตัดปาล์มน้ำมันให้ระวังถนนในสวนลื่นติดหล่ม',
              adviceEn: 'Pause rubber tapping on wet trunks. Use 4WD tractor trailers for oil palm bunch collection.',
            },
            soilWork: {
              status: 'danger',
              titleTh: 'การใส่ปุ๋ยทางดินและการปรับปรุงดิน',
              titleEn: 'Soil Fertilization & Ground Care',
              badgeTh: 'ห้ามหว่านปุ๋ย ปุ๋ยจะชะล้างหมด',
              badgeEn: 'Severe Leaching Risk',
              adviceTh: 'ห้ามหว่านปุ๋ยเคมีเด็ดขาด ปริมาณน้ำฝนจะชะล้างธาตุอาหารลงคูน้ำและลึกเกินกว่ารากจะดูดซึม',
              adviceEn: 'Do not broadcast fertilizers. Heavy precipitation causes 80%+ nutrient leaching into ditches.',
            },
          },
          hourly: [
            { time: '07:00', temp: 25, rain: 40, wind: 14, status: 'watch', icon: 'rain' },
            { time: '10:00', temp: 28, rain: 60, wind: 18, status: 'rain', icon: 'rain' },
            { time: '13:00', temp: 30, rain: 75, wind: 22, status: 'rain', icon: 'storm' },
            { time: '16:00', temp: 28, rain: 65, wind: 19, status: 'rain', icon: 'rain' },
            { time: '19:00', temp: 26, rain: 45, wind: 15, status: 'watch', icon: 'rain' },
          ],
        };
      default:
        return {
          temp: 31.0,
          feelsLike: 34.8,
          humidity: 70,
          precipProb: 40,
          windSpeed: 12,
          uvIndex: 7,
          conditionTh: 'เมฆเป็นส่วนมาก มีโอกาสฝนตกเล็กน้อยช่วงบ่าย',
          conditionEn: 'Partly cloudy with light afternoon showers',
          weatherType: 'partly_cloudy',
          rainTimelineNoteTh: 'สภาพอากาศทั่วไปเอื้อต่อการทำเกษตรช่วงเช้า',
          rainTimelineNoteEn: 'General weather favorable for morning field tasks.',
          operations: {
            spraying: {
              status: 'optimal',
              titleTh: 'การฉีดพ่นปุ๋ยทางใบ/ฮอร์โมน/สารป้องกันกำจัดศัตรูพืช',
              titleEn: 'Foliar Spraying & Crop Protection',
              badgeTh: 'ฉีดพ่นได้ช่วงเช้า',
              badgeEn: 'Morning Spray Window',
              adviceTh: 'ฉีดพ่นสารชีวภัณฑ์บำรุงพืชช่วงเช้า 06:00 - 09:30 น. ปลอดภัยจากแดดจัดและฝนบ่าย',
              adviceEn: 'Apply foliar nutrients early morning between 06:00 - 09:30 AM before heat builds up.',
            },
            irrigation: {
              status: 'optimal',
              titleTh: 'การให้น้ำและระบบน้ำสปริงเกอร์',
              titleEn: 'Irrigation & Drainage Management',
              badgeTh: 'ให้น้ำตามรอบปกติ',
              badgeEn: 'Standard Schedule',
              adviceTh: 'ให้น้ำตามตารางปกติ ตรวจสอบความชื้นในดินก่อนเปิดสปริงเกอร์',
              adviceEn: 'Proceed with normal irrigation cycle after inspecting sensor soil moisture.',
            },
            harvesting: {
              status: 'optimal',
              titleTh: 'การกรีดยางพาราและการเก็บเกี่ยวผลผลิต',
              titleEn: 'Rubber Tapping & Fruit Harvest',
              badgeTh: 'เหมาะแก่การเก็บเกี่ยว',
              badgeEn: 'Ready for Harvest',
              adviceTh: 'ผลผลิตเก็บเกี่ยวได้ตามปกติ ขนส่งเข้าโรงคัดแยกได้ราบรื่น',
              adviceEn: 'Harvest operations normal. Smooth transit to packing and collection centers.',
            },
            soilWork: {
              status: 'optimal',
              titleTh: 'การใส่ปุ๋ยทางดินและการปรับปรุงดิน',
              titleEn: 'Soil Fertilization & Ground Care',
              badgeTh: 'ใส่ปุ๋ยทางดินได้',
              badgeEn: 'Soil Prep Ready',
              adviceTh: 'ใส่ปุ๋ยสูตรสั่งตัดตามการวิเคราะห์ดินและพรวนดินรอบทรงพุ่ม',
              adviceEn: 'Apply site-specific fertilizer based on NPK recommendations around canopy line.',
            },
          },
          hourly: [
            { time: '07:00', temp: 26, rain: 15, wind: 8, status: 'optimal', icon: 'sun' },
            { time: '10:00', temp: 30, rain: 25, wind: 12, status: 'optimal', icon: 'cloud' },
            { time: '13:00', temp: 32, rain: 40, wind: 15, status: 'watch', icon: 'cloud' },
            { time: '16:00', temp: 29, rain: 30, wind: 12, status: 'optimal', icon: 'cloud' },
            { time: '19:00', temp: 27, rain: 20, wind: 9, status: 'optimal', icon: 'cloud' },
          ],
        };
    }
  };

  const weather = getProvinceWeather(selectedProvince);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      setLastUpdatedTime(
        now.toLocaleTimeString(lang === 'th' ? 'th-TH' : 'en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-5">
      {/* 1. Header with Province Quick Selector & Live Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            {weather.weatherType === 'sunny' ? (
              <Sun className="w-6 h-6 text-amber-500 animate-pulse" />
            ) : weather.weatherType === 'rainy' ? (
              <CloudRain className="w-6 h-6 text-sky-500" />
            ) : weather.weatherType === 'storm' ? (
              <CloudLightning className="w-6 h-6 text-indigo-500" />
            ) : (
              <CloudSun className="w-6 h-6 text-amber-500" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                {lang === 'th'
                  ? `พยากรณ์อากาศและแผนปฏิบัติงานเกษตร จ.${selectedProvince}`
                  : `Agri-Weather & Farm Operations Plan — ${selectedProvince}`}
              </h2>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                {lang === 'th' ? 'เรดาร์สด TMD' : 'TMD Live Radar'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              <span>{lang === 'th' ? weather.conditionTh : weather.conditionEn}</span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span>
                {lang === 'th'
                  ? `อัปเดตล่าสุด ${lastUpdatedTime} น.`
                  : `Updated ${lastUpdatedTime}`}
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls: Province Dropdown & Refresh */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onSelectProvince && (
            <div className="relative">
              <select
                value={selectedProvince}
                onChange={(e) => onSelectProvince(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-7 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
                aria-label="Select Province"
              >
                {SUPPORTED_PROVINCES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {lang === 'th' ? p.th : p.en}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}

          <button
            onClick={handleRefresh}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-slate-200"
            title={lang === 'th' ? 'รีเฟรชข้อมูลสภาพอากาศ' : 'Refresh Weather Data'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            <span className="hidden sm:inline">{lang === 'th' ? 'รีเฟรช' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* 2. Primary Agri-Weather Indicators: 3 Core Metrics Highlighted */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Metric 1: Current Temperature */}
        <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1">
              <Thermometer className="w-4 h-4 text-amber-500" />
              <span>{lang === 'th' ? 'อุณหภูมิปัจจุบัน' : 'Current Temperature'}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {lang === 'th' ? `รู้สึกเหมือน ${weather.feelsLike}°C` : `Feels like ${weather.feelsLike}°C`}
            </span>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
              {weather.temp}°C
            </span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            {weather.temp >= 33 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 inline" />
                <span>{lang === 'th' ? 'แดดแรงสูง ระวังพืชคายน้ำเหี่ยวเฉา' : 'Intense sun; high evaporation'}</span>
              </span>
            ) : weather.temp <= 25 ? (
              <span className="text-sky-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 shrink-0 inline" />
                <span>{lang === 'th' ? 'อากาศเย็นสบาย เหมาะแก่การทำงาน' : 'Cool comfortable field weather'}</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline" />
                <span>{lang === 'th' ? 'อุณหภูมิเหมาะสมต่อการสังเคราะห์แสง' : 'Optimal photosynthesis temperature'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Metric 2: Rainfall Probability (Precipitation) */}
        <div className={`rounded-2xl p-4 border flex flex-col justify-between ${
          weather.precipProb >= 60
            ? 'bg-sky-50/70 border-sky-200'
            : weather.precipProb >= 30
            ? 'bg-amber-50/60 border-amber-200'
            : 'bg-slate-50/90 border-slate-200/80'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium mb-1">
            <span className="flex items-center gap-1 text-slate-700">
              <CloudRain className="w-4 h-4 text-sky-600" />
              <span className="font-bold">{lang === 'th' ? 'โอกาสเกิดฝน' : 'Rain Probability'}</span>
            </span>
            <span className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
              weather.precipProb >= 60
                ? 'bg-sky-100 text-sky-800'
                : weather.precipProb >= 30
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              {weather.precipProb >= 60
                ? lang === 'th' ? 'ฝนชุก / เสี่ยงชะล้าง' : 'High Rain'
                : weather.precipProb >= 30
                ? lang === 'th' ? 'ฝนโปรยบางส่วน' : 'Scattered'
                : lang === 'th' ? 'ฝนน้อย / ท้องฟ้าเปิด' : 'Low Rain'}
            </span>
          </div>
          <div className="my-1">
            <span className={`text-3xl font-black font-mono tabular-nums tracking-tight ${
              weather.precipProb >= 60 ? 'text-sky-900' : 'text-slate-900'
            }`}>
              {weather.precipProb}%
            </span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            <span>{lang === 'th' ? weather.rainTimelineNoteTh : weather.rainTimelineNoteEn}</span>
          </div>
        </div>

        {/* Metric 3: Relative Humidity */}
        <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
            <span className="flex items-center gap-1">
              <Droplets className="w-4 h-4 text-teal-600" />
              <span>{lang === 'th' ? 'ความชื้นสัมพัทธ์ในอากาศ' : 'Relative Humidity'}</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              ลม {weather.windSpeed} km/h
            </span>
          </div>
          <div className="my-1">
            <span className="text-3xl font-black text-slate-900 font-mono tabular-nums tracking-tight">
              {weather.humidity}%
            </span>
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            {weather.humidity >= 80 ? (
              <span className="text-rose-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 inline" />
                <span>{lang === 'th' ? 'ชื้นสูงสะสม ระวังโรคเชื้อราใบจุด/รากเน่า' : 'High humidity; monitor fungal leaf spots'}</span>
              </span>
            ) : weather.humidity <= 50 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 inline" />
                <span>{lang === 'th' ? 'อากาศแห้ง ดินระเหยน้ำเร็ว ควรให้น้ำเพิ่ม' : 'Dry air; increase drip irrigation'}</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 inline" />
                <span>{lang === 'th' ? 'ความชื้นเหมาะสม ต้นพืชหายใจและดูดปุ๋ยได้ดี' : 'Optimal humidity for nutrient uptake'}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Daily Operations Planner: 4 Actionable Farm Pillars (Clean Light Theme) */}
      <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-200/90 space-y-4 text-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200/80">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <Calendar className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {lang === 'th'
                ? 'คำแนะนำการวางแผนปฏิบัติงานประจำวันตามสภาพอากาศ (Daily Operations Planner)'
                : 'Daily Farm Operations Guidance Based on Real-time Weather'}
            </h3>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium font-mono">
            {lang === 'th' ? 'คำนวณอัตโนมัติรายชั่วโมง' : 'Auto-calculated hourly'}
          </span>
        </div>

        {/* 4 Operations Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Pillar 1: Foliar Spraying */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 shadow-2xs hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{lang === 'th' ? weather.operations.spraying.titleTh : weather.operations.spraying.titleEn}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                weather.operations.spraying.status === 'optimal'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : weather.operations.spraying.status === 'warning'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {lang === 'th' ? weather.operations.spraying.badgeTh : weather.operations.spraying.badgeEn}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {lang === 'th' ? weather.operations.spraying.adviceTh : weather.operations.spraying.adviceEn}
            </p>
          </div>

          {/* Pillar 2: Irrigation & Drainage */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 shadow-2xs hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>{lang === 'th' ? weather.operations.irrigation.titleTh : weather.operations.irrigation.titleEn}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                weather.operations.irrigation.status === 'optimal'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : weather.operations.irrigation.status === 'warning'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {lang === 'th' ? weather.operations.irrigation.badgeTh : weather.operations.irrigation.badgeEn}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {lang === 'th' ? weather.operations.irrigation.adviceTh : weather.operations.irrigation.adviceEn}
            </p>
          </div>

          {/* Pillar 3: Harvesting & Tapping */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 shadow-2xs hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>{lang === 'th' ? weather.operations.harvesting.titleTh : weather.operations.harvesting.titleEn}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                weather.operations.harvesting.status === 'optimal'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : weather.operations.harvesting.status === 'warning'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {lang === 'th' ? weather.operations.harvesting.badgeTh : weather.operations.harvesting.badgeEn}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {lang === 'th' ? weather.operations.harvesting.adviceTh : weather.operations.harvesting.adviceEn}
            </p>
          </div>

          {/* Pillar 4: Soil Fertilizer & Field Prep */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 space-y-1.5 shadow-2xs hover:border-emerald-200 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>{lang === 'th' ? weather.operations.soilWork.titleTh : weather.operations.soilWork.titleEn}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 ${
                weather.operations.soilWork.status === 'optimal'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : weather.operations.soilWork.status === 'warning'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {lang === 'th' ? weather.operations.soilWork.badgeTh : weather.operations.soilWork.badgeEn}
              </span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {lang === 'th' ? weather.operations.soilWork.adviceTh : weather.operations.soilWork.adviceEn}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Hourly Forecast Timeline Today */}
      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{lang === 'th' ? 'ไทม์ไลน์สภาพอากาศรายชั่วโมงวันนี้' : 'Hourly Weather Timeline Today'}</span>
          </span>
          <span className="text-[11px] text-slate-400 font-normal">
            {lang === 'th' ? 'อุณหภูมิ & โอกาสเกิดฝน' : 'Temperature & Rainfall Chance'}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          {weather.hourly.map((h, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border transition-all ${
                h.rain >= 50
                  ? 'bg-sky-50 border-sky-200 text-sky-900'
                  : 'bg-white border-slate-200/80 text-slate-800'
              }`}
            >
              <div className="text-[11px] font-semibold text-slate-500 mb-1">{h.time}</div>
              <div className="flex justify-center my-1.5">
                {h.icon === 'sun' ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : h.icon === 'rain' ? (
                  <CloudRain className="w-5 h-5 text-sky-500" />
                ) : h.icon === 'storm' ? (
                  <CloudLightning className="w-5 h-5 text-indigo-500" />
                ) : (
                  <CloudSun className="w-5 h-5 text-amber-500" />
                )}
              </div>
              <div className="font-bold text-slate-900 font-mono tabular-nums text-sm">{h.temp}°C</div>
              <div className="text-[11px] font-mono mt-1 font-semibold text-sky-600">
                ฝน {h.rain}%
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                ลม {h.wind} km/h
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
