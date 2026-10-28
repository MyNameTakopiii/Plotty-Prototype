# KasetThai AI (เกษตรไทย AI) — Smart Agriculture & Crop Price Forecasting Platform

An AI-powered, bilingual (Thai & English) smart agricultural decision platform for Thai farmers. It bridges precision agronomy, Thai land laws, stock-market-style crop price forecasting, and interactive 3D farm growth simulation into an accessible, mobile-first experience.

***

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product decisions were confirmed through Phase 1 clarification:
> - **Crop Price Forecasting Chart**: Interactive stock-market-style clean line chart with shaded confidence cones (80% probability bounds) and distinct Bullish vs. Bearish scenario corridors.
> - **Forecasting Time Horizon**: Monthly projections spanning 3, 6, and 12 months aligned with Thai seasonal harvest peaks and monsoon cycles.
> - **Multi-Crop Price Comparison**: Side-by-side comparative price forecasting allowing farmers to evaluate economic switching or intercropping (e.g., Jasmine Rice vs. Cassava, or Durian vs. Mango).
> - **Uncertainty & Fact Demarcation**: Solid visual separation between verified historical market facts (Talaad Thai / DIT / OAE) and dashed/shaded AI projections, with statutory disclaimers that forecasts are probabilistic estimates and not guaranteed profits.
> - **3D Farm Simulator**: Three.js WebGL visualizer with 1-to-10 year timeline growth, aerial drone photo backdrop, procedural multi-part crops, and canopy/yield telemetry.
> - **Localization**: Bilingual Thai/English toggle with authentic Thai agro-economic terminology and traditional Thai land measurements (**1 ไร่ = 4 งาน = 400 ตารางวา = 1,600 ตร.ม.**).

***

## 1. Overview & Core Concept

### What It Does
KasetThai AI equips Thai smallholders, commercial growers, and agricultural cooperatives with an all-in-one planning ecosystem:
1. **AI Plant Health Diagnostic**: Upload or capture plant images to detect fungal, bacterial, viral diseases, nutrient deficiencies, and pests with confidence ratings, severity scales, and organic/chemical treatments registered with the Thai Department of Agriculture (DOA).
2. **Crop & Yield Planner**: Recommend crop varieties matching specific Thai provinces, soil classifications (clay, sandy loam, saline, laterite), and irrigation access. Generates full cost breakdown (ต้นทุนผันแปรและคงที่) and harvest timelines in Thai units (kg/ไร่).
3. **Stock-Market-Style Crop Price Forecasting**:
   - Interactive SVG/Canvas financial chart plotting 12–24 months of historical farmgate and wholesale prices (Talaad Thai, DIT, OAE).
   - 3, 6, and 12-month forward predictive trajectory with shaded confidence bands.
   - Bullish scenario (export demand surge, Chinese border logistics open, lower regional supply) vs. Bearish scenario (oversupply peak, drought impact, export tariffs).
   - Seasonal harvest volume bar overlay highlighting market gluts and supply dips.
   - Dual-crop comparator to evaluate market momentum between competing crops.
4. **Thai Agricultural Law & Program Assistant**: Grounded conversational assistant addressing **ส.ป.ก. 4-01** rights, lease transfers to legitimate heirs, **โฉนดที่ดิน น.ส.4**, **น.ส.3 ก**, BAAC (ธ.ก.ส.) low-interest loans, and crop insurance subsidies with official source citations.
5. **Interactive 3D Farm Growth Simulator (0–10 Years)**: Convert land dimensions into a 3D procedural farm model. Scrub a timeline slider to watch saplings expand into mature fruit-bearing canopies over 3, 5, and 10 years with real-time canopy radius, root depth, and cumulative yield readouts.
6. **Farm Decision Support**: Multi-scenario economic model synthesizing yield predictions, production expenses, and price forecasts to calculate expected net profit per Rai, payback periods, and climate resilience scores.

### Target Persona
- **Thai Smallholders & Commercial Growers**: Planning annual crop rotations or permanent orchard investments.
- **Young Smart Farmers (YSF)**: Tech-savvy agriculturalists seeking financial analytics, risk hedging, and spatial farm layout visualization.
- **Agricultural Cooperatives & Extension Officers**: Advising farmers on market timing to avoid price troughs during peak harvest gluts.

***

## 2. User Experience & Visual Design

