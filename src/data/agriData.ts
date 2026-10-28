/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CropInfo {
  id: string;
  nameThai: string;
  nameEnglish: string;
  category: 'fruit' | 'staple' | 'cash_crop' | 'tree';
  unit: string;
  standardPriceTHB: number;
  currentPrice: number;
  priceUnit: string;
  growingPeriodMonths: number;
  yearsToFirstHarvest: number;
  lifespanYears: number;
  typicalSpacingMeters: string;
  treesPerRai: number;
  waterRequirement: 'high' | 'medium' | 'low';
  soilPreferenceThai: string;
  soilPreferenceEnglish: string;
  avgYieldPerRaiKg: number;
  costPerRaiTHB: number;
  harvestMonthsThai: string;
  peakHarvestMonth: number; // 1-12
  descriptionThai: string;
  descriptionEnglish: string;
  color: string;
}

export const CROPS: Record<string, CropInfo> = {
  mango_namdokmai: {
    id: 'mango_namdokmai',
    nameThai: 'มะม่วงน้ำดอกไม้สีทอง (เกรดส่งออก Premium)',
    nameEnglish: 'Nam Dok Mai Sri Thong Mango (Export Grade)',
    category: 'fruit',
    unit: 'กิโลกรัม (kg)',
    standardPriceTHB: 42,
    currentPrice: 45,
    priceUnit: 'บาท/กก.',
    growingPeriodMonths: 36,
    yearsToFirstHarvest: 3,
    lifespanYears: 25,
    typicalSpacingMeters: '6 x 6 เมตร',
    treesPerRai: 45,
    waterRequirement: 'medium',
    soilPreferenceThai: 'ดินร่วนปนทราย ระบายน้ำดี pH 5.5-6.5',
    soilPreferenceEnglish: 'Sandy loam, well-draining, pH 5.5-6.5',
    avgYieldPerRaiKg: 2500,
    costPerRaiTHB: 18000,
    harvestMonthsThai: 'กุมภาพันธ์ - พฤษภาคม',
    peakHarvestMonth: 4,
    descriptionThai: 'ราชินีแห่งมะม่วงไทย ผลสีทองกลิ่นหอมหวาน เนื้อแน่นเนียน ตลาดส่งออกหลักญี่ปุ่นและเกาหลีใต้',
    descriptionEnglish: 'Queen of Thai Mangoes with golden skin, sweet aroma, and smooth texture for export markets.',
    color: '#F59E0B',
  },
  mango_mahachanok: {
    id: 'mango_mahachanok',
    nameThai: 'มะม่วงมหาชนก (สีรุ้งพรีเมียม)',
    nameEnglish: 'Mahachanok Mango (Rainbow Premium)',
    category: 'fruit',
    unit: 'กิโลกรัม (kg)',
    standardPriceTHB: 50,
    currentPrice: 55,
    priceUnit: 'บาท/กก.',
    growingPeriodMonths: 48,
    yearsToFirstHarvest: 4,
    lifespanYears: 30,
    typicalSpacingMeters: '6 x 6 เมตร',
    treesPerRai: 45,
    waterRequirement: 'medium',
    soilPreferenceThai: 'ดินร่วนซุย ระบายน้ำดี ไม่ชอบน้ำขัง',
    soilPreferenceEnglish: 'Well-draining loam, sensitive to waterlogging',
    avgYieldPerRaiKg: 2200,
    costPerRaiTHB: 20000,
    harvestMonthsThai: 'มีนาคม - มิถุนายน',
    peakHarvestMonth: 5,
    descriptionThai: 'มะม่วงผลยาวเปลือกสีสวยงาม เอกลักษณ์เฉพาะตัว รสชาติหวานจัด กลิ่นหอมฟุ้ง ราคาสูงในตลาดพรีเมียม',
    descriptionEnglish: 'Exquisite multi-colored mango with intense sweetness and distinct tropical aroma.',
    color: '#EC4899',
  },
  mango_rad: {
    id: 'mango_rad',
    nameThai: 'มะม่วงเขียวสามรส & ฟ้าลั่น',
    nameEnglish: 'Green Three-Flavor & Falan Mango',
    category: 'fruit',
    unit: 'กิโลกรัม (kg)',
    standardPriceTHB: 22,
    currentPrice: 25,
    priceUnit: 'บาท/กก.',
    growingPeriodMonths: 36,
    yearsToFirstHarvest: 3,
    lifespanYears: 25,
    typicalSpacingMeters: '6 x 6 เมตร',
    treesPerRai: 45,
    waterRequirement: 'medium',
    soilPreferenceThai: 'ดินร่วนปนทราย pH 6.0',
    soilPreferenceEnglish: 'Sandy loam pH 6.0',
    avgYieldPerRaiKg: 3000,
    costPerRaiTHB: 15000,
    harvestMonthsThai: 'มกราคม - เมษายน',
    peakHarvestMonth: 3,
    descriptionThai: 'มะม่วงมันทานดิบกรอบอร่อยและแปรรูป ผลผลิตสูง ดูแลรักษาง่าย ตลาดอุตสาหกรรมต้องการมาก',
    descriptionEnglish: 'Crunchy green mango variety ideal for fresh consumption and processing.',
    color: '#10B981',
  },
  mango_young: {
    id: 'mango_young',
    nameThai: 'มะม่วงน้ำดอกไม้แปลงขยาย (อายุ 1 ปี Smart Drip)',
    nameEnglish: 'Young Nam Dok Mai Mango (1Y Solar Drip)',
    category: 'tree',
    unit: 'ต้น (tree)',
    standardPriceTHB: 800,
    currentPrice: 800,
    priceUnit: 'บาท/ต้น',
    growingPeriodMonths: 12,
    yearsToFirstHarvest: 3,
    lifespanYears: 25,
    typicalSpacingMeters: '6 x 6 เมตร',
    treesPerRai: 45,
    waterRequirement: 'medium',
    soilPreferenceThai: 'ดินร่วนระบายน้ำดี ติดตั้งเซนเซอร์ Smart IoT',
    soilPreferenceEnglish: 'Well-draining soil with Smart IoT sensor integration',
    avgYieldPerRaiKg: 0,
    costPerRaiTHB: 12000,
    harvestMonthsThai: 'ระยะสร้างทรงพุ่ม (ยังไม่เก็บเกี่ยว)',
    peakHarvestMonth: 0,
    descriptionThai: 'แปลงมะม่วงปลูกใหม่ ติดตั้งระบบน้ำหยดอัตโนมัติและเซนเซอร์ตรวจความชื้นดินเรียลไทม์',
    descriptionEnglish: 'Young mango orchard equipped with precision automated drip and real-time IoT sensors.',
    color: '#3B82F6',
  },
};

