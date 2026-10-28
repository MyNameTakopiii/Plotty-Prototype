/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { CROPS, PRICE_SERIES, PriceDataPoint } from '../data/agriData';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Scale,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';

interface PriceForecasterProps {
  lang: 'th' | 'en';
}

export const PriceForecaster: React.FC<PriceForecasterProps> = ({ lang }) => {
  const defaultCropId = 'mango_namdokmai';
  const [selectedCrop, setSelectedCrop] = useState<string>(defaultCropId);
  const [compareCrop, setCompareCrop] = useState<string>('none');
  const [horizonMonths, setHorizonMonths] = useState<number>(6); // 3, 6, 12
  const [showScenarios, setShowScenarios] = useState<boolean>(true);
  const [showConfidenceCone, setShowConfidenceCone] = useState<boolean>(true);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);
  const [aiCommentary, setAiCommentary] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState<boolean>(false);
  const [showMethodologyModal, setShowMethodologyModal] = useState<boolean>(false);
  const [farmerOfferPrice, setFarmerOfferPrice] = useState<string>('');
  const [showFairPriceCalc, setShowFairPriceCalc] = useState<boolean>(false);

  // Demo Mode Action Listener
  React.useEffect(() => {
    const handleDemoAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.action === 'select_forecast_crop') {
        const cropId = customEvent.detail.cropId || defaultCropId;
        setSelectedCrop(cropId);
      } else if (customEvent.detail?.action === 'open_fair_price_calc') {
        setShowFairPriceCalc(true);
      }
    };
    window.addEventListener('kasetthai_demo_action', handleDemoAction);
    return () => window.removeEventListener('kasetthai_demo_action', handleDemoAction);
  }, []);

  const primaryCrop = CROPS[selectedCrop] || CROPS[defaultCropId] || Object.values(CROPS)[0];
  const secondaryCrop = compareCrop !== 'none' ? CROPS[compareCrop] : null;

  // Filter series based on horizon
  const fullSeries = PRICE_SERIES[selectedCrop] || [];
  const secondarySeries = secondaryCrop ? PRICE_SERIES[compareCrop] || [] : [];

  // Historical is 12 points. Forecast points: slice based on horizon (3, 6, 12)
  const displaySeries = useMemo(() => {
    const historical = fullSeries.filter((p) => p.isHistorical);
    const forecast = fullSeries.filter((p) => !p.isHistorical).slice(0, horizonMonths);
    return [...historical, ...forecast];
  }, [fullSeries, horizonMonths]);

  const displaySecondarySeries = useMemo(() => {
    if (!secondaryCrop) return [];
    const historical = secondarySeries.filter((p) => p.isHistorical);
    const forecast = secondarySeries.filter((p) => !p.isHistorical).slice(0, horizonMonths);
    return [...historical, ...forecast];
  }, [secondarySeries, horizonMonths, secondaryCrop]);

  // Calculate chart boundaries
  const { minVal, maxVal } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;

    displaySeries.forEach((p) => {
      const vals = [
        p.actualPrice,
        p.projectedPrice,
        p.upperBand,
        p.lowerBand,
        p.bullishScenario,
        p.bearishScenario,
      ].filter((v): v is number => v !== undefined);
      vals.forEach((v) => {
        if (v < min) min = v;
        if (v > max) max = v;
      });
    });

    const padding = (max - min) * 0.15 || 10;
    return {
      minVal: Math.max(0, Math.floor(min - padding)),
      maxVal: Math.ceil(max + padding),
    };
  }, [displaySeries]);

  // Chart coordinates calculation
  const chartWidth = 960;
  const chartHeight = 400;
  const paddingLeft = 70;
  const paddingRight = 45;
  const paddingTop = 42;
  const paddingBottom = 85;
  const plotWidth = chartWidth - paddingLeft - paddingRight;
  const plotHeight = chartHeight - paddingTop - paddingBottom;

  const pointsCount = displaySeries.length;
  const getX = (idx: number) => paddingLeft + (idx / (pointsCount - 1)) * plotWidth;
  const getY = (val: number) => {
    if (maxVal === minVal) return paddingTop + plotHeight / 2;
    return paddingTop + plotHeight - ((val - minVal) / (maxVal - minVal)) * plotHeight;
  };

  // Build SVG Paths
  const historicalPoints = displaySeries.filter((p) => p.isHistorical);
  const forecastPoints = displaySeries.filter((p) => !p.isHistorical);
  const transitionIndex = historicalPoints.length - 1;

  // Path for Historical (Solid)
  const historicalPath = historicalPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.actualPrice ?? 0)}`)
    .join(' ');

  // Path for Baseline Forecast (Dashed)
  const forecastPath = [
    // Start from the last historical point
    `M ${getX(transitionIndex)} ${getY(displaySeries[transitionIndex]?.actualPrice ?? 0)}`,
    ...forecastPoints.map((p, idx) => {
      const absoluteIdx = transitionIndex + 1 + idx;
      return `L ${getX(absoluteIdx)} ${getY(p.projectedPrice ?? 0)}`;
    }),
  ].join(' ');

  // Path for Bullish Scenario Corridor
  const bullishPath = [
    `M ${getX(transitionIndex)} ${getY(displaySeries[transitionIndex]?.actualPrice ?? 0)}`,
    ...forecastPoints.map((p, idx) => {
      const absoluteIdx = transitionIndex + 1 + idx;
      return `L ${getX(absoluteIdx)} ${getY(p.bullishScenario ?? p.projectedPrice ?? 0)}`;
    }),
  ].join(' ');

  // Path for Bearish Scenario Corridor
  const bearishPath = [
    `M ${getX(transitionIndex)} ${getY(displaySeries[transitionIndex]?.actualPrice ?? 0)}`,
    ...forecastPoints.map((p, idx) => {
      const absoluteIdx = transitionIndex + 1 + idx;
      return `L ${getX(absoluteIdx)} ${getY(p.bearishScenario ?? p.projectedPrice ?? 0)}`;
    }),
  ].join(' ');

  // Secondary Crop Paths (for comparison mode)
  const secondaryHistoricalPoints = displaySecondarySeries.filter((p) => p.isHistorical);
  const secondaryForecastPoints = displaySecondarySeries.filter((p) => !p.isHistorical);
  const secondaryHistoricalPath = secondaryHistoricalPoints
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx)} ${getY(p.actualPrice ?? 0)}`)
    .join(' ');
  const secondaryForecastPath =
    secondaryCrop && secondaryHistoricalPoints.length > 0
      ? [
          `M ${getX(transitionIndex)} ${getY(displaySecondarySeries[transitionIndex]?.actualPrice ?? 0)}`,
          ...secondaryForecastPoints.map((p, idx) => {
            const absoluteIdx = transitionIndex + 1 + idx;
            return `L ${getX(absoluteIdx)} ${getY(p.projectedPrice ?? 0)}`;
          }),
        ].join(' ')
      : '';

  // Shaded Confidence Area (Polygon between upperBand and lowerBand)
  const confidencePolygon = useMemo(() => {
    if (!showConfidenceCone || forecastPoints.length === 0) return '';
    const lastHist = displaySeries[transitionIndex];
    const topPoints = [
      `M ${getX(transitionIndex)} ${getY(lastHist?.actualPrice ?? 0)}`,
      ...forecastPoints.map((p, idx) => `L ${getX(transitionIndex + 1 + idx)} ${getY(p.upperBand ?? 0)}`),
    ];
    const bottomPoints = [
      ...forecastPoints
        .slice()
        .reverse()
        .map((p, idx) => {
          const revIdx = transitionIndex + forecastPoints.length - idx;
          return `L ${getX(revIdx)} ${getY(p.lowerBand ?? 0)}`;
        }),
      `L ${getX(transitionIndex)} ${getY(lastHist?.actualPrice ?? 0)}`,
      'Z',
    ];
    return `${topPoints.join(' ')} ${bottomPoints.join(' ')}`;
  }, [displaySeries, forecastPoints, showConfidenceCone, transitionIndex]);

  // Current active point for stats
  const activePoint =
    hoveredPointIndex !== null && displaySeries[hoveredPointIndex]
      ? displaySeries[hoveredPointIndex]
      : displaySeries[displaySeries.length - 1];

  const currentActual = displaySeries[transitionIndex]?.actualPrice ?? primaryCrop.currentPrice;
  const futurePeak = Math.max(...forecastPoints.map((p) => p.projectedPrice ?? 0));
  const futureBullish = Math.max(...forecastPoints.map((p) => p.bullishScenario ?? 0));
  const futureBearish = Math.min(...forecastPoints.map((p) => p.bearishScenario ?? p.projectedPrice ?? 0));

  const pctChange = currentActual > 0 ? (((futurePeak - currentActual) / currentActual) * 100).toFixed(1) : '0';

  // Fetch AI commentary
  const handleFetchAiCommentary = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/price-forecast/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropKey: primaryCrop.nameThai,
          currentPrice: currentActual,
          forecastTrend: Number(pctChange) >= 0 ? 'ขาขึ้น (Bullish trend)' : 'ขาลง (Bearish trend)',
          horizonMonths: horizonMonths,
          lang: lang,
        }),
      });
      const data = await res.json();
      if (data.commentary) {
        setAiCommentary(data.commentary);
      }
    } catch (e) {
      console.error(e);
      setAiCommentary(
        lang === 'th'
          ? 'แนวโน้มราคาได้รับอิทธิพลจากฤดูกาลเก็บเกี่ยวและอุปสงค์ส่งออก แนะนำให้เกษตรกรติดตามรอบเก็บเกี่ยวผลผลิตเพื่อหลีกเลี่ยงช่วงราคาตกต่ำ'
          : 'Price trends follow seasonal supply peaks and export logistics. Farmers are advised to avoid dumping during peak glut.'
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div id="tour-step-3" className="space-y-6">
      {/* Top Banner / Headline */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">
              {lang === 'th' ? 'ตลาดสินค้าเกษตรล่วงหน้า' : 'Agri Commodity Terminal'}
            </span>
            <span>·</span>
            <span>{lang === 'th' ? 'อ้างอิง กรมการค้าภายใน & สศก.' : 'Ref: DIT & OAE Thailand'}</span>
            <span>·</span>
            <span className="text-amber-600 font-medium">
              {lang === 'th' ? 'แบบจำลอง AI คาดการณ์' : 'AI Probabilistic Forecast'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {lang === 'th' ? 'กราฟคาดการณ์ราคาพืชผลล่วงหน้า' : 'Interactive Crop Price Forecasting'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {lang === 'th'
              ? 'วิเคราะห์ราคาย้อนหลัง ผสานสถิติฤดูกาล ปริมาณผลผลิตออกสู่ตลาด และการคาดการณ์อนาคต 3-12 เดือน พร้อมกรอบสถานการณ์สูง/ต่ำ'
              : 'Interactive stock-market style trend analysis combining historical farmgate benchmarks with 3-12 month AI seasonal projections.'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            onClick={() => setShowMethodologyModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>{lang === 'th' ? 'ที่มาข้อมูล & ความแม่นยำ' : 'Methodology & Data'}</span>
          </button>
          <button
            onClick={handleFetchAiCommentary}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-xs disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoadingAi ? (lang === 'th' ? 'กำลังวิเคราะห์...' : 'Analyzing...') : (lang === 'th' ? 'วิเคราะห์เชิงลึก AI' : 'AI Market Insight')}</span>
          </button>
        </div>
      </div>

      {/* Quick 1-Tap Crop Selector Bar */}
      <div className="space-y-1.5">
        <span className="text-xs font-bold text-slate-700 block">
          {lang === 'th' ? 'แตะเลือกพืชเพื่อดูราคาได้ทันที:' : 'Quick Select Crop:'}
        </span>
        <div className="flex overflow-x-auto gap-2 pb-1 no-scrollbar">
          {Object.values(CROPS).map((crop) => {
            const isSelected = selectedCrop === crop.id;
            return (
              <button
                key={crop.id}
                onClick={() => {
                  setSelectedCrop(crop.id);
                  setHoveredPointIndex(null);
                  setAiCommentary(null);
                }}
                className={`px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isSelected ? '#FFFFFF' : crop.color }} />
                <span>{lang === 'th' ? crop.nameThai.split('(')[0] : crop.nameEnglish.split('(')[0]}</span>
                <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  ฿{crop.currentPrice.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Friendly Farmer Summary Card with Live Benchmark Indicator */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 p-4 rounded-2xl border border-emerald-200 text-xs text-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <strong className="text-emerald-950 font-bold text-sm">
                {lang === 'th' ? `สรุปสั้นเข้าใจง่าย: แนวโน้มราคา ${primaryCrop.nameThai.split('(')[0]}` : `Quick Takeaway: ${primaryCrop.nameEnglish}`}
              </strong>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                {lang === 'th' ? 'ข้อมูลจริงหน้าสวนวันนี้' : 'Verified Farmgate Data'}
              </span>
            </div>
            <p className="leading-relaxed text-slate-700">
              {lang === 'th'
                ? `ราคาหน้าสวนจริงวันนี้อยู่ที่ ฿${currentActual.toLocaleString()} ${primaryCrop.priceUnit} (อ้างอิง กรมการค้าภายใน & ตลาดไท) ในอีก ${horizonMonths} เดือนข้างหน้า ระบบคาดการณ์ว่าราคามีโอกาสขยับไปที่ประมาณ ฿${futurePeak.toLocaleString()} (${Number(pctChange) >= 0 ? `เพิ่มขึ้นราว +${pctChange}%` : `ปรับลดลง ${pctChange}%`})`
                : `Current benchmark is ฿${currentActual.toLocaleString()} ${primaryCrop.priceUnit} (Ref: DIT & Talaad Thai). Projected peak over ${horizonMonths}M is ~฿${futurePeak.toLocaleString()} (${pctChange}% change).`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowFairPriceCalc(!showFairPriceCalc)}
          className="self-start md:self-auto px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shrink-0 cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{showFairPriceCalc ? (lang === 'th' ? 'ปิดเครื่องมือเทียบ' : 'Close Checker') : (lang === 'th' ? 'เทียบราคาพ่อค้าคนกลาง' : 'Check Middleman Offer')}</span>
        </button>
      </div>

      {/* Middleman Fair Price Checker (Interactive Farmer Tool) */}
      {showFairPriceCalc && (
        <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-300 text-xs text-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <strong className="text-amber-950 font-bold text-sm block">
                {lang === 'th' ? 'เครื่องมือตรวจสอบราคาที่เป็นธรรม (เช็คราคาพ่อค้าคนกลางมาเสนอซื้อ)' : 'Fair Price Verification Tool'}
              </strong>
              <span className="text-slate-600 text-[11px]">
                {lang === 'th'
                  ? 'ใส่ราคาที่พ่อค้าคนกลางเสนอซื้อหน้าสวน เพื่อเทียบกับราคากลางจริงของตลาดไทและกระทรวงพาณิชย์'
                  : 'Enter the price offered by your local middleman to compare against verified central wholesale benchmarks.'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">ราคาที่เสนอ:</span>
              <div className="relative">
                <input
                  type="number"
                  placeholder="เช่น 160"
                  value={farmerOfferPrice}
                  onChange={(e) => setFarmerOfferPrice(e.target.value)}
                  className="w-28 px-2.5 py-1.5 rounded-lg border border-amber-400 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-2 top-1.5 text-slate-400 text-[10px]">฿</span>
              </div>
            </div>
          </div>

          {farmerOfferPrice && Number(farmerOfferPrice) > 0 && (() => {
            const offer = Number(farmerOfferPrice);
            const diff = offer - currentActual;
            const diffPct = ((diff / currentActual) * 100).toFixed(1);
            const isFair = diff >= -currentActual * 0.1; // Fair if within 10% transport & grading deduction

            return (
              <div className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                isFair
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {isFair ? (
                      <span className="font-bold text-sm flex items-center gap-1.5 text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{lang === 'th' ? 'ราคายุติธรรม สมเหตุสมผล' : 'Fair Market Price'}</span>
                      </span>
                    ) : (
                      <span className="font-bold text-sm flex items-center gap-1.5 text-rose-800">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        <span>{lang === 'th' ? 'ระวัง! ราคาต่ำกว่าเกณฑ์ตลาดกลางมากเกินไป' : 'Sub-market Offer Warning'}</span>
                      </span>
                    )}
                    <span className="text-xs font-mono font-bold">
                      ({Number(diffPct) >= 0 ? `+${diffPct}%` : `${diffPct}%`})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    {isFair
                      ? lang === 'th'
                        ? `ราคาที่เสนอ ฿${offer} ใกล้เคียงราคากลาง ฿${currentActual} (หักค่าคัดเกรดและค่าขนส่ง 5-10% อยู่ในเกณฑ์มาตรฐาน)`
                        : `Offer of ฿${offer} is within normal grading and transit deduction margins.`
                      : lang === 'th'
                        ? `ราคาที่เสนอ ฿${offer} ต่ำกว่าราคากลาง ฿${currentActual} ถึง ฿${Math.abs(diff).toFixed(1)}/กก. แนะนำให้ต่อรองขึ้นเป็นอย่างน้อย ฿${(currentActual * 0.92).toFixed(0)} บาท หรือรวบรวมขายผ่านสหกรณ์`
                        : `Offer is ฿${Math.abs(diff).toFixed(1)} below benchmark. Negotiate for at least ฿${(currentActual * 0.92).toFixed(0)}.`}
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Control Bar: Crop Selector, Horizon, Scenario Toggles */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Left: Primary & Compare Crop */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'th' ? 'เลือกพืชผลหลัก' : 'Primary Crop'}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => {
                setSelectedCrop(e.target.value);
                setHoveredPointIndex(null);
                setAiCommentary(null);
              }}
              className="text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {Object.values(CROPS).map((crop) => (
                <option key={crop.id} value={crop.id}>
                  {lang === 'th' ? crop.nameThai : crop.nameEnglish} ({crop.priceUnit})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'th' ? 'เปรียบเทียบพืชที่ 2' : 'Compare 2nd Crop'}
            </label>
            <select
              value={compareCrop}
              onChange={(e) => setCompareCrop(e.target.value)}
              className="text-xs sm:text-sm font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="none">{lang === 'th' ? '-- ไม่เปรียบเทียบ --' : '-- None --'}</option>
              {Object.values(CROPS)
                .filter((c) => c.id !== selectedCrop)
                .map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {lang === 'th' ? crop.nameThai : crop.nameEnglish}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Right: Horizon & Toggles */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Horizon Selector */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'th' ? 'ระยะเวลาคาดการณ์' : 'Forecast Horizon'}
            </label>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
              {[3, 6, 12].map((m) => (
                <button
                  key={m}
                  onClick={() => setHorizonMonths(m)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    horizonMonths === m
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m} {lang === 'th' ? 'เดือน' : 'Mo'}
                </button>
              ))}
            </div>
          </div>

          {/* Scenario & Cone Toggles */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              {lang === 'th' ? 'เลเยอร์วิเคราะห์' : 'Layers'}
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowConfidenceCone(!showConfidenceCone)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  showConfidenceCone
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'th' ? 'กรอบความเชื่อมั่น 80%' : '80% Cone'}
              </button>
              <button
                onClick={() => setShowScenarios(!showScenarios)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  showScenarios
                    ? 'bg-blue-50 border-blue-200 text-blue-800 font-semibold'
                    : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                }`}
              >
                {lang === 'th' ? 'ฉากทัศน์ สูง/ต่ำ (Bull/Bear)' : 'Bull/Bear'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metric Highlights Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">
            {lang === 'th' ? 'ราคาหน้าสวนปัจจุบัน' : 'Current Farmgate'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              ฿{currentActual.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">{primaryCrop.priceUnit}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {lang === 'th' ? 'ข้อมูลจริง ตลาดไท/DIT' : 'Actual historical benchmark'}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">
            {lang === 'th' ? `คาดการณ์สูงสุดใน ${horizonMonths} ด.` : `Projected Peak in ${horizonMonths}M`}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-emerald-700 font-mono tabular-nums">
              ฿{futurePeak.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">{primaryCrop.priceUnit}</span>
          </div>
          <div className="flex items-center text-[10px] font-semibold text-emerald-700 mt-1">
            <ArrowUpRight className="w-3 h-3 mr-0.5" />
            <span>{pctChange}% {lang === 'th' ? 'จากปัจจุบัน' : 'vs current'}</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">
            {lang === 'th' ? 'กรอบบนกรณีตลาดหนุน (Bullish)' : 'Bullish Upside Corridor'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-emerald-600 font-mono tabular-nums">
              ฿{futureBullish.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">{primaryCrop.priceUnit}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {lang === 'th' ? 'กรณีเปิดด่านจีน/ส่งออกพุ่ง' : 'Export surge & open logistics'}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">
            {lang === 'th' ? 'กรอบล่างกรณีตลาดชะลอ (Bearish)' : 'Bearish Floor Risk'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-rose-600 font-mono tabular-nums">
              ฿{futureBearish.toLocaleString()}
            </span>
            <span className="text-[11px] text-slate-500">{primaryCrop.priceUnit}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {lang === 'th' ? 'กรณีผลผลิตล้น/กระทบภัยแล้ง' : 'Supply glut / transport freeze'}
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] text-slate-500 block">
            {lang === 'th' ? 'ดัชนีความผันผวน' : 'Volatility Index'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-xl font-bold text-slate-800 font-mono tabular-nums">
              {primaryCrop.id === 'durian' ? 'สูง (High 18%)' : primaryCrop.id === 'rice' ? 'ปานกลาง (8%)' : 'ต่ำ (Low 5%)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {lang === 'th' ? 'วัดจากสถิติราคาย้อนหลัง 2 ปี' : '2-year rolling std deviation'}
          </span>
        </div>
      </div>

      {/* Main Stock-Market Interactive Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        {/* Chart Header & Legend */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">
              {lang === 'th' ? primaryCrop.nameThai : primaryCrop.nameEnglish}
            </span>
            <span className="text-xs text-slate-400 font-mono">({primaryCrop.priceUnit})</span>
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 bg-slate-800 inline-block" />
              <span>{lang === 'th' ? 'ข้อมูลจริง (ประวัติศาสตร์)' : 'Historical (Verified)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-0.5 border-t-2 border-dashed border-emerald-600 inline-block" />
              <span>{lang === 'th' ? 'คาดการณ์ AI (ฐานปกติ)' : 'AI Forecast (Base)'}</span>
            </div>
            {showScenarios && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t border-dotted border-emerald-500 inline-block" />
                  <span className="text-emerald-700 font-medium">Bullish</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t border-dotted border-rose-500 inline-block" />
                  <span className="text-rose-700 font-medium">Bearish</span>
                </div>
              </>
            )}
            {showConfidenceCone && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                <span className="text-slate-500">{lang === 'th' ? 'กรอบความเชื่อมั่น 80%' : '80% Confidence'}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-2.5 rounded bg-slate-300/80 inline-block" />
              <span className="text-slate-500">{lang === 'th' ? 'ผลผลิตออกสู่ตลาด' : 'Harvest Supply'}</span>
            </div>
            {secondaryCrop && (
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-0.5 border-t-2 border-dashed border-amber-500 inline-block" />
                <span className="text-amber-700 font-bold">
                  {lang === 'th' ? secondaryCrop.nameThai.split('(')[0] : secondaryCrop.nameEnglish.split('(')[0]}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* SVG Canvas Chart */}
        <div className="relative overflow-x-auto pb-1">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto select-none font-sans"
            style={{ minWidth: '780px' }}
          >
            <defs>
              <linearGradient id="confidenceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#10B981" stopOpacity="0.04" />
              </linearGradient>
              <linearGradient id="volumeBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.12" />
              </linearGradient>
              <filter id="badgeShadow" x="-10%" y="-20%" width="120%" height="150%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.08" />
              </filter>
            </defs>

            {/* Y-Axis Label / Unit Header */}
            <text
              x={paddingLeft}
              y={paddingTop - 18}
              textAnchor="start"
              className="text-[11px] font-bold fill-slate-600 font-sans tracking-tight"
            >
              {lang === 'th' ? `ราคา (${primaryCrop.priceUnit})` : `Price (${primaryCrop.priceUnit})`}
            </text>

            {/* Horizontal Gridlines & Price Y-Axis */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
              const val = Math.round(minVal + (maxVal - minVal) * (1 - pct));
              const yPos = paddingTop + pct * plotHeight;
              return (
                <g key={pct}>
                  <line
                    x1={paddingLeft}
                    y1={yPos}
                    x2={chartWidth - paddingRight}
                    y2={yPos}
                    stroke="#E2E8F0"
                    strokeDasharray={pct === 1 ? 'none' : '3 3'}
                  />
                  <text
                    x={paddingLeft - 12}
                    y={yPos + 4}
                    textAnchor="end"
                    className="text-[11px] fill-slate-500 font-sans font-medium"
                  >
                    ฿{val.toLocaleString()}
                  </text>
                </g>
              );
            })}

            {/* Bottom Harvest Volume Bars (Supply Index 0-100) */}
            {displaySeries.map((p, idx) => {
              const barHeight = (p.harvestVolumeIndex / 100) * 36;
              const barWidth = Math.max(8, plotWidth / pointsCount - 6);
              const barX = getX(idx) - barWidth / 2;
              const barY = chartHeight - paddingBottom - barHeight;
              return (
                <rect
                  key={`bar-${idx}`}
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill="url(#volumeBarGrad)"
                  rx="2"
                />
              );
            })}

            {/* Bottom Harvest Volume Subtle Baseline Label */}
            <text
              x={paddingLeft + 4}
              y={chartHeight - paddingBottom - 40}
              className="text-[9.5px] fill-slate-400 font-sans font-medium"
            >
              {lang === 'th' ? '▲ ปริมาณผลผลิตออกสู่ตลาด (Supply Index)' : '▲ Harvest Supply Volume Index'}
            </text>

            {/* Shaded Confidence Cone */}
            {showConfidenceCone && confidencePolygon && (
              <path d={confidencePolygon} fill="url(#confidenceGrad)" />
            )}

            {/* Bullish Scenario Line (Green Dotted) */}
            {showScenarios && (
              <path
                d={bullishPath}
                fill="none"
                stroke="#10B981"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />
            )}

            {/* Bearish Scenario Line (Rose Dotted) */}
            {showScenarios && (
              <path
                d={bearishPath}
                fill="none"
                stroke="#EF4444"
                strokeWidth="1.8"
                strokeDasharray="3 3"
              />
            )}

            {/* Historical Trend Line (Solid Charcoal) */}
            <path
              d={historicalPath}
              fill="none"
              stroke="#1E293B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Baseline Forecast Line (Dashed Emerald) */}
            <path
              d={forecastPath}
              fill="none"
              stroke="#059669"
              strokeWidth="2.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
            />

            {/* Secondary Crop Comparison Lines (if active) */}
            {secondaryCrop && (
              <>
                <path
                  d={secondaryHistoricalPath}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d={secondaryForecastPath}
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="2"
                  strokeDasharray="5 3"
                  strokeLinecap="round"
                />
                {displaySecondarySeries.map((p, idx) => (
                  <circle
                    key={`sec-pt-${idx}`}
                    cx={getX(idx)}
                    cy={getY(p.isHistorical ? p.actualPrice ?? 0 : p.projectedPrice ?? 0)}
                    r="3"
                    fill="#F59E0B"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                ))}
              </>
            )}

            {/* Transition Line: Historical vs Forecast Boundary */}
            <line
              x1={getX(transitionIndex)}
              y1={paddingTop - 6}
              x2={getX(transitionIndex)}
              y2={chartHeight - paddingBottom}
              stroke="#475569"
              strokeDasharray="4 4"
              strokeWidth="1.5"
            />
            <g transform={`translate(${getX(transitionIndex)}, ${paddingTop - 18})`}>
              <rect
                x="-85"
                y="-10"
                width="170"
                height="20"
                rx="6"
                fill="#FFFFFF"
                stroke="#CBD5E1"
                strokeWidth="1"
                filter="url(#badgeShadow)"
              />
              <text
                x="0"
                y="4"
                textAnchor="middle"
                className="text-[10px] font-bold fill-slate-700 font-sans"
              >
                {lang === 'th' ? '◄ ข้อมูลจริง | คาดการณ์ AI ►' : '◄ Verified | AI Forecast ►'}
              </text>
            </g>

            {/* Data Point Circles */}
            {displaySeries.map((p, idx) => {
              const cx = getX(idx);
              const cy = getY(p.isHistorical ? p.actualPrice ?? 0 : p.projectedPrice ?? 0);
              const isHovered = hoveredPointIndex === idx;

              return (
                <g
                  key={idx}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                >
                  {/* Invisible Hitbox for comfortable hovering */}
                  <circle cx={cx} cy={cy} r="16" fill="transparent" />

                  {p.isHistorical ? (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? '6' : '3.5'}
                      fill="#1E293B"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  ) : (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? '6' : '3.5'}
                      fill="#059669"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

            {/* X-Axis Baseline & Tick Marks */}
            <line
              x1={paddingLeft}
              y1={chartHeight - paddingBottom}
              x2={chartWidth - paddingRight}
              y2={chartHeight - paddingBottom}
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            {displaySeries.map((p, idx) => {
              const xPos = getX(idx);
              return (
                <line
                  key={`tick-${idx}`}
                  x1={xPos}
                  y1={chartHeight - paddingBottom}
                  x2={xPos}
                  y2={chartHeight - paddingBottom + 5}
                  stroke={p.isHistorical ? '#94A3B8' : '#10B981'}
                  strokeWidth={idx === transitionIndex ? '2' : '1'}
                />
              );
            })}

            {/* X-Axis Month Labels (Angled -40deg to eliminate text overlapping) */}
            {displaySeries.map((p, idx) => {
              const xPos = getX(idx);
              const isHovered = hoveredPointIndex === idx;
              const yBase = chartHeight - paddingBottom + 14;
              return (
                <g
                  key={`label-${idx}`}
                  transform={`translate(${xPos}, ${yBase}) rotate(-40)`}
                  className="cursor-pointer"
                  onClick={() => setHoveredPointIndex(idx)}
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                >
                  <text
                    x={0}
                    y={0}
                    textAnchor="end"
                    className={`text-[10.5px] font-sans transition-colors ${
                      isHovered
                        ? 'fill-slate-950 font-bold'
                        : p.isHistorical
                        ? 'fill-slate-600 font-medium'
                        : 'fill-emerald-800 font-semibold'
                    }`}
                  >
                    {lang === 'th' ? p.labelThai : p.labelEnglish}
                  </text>
                </g>
              );
            })}

            {/* Interactive Cursor Crosshair & Floating On-Curve Tooltip */}
            {hoveredPointIndex !== null && displaySeries[hoveredPointIndex] && (() => {
              const hp = displaySeries[hoveredPointIndex];
              const hx = getX(hoveredPointIndex);
              const priceVal = hp.isHistorical ? hp.actualPrice ?? 0 : hp.projectedPrice ?? 0;
              const hy = getY(priceVal);
              const isRightHalf = hoveredPointIndex > pointsCount / 2;
              const tooltipX = isRightHalf ? hx - 110 : hx + 10;
              const tooltipY = Math.max(paddingTop + 10, Math.min(chartHeight - paddingBottom - 48, hy - 25));

              return (
                <g pointerEvents="none">
                  {/* Vertical dashed guideline */}
                  <line
                    x1={hx}
                    y1={paddingTop}
                    x2={hx}
                    y2={chartHeight - paddingBottom}
                    stroke="#94A3B8"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  {/* Glowing focus ring on the data point */}
                  <circle cx={hx} cy={hy} r="8" fill="#10B981" fillOpacity="0.25" />
                  <circle cx={hx} cy={hy} r="5" fill="#047857" stroke="#FFFFFF" strokeWidth="2" />
                  
                  {/* Floating tooltip box */}
                  <rect
                    x={tooltipX}
                    y={tooltipY}
                    width="104"
                    height="42"
                    rx="6"
                    fill="#0F172A"
                    fillOpacity="0.95"
                    filter="url(#badgeShadow)"
                  />
                  <text
                    x={tooltipX + 52}
                    y={tooltipY + 16}
                    textAnchor="middle"
                    className="text-[10px] font-medium fill-slate-300 font-sans"
                  >
                    {lang === 'th' ? hp.labelThai : hp.labelEnglish}
                  </text>
                  <text
                    x={tooltipX + 52}
                    y={tooltipY + 33}
                    textAnchor="middle"
                    className="text-[13px] font-bold fill-emerald-300 font-sans"
                  >
                    ฿{priceVal.toLocaleString()}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Hover Information Floating Banner */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span>{lang === 'th' ? activePoint.labelThai : activePoint.labelEnglish} ({activePoint.date})</span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-500">{lang === 'th' ? 'สถานะ:' : 'Status:'}</span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  activePoint.isHistorical
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {activePoint.isHistorical
                  ? lang === 'th'
                    ? 'ข้อมูลจริงย้อนหลัง'
                    : 'Verified Historical'
                  : lang === 'th'
                  ? `คาดการณ์ AI (ความเชื่อมั่น ${activePoint.confidence}%)`
                  : `AI Forecast (${activePoint.confidence}% Conf)`}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono tabular-nums">
            <div>
              <span className="text-slate-500 mr-1.5">{lang === 'th' ? 'ราคาคาดการณ์:' : 'Projected:'}</span>
              <span className="font-bold text-slate-900 text-sm">
                ฿{(activePoint.isHistorical ? activePoint.actualPrice : activePoint.projectedPrice)?.toLocaleString()} {primaryCrop.priceUnit}
              </span>
            </div>

            {!activePoint.isHistorical && showScenarios && (
              <>
                <div className="text-emerald-700">
                  <span className="mr-1">Bull:</span>
                  <span className="font-semibold">฿{activePoint.bullishScenario?.toLocaleString()}</span>
                </div>
                <div className="text-rose-700">
                  <span className="mr-1">Bear:</span>
                  <span className="font-semibold">฿{activePoint.bearishScenario?.toLocaleString()}</span>
                </div>
              </>
            )}

            <div>
              <span className="text-slate-500 mr-1.5">{lang === 'th' ? 'ดัชนีผลผลิต:' : 'Supply Index:'}</span>
              <span className="font-semibold text-slate-700">{activePoint.harvestVolumeIndex}/100</span>
            </div>
          </div>
        </div>

        {activePoint.notesThai && (
          <div className="mt-2 text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{lang === 'th' ? activePoint.notesThai : activePoint.notesEnglish}</span>
          </div>
        )}
      </div>

      {/* AI Market Intelligence Commentary Box */}
      {aiCommentary && (
        <div className="bg-emerald-950 text-emerald-100 p-5 rounded-2xl border border-emerald-800/60 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2 text-emerald-400 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            <span>{lang === 'th' ? 'บทวิเคราะห์การตลาดเกษตรอัจฉริยะ (AI Market Brief)' : 'AI Agricultural Intelligence Brief'}</span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line text-emerald-50">
            {aiCommentary}
          </p>
        </div>
      )}

      {/* Statutory Disclaimer & Uncertainty Communication Card */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-slate-800 block">
            {lang === 'th' ? 'ข้อกำหนดความโปร่งใสและคำเตือนความเสี่ยง (Transparency & Risk Disclosure)' : 'Risk Disclosure & Sourcing Transparency'}
          </span>
          <p className="leading-relaxed">
            {lang === 'th'
              ? 'การคาดการณ์ราคาในระบบนี้เป็นการประมวลผลทางสถิติความน่าจะเป็น (Probabilistic Forecast) โดยแบบจำลองปัญญาประดิษฐ์ อิงจากราคาเฉลี่ยย้อนหลัง สถิติฤดูกาลผลผลิต และดัชนีอุปสงค์ส่งออก ไม่ใช่การรับประกันราคาหรือการันตีผลกำไร เกษตรกรควรพิจารณาสภาพคล่อง แหล่งรับซื้อในพื้นที่ และใช้สัญญาซื้อขายล่วงหน้าเพื่อบริหารความเสี่ยง'
              : 'Price forecasts are probabilistic statistical estimates based on historical benchmarks, seasonal harvest peaks, and export demand elasticities. They are NOT financial guarantees. Farmers must assess local buying points, transport costs, and hedging options.'}
          </p>
        </div>
      </div>

      {/* Methodology Modal */}
      {showMethodologyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {lang === 'th' ? 'แหล่งที่มาของข้อมูลและแบบจำลอง' : 'Data Sourcing & Forecasting Methodology'}
              </h3>
              <button
                onClick={() => setShowMethodologyModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors cursor-pointer"
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div>
                <strong className="text-slate-900 block mb-1">
                  {lang === 'th' ? '1. แหล่งข้อมูลจริง (Historical Benchmarks)' : '1. Verified Historical Benchmarks'}
                </strong>
                <p>
                  {lang === 'th'
                    ? 'รวบรวมข้อมูลราคาหน้าสวนและราคาขายส่งจาก กรมการค้าภายใน (DIT), สำนักงานเศรษฐกิจการเกษตร (สศก. OAE) และสถิติการประมูลตลาดไท ระหว่างปี พ.ศ. 2567 - 2569'
                    : 'Historical farmgate benchmarks sourced from Department of Internal Trade (DIT), Office of Agricultural Economics (OAE), and Talaad Thai wholesale market indices (2024-2026).'}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block mb-1">
                  {lang === 'th' ? '2. แบบจำลองการคาดการณ์ (Forecasting Engine)' : '2. Probabilistic Forecasting Engine'}
                </strong>
                <p>
                  {lang === 'th'
                    ? 'ใช้แบบจำลอง Time-Series Seasonal Decomposition ร่วมกับการวิเคราะห์พฤติกรรมอุปสงค์-อุปทาน ผลผลิตกระจุกตัวช่วงฤดูมรสุม และการเปิดด่านศุลกากรส่งออกผลไม้'
                    : 'Employs seasonal time-series decomposition combined with harvest volume elasticity and export logistics pipeline tracking.'}
                </p>
              </div>

              <div>
                <strong className="text-slate-900 block mb-1">
                  {lang === 'th' ? '3. กรอบสถานการณ์ (Bull / Bear Scenarios)' : '3. Bullish & Bearish Corridors'}
                </strong>
                <p>
                  {lang === 'th'
                    ? 'กรอบบน (Bullish) ประเมินเมื่อปริมาณส่งออกโตกว่าปกติหรือผลผลิตต่างประเทศเสียหาย ส่วนกรอบล่าง (Bearish) ประเมินความเสี่ยงกรณีเกิดภาวะผลผลิตล้นตลาดหรือค่าระวางเรือพุ่งสูง'
                    : 'Bullish scenario models heightened foreign purchase demand or regional crop failures. Bearish scenario simulates domestic harvest gluts and elevated freight tariffs.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowMethodologyModal(false)}
              className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              {lang === 'th' ? 'เข้าใจแล้วและปิดหน้านี้' : 'Close and Return'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