### Key User Flows
1. **Stock-Market Crop Price Forecasting Flow**:
   - Navigate to **"แนวโน้มราคาพืชผล" (Crop Price Trends)**.
   - Select primary crop (e.g. Monthong Durian / Jasmine Rice / Cassava) and market grade (Grade A / Export / Factory Gate).
   - View historical trend (solid line) transitioning into a 3/6/12-month forward forecast (dashed center line with shaded confidence cone).
   - Toggle **"Bullish / Bearish Scenarios"** to see price corridors under favorable vs. stressed market conditions.
   - Click **"Compare Crop"** to overlay a second commodity (e.g. Nam Dok Mai Mango) and inspect historical correlation and margin spread.
   - Review transparent "Data Sources & Methodology" card citing DIT (กรมการค้าภายใน) and OAE (สศก.) with prominent non-guarantee disclaimer.
2. **Plant Health Scanner Flow**:
   - Tap "ถ่ายภาพ/อัปโหลดใบพืช" (Take Photo / Upload Leaf).
   - Quick-load pre-tested samples (Durian Phytophthora, Rice Blast, Cassava Mosaic Virus, Palm Leaf Spot) for instant demonstration.
   - View diagnosis summary: Disease Name (TH/EN), AI Confidence %, Severity Meter, Symptoms, DOA-approved Organic/Chemical Controls, and Cultural Prevention.
3. **3D Farm Timeline Simulator Flow**:
   - Set plot area (e.g. 6 ไร่ 2 งาน) and select crop arrangement (e.g. Durian + Perimeter Rubber + Irrigation Pond).
   - Switch between **Aerial Drone Backdrop** and **Contoured Soil Terrain**.
   - Drag timeline slider across **Year 0 → Year 1 → Year 3 → Year 5 → Year 10**.
   - Observe procedural 3D trees growing in scale, foliage density, and fruit-bearing nodes, while dynamic bottom HUD updates canopy spread (meters) and projected yield (kg/rai/year).
4. **Crop & Yield Planner + Decision Support Flow**:
   - Select province, water source, and soil characteristics.
   - Compare 3 scenarios: *Monoculture Rice* vs. *High-Value Durian Orchard* vs. *Drought-Tolerant Cassava*.
   - View side-by-side ROI metrics: Capital Expenditure (Capex), Operating Cost/Rai (Opex), Projected Net Revenue, Water Stress Risk, and Breakeven Horizon.
5. **Agricultural Legal & Subsidy Advisor Flow**:
   - Ask questions regarding agricultural land code, transfer to direct heirs under Land Reform Act, or disaster compensation.
   - Receive verified responses with statutory citations and a clear prompt to verify with local land officers (สำนักงานที่ดิน / ส.ป.ก. จังหวัด).

### Visual Identity & Theme
- **Style Direction**: *Thai Precision Agritech* — clean, utilitarian, high-contrast, designed for rapid scannability in direct daylight.
- **Color Discipline (60-30-10)**:
  - 60% Canvas: Neutral Slate (`#F8FAFC` light / `#0B0F17` dark-ready).
  - 30% Structural Surfaces: Pure white cards with hairline borders (`#E2E8F0`).
  - 10% Accent Palette:
    - Paddy Emerald Green (`#059669` / `#10B981`): Bullish prices, healthy plants, primary actions.
    - Crimson Rust (`#DC2626`): Bearish price corridor, high-risk disease alerts.
    - Deep Amber (`#D97706`): Moderate confidence, baseline forecast path.
- **Typography**:
  - Contemporary sans pairings with comprehensive Thai glyph coverage.
  - Tabular numerals (`tabular-nums font-mono`) for all prices, coordinates, dates, and Rai area measurements.
- **Zero-Slop Discipline**:
  - No fake AI scores or arbitrary innovation percentages.
  - No static pill capsules; clean inline metadata with `·` separators.
  - Collapsible bottom control dock for 3D simulator to keep center viewport 100% unobstructed.

***

## 3. Key Technical Decisions & Trade-Offs

1. **Interactive Financial Chart Implementation**:
   - *Chosen Approach*: High-performance interactive SVG/Canvas chart with smooth tooltips, scrubbing crosshairs, shaded confidence cone paths, and scenario corridors.
   - *Why*: Delivers a clean, responsive, financial-terminal-grade experience without heavy external charting library bloat, ensuring zero latency on mobile devices.
2. **Procedural Three.js 3D Engine**:
   - *Chosen Approach*: Multi-part procedural geometries (`THREE.Group` with 4–8 distinct meshes: bark trunks, branch nodes, layered foliage discs, and fruit clusters) rendered with studio PBR materials (`MeshStandardMaterial`), soft shadow maps, and horizon fog.
   - *Why*: Zero external 3D asset downloads, avoiding 404 network failures and allowing real-time parametric scaling across the 1–10 year timeline.