// -------------------------------------------------------------
// Historical Price Series & Forecast Models (Monthly Data)
// -------------------------------------------------------------
export interface PriceDataPoint {
  date: string; // YYYY-MM
  labelThai: string;
  labelEnglish: string;
  isHistorical: boolean;
  actualPrice?: number;
  projectedPrice?: number;
  upperBand?: number;
  lowerBand?: number;
  bullishScenario?: number;
  bearishScenario?: number;
  harvestVolumeIndex: number; // 0 to 100 supply index
  confidence?: number; // 0 to 100
  notesThai?: string;
  notesEnglish?: string;
}

export const PRICE_SERIES: Record<string, PriceDataPoint[]> = {
  mango_namdokmai: [
    { date: '2025-11', labelThai: 'พ.ย. 68', labelEnglish: 'Nov 25', isHistorical: true, actualPrice: 38, harvestVolumeIndex: 30 },
    { date: '2025-12', labelThai: 'ธ.ค. 68', labelEnglish: 'Dec 25', isHistorical: true, actualPrice: 40, harvestVolumeIndex: 35 },
    { date: '2026-01', labelThai: 'ม.ค. 69', labelEnglish: 'Jan 26', isHistorical: true, actualPrice: 42, harvestVolumeIndex: 50 },
    { date: '2026-02', labelThai: 'ก.พ. 69', labelEnglish: 'Feb 26', isHistorical: true, actualPrice: 44, harvestVolumeIndex: 75 },
    { date: '2026-03', labelThai: 'มี.ค. 69', labelEnglish: 'Mar 26', isHistorical: true, actualPrice: 45, harvestVolumeIndex: 90 },
    { date: '2026-04', labelThai: 'เม.ย. 69', labelEnglish: 'Apr 26', isHistorical: true, actualPrice: 43, harvestVolumeIndex: 95 },
    { date: '2026-05', labelThai: 'พ.ค. 69', labelEnglish: 'May 26', isHistorical: false, projectedPrice: 45, upperBand: 48, lowerBand: 42, bullishScenario: 50, bearishScenario: 40, harvestVolumeIndex: 85, confidence: 91 },
    { date: '2026-06', labelThai: 'มิ.ย. 69', labelEnglish: 'Jun 26', isHistorical: false, projectedPrice: 48, upperBand: 52, lowerBand: 44, bullishScenario: 54, bearishScenario: 42, harvestVolumeIndex: 60, confidence: 88 },
    { date: '2026-07', labelThai: 'ก.ค. 69', labelEnglish: 'Jul 26', isHistorical: false, projectedPrice: 52, upperBand: 56, lowerBand: 47, bullishScenario: 58, bearishScenario: 45, harvestVolumeIndex: 45, confidence: 85 },
    { date: '2026-08', labelThai: 'ส.ค. 69', labelEnglish: 'Aug 26', isHistorical: false, projectedPrice: 50, upperBand: 54, lowerBand: 45, bullishScenario: 56, bearishScenario: 43, harvestVolumeIndex: 40, confidence: 84 },
    { date: '2026-09', labelThai: 'ก.ย. 69', labelEnglish: 'Sep 26', isHistorical: false, projectedPrice: 46, upperBand: 50, lowerBand: 42, bullishScenario: 52, bearishScenario: 40, harvestVolumeIndex: 50, confidence: 82 },
    { date: '2026-10', labelThai: 'ต.ค. 69', labelEnglish: 'Oct 26', isHistorical: false, projectedPrice: 44, upperBand: 48, lowerBand: 40, bullishScenario: 50, bearishScenario: 38, harvestVolumeIndex: 55, confidence: 80 },
  ],
  mango_mahachanok: [
    { date: '2025-11', labelThai: 'พ.ย. 68', labelEnglish: 'Nov 25', isHistorical: true, actualPrice: 45, harvestVolumeIndex: 25 },
    { date: '2025-12', labelThai: 'ธ.ค. 68', labelEnglish: 'Dec 25', isHistorical: true, actualPrice: 48, harvestVolumeIndex: 30 },
    { date: '2026-01', labelThai: 'ม.ค. 69', labelEnglish: 'Jan 26', isHistorical: true, actualPrice: 50, harvestVolumeIndex: 45 },
    { date: '2026-02', labelThai: 'ก.พ. 69', labelEnglish: 'Feb 26', isHistorical: true, actualPrice: 52, harvestVolumeIndex: 70 },
    { date: '2026-03', labelThai: 'มี.ค. 69', labelEnglish: 'Mar 26', isHistorical: true, actualPrice: 54, harvestVolumeIndex: 85 },
    { date: '2026-04', labelThai: 'เม.ย. 69', labelEnglish: 'Apr 26', isHistorical: true, actualPrice: 55, harvestVolumeIndex: 90 },
    { date: '2026-05', labelThai: 'พ.ค. 69', labelEnglish: 'May 26', isHistorical: false, projectedPrice: 56, upperBand: 60, lowerBand: 52, bullishScenario: 62, bearishScenario: 49, harvestVolumeIndex: 80, confidence: 90 },
    { date: '2026-06', labelThai: 'มิ.ย. 69', labelEnglish: 'Jun 26', isHistorical: false, projectedPrice: 58, upperBand: 63, lowerBand: 53, bullishScenario: 65, bearishScenario: 50, harvestVolumeIndex: 55, confidence: 87 },
    { date: '2026-07', labelThai: 'ก.ค. 69', labelEnglish: 'Jul 26', isHistorical: false, projectedPrice: 62, upperBand: 67, lowerBand: 57, bullishScenario: 70, bearishScenario: 54, harvestVolumeIndex: 40, confidence: 85 },
    { date: '2026-08', labelThai: 'ส.ค. 69', labelEnglish: 'Aug 26', isHistorical: false, projectedPrice: 60, upperBand: 65, lowerBand: 55, bullishScenario: 68, bearishScenario: 52, harvestVolumeIndex: 35, confidence: 83 },
    { date: '2026-09', labelThai: 'ก.ย. 69', labelEnglish: 'Sep 26', isHistorical: false, projectedPrice: 55, upperBand: 60, lowerBand: 50, bullishScenario: 62, bearishScenario: 48, harvestVolumeIndex: 45, confidence: 81 },
    { date: '2026-10', labelThai: 'ต.ค. 69', labelEnglish: 'Oct 26', isHistorical: false, projectedPrice: 52, upperBand: 57, lowerBand: 47, bullishScenario: 60, bearishScenario: 45, harvestVolumeIndex: 50, confidence: 79 },
  ],
  mango_rad: [
    { date: '2025-11', labelThai: 'พ.ย. 68', labelEnglish: 'Nov 25', isHistorical: true, actualPrice: 20, harvestVolumeIndex: 40 },
    { date: '2025-12', labelThai: 'ธ.ค. 68', labelEnglish: 'Dec 25', isHistorical: true, actualPrice: 22, harvestVolumeIndex: 50 },
    { date: '2026-01', labelThai: 'ม.ค. 69', labelEnglish: 'Jan 26', isHistorical: true, actualPrice: 23, harvestVolumeIndex: 65 },
    { date: '2026-02', labelThai: 'ก.พ. 69', labelEnglish: 'Feb 26', isHistorical: true, actualPrice: 25, harvestVolumeIndex: 85 },
    { date: '2026-03', labelThai: 'มี.ค. 69', labelEnglish: 'Mar 26', isHistorical: true, actualPrice: 25, harvestVolumeIndex: 95 },
    { date: '2026-04', labelThai: 'เม.ย. 69', labelEnglish: 'Apr 26', isHistorical: true, actualPrice: 24, harvestVolumeIndex: 90 },
    { date: '2026-05', labelThai: 'พ.ค. 69', labelEnglish: 'May 26', isHistorical: false, projectedPrice: 25, upperBand: 28, lowerBand: 22, bullishScenario: 30, bearishScenario: 20, harvestVolumeIndex: 75, confidence: 92 },
    { date: '2026-06', labelThai: 'มิ.ย. 69', labelEnglish: 'Jun 26', isHistorical: false, projectedPrice: 26, upperBand: 29, lowerBand: 23, bullishScenario: 32, bearishScenario: 21, harvestVolumeIndex: 60, confidence: 89 },
    { date: '2026-07', labelThai: 'ก.ค. 69', labelEnglish: 'Jul 26', isHistorical: false, projectedPrice: 28, upperBand: 31, lowerBand: 25, bullishScenario: 34, bearishScenario: 23, harvestVolumeIndex: 50, confidence: 86 },
    { date: '2026-08', labelThai: 'ส.ค. 69', labelEnglish: 'Aug 26', isHistorical: false, projectedPrice: 27, upperBand: 30, lowerBand: 24, bullishScenario: 33, bearishScenario: 22, harvestVolumeIndex: 45, confidence: 84 },
    { date: '2026-09', labelThai: 'ก.ย. 69', labelEnglish: 'Sep 26', isHistorical: false, projectedPrice: 25, upperBand: 28, lowerBand: 22, bullishScenario: 30, bearishScenario: 20, harvestVolumeIndex: 55, confidence: 82 },
    { date: '2026-10', labelThai: 'ต.ค. 69', labelEnglish: 'Oct 26', isHistorical: false, projectedPrice: 24, upperBand: 27, lowerBand: 21, bullishScenario: 29, bearishScenario: 19, harvestVolumeIndex: 65, confidence: 80 },
  ],
  mango_young: [
    { date: '2025-11', labelThai: 'พ.ย. 68', labelEnglish: 'Nov 25', isHistorical: true, actualPrice: 800, harvestVolumeIndex: 10 },
    { date: '2025-12', labelThai: 'ธ.ค. 68', labelEnglish: 'Dec 25', isHistorical: true, actualPrice: 800, harvestVolumeIndex: 10 },
    { date: '2026-01', labelThai: 'ม.ค. 69', labelEnglish: 'Jan 26', isHistorical: true, actualPrice: 800, harvestVolumeIndex: 10 },
    { date: '2026-02', labelThai: 'ก.พ. 69', labelEnglish: 'Feb 26', isHistorical: true, actualPrice: 800, harvestVolumeIndex: 10 },
    { date: '2026-03', labelThai: 'มี.ค. 69', labelEnglish: 'Mar 26', isHistorical: true, actualPrice: 800, harvestVolumeIndex: 10 },
    { date: '2026-04', labelThai: 'เม.ย. 69', labelEnglish: 'Apr 26', isHistorical: true, actualPrice: 800, harvestVolumeIndex: 10 },
    { date: '2026-05', labelThai: 'พ.ค. 69', labelEnglish: 'May 26', isHistorical: false, projectedPrice: 800, upperBand: 850, lowerBand: 750, bullishScenario: 900, bearishScenario: 750, harvestVolumeIndex: 10, confidence: 95 },
    { date: '2026-06', labelThai: 'มิ.ย. 69', labelEnglish: 'Jun 26', isHistorical: false, projectedPrice: 820, upperBand: 870, lowerBand: 770, bullishScenario: 920, bearishScenario: 770, harvestVolumeIndex: 10, confidence: 94 },
    { date: '2026-07', labelThai: 'ก.ค. 69', labelEnglish: 'Jul 26', isHistorical: false, projectedPrice: 850, upperBand: 900, lowerBand: 800, bullishScenario: 950, bearishScenario: 800, harvestVolumeIndex: 10, confidence: 93 },
    { date: '2026-08', labelThai: 'ส.ค. 69', labelEnglish: 'Aug 26', isHistorical: false, projectedPrice: 850, upperBand: 900, lowerBand: 800, bullishScenario: 950, bearishScenario: 800, harvestVolumeIndex: 10, confidence: 92 },
    { date: '2026-09', labelThai: 'ก.ย. 69', labelEnglish: 'Sep 26', isHistorical: false, projectedPrice: 880, upperBand: 930, lowerBand: 830, bullishScenario: 980, bearishScenario: 830, harvestVolumeIndex: 10, confidence: 91 },
    { date: '2026-10', labelThai: 'ต.ค. 69', labelEnglish: 'Oct 26', isHistorical: false, projectedPrice: 900, upperBand: 950, lowerBand: 850, bullishScenario: 1000, bearishScenario: 850, harvestVolumeIndex: 10, confidence: 90 },
  ],
};

