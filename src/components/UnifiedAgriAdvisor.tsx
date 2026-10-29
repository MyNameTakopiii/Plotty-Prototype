import React, { useState, useRef } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  Camera,
  Search,
  Sparkles,
  FlaskConical,
  Sprout,
  Clock,
  RefreshCw,
  Info,
  ChevronRight,
  Send,
  X,
  PlusCircle,
} from 'lucide-react';
import { SAMPLE_DISEASES, DiseaseSample } from '../data/agriData';

interface UnifiedAgriAdvisorProps {
  lang: 'th' | 'en';
}

export const UnifiedAgriAdvisor: React.FC<UnifiedAgriAdvisorProps> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'scanner' | 'alro'>('scanner');

  // Scanner & Input State
  const [selectedCropType, setSelectedCropType] = useState<string>('มะม่วงน้ำดอกไม้สีทอง (Mango Nam Dok Mai)');
  const [symptomNotes, setSymptomNotes] = useState<string>('');
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(lang === 'th' ? 'กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น' : 'Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedImagePreview(reader.result as string);
      setDiagnosisResult(null);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Sample Preset Loader
  const handleSelectSample = (sample: DiseaseSample) => {
    setSelectedCropType(sample.crop);
    setSymptomNotes(sample.mockDiagnosis.symptoms[0] || 'พบรอยแผลจุดสีน้ำตาลเข้ม');
    setUploadedImagePreview(
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="%231E293B"/><circle cx="200" cy="150" r="80" fill="${encodeURIComponent(
        sample.previewColor
      )}"/><text x="200" y="270" fill="%23FFFFFF" font-family="sans-serif" font-size="14" text-anchor="middle">${encodeURIComponent(
        sample.nameThai
      )}</text></svg>`
    );
    setDiagnosisResult(sample.mockDiagnosis);
    setErrorMsg(null);
  };

  // Run AI Diagnostics Engine
  const handleRunDiagnostics = () => {
    if (!uploadedImagePreview && !symptomNotes.trim()) {
      setErrorMsg(
        lang === 'th'
          ? 'กรุณาอัปโหลดรูปถ่ายใบ/ผล หรือพิมพ์อธิบายอาการของพืชในช่องระบุข้อความก่อนกดวิเคราะห์'
          : 'Please upload a photo or type symptoms before running AI analysis.'
      );
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    setTimeout(() => {
      let result = SAMPLE_DISEASES[0].mockDiagnosis;

      if (symptomNotes.includes('ขาว') || symptomNotes.includes('แป้ง') || selectedCropType.includes('เขียวสามรส')) {
        result = SAMPLE_DISEASES[1].mockDiagnosis; // Powdery Mildew
      } else if (symptomNotes.includes('เน่า') || symptomNotes.includes('ยาง') || selectedCropType.includes('ทุเรียน')) {
        result = SAMPLE_DISEASES[2].mockDiagnosis; // Phytophthora Root Rot
      } else if (symptomNotes.includes('ไฟ') || symptomNotes.includes('เพลี้ย') || symptomNotes.includes('ยอด')) {
        result = SAMPLE_DISEASES[3].mockDiagnosis; // Thrips
      }

      setDiagnosisResult(result);
      setIsAnalyzing(false);
    }, 450);
  };

  // Reset Scanner
  const handleReset = () => {
    setUploadedImagePreview(null);
    setDiagnosisResult(null);
    setErrorMsg(null);
    setSymptomNotes('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4 text-xs sm:text-sm animate-in fade-in duration-200">
      {/* Top Header & Section Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-200 shrink-0">
              <Stethoscope className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
                {lang === 'th' ? 'หมอพืชมะม่วงอัจฉริยะ & ตรวจสอบโฉนด ส.ป.ก.' : 'Smart Plant Pathology & ALRO Land Rights Audit'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {lang === 'th'
                  ? 'อัปโหลดรูปถ่ายอาการโรคพืช ตรวจสอบยาที่กรมวิชาการเกษตรรับรอง และเช็กสิทธิ์โฉนด ส.ป.ก. 4-01'
                  : 'AI leaf diagnostic image uploader and ALRO 4-01 agricultural title deed audit'}
              </p>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'scanner' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📷 สแกนตรวจโรคพืช
            </button>
            <button
              onClick={() => setActiveTab('alro')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'alro' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📜 สิทธิ์ ส.ป.ก. 4-01
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: PLANT DOCTOR PHOTO UPLOADER & AI DIAGNOSTIC ENGINE */}
      {activeTab === 'scanner' && (
        <div className="space-y-4">
          {/* Main Grid: Upload Dropzone + Inputs */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>1. อัปโหลดรูปถ่ายใบ/ผล/ลำต้นพืช หรือพิมพ์ระบุอาการ:</span>
              </span>
              {uploadedImagePreview && (
                <button
                  onClick={handleReset}
                  className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>ล้างรูปภาพ</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Photo Upload Dropzone Box (5 cols) */}
              <div className="md:col-span-5 space-y-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[190px] ${
                    uploadedImagePreview
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {uploadedImagePreview ? (
                    <div className="space-y-2 w-full">
                      <img
                        src={uploadedImagePreview}
                        alt="Uploaded Leaf Specimen"
                        className="max-h-40 mx-auto rounded-xl object-contain shadow-xs border border-emerald-200"
                      />
                      <span className="text-[11px] text-emerald-800 font-bold block">
                        ✓ อัปโหลดรูปภาพตัวอย่างเรียบร้อยแล้ว (คลิกเพื่อเปลี่ยนรูป)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 py-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">
                          คลิกเพื่ออัปโหลดรูปถ่ายใบ/ผลพืช
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          รองรับ JPG, PNG, WEBP (ภาพจากโดรน/กล้องมือถือ)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Disease Specimen Buttons */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    หรือเลือกตัวอย่างโรคพืชที่พบบ่อยในสวน:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SAMPLE_DISEASES.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSelectSample(s)}
                        className="p-2 bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 border border-slate-200 hover:border-emerald-300 rounded-xl text-left text-[11px] font-semibold transition-all cursor-pointer truncate"
                      >
                        • {s.nameThai.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Input Parameters Box (7 cols) */}
              <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
                {/* Select Crop Type Input */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-800 block">
                    เลือกชนิดพืช / พันธุ์มะม่วงในแปลง:
                  </label>
                  <select
                    value={selectedCropType}
                    onChange={(e) => setSelectedCropType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                  >
                    <option value="มะม่วงน้ำดอกไม้สีทอง (Mango Nam Dok Mai)">มะม่วงน้ำดอกไม้สีทอง (แปลง A)</option>
                    <option value="มะม่วงมหาชนก (Mango Mahachanok)">มะม่วงมหาชนกส่งออก (แปลง B)</option>
                    <option value="มะม่วงเขียวสามรส (Mango Rad)">มะม่วงเขียวสามรส (แปลง C)</option>
                    <option value="ทุเรียนหมอนทอง (Monthong Durian)">ทุเรียนหมอนทอง</option>
                    <option value="ยางพารา / ปาล์มน้ำมัน">ยางพารา / ปาล์มน้ำมัน</option>
                  </select>
                </div>

                {/* Symptom Notes Text Area Input */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-slate-800 block">
                    ระบุลักษณะอาการเพิ่มเติม (ถ้ามี):
                  </label>
                  <textarea
                    rows={3}
                    value={symptomNotes}
                    onChange={(e) => setSymptomNotes(e.target.value)}
                    placeholder={
                      lang === 'th'
                        ? 'เช่น ใบมีจุดสีน้ำตาลขอบเหลือง, ผลมีแผลดำฉ่ำน้ำ, ยอดอ่อนหงิกงอ...'
                        : 'e.g., brown spots on leaves, black water-soaked lesions on fruits...'
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {errorMsg && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Run AI Analysis Button */}
                <button
                  onClick={handleRunDiagnostics}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>กำลังประมวลผลวิเคราะห์ด้วย AI Vision...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>กดเริ่มตรวจวิเคราะห์อาการโรคพืชด้วย AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* DIAGNOSIS RESULTS CARD */}
          {diagnosisResult && (
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-200">
              {/* Diagnosis Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-900 font-black px-2.5 py-0.5 rounded-full uppercase">
                    ผลตรวจวินิจฉัยอย่างเป็นทางการ (DOA Certified)
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
                    {diagnosisResult.diseaseNameThai}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono italic block">
                    {diagnosisResult.diseaseNameEnglish} ({diagnosisResult.pathogenType})
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 text-center">
                    <span className="text-[10px] text-slate-500 block font-sans">ความแม่นยำ AI</span>
                    <span className="text-sm font-extrabold text-emerald-800 font-mono">
                      {diagnosisResult.confidence}%
                    </span>
                  </div>
                  <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-center">
                    <span className="text-[10px] text-slate-500 block font-sans">ระดับความรุนแรง</span>
                    <span className="text-xs font-bold text-amber-900">
                      {diagnosisResult.severity === 'severe'
                        ? 'รุนแรงสูง'
                        : diagnosisResult.severity === 'moderate'
                        ? 'ปานกลาง'
                        : 'เล็กน้อย'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Observed Symptoms */}
              <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-extrabold text-xs text-slate-900 block">
                  ลักษณะอาการที่ตรวจพบในแปลง:
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {(diagnosisResult?.symptoms || []).map((sym: string, sIdx: number) => (
                    <li key={sIdx} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Treatment Options: Biological vs Chemical */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Organic / Bio Control */}
                <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs">
                    <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>1. วิธีรักษาทางชีววิถี / ออร์แกนิก (Organic Control):</span>
                  </div>
                  <ul className="space-y-1 text-xs text-slate-800">
                    {(diagnosisResult?.organicTreatment || []).map((org: string, oIdx: number) => (
                      <li key={oIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{org}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical Treatment with DOA Active Ingredients */}
                <div className="bg-sky-50/70 p-3.5 rounded-2xl border border-sky-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-sky-900 text-xs">
                    <FlaskConical className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>2. สารเคมีตามคำแนะนำกรมวิชาการเกษตร (Chemical DOA):</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    {(diagnosisResult?.chemicalTreatment || []).map((chem: any, cIdx: number) => (
                      <div key={cIdx} className="bg-white p-2 rounded-xl border border-sky-200 space-y-0.5">
                        <div className="flex justify-between items-center font-bold text-slate-900">
                          <span>{chem.activeIngredient}</span>
                          <span className="text-[10px] bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-mono">
                            ระยะปลอดภัย (PHI): {chem.phiDays}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">อัตราผสม: {chem.dosage}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALRO LAND TITLE AUDIT */}
      {activeTab === 'alro' && (
        <div className="p-4 sm:p-5 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                {lang === 'th' ? 'ตรวจสอบสิทธิ์โฉนด ส.ป.ก. 4-01 เพื่อการค้ำประกันสินเชื่อ' : 'ALRO Title Legal Status & Rights Audit'}
              </h4>
              <span className="text-[11px] text-slate-600 block">
                ตามระเบียบคณะกรรมการปฏิรูปที่ดินเพื่อเกษตรกรรม (คปจ.) ปี 2566
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">สถานะระเบียบ คปจ. ปี 2566:</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                  ผ่านเกณฑ์ถูกต้อง
                </span>
              </div>
              <span className="text-[11px] text-slate-600 block">
                ไม้ยืนต้นบนแปลง ส.ป.ก. 4-01 สามารถใช้เป็นหลักประกันชำระหนี้ร่วมกับ ธ.ก.ส. ได้อย่างถูกต้องตามระเบียบ
              </span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-amber-200 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900">พ.ร.บ.หลักประกันทางธุรกิจ 2558:</span>
                <span className="font-bold text-amber-900 text-xs">รองรับไม้ยืนต้น 58 ชนิด</span>
              </div>
              <span className="text-[11px] text-slate-600 block">
                มะม่วงได้รับการจัดอันดับเป็นไม้เศรษฐกิจค้ำประกันสินเชื่อได้ถึง 80% ของมูลค่าต้น
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