3. **Server-Side Gemini 3.8 Flash Vision & Text Engine**:
   - *Chosen Approach*: Express server routes (`/api/plant-health`, `/api/crop-forecast`, `/api/legal-advisor`) utilizing the `@google/genai` SDK with strict JSON schemas.
   - *Why*: Keeps API keys secure on the backend, guarantees structured JSON output, and enables graceful fallback data if network access is restricted.
4. **Transparent Distinction: Real Data vs. AI Projections**:
   - *Chosen Approach*: Distinct graphical markers (solid vs. dashed lines, labeled confidence bands) and explicit sourcing badges (e.g. `[ข้อมูลจริงจาก กรมการค้าภายใน]` vs. `[คาดการณ์โดย AI - ความเชื่อมั่น 82%]`).

***

## 4. Technical Architecture & Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       KasetThai AI Client (React 19)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Top Bar (Wordmark · Thai/English Toggle · Active Province · Land Units)    │
├───────────────────┬──────────────────────┬────────────────┬─────────────────┤
│ [1] Plant Health  │ [2] Stock-Market     │ [3] Crop &     │ [4] Legal & Gov │
│     Diagnostic AI │     Price Forecast   │     Yield Plan │     Advisor     │
├───────────────────┴──────────────────────┴────────────────┴─────────────────┤
│             [5] 3D Farm Growth Simulator (Three.js WebGL Engine)            │
│  - Aerial Drone Map Backdrop · 0–10 Yr Growth Slider · Procedural Flora     │
│  - Canopy Radius Telemetry · Projected Yield Maturation Meter               │
├─────────────────────────────────────────────────────────────────────────────┤
│             [6] Farm Decision Support & Multi-Scenario ROI Matrix           │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP API Calls (Proxy Routes)
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Node.js / Express Server                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  • /api/plant-health/analyze   --> Multimodal Vision Disease Diagnostic     │
│  • /api/price-forecast/query   --> Historical Benchmark + Forecast Models  │
│  • /api/legal-advisor/query    --> Thai Agrarian Laws & Subsidies Grounding │
│  • /api/crop-planner/simulate  --> Provincial Soil & Yield Calculator       │
├─────────────────────────────────────────────────────────────────────────────┤
│                         @google/genai SDK Engine                            │
│                   (Model: 'gemini-3.8-flash' on Server)                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Module Breakdown
- `src/components/Navbar.tsx`: Strict 3-zone Top Bar Contract (Wordmark, Nav links, Language switch & Quick Province selector).
- `src/components/PriceForecaster.tsx`: Interactive financial chart with confidence cone, Bull/Bear corridors, 3/6/12M horizon selector, harvest volume overlay, and dual-crop comparison.
- `src/components/PlantHealthScanner.tsx`: Leaf photo uploader, quick test presets, symptom breakdown, DOA chemical/organic treatment guidelines.
- `src/components/FarmSimulator3D.tsx`: Three.js procedural 3D farm viewer, bottom collapsible dock, aerial drone map toggle, timeline slider (0–10 years), and micro-spacing metrics.
- `src/components/CropYieldPlanner.tsx`: Province/soil/water input, Thai land calculator (Rai/Ngan/Wa), seasonal calendar, and production cost analyzer.
- `src/components/AgriLegalAssistant.tsx`: Thai land law FAQ and conversational advisor with legal disclaimers and official citations.
- `src/components/DecisionSupport.tsx`: Side-by-side scenario comparison (Capex, Opex, Net Margin, Water Risk, Payback Period).
- `src/data/agriData.ts`: Comprehensive dataset of Thai crops, historical prices (2024-2026), seasonal harvest calendars, and Thai land legal statutes.
- `server.ts`: Express API server communicating with `@google/genai` SDK.

***

## 5. Execution Plan

1. **Install Dependencies**: Install `three` and `@types/three` for the WebGL 3D farm engine.
2. **Server Architecture**: Set up `server.ts` with Gemini API integration for vision diagnostics, price forecasting commentary, and legal advice.
3. **Data Layer**: Build Thai agro-economic dataset (crop varieties, historical price series, seasonal harvest peaks, land laws).
4. **Interactive Views**: Implement the stock-market price forecasting module, plant health scanner, 3D farm simulator, and decision support matrix.
5. **Verification**: Run `compile_applet` and verify all flows and event handlers end-to-end.