// -------------------------------------------------------------
// Sample Mango Plant Diseases
// -------------------------------------------------------------
export interface PlantDisease {
  id: string;
  nameThai: string;
  nameEnglish: string;
  affectedCrop: string;
  severity: 'high' | 'medium' | 'low';
  symptomsThai: string;
  symptomsEnglish: string;
  treatmentThai: string;
  treatmentEnglish: string;
  mockDiagnosis?: any;
  symptomsSummary?: string;
  crop: string;
  previewColor: string;
}

export type DiseaseSample = PlantDisease;

export const SAMPLE_DISEASES: PlantDisease[] = [
  {
    id: 'anthracnose',
    nameThai: 'โรคแอนแทรคโนส (Anthracnose)',
    nameEnglish: 'Anthracnose (Colletotrichum gloeosporioides)',
    affectedCrop: 'mango_namdokmai',
    severity: 'high',
    symptomsThai: 'พบบนใบและผลอ่อน มีแผลจุดสีน้ำตาลเข้มหรือดำ ลุกลามขยายใหญ่ ทำให้ผลเน่าดำและร่วงหล่นก่อนกำหนดในช่วงฤดูฝน',
    symptomsEnglish: 'Dark brown to black sunken lesions on leaves, panicles, and developing fruits, causing fruit rot and premature drop.',
    treatmentThai: 'ตัดแต่งกิ่งที่เป็นโรคออกเผาทำลาย พ่นสารป้องกันกำจัดเชื้อรากลุ่มไดฟีโนโคนาโซลหรือคาร์เบนดาซิมตามคำแนะนำ',
    treatmentEnglish: 'Prune infected twigs and burn. Apply systemic fungicides such as Difenoconazole or Carbendazim during humid periods.',
    crop: 'มะม่วงน้ำดอกไม้',
    previewColor: '#EF4444',
    mockDiagnosis: { confidence: 94 },
    symptomsSummary: 'จุดแผลสีน้ำตาลบนใบและผล',
  },
  {
    id: 'powdery_mildew',
    nameThai: 'โรคราแป้ง (Powdery Mildew)',
    nameEnglish: 'Powdery Mildew (Oidium mangiferae)',
    affectedCrop: 'mango_mahachanok',
    severity: 'medium',
    symptomsThai: 'พบบนช่อดอกและใบอ่อน มีผงสีขาวคล้ายแป้งปกคลุม ช่อดอกแห้งเกรียม ดอกร่วงไม่ติดผล',
    symptomsEnglish: 'White powdery fungus growth covering flowers and young leaves, leading to blossom blight and poor fruit set.',
    treatmentThai: 'พ่นด้วยผงกำมะถันละลายน้ำหรือสารเปนโคนาโซลในช่วงระยะแตกตาดอกและติดผลอ่อน',
    treatmentEnglish: 'Spray wettable sulfur or Penconazole during flowering and initial fruit setting stages.',
    crop: 'มะม่วงมหาชนก',
    previewColor: '#F59E0B',
    mockDiagnosis: { confidence: 89 },
    symptomsSummary: 'ผงสีขาวบนช่อดอก',
  },
  {
    id: 'leaf_hopper',
    nameThai: 'เพลี้ยจักจั่นช่อดอกมะม่วง (Mango Leaf Hopper)',
    nameEnglish: 'Mango Leaf Hopper (Idioscopus clypealis)',
    affectedCrop: 'mango_namdokmai',
    severity: 'high',
    symptomsThai: 'ดูดกินน้ำเลี้ยงที่ช่อดอก ทำให้ดอกแห้งร่วง และขับมูลหวานทำให้เกิดราดำเคลือบใและผล',
    symptomsEnglish: 'Nymphs and adults suck sap from flower panicles causing blossom blight and secreting honeydew causing black mold.',
    treatmentThai: 'พ่นสารอิมิดาโคลพริดหรือฟิโพรนิลเมื่อเริ่มพบการระบาดก่อนระยะดอกบาน',
    treatmentEnglish: 'Spray Imidacloprid or Fipronil at early infestation before full bloom.',
    crop: 'มะม่วงน้ำดอกไม้',
    previewColor: '#3B82F6',
    mockDiagnosis: { confidence: 92 },
    symptomsSummary: 'เพลี้ยดูดกินน้ำเลี้ยงช่อดอก',
  },
];

// -------------------------------------------------------------
// Land Measurement Helpers
// -------------------------------------------------------------
export const raiNganWaToSqm = (rai: number, ngan: number, wa: number): number => {
  return (rai * 1600) + (ngan * 400) + (wa * 4);
};

export const sqmToString = (sqm: number, lang: 'th' | 'en'): string => {
  const rai = Math.floor(sqm / 1600);
  const rem1 = sqm % 1600;
  const ngan = Math.floor(rem1 / 400);
  const wa = Math.round((rem1 % 400) / 4);

  if (lang === 'th') {
    return `${rai} ไร่ ${ngan} งาน ${wa} วา`;
  }
  return `${rai} Rai ${ngan} Ngan ${wa} Sq.Wa`;
};

export interface LandMapPreset {
  id: string;
  nameThai: string;
  nameEnglish: string;
  province: string;
  defaultRai: number;
  imageUrl: string;
  cropId: string;
  landRai: number;
  titleThai: string;
  titleEnglish: string;
  descriptionThai: string;
  previewColor: string;
}

export const LAND_MAP_PRESETS: LandMapPreset[] = [
  {
    id: 'chachoengsao_mango_drone',
    nameThai: 'แปลงสวนมะม่วง อ.บางคล้า จ.ฉะเชิงเทรา',
    nameEnglish: 'Mango Orchard, Bang Khla, Chachoengsao',
    province: 'ฉะเชิงเทรา',
    defaultRai: 25,
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d691a4bf5?auto=format&fit=crop&w=1024&q=80',
    cropId: 'mango_namdokmai',
    landRai: 25,
    titleThai: 'แปลงสวนมะม่วงน้ำดอกไม้ อ.บางคล้า จ.ฉะเชิงเทรา',
    titleEnglish: 'Nam Dok Mai Mango Orchard, Bang Khla',
    descriptionThai: 'แปลงนำร่อง 25 ไร่ ระบบ Smart IoT และโซลาร์เซลล์',
    previewColor: '#10B981',
  },
];

export interface LegalTopic {
  id: string;
  titleThai: string;
  titleEnglish: string;
  descriptionThai: string;
  descriptionEnglish: string;
  summaryThai?: string;
  officialSource?: string;
}

export const THAI_LEGAL_TOPICS: LegalTopic[] = [
  {
    id: 'alro',
    titleThai: 'สิทธิ์ที่ดิน ส.ป.ก. 4-01 & โฉนดเพื่อเกษตรกรรม',
    titleEnglish: 'ALRO 4-01 Land Rights & Agricultural Title',
    descriptionThai: 'หลักเกณฑ์การถือครอง การเปลี่ยนมือ และการแปลง ส.ป.ก. เป็นโฉนดเพื่อค้ำประกันสินเชื่อตามระเบียบปี 2566',
    descriptionEnglish: 'Holding rules, transfer limits, and conversion to agricultural title deeds for credit.',
    summaryThai: 'แปลง ส.ป.ก. 4-01 ถือครองครบ 5 ปี แปลงเป็นโฉนดเพื่อการเกษตรได้',
    officialSource: 'สำนักงานการปฏิรูปที่ดินเพื่อเกษตรกรรม (ส.ป.ก.)',
  },
  {
    id: 'collateral',
    titleThai: 'พ.ร.บ. หลักประกันทางธุรกิจ (ไม้ยืนต้น)',
    titleEnglish: 'Business Collateral Act (Living Trees)',
    descriptionThai: 'การประเมินมูลค่าต้นมะม่วงและไม้ยืนต้นเป็นหลักทรัพย์ค้ำประกันเงินกู้ ธ.ก.ส.',
    descriptionEnglish: 'Appraising mango trees and perennial plants as BAAC loan collateral.',
    summaryThai: 'ประเมินต้นมะม่วงเป็นหลักทรัพย์ค้ำประกันสินเชื่อ ธ.ก.ส.',
    officialSource: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)',
  },
];

export const INSTANT_LEGAL_QA = [
  {
    keywords: ['ส.ป.ก', 'โฉนด', 'เปลี่ยน'],
    replyThai: 'ที่ดิน ส.ป.ก. 4-01 ตามระเบียบใหม่ปี 2566 สามารถยื่นขอปรับสถานะเป็น "โฉนดเพื่อการเกษตร" ได้หากถือครองและทำประโยชน์ต่อเนื่องไม่น้อยกว่า 5 ปี โดยสามารถนำต้นมะม่วงและโฉนดนี้ไปเป็นหลักประกันสินเชื่อดอกเบี้ยต่ำกับ ธ.ก.ส. ได้ทันที',
    replyEnglish: 'SorPorKor 4-01 land can be converted to Agricultural Title Deeds after 5 years of cultivation under the 2023 regulations.',
    citation: 'พระราชบัญญัติการปฏิรูปที่ดินเพื่อเกษตรกรรม พ.ศ. 2518 และระเบียบ ส.ป.ก. ฉบับปี 2566',
  },
];

export interface ScenarioModel {
  id: string;
  titleThai: string;
  titleEnglish: string;
  descriptionThai: string;
  descriptionEnglish: string;
  year5ProfitTHB: number;
  year10CumulativeNetTHB: number;
  landRai: number;
  summaryThai: string;
  capexTHB: number;
  annualOpexTHB: number;
  paybackPeriodYears: number;
  waterStressRisk: string;
  priceVolatilityRisk: string;
}

export const FARM_SCENARIOS: ScenarioModel[] = [
  {
    id: 'drought',
    titleThai: 'ภัยแล้ง เอลนีโญ',
    titleEnglish: 'El Nino Drought',
    descriptionThai: 'จัดการน้ำหยดและเซนเซอร์ความชื้น',
    descriptionEnglish: 'Manage drip and soil moisture sensors',
    year5ProfitTHB: 1250000,
    year10CumulativeNetTHB: 3400000,
    landRai: 25,
    summaryThai: 'ระบบน้ำหยดโซลาร์เซลล์ช่วยลดความเสี่ยงภัยแล้ง 85%',
    capexTHB: 150000,
    annualOpexTHB: 25000,
    paybackPeriodYears: 2.1,
    waterStressRisk: 'Medium',
    priceVolatilityRisk: 'Low',
  },
  {
    id: 'flood',
    titleThai: 'น้ำท่วมฉับพลัน',
    titleEnglish: 'Flash Flood',
    descriptionThai: 'ระบบคูระบายน้ำรอบแปลง',
    descriptionEnglish: 'Orchard drainage network',
    year5ProfitTHB: 1100000,
    year10CumulativeNetTHB: 3100000,
    landRai: 25,
    summaryThai: 'ขุดคูระบายน้ำและยกระดับโคนต้นป้องกันรากเน่า',
    capexTHB: 120000,
    annualOpexTHB: 18000,
    paybackPeriodYears: 2.5,
    waterStressRisk: 'Low',
    priceVolatilityRisk: 'Low',
  },
];
