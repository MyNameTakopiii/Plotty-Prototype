/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { InteractiveLandBoundaryPicker } from './InteractiveLandBoundaryPicker';
import { CROPS, LAND_MAP_PRESETS, LandMapPreset, raiNganWaToSqm, sqmToString } from '../data/agriData';
import {
  Upload,
  Layers,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Maximize2,
  Minimize2,
  Calendar,
  Compass,
  Droplets,
  Trees,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
  Play,
  Pause,
  Share2,
  Copy,
  Check,
  X,
  ShieldCheck,
  MapPin,
  Box,
  HeartPulse,
  Activity,
  ZoomIn,
  ZoomOut,
  Target,
  EyeOff,
  Focus,
  Waves,
  Navigation,
  Smartphone,
  Sprout,
  SlidersHorizontal,
} from 'lucide-react';

export interface Plot3DInfo {
  plotId?: string;
  cropId: string;
  areaRai: number;
  treeCount?: number;
  name: string;
  treeAgeYears?: number;
  healthScore?: number;
}

interface FarmSimulator3DProps {
  lang: 'th' | 'en';
  initialPlot?: Plot3DInfo | null;
}

export const FarmSimulator3D: React.FC<FarmSimulator3DProps> = ({ lang, initialPlot }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab State: '3d' Digital Twin vs 'pin_mapping' Satellite Tap-to-Pin
  const [simulatorTab, setSimulatorTab] = useState<'3d' | 'pin_mapping'>('3d');

  // Simulation & Crop State
  const [selectedCrop, setSelectedCrop] = useState<string>(initialPlot?.cropId || 'mango_namdokmai');
  const [pendingCrop, setPendingCrop] = useState<string>(initialPlot?.cropId || 'mango_namdokmai');
  const [timelineYear, setTimelineYear] = useState<number>(initialPlot?.treeAgeYears ? (initialPlot.treeAgeYears >= 8 ? 10 : initialPlot.treeAgeYears >= 5 ? 5 : 1) : 5);
  const [plotAreaRai, setPlotAreaRai] = useState<number>(initialPlot?.areaRai || 70);
  const [plotAreaNgan, setPlotAreaNgan] = useState<number>(0);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasSimulated, setHasSimulated] = useState<boolean>(true);
  const [showFruits, setShowFruits] = useState<boolean>(true); // Toggle to show/hide 3D fruits
  const [show5GNodes, setShow5GNodes] = useState<boolean>(true); // Smart IoT Overlay
  const [selected5GNode, setSelected5GNode] = useState<'node-1' | 'node-2' | 'node-3'>('node-1');
  const [satelliteLayer, setSatelliteLayer] = useState<'normal' | 'ndvi' | 'ndwi'>('normal'); // Satellite AI NDVI/NDWI Heatmaps

  // Crisis Scenarios & 3D Defense State (Flooding & Drought)
  const [riskScenario, setRiskScenario] = useState<'normal' | 'flood' | 'drought'>('normal');
  const [hasFloodDefense, setHasFloodDefense] = useState<boolean>(false);
  const [hasDroughtDefense, setHasDroughtDefense] = useState<boolean>(false);

  // Mobile Ergonomic View & Fullscreen State
  const [isFullscreen3D, setIsFullscreen3D] = useState<boolean>(false);
  const [activeMobileStep, setActiveMobileStep] = useState<'3d_viewer' | 'upload_2d' | 'select_crop' | 'disaster'>('3d_viewer');
  const [showMobileSpecBadge, setShowMobileSpecBadge] = useState<boolean>(false);
  const [showMobileQuickTools, setShowMobileQuickTools] = useState<boolean>(false);

  const handleZoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const target = controlsRef.current.target;
    const cam = cameraRef.current;
    const dir = new THREE.Vector3().subVectors(target, cam.position);
    if (dir.length() > 1.2) {
      cam.position.addScaledVector(dir, 0.25);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const target = controlsRef.current.target;
    const cam = cameraRef.current;
    const dir = new THREE.Vector3().subVectors(cam.position, target);
    if (dir.length() < 48) {
      cam.position.addScaledVector(dir.normalize(), 3.5);
      controlsRef.current.update();
    }
  };

  // 3D Tree Selection & Interactive Inspection State
  interface InspectedTreeInfo {
    id: string;
    row: number;
    col: number;
    varietyTh: string;
    varietyEn: string;
    varietyId: string;
    ageYears: number;
    canopyDiameterM: number;
    heightM: number;
    fruitCount: number;
    baggedRatioPct: number;
    healthScore: number;
    chlorophyllIndex: number; // NDVI 0-1
    soilMoisturePct: number;
    estimatedValueThb: number; // Asset appraisal value for BAAC
    posX: number;
    posZ: number;
  }
  const [inspectedTree, setInspectedTree] = useState<InspectedTreeInfo | null>(null);
  const selectionRingRef = useRef<THREE.Mesh | null>(null);

  // Demo Mode 3D Action Listener
  useEffect(() => {
    const handleDemoAction = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.action === 'set_3d_satellite') {
        setSatelliteLayer(customEvent.detail.layer || 'ndvi');
      } else if (customEvent.detail?.action === 'set_3d_year') {
        setTimelineYear(customEvent.detail.year || 5);
      }
    };
    window.addEventListener('kasetthai_demo_action', handleDemoAction);
    return () => window.removeEventListener('kasetthai_demo_action', handleDemoAction);
  }, []);

  // Listen for initialPlot prop changes (Plots A, B, C selection from Dashboard)
  useEffect(() => {
    if (initialPlot) {
      if (initialPlot.cropId) {
        setSelectedCrop(initialPlot.cropId);
        setPendingCrop(initialPlot.cropId);
      }
      if (initialPlot.areaRai) {
        setPlotAreaRai(initialPlot.areaRai);
      }
      if (initialPlot.treeAgeYears !== undefined) {
        setTimelineYear(initialPlot.treeAgeYears >= 8 ? 10 : initialPlot.treeAgeYears >= 5 ? 5 : 1);
      }
      if (initialPlot.name) {
        setUploadedImageName(`ภาพถ่ายแปลง: ${initialPlot.name}`);
      }
      if (initialPlot.plotId === 'plot_c') {
        setSelected5GNode('node-1');
      }
      setHasSimulated(true);
      setActiveMobileStep('3d_viewer');
    }
  }, [initialPlot]);
  
  // 2D to 3D Conversion State
  const [uploaded2DImage, setUploaded2DImage] = useState<string | null>(null);
  const [uploadedImageName, setUploadedImageName] = useState<string>(
    initialPlot ? `ภาพถ่ายแปลง: ${initialPlot.name}` : 'ภาพถ่ายโดรนสวนมะม่วง อ.บางคล้า จ.ฉะเชิงเทรา 25 ไร่'
  );
  const [activePresetId, setActivePresetId] = useState<string>('chachoengsao_mango_drone');
  const [show2DInspector, setShow2DInspector] = useState<boolean>(false);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [copied3DLink, setCopied3DLink] = useState<boolean>(false);

  const handleShare3DFarm = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied3DLink(true);
      setTimeout(() => setCopied3DLink(false), 3000);
    }
  };

  // Three.js internal refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const plantGroupRef = useRef<THREE.Group | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const floodWaterMeshRef = useRef<THREE.Mesh | null>(null);
  const dykesGroupRef = useRef<THREE.Group | null>(null);
  const irrigationGroupRef = useRef<THREE.Group | null>(null);
  const iotNodesGroupRef = useRef<THREE.Group | null>(null);
  const orchardLandscapeRef = useRef<THREE.Group | null>(null);
  const waterCanalMeshesRef = useRef<THREE.Mesh[]>([]);
  const targetCamPosRef = useRef<THREE.Vector3 | null>(null);
  const targetCamLookAtRef = useRef<THREE.Vector3 | null>(null);
  const [xrayIsolation, setXrayIsolation] = useState<boolean>(true);
  const [cameraViewAngle, setCameraViewAngle] = useState<'canopy' | 'fruits' | 'trunk'>('canopy');
  const [isAutoOrbiting, setIsAutoOrbiting] = useState<boolean>(false);
  const isAutoOrbitingRef = useRef<boolean>(false);

  const crop = CROPS[selectedCrop] || CROPS.mango_namdokmai;
  const totalSqm = raiNganWaToSqm(plotAreaRai, plotAreaNgan, 0);

  // Compute planting telemetry based on land & crop
  const treeDensityPerRai = crop.treesPerRai || 25;
  const totalTrees = crop.id === 'rice' ? 0 : Math.round(plotAreaRai * treeDensityPerRai);
  
  // Growth ratio calculation: Year 0 = 0.2, Year 1 = 0.4, Year 3 = 0.7, Year 5 = 0.9, Year 10 = 1.15
  const growthScale =
    timelineYear === 0 ? 0.2 :
    timelineYear === 1 ? 0.4 :
    timelineYear === 3 ? 0.7 :
    timelineYear === 5 ? 0.9 : 1.15;

  const yieldMaturationRatio =
    timelineYear < crop.yearsToFirstHarvest
      ? 0
      : Math.min(1, (timelineYear - crop.yearsToFirstHarvest + 1) / (crop.yearsToFirstHarvest * 0.8 || 1));

  // Risk & Defense Yield Multiplier
  const isPlantDistressed =
    (riskScenario === 'flood' && !hasFloodDefense) ||
    (riskScenario === 'drought' && !hasDroughtDefense);

  const yieldRiskMultiplier =
    riskScenario === 'flood'
      ? hasFloodDefense ? 0.95 : 0.25 // Flood with dykes preserves 95% of crop; without defense drops to 25%
      : riskScenario === 'drought'
      ? hasDroughtDefense ? 0.95 : 0.35 // Drought with swale/drip preserves 95%; without drops to 35%
      : 1.0;

  const rawHarvestTons =
    crop.id === 'rice'
      ? (crop.avgYieldPerRaiKg * plotAreaRai) / 1000
      : (crop.avgYieldPerRaiKg * plotAreaRai * yieldMaturationRatio) / 1000;

  const projectedHarvestTons = (rawHarvestTons * yieldRiskMultiplier).toFixed(1);

  const canopyDiameterMeters =
    crop.id.startsWith('mango') ? (growthScale * 5.5).toFixed(1) :
    crop.id === 'rubber' ? (growthScale * 5.0).toFixed(1) :
    crop.id === 'oilpalm' ? (growthScale * 8.0).toFixed(1) :
    crop.id === 'mango' ? (growthScale * 5.5).toFixed(1) :
    crop.id === 'cassava' ? (growthScale * 1.4).toFixed(1) : '0.3';

  // Auto-play timeline progression
  useEffect(() => {
    if (!isPlaying) return;
    const timelineSteps = [0, 1, 3, 5, 10];
    const timer = setInterval(() => {
      setTimelineYear((curr) => {
        const nextIdx = (timelineSteps.indexOf(curr) + 1) % timelineSteps.length;
        return timelineSteps[nextIdx];
      });
    }, 2400);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // -------------------------------------------------------------
  // Procedural 2D Drone Map Image Generator
  // -------------------------------------------------------------
  const generateProceduralDroneCanvas = (presetId: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    if (presetId === 'suphan_rice_satellite') {
      // Rice Terraces in Suphan Buri
      ctx.fillStyle = '#416335';
      ctx.fillRect(0, 0, 1024, 1024);

      // Water canals
      ctx.fillStyle = '#2d5369';
      ctx.fillRect(0, 480, 1024, 64);

      // Paddy bunds (คันนา)
      ctx.strokeStyle = '#5a4632';
      ctx.lineWidth = 14;
      for (let y = 80; y < 1000; y += 180) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(984, y);
        ctx.stroke();
      }
      for (let x = 80; x < 1000; x += 300) {
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x, 984);
        ctx.stroke();
      }
    } else if (presetId === 'korat_cassava_drone') {
      // Korat Laterite Cassava Rows
      ctx.fillStyle = '#6e543c';
      ctx.fillRect(0, 0, 1024, 1024);

      // Red laterite dirt road
      ctx.fillStyle = '#9c6644';
      ctx.fillRect(480, 0, 64, 1024);

      // Parallel planting furrows
      ctx.strokeStyle = '#543d2b';
      ctx.lineWidth = 6;
      for (let x = 60; x < 1000; x += 50) {
        if (Math.abs(x - 512) < 50) continue;
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x, 984);
        ctx.stroke();
      }
    } else {
      // Realistic Bang Khla Mango Orchard: Alluvial Loam Soil, Raised Beds & Parallel Irrigation Canals
      // 1. Rich alluvial clay-loam base
      ctx.fillStyle = '#3e2c1e';
      ctx.fillRect(0, 0, 1024, 1024);

      // Procedural fine organic soil grain & mottled humus
      for (let i = 0; i < 400; i++) {
        const rx = Math.random() * 1024;
        const ry = Math.random() * 1024;
        const rSize = 2 + Math.random() * 8;
        ctx.fillStyle = Math.random() > 0.5 ? '#4c3726' : '#2f1f13';
        ctx.beginPath();
        ctx.arc(rx, ry, rSize, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Raised Earthen Planting Beds (คันดินยกร่องสวน)
      const bedXPositions = [102, 307, 512, 717, 922];
      bedXPositions.forEach((bx) => {
        // Bed mound base
        const bedGrad = ctx.createLinearGradient(bx - 60, 0, bx + 60, 0);
        bedGrad.addColorStop(0, '#422f1f');
        bedGrad.addColorStop(0.5, '#563e29');
        bedGrad.addColorStop(1, '#422f1f');
        ctx.fillStyle = bedGrad;
        ctx.fillRect(bx - 60, 40, 120, 944);

        // Ground cover grass fringes along bed shoulders
        ctx.fillStyle = '#396024';
        for (let y = 50; y < 980; y += 14) {
          ctx.fillRect(bx - 62, y, 6, 8);
          ctx.fillRect(bx + 56, y, 6, 8);
        }

        // Compost mulch rings and drip irrigation loops under 5 tree spots
        for (let ty = 102; ty <= 922; ty += 205) {
          // Dark moist compost mulch halo
          ctx.fillStyle = '#26160c';
          ctx.beginPath();
          ctx.arc(bx, ty, 38, 0, Math.PI * 2);
          ctx.fill();

          // Drip irrigation black PE ring
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(bx, ty, 24, 0, Math.PI * 2);
          ctx.stroke();

          // Moist soil center
          ctx.fillStyle = '#1c1008';
          ctx.beginPath();
          ctx.arc(bx, ty, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 3. Parallel Irrigation Canals (คูน้ำท้องร่องสวน 4 แนว)
      const canalXPositions = [205, 410, 614, 819];
      canalXPositions.forEach((cx) => {
        // Wet muddy bank shoulders
        ctx.fillStyle = '#2b1b11';
        ctx.fillRect(cx - 36, 40, 72, 944);

        // Vetiver grass erosion buffers along canal banks
        ctx.fillStyle = '#2d6023';
        ctx.fillRect(cx - 36, 40, 8, 944);
        ctx.fillRect(cx + 28, 40, 8, 944);

        // Water channel with deep river jade / emerald gradient
        const waterGrad = ctx.createLinearGradient(cx - 26, 0, cx + 26, 0);
        waterGrad.addColorStop(0, '#154e5b');
        waterGrad.addColorStop(0.3, '#1c6877');
        waterGrad.addColorStop(0.7, '#247f91');
        waterGrad.addColorStop(1, '#154e5b');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(cx - 26, 40, 52, 944);

        // Floating water lily / duckweed clusters
        ctx.fillStyle = '#4caf50';
        for (let y = 80; y < 960; y += 75) {
          const offsetX = (Math.sin(y * 0.05) * 12);
          ctx.beginPath();
          ctx.arc(cx + offsetX, y, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Wooden crossing bridges (สะพานไม้พาดข้ามร่องสวน)
        [256, 512, 768].forEach((by) => {
          ctx.fillStyle = '#654321';
          ctx.fillRect(cx - 38, by - 6, 76, 12);
          ctx.fillStyle = '#4a2f16';
          ctx.fillRect(cx - 36, by - 4, 72, 3);
          ctx.fillRect(cx - 36, by + 1, 72, 3);
        });
      });

      // 4. Perimeter farm road & ditch
      ctx.strokeStyle = '#273822';
      ctx.lineWidth = 14;
      ctx.strokeRect(30, 30, 964, 964);

      // Farm dirt road path
      ctx.fillStyle = '#6e533b';
      ctx.fillRect(30, 502, 964, 20);
    }

    return canvas;
  };

  // Satellite AI NDVI Heatmap Generator
  const generateNdviHeatmapCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base background (low vegetation index / soil)
    ctx.fillStyle = '#f97316';
    ctx.fillRect(0, 0, 1024, 1024);

    // Healthy dense green canopy zone
    const greenGrad = ctx.createRadialGradient(512, 512, 50, 512, 512, 480);
    greenGrad.addColorStop(0, '#22c55e');
    greenGrad.addColorStop(0.65, '#16a34a');
    greenGrad.addColorStop(1, '#eab308');
    ctx.fillStyle = greenGrad;
    ctx.fillRect(60, 60, 904, 904);

    // Stressed/Low chlorophyll spot (disease/water stress indicator)
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(280, 320, 110, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  };

  // Satellite AI NDWI Water Moisture Heatmap Generator
  const generateNdwiHeatmapCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Arid dry soil background
    ctx.fillStyle = '#d97706';
    ctx.fillRect(0, 0, 1024, 1024);

    // High moisture blue zone
    const blueGrad = ctx.createRadialGradient(512, 512, 50, 512, 512, 450);
    blueGrad.addColorStop(0, '#0284c7');
    blueGrad.addColorStop(0.6, '#06b6d4');
    blueGrad.addColorStop(1, '#14b8a6');
    ctx.fillStyle = blueGrad;
    ctx.fillRect(80, 80, 864, 864);

    // High water retention canal & pond
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(0, 480, 1024, 64);

    return canvas;
  };

  // Synchronize Satellite Layer Texture on 3D Ground
  useEffect(() => {
    if (!terrainMeshRef.current) return;

    let canvas: HTMLCanvasElement;
    if (satelliteLayer === 'ndvi') {
      canvas = generateNdviHeatmapCanvas();
    } else if (satelliteLayer === 'ndwi') {
      canvas = generateNdwiHeatmapCanvas();
    } else {
      canvas = generateProceduralDroneCanvas(activePresetId);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    terrainMeshRef.current.material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.85,
    });
  }, [satelliteLayer, activePresetId]);

  // Convert canvas to base64 for initial 2D preview
  useEffect(() => {
    if (!uploaded2DImage) {
      const initialCanvas = generateProceduralDroneCanvas(activePresetId);
      setUploaded2DImage(initialCanvas.toDataURL('image/jpeg', 0.9));
    }
  }, [activePresetId, uploaded2DImage]);

  // Handle uploading custom 2D land image from user's phone / computer
  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsConverting(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setUploaded2DImage(result);
      setUploadedImageName(file.name);
      setActivePresetId('custom');

      // Update 3D ground texture with user's uploaded 2D image!
      const img = new Image();
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.needsUpdate = true;
        texture.colorSpace = THREE.SRGBColorSpace;
        if (terrainMeshRef.current) {
          terrainMeshRef.current.material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.9,
          });
        }
        setIsConverting(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Select one of the 3 realistic Thai land presets
  const handleSelectPreset = (preset: LandMapPreset) => {
    setIsConverting(true);
    setActivePresetId(preset.id);
    setSelectedCrop(preset.cropId);
    setPlotAreaRai(preset.landRai);
    setUploadedImageName(preset.titleThai);

    const canvas = generateProceduralDroneCanvas(preset.id);
    setUploaded2DImage(canvas.toDataURL('image/jpeg', 0.9));

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    if (terrainMeshRef.current) {
      terrainMeshRef.current.material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.9,
      });
    }

    setTimeout(() => {
      setIsConverting(false);
    }, 400);
  };

  // -------------------------------------------------------------
  // Procedural Realistic Mango 3D Fruit & Orchard Tree
  // Characterized by:
  // - Long pendulous thin panicle stalks hanging gracefully from canopy branches
  // - Smooth, curved kidney/obovate shape (น้ำดอกไม้ / มหาชนก) with distinctive beak (beak tip/เพรียวยาว)
  // - Golden yellow-green ripening gradient or blushing pink-orange for export varieties
  // - Broad, lush domed canopy with glossy lanceolate leaves
  // -------------------------------------------------------------
  const createMangoFruit = (fruitScale: number, isDistressed = false, variety = 'namdokmai'): THREE.Group => {
    const fruitGroup = new THREE.Group();

    // 1. Slender Mango Stalk / Panicle (ก้านช่อผลมะม่วง เรียวยาวห้อยระย้า)
    const stalkGeo = new THREE.CylinderGeometry(0.012 * fruitScale, 0.018 * fruitScale, 0.45 * fruitScale, 6);
    const stalkMat = new THREE.MeshStandardMaterial({
      color: 0x475522, // Olive green stalk
      roughness: 0.7,
    });
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    stalk.position.y = 0.22 * fruitScale;
    stalk.rotation.z = (Math.random() - 0.5) * 0.15;
    stalk.castShadow = true;
    fruitGroup.add(stalk);

    // 2. Mango Body (ผลมะม่วงน้ำดอกไม้ / มหาชนก ทรงรียาว โค้งมน มีปลายจะงอยพริ้ว)
    // Use high-resolution SphereGeometry and deform vertices along Y/X to create authentic mango curves
    const bodyGeo = new THREE.SphereGeometry(0.24 * fruitScale, 16, 16);
    const pos = bodyGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Elongate along vertical axis (ทรงรียาว)
      y *= 1.55;

      // Slight natural taper toward the beak (ส่วนปลายเรียวลง)
      if (y < 0) {
        const factor = 1.0 + y * 0.7;
        x *= Math.max(0.45, factor);
        z *= Math.max(0.45, factor);
        // Characteristic curved mango beak (ส่วนโค้งจะงอยก้นมะม่วง)
        x += Math.pow(Math.abs(y), 1.6) * 0.22;
      } else {
        // Broad shoulders near pedicel (ไหล่ผลผายกว้าง)
        x *= 1.08;
        z *= 0.95;
      }

      pos.setXYZ(i, x, y, z);
    }
    bodyGeo.computeVertexNormals();

    // Mango skin colors
    let skinColor = 0xf59e0b; // Golden Nam Dok Mai
    let roughness = 0.35; // Glossy export skin
    if (isDistressed) {
      skinColor = 0x856b35; // Dull brownish-yellow
      roughness = 0.75;
    } else if (variety === 'mango_rad') {
      skinColor = 0x22c55e; // Green Three-Flavor
      roughness = 0.4;
    } else if (variety === 'mango_mahachanok') {
      skinColor = 0xf97316; // Rainbow blush orange-pink
      roughness = 0.35;
    }

    const bodyMat = new THREE.MeshStandardMaterial({
      color: skinColor,
      roughness: roughness,
      metalness: 0.05,
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -0.16 * fruitScale;
    body.rotation.z = -0.08; // Natural gentle tilt
    body.castShadow = true;
    fruitGroup.add(body);

    // 3. Realistic Export Foam Fruit Protection Bag (ถุงห่อผลมะม่วงสีทอง/ขาว คาร์บอน สำหรับเกรดส่งออก)
    if (!isDistressed && variety === 'mango_namdokmai') {
      const bagGeo = new THREE.CylinderGeometry(
        0.18 * fruitScale,
        0.22 * fruitScale,
        0.58 * fruitScale,
        10,
        1,
        true
      );
      const bagMat = new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.85,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const bag = new THREE.Mesh(bagGeo, bagMat);
      bag.position.y = -0.16 * fruitScale;
      fruitGroup.add(bag);
    }

    return fruitGroup;
  };

  const buildMangoTree = (scale: number, distressed = false, cropVariety = 'mango_namdokmai'): THREE.Group => {
    const tree = new THREE.Group();

    // 1. Natural Wood Trunk (ลำต้นไม้มะม่วง เนื้อไม้สีเทาอมน้ำตาล แตกกิ่งต่ำ ทรงพุ่มกลมทึบ)
    const trunkGeo = new THREE.CylinderGeometry(0.24 * scale, 0.42 * scale, 2.3 * scale, 10);
    const trunkMat = new THREE.MeshStandardMaterial({
      color: distressed ? 0x453528 : 0x544030,
      roughness: 0.92,
    });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.15 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    // Root flare at ground base
    const rootGeo = new THREE.ConeGeometry(0.6 * scale, 0.4 * scale, 8);
    const root = new THREE.Mesh(rootGeo, trunkMat);
    root.position.y = 0.2 * scale;
    tree.add(root);

    // 2. Main Scaffold Branches (กิ่งหลักแผ่ออกทรงโดม สไตล์ตัดแต่งกิ่งทรงเตี้ย High Density Orcharding)
    const branchAngles = [0.1, 1.35, 2.7, 4.0, 5.2];
    branchAngles.forEach((angle, idx) => {
      const branchHeight = (1.6 + (idx % 3) * 0.25) * scale;
      const branchLen = (1.5 + (idx % 2) * 0.3) * scale;
      const branchGeo = new THREE.CylinderGeometry(0.09 * scale, 0.15 * scale, branchLen, 7);
      const branchMat = new THREE.MeshStandardMaterial({ color: 0x483627, roughness: 0.9 });
      const branch = new THREE.Mesh(branchGeo, branchMat);
      
      branch.position.set(0, branchHeight, 0);
      branch.rotation.z = Math.PI / 2.7;
      branch.rotation.y = angle;
      branch.castShadow = true;
      tree.add(branch);

      // Sub-branch tier
      const subBranchGeo = new THREE.CylinderGeometry(0.04 * scale, 0.08 * scale, 0.9 * scale, 6);
      const subBranch = new THREE.Mesh(subBranchGeo, branchMat);
      const subX = Math.cos(angle) * branchLen * 0.65;
      const subZ = Math.sin(angle) * branchLen * 0.65;
      subBranch.position.set(subX, branchHeight + 0.2 * scale, subZ);
      subBranch.rotation.z = Math.PI / 3.2;
      subBranch.rotation.y = angle + 0.5;
      tree.add(subBranch);

      // Attach Hanging Clusters of Mangoes (ช่อมะม่วงห้อยระย้า) if Year >= 3 & showFruits
      if (showFruits && timelineYear >= 3) {
        const fruitsPerBranch = timelineYear >= 10 ? 4 : timelineYear >= 5 ? 3 : 1;
        for (let f = 1; f <= fruitsPerBranch; f++) {
          const distAlongBranch = (0.55 + f * 0.32) * scale;
          const mangoScale = (timelineYear >= 5 ? 1.05 : 0.7) * scale;
          const mangoFruit = createMangoFruit(mangoScale, distressed, cropVariety);

          const fx = Math.cos(angle) * distAlongBranch + (f % 2 === 0 ? 0.08 : -0.08) * scale;
          const fz = Math.sin(angle) * distAlongBranch + (f % 2 === 0 ? -0.08 : 0.08) * scale;
          // Mangoes hang downwards naturally below canopy
          mangoFruit.position.set(fx, branchHeight - 0.28 * scale, fz);
          tree.add(mangoFruit);
        }
      }
    });

    // 3. Lush Mango Canopy Tiers (ทรงพุ่มใบมะม่วงแน่นหนา กลมทึบ สีเขียวเข้มมันวาว)
    const baseGreen = distressed ? 0x7c7334 : 0x14532d; // Deep forest mango green
    const topGreen = distressed ? 0x8e8238 : 0x15803d;  // New flush / sunlit leaf green

    // Tier 1 - Lower wide dome
    const canopy1Geo = new THREE.DodecahedronGeometry(1.6 * scale, 1);
    const canopy1Mat = new THREE.MeshStandardMaterial({
      color: baseGreen,
      roughness: 0.65,
      flatShading: true,
      transparent: true,
      opacity: 1.0,
    });
    const canopy1 = new THREE.Mesh(canopy1Geo, canopy1Mat);
    canopy1.position.y = 2.45 * scale;
    canopy1.scale.set(1.4, 0.85, 1.4);
    canopy1.castShadow = true;
    canopy1.userData.isCanopy = true;
    tree.add(canopy1);

    // Tier 2 - Mid dense dome
    const canopy2Geo = new THREE.DodecahedronGeometry(1.25 * scale, 1);
    const canopy2Mat = new THREE.MeshStandardMaterial({
      color: topGreen,
      roughness: 0.6,
      flatShading: true,
      transparent: true,
      opacity: 1.0,
    });
    const canopy2 = new THREE.Mesh(canopy2Geo, canopy2Mat);
    canopy2.position.set(0.15 * scale, 3.2 * scale, -0.1 * scale);
    canopy2.scale.set(1.2, 0.9, 1.2);
    canopy2.castShadow = true;
    canopy2.userData.isCanopy = true;
    tree.add(canopy2);

    // Tier 3 - Top flush apex
    const canopy3Geo = new THREE.DodecahedronGeometry(0.85 * scale, 1);
    const canopy3Mat = new THREE.MeshStandardMaterial({
      color: distressed ? 0xa3913e : 0x16a34a,
      roughness: 0.55,
      flatShading: true,
      transparent: true,
      opacity: 1.0,
    });
    const canopy3 = new THREE.Mesh(canopy3Geo, canopy3Mat);
    canopy3.position.set(-0.1 * scale, 3.85 * scale, 0.1 * scale);
    canopy3.castShadow = true;
    canopy3.userData.isCanopy = true;
    tree.add(canopy3);

    return tree;
  };

  const buildRubberTree = (scale: number, distressed = false): THREE.Group => {
    const tree = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 3.8 * scale, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x696969, roughness: 0.7 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.9 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    // Spiral Tapping Groove (รอยกรีดยางพารา)
    const grooveGeo = new THREE.TorusGeometry(0.28 * scale, 0.04 * scale, 4, 12, Math.PI);
    const grooveMat = new THREE.MeshStandardMaterial({ color: 0x3d2817 });
    const groove = new THREE.Mesh(grooveGeo, grooveMat);
    groove.position.y = 1.3 * scale;
    groove.rotation.x = Math.PI / 4;
    tree.add(groove);

    // Latex Collection Cup & White Latex Liquid (ถ้วยรองน้ำยางสด)
    if (showFruits && timelineYear >= 3) {
      const cupGeo = new THREE.CylinderGeometry(0.12 * scale, 0.08 * scale, 0.16 * scale, 8);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(0.24 * scale, 1.05 * scale, 0.1 * scale);
      tree.add(cup);

      // White Latex Liquid inside cup
      const latexGeo = new THREE.CircleGeometry(0.11 * scale, 8);
      const latexMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
      const latex = new THREE.Mesh(latexGeo, latexMat);
      latex.rotation.x = -Math.PI / 2;
      latex.position.set(0.24 * scale, 1.13 * scale, 0.1 * scale);
      tree.add(latex);
    }

    // High Canopy
    const canopyColor = distressed ? 0x736931 : 0x1b4329;
    const canopyGeo = new THREE.ConeGeometry(1.2 * scale, 2.0 * scale, 7);
    const canopyMat = new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.8 });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.y = 4.2 * scale;
    canopy.castShadow = true;
    tree.add(canopy);

    return tree;
  };

  const buildOilPalmTree = (scale: number, distressed = false): THREE.Group => {
    const palm = new THREE.Group();

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.4 * scale, 0.5 * scale, 2.6 * scale, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 0.95 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.3 * scale;
    trunk.castShadow = true;
    palm.add(trunk);

    // Palm Fronds (ทางใบปาล์ม)
    const frondColor = distressed ? 0x7c7332 : 0x226b35;
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const frondGeo = new THREE.CylinderGeometry(0.04 * scale, 0.12 * scale, 2.3 * scale, 5);
      const frondMat = new THREE.MeshStandardMaterial({ color: frondColor, roughness: 0.7 });
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(0, 2.5 * scale, 0);
      frond.rotation.z = Math.PI / 3;
      frond.rotation.y = angle;
      frond.castShadow = true;
      palm.add(frond);
    }

    // Fresh Fruit Bunches (ทะลายปาล์มน้ำมันสุก สีส้มแดงเข้ม/ม่วงดำ)
    if (showFruits && timelineYear >= 3) {
      const bunchAngles = [0.8, 2.4, 4.0, 5.2];
      bunchAngles.forEach((bAngle) => {
        const bunchGeo = new THREE.DodecahedronGeometry(0.38 * scale, 1);
        const bunchColor = distressed ? 0x5a341a : 0xc2410c;
        const bunchMat = new THREE.MeshStandardMaterial({
          color: bunchColor,
          roughness: 0.8,
          flatShading: true,
        });
        const bunch = new THREE.Mesh(bunchGeo, bunchMat);
        bunch.position.set(
          Math.cos(bAngle) * 0.42 * scale,
          2.3 * scale,
          Math.sin(bAngle) * 0.42 * scale
        );
        bunch.scale.set(1.0, 1.25, 0.9);
        bunch.castShadow = true;
        palm.add(bunch);
      });
    }

    return palm;
  };

  const buildCassavaBush = (scale: number, distressed = false): THREE.Group => {
    const bush = new THREE.Group();

    // Stems (ลำต้นมันสำปะหลัง)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const stemGeo = new THREE.CylinderGeometry(0.04 * scale, 0.08 * scale, 1.4 * scale, 5);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x735c43 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(0, 0.7 * scale, 0);
      stem.rotation.z = 0.25;
      stem.rotation.y = angle;
      bush.add(stem);
    }

    // Tuber Roots (หัวมันสำปะหลังสีน้ำตาล ที่โคนต้น)
    if (showFruits && timelineYear >= 1) {
      for (let r = 0; r < 5; r++) {
        const rAngle = (r / 5) * Math.PI * 2;
        const rootGeo = new THREE.CylinderGeometry(0.07 * scale, 0.03 * scale, 0.65 * scale, 6);
        const rootMat = new THREE.MeshStandardMaterial({ color: 0x593c28, roughness: 0.9 });
        const root = new THREE.Mesh(rootGeo, rootMat);
        root.position.set(Math.cos(rAngle) * 0.25 * scale, 0.15 * scale, Math.sin(rAngle) * 0.25 * scale);
        root.rotation.z = Math.PI / 2.8;
        root.rotation.y = rAngle;
        bush.add(root);
      }
    }

    // Foliage (พุ่มใบมันสำปะหลัง)
    const foliageColor = distressed ? 0x877a33 : 0x3d7e35;
    const foliageGeo = new THREE.DodecahedronGeometry(0.7 * scale, 0);
    const foliageMat = new THREE.MeshStandardMaterial({ color: foliageColor, roughness: 0.8 });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 1.3 * scale;
    foliage.scale.set(1.2, 0.8, 1.2);
    foliage.castShadow = true;
    bush.add(foliage);

    return bush;
  };

  const buildRicePaddy = (distressed = false): THREE.Group => {
    const paddy = new THREE.Group();

    // Paddy Water / Mud
    const waterGeo = new THREE.PlaneGeometry(18, 18);
    const waterMat = new THREE.MeshStandardMaterial({
      color: distressed ? 0x474f26 : 0x355e3b,
      roughness: 0.2,
      metalness: 0.4,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.05;
    paddy.add(water);

    // Earthen Bunds (คันนา)
    const bundGeo = new THREE.BoxGeometry(18.2, 0.2, 0.4);
    const bundMat = new THREE.MeshStandardMaterial({ color: 0x54402d, roughness: 0.9 });
    [-9, 0, 9].forEach((z) => {
      const bund = new THREE.Mesh(bundGeo, bundMat);
      bund.position.set(0, 0.1, z);
      paddy.add(bund);
    });

    // Rice Tufts & Golden Panicles (กอข้าว & รวงข้าวสีทองสุก)
    const tuftColor = distressed ? 0xa89f38 : 0x74b72e;
    const tuftGeo = new THREE.ConeGeometry(0.15, 0.6, 4);
    const tuftMat = new THREE.MeshStandardMaterial({ color: tuftColor, roughness: 0.6 });

    // Golden Panicle Geometry for Rice Harvest
    const panicleGeo = new THREE.SphereGeometry(0.1, 4, 4);
    const panicleMat = new THREE.MeshStandardMaterial({ color: 0xdfb03b, roughness: 0.5 });

    for (let x = -8; x <= 8; x += 1.4) {
      for (let z = -8; z <= 8; z += 1.4) {
        if (Math.abs(z) === 0) continue;
        const posX = x + (Math.random() - 0.5) * 0.2;
        const posZ = z + (Math.random() - 0.5) * 0.2;

        const tuft = new THREE.Mesh(tuftGeo, tuftMat);
        tuft.position.set(posX, 0.3, posZ);
        paddy.add(tuft);

        // Golden Drooping Panicles at harvest (Year >= 1)
        if (showFruits && timelineYear >= 1) {
          const panicle = new THREE.Mesh(panicleGeo, panicleMat);
          panicle.position.set(posX + 0.08, 0.62, posZ + 0.08);
          panicle.scale.set(1.4, 0.7, 1.4);
          paddy.add(panicle);
        }
      }
    }
    return paddy;
  };

  // Realistic High-Relief 3D Central Plains Orchard Ground & Canal System (Bang Khla / Chachoengsao style)
  // Features authentic 3D vertical elevation:
  // - High raised planting beds (สันร่องสวน) at Y = +0.28m with rich dark compost topsoil
  // - Steep sloped earthen ditch banks (ตลิ่งลาดเอียง) with bamboo revetment pegs (หลักไม้ไผ่ปักตลิ่ง)
  // - Sunken water canals (คูน้ำร่องสวน) recessed deep at Y = -0.16m (0.44m physical drop!)
  // - Deep canal floor silt at Y = -0.48m
  const build3DOrchardLandscape = (group: THREE.Group, distressed = false) => {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    waterCanalMeshesRef.current = [];

    // Parallel canal X positions between tree rows (at X = -5.7, -1.9, 1.9, 5.7)
    const canalXPositions = [-5.7, -1.9, 1.9, 5.7];
    const canalLength = 34;

    canalXPositions.forEach((cx, canalIdx) => {
      // 1. Deep Recessed Canal Trench Bed Floor (ท้องร่องสวนขุดลึก)
      const trenchBedGeo = new THREE.BoxGeometry(1.48, 0.26, canalLength);
      const trenchMat = new THREE.MeshStandardMaterial({
        color: distressed ? 0x3d3023 : 0x1f160e, // Wet anaerobic dark silt clay
        roughness: 0.98,
      });
      const trench = new THREE.Mesh(trenchBedGeo, trenchMat);
      trench.position.set(cx, -0.42, 0);
      trench.receiveShadow = true;
      group.add(trench);

      // 2. Steep Sloped Earthen Embankment Banks (ตลิ่งร่องสวนลาดเทสองฝั่ง)
      const bankMat = new THREE.MeshStandardMaterial({
        color: distressed ? 0x5a4835 : 0x3b2818,
        roughness: 0.92,
      });
      const bankGeo = new THREE.BoxGeometry(0.28, 0.38, canalLength);
      
      const leftBank = new THREE.Mesh(bankGeo, bankMat);
      leftBank.position.set(cx - 0.72, 0.06, 0);
      leftBank.rotation.z = 0.22; // Slopes into canal
      leftBank.receiveShadow = true;
      group.add(leftBank);

      const rightBank = new THREE.Mesh(bankGeo, bankMat);
      rightBank.position.set(cx + 0.72, 0.06, 0);
      rightBank.rotation.z = -0.22; // Slopes into canal
      rightBank.receiveShadow = true;
      group.add(rightBank);

      // 3. Bamboo Revetment Stakes (เสาหลักไม้ไผ่ปักชะลอน้ำและกันตลิ่งทรุด)
      const bambooMat = new THREE.MeshStandardMaterial({
        color: distressed ? 0x78716c : 0x854d0e,
        roughness: 0.85,
      });
      const stakeGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.52, 6);
      for (let z = -15; z <= 15; z += 1.8) {
        // Left stake
        const leftStake = new THREE.Mesh(stakeGeo, bambooMat);
        leftStake.position.set(cx - 0.76, 0.12, z + (canalIdx % 2 ? 0.3 : 0));
        leftStake.rotation.z = 0.08;
        leftStake.castShadow = true;
        group.add(leftStake);

        // Right stake
        const rightStake = new THREE.Mesh(stakeGeo, bambooMat);
        rightStake.position.set(cx + 0.76, 0.12, z + (canalIdx % 2 ? -0.3 : 0));
        rightStake.rotation.z = -0.08;
        rightStake.castShadow = true;
        group.add(rightStake);
      }

      // 4. Sunken, Realistic Glistening Orchard Water Surface (ผิวน้ำร่องสวนลึกชัดเจน)
      // Visibly sunken at Y = -0.16m, providing 44cm of true physical 3D depth from bed top!
      const waterGeo = new THREE.PlaneGeometry(1.36, canalLength, 1, 32);
      const waterMat = new THREE.MeshStandardMaterial({
        color: distressed ? 0x244c45 : 0x16697a, // Authentic deep teal canal water
        roughness: 0.04,
        metalness: 0.28,
        transparent: true,
        opacity: 0.88,
      });
      const waterMesh = new THREE.Mesh(waterGeo, waterMat);
      waterMesh.rotation.x = -Math.PI / 2;
      waterMesh.position.set(cx, -0.16, 0);
      waterMesh.receiveShadow = true;
      group.add(waterMesh);
      waterCanalMeshesRef.current.push(waterMesh);

      // 5. Floating Duckweed & Water Lily Clusters (จอกแหนและใบบัวลอยบนผิวน้ำร่อง)
      const lilyGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.015, 8);
      const lilyMat = new THREE.MeshStandardMaterial({
        color: distressed ? 0x737d38 : 0x2e7d32,
        roughness: 0.55,
      });
      for (let z = -14; z <= 14; z += 3.6) {
        const offsetZ = z + (canalIdx % 2 === 0 ? 0.8 : -0.8);
        const offsetX = Math.sin(z * 1.4) * 0.34;
        const lily = new THREE.Mesh(lilyGeo, lilyMat);
        lily.position.set(cx + offsetX, -0.152, offsetZ);
        group.add(lily);
      }

      // 6. Rustic Wooden Footbridges Spanning Across the Canal (สะพานไม้ข้ามร่องสวน)
      const woodMat = new THREE.MeshStandardMaterial({
        color: 0x5c4028,
        roughness: 0.88,
      });
      const timberPostGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.48, 6);
      [-7.5, 0, 7.5].forEach((bz) => {
        // Wooden planks across the bed tops
        const plank1 = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.06, 0.34), woodMat);
        plank1.position.set(cx, 0.32, bz - 0.19);
        plank1.castShadow = true;
        group.add(plank1);

        const plank2 = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.06, 0.34), woodMat);
        plank2.position.set(cx, 0.32, bz + 0.19);
        plank2.castShadow = true;
        group.add(plank2);

        // Support timber posts into ditch banks
        [-0.7, 0.7].forEach((px) => {
          const post = new THREE.Mesh(timberPostGeo, woodMat);
          post.position.set(cx + px, 0.12, bz);
          post.castShadow = true;
          group.add(post);
        });
      });
    });

    // 7. High-Relief 3D Raised Planting Bed Mounds & Drip Irrigation System
    // Raised beds along tree rows: X = [-7.6, -3.8, 0, 3.8, 7.6]
    const rowXPositions = [-7.6, -3.8, 0, 3.8, 7.6];
    const moundGeo = new THREE.CylinderGeometry(1.25, 1.62, 0.18, 14);
    const moundMat = new THREE.MeshStandardMaterial({
      color: distressed ? 0x52402e : 0x352314, // Rich organic compost topsoil
      roughness: 0.96,
    });
    const dripRingGeo = new THREE.TorusGeometry(0.72, 0.024, 6, 20);
    const dripMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.35,
    });
    const emitterGeo = new THREE.CylinderGeometry(0.018, 0.028, 0.09, 6);
    const emitterMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.3,
      metalness: 0.6,
    });

    rowXPositions.forEach((rx) => {
      // Main Raised Bed Body: Elevation Y = +0.28m, Depth down to -0.08m
      const bedBodyGeo = new THREE.BoxGeometry(2.32, 0.36, canalLength);
      const bedBodyMat = new THREE.MeshStandardMaterial({
        color: distressed ? 0x4f3d2c : 0x3d2a1b,
        roughness: 0.94,
      });
      const bedBody = new THREE.Mesh(bedBodyGeo, bedBodyMat);
      bedBody.position.set(rx, 0.10, 0); // Bottom at -0.08m, Top at +0.28m
      bedBody.receiveShadow = true;
      group.add(bedBody);

      // Tree planting mounds at Z coordinates matching planting grid (-7.6, -3.8, 0, 3.8, 7.6)
      [-7.6, -3.8, 0, 3.8, 7.6].forEach((rz) => {
        // Raised planting collar mound: Peak at Y = 0.46m
        const mound = new THREE.Mesh(moundGeo, moundMat);
        mound.position.set(rx, 0.37, rz);
        mound.receiveShadow = true;
        group.add(mound);

        // Black PE drip irrigation ring
        const dripRing = new THREE.Mesh(dripRingGeo, dripMat);
        dripRing.rotation.x = -Math.PI / 2;
        dripRing.position.set(rx, 0.465, rz);
        group.add(dripRing);

        // Micro-emitter stake
        const emitter = new THREE.Mesh(emitterGeo, emitterMat);
        emitter.position.set(rx + 0.72, 0.51, rz);
        group.add(emitter);
      });
    });
  };

  // Reusable Tree & Orchard Population Engine (called synchronously in setup and on state updates)
  const populateTreesInGroup = (group: THREE.Group) => {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
    }

    if (selectedCrop === 'rice') {
      if (orchardLandscapeRef.current) orchardLandscapeRef.current.visible = false;
      if (terrainMeshRef.current) terrainMeshRef.current.position.y = 0;
      const ricePaddy = buildRicePaddy(isPlantDistressed);
      group.add(ricePaddy);
      return;
    } else {
      if (terrainMeshRef.current) terrainMeshRef.current.position.y = -0.54;
      if (orchardLandscapeRef.current) {
        orchardLandscapeRef.current.visible = true;
        build3DOrchardLandscape(orchardLandscapeRef.current, isPlantDistressed);
      }
    }

    const isPlotA = initialPlot?.plotId === 'plot_a' || plotAreaRai >= 70;
    const isPlotB = initialPlot?.plotId === 'plot_b' || (plotAreaRai >= 20 && plotAreaRai < 70);

    const countX = selectedCrop === 'cassava' ? 5 : isPlotA ? 5 : isPlotB ? 4 : 3;
    const countZ = selectedCrop === 'cassava' ? 5 : isPlotA ? 5 : isPlotB ? 4 : 3;

    const spacing =
      selectedCrop === 'oilpalm' ? 4.8 :
      selectedCrop === 'rubber' ? 3.6 :
      isPlotA ? 3.2 : isPlotB ? 3.8 : 4.4;

    for (let ix = -Math.floor(countX / 2); ix <= Math.floor(countX / 2); ix++) {
      for (let iz = -Math.floor(countZ / 2); iz <= Math.floor(countZ / 2); iz++) {
        const posX = ix * spacing + (Math.random() - 0.5) * 0.2;
        const posZ = iz * spacing + (Math.random() - 0.5) * 0.2;

        let plantMesh: THREE.Group;
        if (selectedCrop === 'rubber') plantMesh = buildRubberTree(growthScale, isPlantDistressed);
        else if (selectedCrop === 'oilpalm') plantMesh = buildOilPalmTree(growthScale, isPlantDistressed);
        else if (selectedCrop === 'cassava') plantMesh = buildCassavaBush(growthScale, isPlantDistressed);
        else plantMesh = buildMangoTree(growthScale, isPlantDistressed, selectedCrop);

        const treeIndex = (ix + Math.floor(countX / 2)) * countZ + (iz + Math.floor(countZ / 2)) + 1;
        const varietyInfo = CROPS[selectedCrop] || CROPS.mango_namdokmai;
        const baseFruit = timelineYear >= 10 ? 120 : timelineYear >= 5 ? 65 : timelineYear >= 3 ? 25 : 0;
        const fruitVariance = Math.round((Math.random() - 0.5) * 12);
        const actualFruits = Math.max(0, baseFruit + fruitVariance);
        const treeAge = timelineYear === 0 ? 0.5 : timelineYear === 1 ? 1.5 : timelineYear === 3 ? 3.5 : timelineYear === 5 ? 6 : 10;
        const singleTreeValue = timelineYear >= 5 ? 1500 : timelineYear >= 3 ? 1000 : 500;

        plantMesh.userData = {
          id: `MNG-ROW${ix + Math.floor(countX / 2) + 1}-T${iz + Math.floor(countZ / 2) + 1}`,
          row: ix + Math.floor(countX / 2) + 1,
          col: iz + Math.floor(countZ / 2) + 1,
          varietyTh: varietyInfo.nameThai.split('(')[0],
          varietyEn: varietyInfo.nameEnglish.split('(')[0],
          varietyId: selectedCrop,
          ageYears: treeAge,
          canopyDiameterM: +(3.2 * growthScale).toFixed(1),
          heightM: +(3.8 * growthScale).toFixed(1),
          fruitCount: actualFruits,
          baggedRatioPct: actualFruits > 0 ? 94 : 0,
          healthScore: isPlantDistressed ? 64 : 96,
          chlorophyllIndex: isPlantDistressed ? 0.52 : 0.88,
          soilMoisturePct: +(65 + (Math.random() - 0.5) * 6).toFixed(1),
          estimatedValueThb: singleTreeValue,
        };

        const plantElevation = selectedCrop === 'rice' ? 0 : 0.28;
        plantMesh.position.set(posX, plantElevation, posZ);
        group.add(plantMesh);
      }
    }
  };

  // -------------------------------------------------------------
  // Three.js Scene Setup & Lifecycle
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce7d5);
    scene.fog = new THREE.Fog(0xdce7d5, 25, 75);
    sceneRef.current = scene;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 500;

    const camera = new THREE.PerspectiveCamera(
      45,
      width / height,
      0.1,
      200
    );
    camera.position.set(16, 18, 22);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';

    // Replace any existing canvas cleanly
    mountRef.current.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 0.6;
    controls.maxDistance = 55;
    controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN,
    };
    controlsRef.current = controls;

    // Ambient light to ensure bright visibility from all view angles
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 1.4);
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0xe8f4ff, 0x473c2b, 0.65);
    scene.add(hemiLight);

    // Initial 2D Land Map Texture
    const initialCanvas = generateProceduralDroneCanvas(activePresetId);
    const texture = new THREE.CanvasTexture(initialCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    const terrainGeo = new THREE.PlaneGeometry(36, 36, 16, 16);
    const terrainMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.9,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
    terrainMeshRef.current = terrain;

    const plantGroup = new THREE.Group();
    scene.add(plantGroup);
    plantGroupRef.current = plantGroup;

    // Synchronously populate all trees from frame 0!
    populateTreesInGroup(plantGroup);

    // 3D Central Plains Orchard Landscape (Canal ditches, water, raised beds, mounds)
    const orchardLandscapeGroup = new THREE.Group();
    scene.add(orchardLandscapeGroup);
    orchardLandscapeRef.current = orchardLandscapeGroup;
    if (selectedCrop !== 'rice') {
      build3DOrchardLandscape(orchardLandscapeGroup, isPlantDistressed);
    }

    // 3D Flood Simulation Plane (Transparent blue water, initially sunken)
    const floodGeo = new THREE.PlaneGeometry(36.5, 36.5);
    const floodMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.65,
      roughness: 0.1,
      metalness: 0.3,
    });
    const floodWater = new THREE.Mesh(floodGeo, floodMat);
    floodWater.rotation.x = -Math.PI / 2;
    floodWater.position.y = -0.5;
    floodWater.visible = false;
    scene.add(floodWater);
    floodWaterMeshRef.current = floodWater;

    // 3D Flood Defense: Earthen Dykes & Berm Walls around the perimeter
    const dykesGroup = new THREE.Group();
    dykesGroup.visible = false;
    const dykeMat = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.95 });
    [-17.6, 17.6].forEach((z) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(36.5, 1.3, 1.2), dykeMat);
      wall.position.set(0, 0.65, z);
      wall.castShadow = true;
      dykesGroup.add(wall);
    });
    [-17.6, 17.6].forEach((x) => {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.3, 36.5), dykeMat);
      wall.position.set(x, 0.65, 0);
      wall.castShadow = true;
      dykesGroup.add(wall);
    });
    scene.add(dykesGroup);
    dykesGroupRef.current = dykesGroup;

    // 3D Drought Mitigation: Swale Retention Reservoir & Drip Grid
    const irrigationGroup = new THREE.Group();
    irrigationGroup.visible = false;
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    [-10, -5, 0, 5, 10].forEach((xPos) => {
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 32, 6), pipeMat);
      pipe.rotation.x = Math.PI / 2;
      pipe.position.set(xPos, 0.08, 0);
      irrigationGroup.add(pipe);
    });
    const swaleGeo = new THREE.CylinderGeometry(4.2, 3.8, 1.2, 24);
    const swaleMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.25,
      transparent: true,
      opacity: 0.85,
    });
    const swaleWater = new THREE.Mesh(swaleGeo, swaleMat);
    swaleWater.position.set(12, 0.2, 12);
    irrigationGroup.add(swaleWater);
    scene.add(irrigationGroup);
    irrigationGroupRef.current = irrigationGroup;

    // -------------------------------------------------------------
    // Smart Agriculture IoT Sensor Towers (Nodes 1, 2, 3)
    // -------------------------------------------------------------
    const iotNodesGroup = new THREE.Group();
    const pulsingRings: THREE.Mesh[] = [];

    const create5GPole = (x: number, z: number, nodeType: 'soil' | 'weather' | 'water') => {
      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(x, 0, z);

      // Metallic Pole
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 4.2, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.3, metalness: 0.8 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 2.1;
      pole.castShadow = true;
      nodeGroup.add(pole);

      // True Red Accent Collar
      const collarGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.4, 8);
      const collarMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
      const collar = new THREE.Mesh(collarGeo, collarMat);
      collar.position.y = 3.6;
      nodeGroup.add(collar);

      // Solar Panel Box
      const solarGeo = new THREE.BoxGeometry(0.8, 0.05, 0.6);
      const solarMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.2, metalness: 0.6 });
      const solar = new THREE.Mesh(solarGeo, solarMat);
      solar.position.set(0.3, 3.2, 0);
      solar.rotation.z = -0.3;
      solar.castShadow = true;
      nodeGroup.add(solar);

      // Top Red Emissive 5G Beacon
      const beaconGeo = new THREE.IcosahedronGeometry(0.22, 1);
      const beaconMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xd97706, emissiveIntensity: 0.8 });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.y = 4.3;
      nodeGroup.add(beacon);

      // Pulsing 5G Wave Ring
      const ringGeo = new THREE.TorusGeometry(0.8, 0.04, 6, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 4.3;
      nodeGroup.add(ring);
      pulsingRings.push(ring);

      if (nodeType === 'soil') {
        // Soil Probes into ground
        for (let p = -0.2; p <= 0.2; p += 0.2) {
          const probe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), new THREE.MeshStandardMaterial({ color: 0x374151 }));
          probe.position.set(p, 0.2, 0.2);
          nodeGroup.add(probe);
        }
      } else if (nodeType === 'weather') {
        // Anemometer cups
        const cups = new THREE.Group();
        cups.position.y = 4.6;
        for (let c = 0; c < 3; c++) {
          const cup = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 5), new THREE.MeshStandardMaterial({ color: 0xf3f4f6 }));
          cup.rotation.z = Math.PI / 2;
          cup.rotation.y = (c / 3) * Math.PI * 2;
          cup.position.set(Math.cos((c / 3) * Math.PI * 2) * 0.3, 0, Math.sin((c / 3) * Math.PI * 2) * 0.3);
          cups.add(cup);
        }
        nodeGroup.add(cups);
      }

      return nodeGroup;
    };

    const node1 = create5GPole(-8, -8, 'soil');
    const node2 = create5GPole(8, 8, 'weather');
    const node3 = create5GPole(10, -6, 'water');
    iotNodesGroup.add(node1, node2, node3);
    scene.add(iotNodesGroup);
    iotNodesGroupRef.current = iotNodesGroup;

    // Interactive Tree Selection Indicator Ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.45, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15, // Golden Mango Glow
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const selectionRing = new THREE.Mesh(ringGeo, ringMat);
    selectionRing.rotation.x = -Math.PI / 2;
    selectionRing.position.y = 0.30;
    selectionRing.visible = false;
    scene.add(selectionRing);
    selectionRingRef.current = selectionRing;

    // Instant unlock on user drag/orbit gesture so controls never fight the user
    controls.addEventListener('start', () => {
      targetCamPosRef.current = null;
      targetCamLookAtRef.current = null;
      if (isAutoOrbitingRef.current) {
        isAutoOrbitingRef.current = false;
        setIsAutoOrbiting(false);
      }
    });

    // Raycaster for 3D clicks / taps
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let downPos = { x: 0, y: 0 };

    const handlePointerDown = (e: MouseEvent) => {
      // Immediate cancellation of any pending camera lerp on user touch
      targetCamPosRef.current = null;
      targetCamLookAtRef.current = null;
      if (isAutoOrbitingRef.current) {
        isAutoOrbitingRef.current = false;
        setIsAutoOrbiting(false);
      }
      isDragging = false;
      downPos = { x: e.clientX, y: e.clientY };
    };

    const handlePointerMove = (e: MouseEvent) => {
      if (Math.abs(e.clientX - downPos.x) > 6 || Math.abs(e.clientY - downPos.y) > 6) {
        isDragging = true;
      }
    };

    const handleCancelGlide = () => {
      targetCamPosRef.current = null;
      targetCamLookAtRef.current = null;
    };

    const handlePointerUp = (e: MouseEvent) => {
      if (isDragging) return;
      if (!mountRef.current || !cameraRef.current || !plantGroupRef.current) return;

      const rect = mountRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, cameraRef.current);
      const intersects = raycaster.intersectObjects(plantGroupRef.current.children, true);

      if (intersects.length > 0) {
        // Find top-level plant mesh in plantGroup
        let hitObj: THREE.Object3D | null = intersects[0].object;
        while (hitObj && hitObj.parent !== plantGroupRef.current) {
          hitObj = hitObj.parent;
        }

        if (hitObj && hitObj.userData) {
          const u = hitObj.userData;
          const treeInfo: InspectedTreeInfo = {
            id: u.id || 'TREE-01',
            row: u.row || 1,
            col: u.col || 1,
            varietyTh: u.varietyTh || 'มะม่วงน้ำดอกไม้สีทอง',
            varietyEn: u.varietyEn || 'Nam Dok Mai Sri Thong',
            varietyId: u.varietyId || 'mango_namdokmai',
            ageYears: u.ageYears || 5,
            canopyDiameterM: u.canopyDiameterM || 3.8,
            heightM: u.heightM || 3.4,
            fruitCount: u.fruitCount || 45,
            baggedRatioPct: u.baggedRatioPct || 92,
            healthScore: u.healthScore || 96,
            chlorophyllIndex: u.chlorophyllIndex || 0.88,
            soilMoisturePct: u.soilMoisturePct || 68,
            estimatedValueThb: u.estimatedValueThb || 1500,
            posX: hitObj.position.x,
            posZ: hitObj.position.z,
          };
          setInspectedTree(treeInfo);

          // Position camera outside foliage in open row aisle corridor (5.2m away, framed cleanly)
          const targetY = hitObj.position.y || (selectedCrop === 'rice' ? 0 : 0.28);
          targetCamPosRef.current = new THREE.Vector3(hitObj.position.x + 3.8, targetY + 3.2, hitObj.position.z + 3.4);
          targetCamLookAtRef.current = new THREE.Vector3(hitObj.position.x, targetY + 1.8, hitObj.position.z);
          setCameraViewAngle('canopy');

          // Move selection ring to clicked tree on top of raised soil mound
          if (selectionRingRef.current) {
            selectionRingRef.current.position.set(hitObj.position.x, targetY + 0.04, hitObj.position.z);
            selectionRingRef.current.scale.set(u.canopyDiameterM * 0.42, u.canopyDiameterM * 0.42, 1);
            selectionRingRef.current.visible = true;
          }
        }
      }
    };

    const domElem = mountRef.current;
    domElem.addEventListener('mousedown', handlePointerDown);
    domElem.addEventListener('mousemove', handlePointerMove);
    domElem.addEventListener('mouseup', handlePointerUp);
    domElem.addEventListener('wheel', handleCancelGlide, { passive: true });
    domElem.addEventListener('touchstart', handleCancelGlide, { passive: true });

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Auto-Orbit controller (can be toggled or freely dragged by user)
      controls.autoRotate = isAutoOrbitingRef.current;
      controls.autoRotateSpeed = 1.8;
      controls.update();

      // Smooth Camera & Target Lerp Glide
      if (targetCamPosRef.current && targetCamLookAtRef.current) {
        camera.position.lerp(targetCamPosRef.current, 0.08);
        controls.target.lerp(targetCamLookAtRef.current, 0.08);
        if (camera.position.distanceTo(targetCamPosRef.current) < 0.04) {
          targetCamPosRef.current = null;
          targetCamLookAtRef.current = null;
        }
      }

      // Animate Realistic Sunken Canal Water Ripples & Shimmer
      const elapsed = performance.now() * 0.0018;
      waterCanalMeshesRef.current.forEach((wMesh, wIdx) => {
        wMesh.position.y = -0.16 + Math.sin(elapsed * 2.5 + wIdx * 1.5) * 0.005;
      });

      // Animate 5G Pulsing Wave Rings
      pulsingRings.forEach((r) => {
        r.scale.x = (r.scale.x + 0.02) % 2.5;
        r.scale.y = r.scale.x;
        r.scale.z = r.scale.x;
        const mat = r.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 1 - r.scale.x / 2.5);
      });

      // Animate Selection Ring rotation & gentle pulse
      if (selectionRingRef.current && selectionRingRef.current.visible) {
        selectionRingRef.current.rotation.z += 0.015;
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(mountRef.current);

    // Initial size trigger after next tick to ensure correct layout dimensions
    setTimeout(handleResize, 50);
    setTimeout(handleResize, 200);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', handlePointerDown);
      domElem.removeEventListener('mousemove', handlePointerMove);
      domElem.removeEventListener('mouseup', handlePointerUp);
      domElem.removeEventListener('wheel', handleCancelGlide);
      domElem.removeEventListener('touchstart', handleCancelGlide);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Synchronize 3D Disaster & Mitigation Elements
  useEffect(() => {
    if (!sceneRef.current) return;

    // Update Flood Mesh
    if (floodWaterMeshRef.current) {
      if (riskScenario === 'flood') {
        if (hasFloodDefense) {
          floodWaterMeshRef.current.position.y = -0.2;
          floodWaterMeshRef.current.visible = false;
        } else {
          floodWaterMeshRef.current.position.y = 0.45;
          floodWaterMeshRef.current.visible = true;
        }
      } else {
        floodWaterMeshRef.current.position.y = -0.5;
        floodWaterMeshRef.current.visible = false;
      }
    }

    // Update Dykes Mesh
    if (dykesGroupRef.current) {
      dykesGroupRef.current.visible = hasFloodDefense;
    }

    // Update Irrigation & Swale Mesh
    // Update Smart IoT Nodes Visibility
    if (iotNodesGroupRef.current) {
      iotNodesGroupRef.current.visible = show5GNodes;
    }
  }, [riskScenario, hasFloodDefense, hasDroughtDefense, show5GNodes]);

  // Re-populate Plants whenever Crop, Timeline, or Distress state changes
  useEffect(() => {
    if (!plantGroupRef.current) return;
    populateTreesInGroup(plantGroupRef.current);
  }, [selectedCrop, timelineYear, growthScale, isPlantDistressed, showFruits, initialPlot, plotAreaRai]);

  // Intelligent Camera Focus Angle Controller for individual trees
  // Positions camera outside foliage in row aisle corridor with complete line of sight
  const focusOnTree = (tree: InspectedTreeInfo, angle: 'canopy' | 'fruits' | 'trunk' = 'canopy') => {
    if (!cameraRef.current || !controlsRef.current) return;
    setCameraViewAngle(angle);

    const bedY = selectedCrop === 'rice' ? 0 : 0.28;
    let targetPos: THREE.Vector3;
    let camPos: THREE.Vector3;

    if (angle === 'canopy') {
      // Step back into row aisle: 5.2m away, 50° high angle, whole tree dome framed nicely
      targetPos = new THREE.Vector3(tree.posX, bedY + 1.8, tree.posZ);
      camPos = new THREE.Vector3(tree.posX + 3.8, bedY + 3.2, tree.posZ + 3.4);
    } else if (angle === 'fruits') {
      // Step into row aisle looking directly under canopy skirt at hanging mangoes & protection bags
      targetPos = new THREE.Vector3(tree.posX, bedY + 1.3, tree.posZ);
      camPos = new THREE.Vector3(tree.posX + 2.4, bedY + 1.35, tree.posZ + 2.2);
    } else {
      // Ground collar view of root flare, soil mound, and micro-drip ring
      targetPos = new THREE.Vector3(tree.posX, bedY + 0.35, tree.posZ);
      camPos = new THREE.Vector3(tree.posX + 2.2, bedY + 0.85, tree.posZ + 2.0);
    }

    targetCamPosRef.current = camPos;
    targetCamLookAtRef.current = targetPos;
  };

  const resetOverviewCamera = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    targetCamPosRef.current = new THREE.Vector3(16, 18, 22);
    targetCamLookAtRef.current = new THREE.Vector3(0, 0, 0);
  };

  // Intelligent X-Ray & Foliage Opacity Controller
  // When inspecting fruits, canopy becomes a translucent leaf veil (opacity 0.35)
  // so leaves never block the user's view of fruits, branches, and trunk!
  useEffect(() => {
    if (!plantGroupRef.current) return;

    plantGroupRef.current.children.forEach((treeGroup) => {
      const isCurrent = inspectedTree && treeGroup.userData?.id === inspectedTree.id;
      treeGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.userData.origOpacity === undefined) {
            child.userData.origOpacity = child.material.opacity ?? 1.0;
            child.userData.origTransparent = child.material.transparent ?? false;
          }

          if (inspectedTree) {
            if (isCurrent) {
              if (child.userData.isCanopy && cameraViewAngle === 'fruits') {
                // When focusing on fruits, make canopy sheer translucent veil so fruits are 100% visible
                child.material.transparent = true;
                child.material.opacity = 0.35;
                child.material.depthWrite = false;
              } else {
                child.material.transparent = child.userData.origTransparent;
                child.material.opacity = 1.0;
                child.material.depthWrite = true;
              }
            } else if (xrayIsolation) {
              // Non-selected neighbor trees ghosted to 15% opacity
              child.material.transparent = true;
              child.material.opacity = 0.15;
              child.material.depthWrite = false;
            } else {
              child.material.transparent = child.userData.origTransparent;
              child.material.opacity = child.userData.origOpacity;
              child.material.depthWrite = true;
            }
          } else {
            child.material.transparent = child.userData.origTransparent;
            child.material.opacity = child.userData.origOpacity;
            child.material.depthWrite = true;
          }
          child.material.needsUpdate = true;
        }
      });
    });
  }, [inspectedTree, xrayIsolation, cameraViewAngle]);

  const handleBoundaryConfirmed = (plotData: {
    areaRai: number;
    areaNgan: number;
    areaWa: number;
    sqm: number;
    pinsCount: number;
    plotName: string;
  }) => {
    setPlotAreaRai(plotData.areaRai);
    setUploadedImageName(`ผังวัดแปลงดาวเทียม: ${plotData.plotName} (${plotData.areaRai} ไร่)`);
    setSimulatorTab('3d');
    setHasSimulated(true);
  };

  return (
    <div className="space-y-4">
      {/* Mode Switcher Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">เลือกโหมดการแสดงผลแปลง:</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setSimulatorTab('3d')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer min-h-[40px] ${
                simulatorTab === '3d'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Box className="w-4 h-4" />
              <span>{lang === 'th' ? '1. จำลองสวน 3D Digital Twin' : '1. 3D Digital Twin'}</span>
            </button>

            <button
              onClick={() => setSimulatorTab('pin_mapping')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer min-h-[40px] ${
                simulatorTab === 'pin_mapping'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{lang === 'th' ? '2. ปักหมุดวัดแปลงดาวเทียม' : '2. Tap-to-Pin Mapping'}</span>
            </button>
          </div>
        </div>

        <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
          {simulatorTab === '3d'
            ? `แสดงผลแปลง: ${uploadedImageName} (${plotAreaRai} ไร่)`
            : 'โหมดปักหมุดดาวเทียม: คลิกบนแผนที่เพื่อคำนวณ ไร่-งาน-วา'}
        </span>
      </div>

      <div style={{ display: simulatorTab === 'pin_mapping' ? 'block' : 'none' }}>
        <InteractiveLandBoundaryPicker
          lang={lang}
          onBoundaryConfirmed={handleBoundaryConfirmed}
        />
      </div>

      <div style={{ display: simulatorTab === '3d' ? 'block' : 'none' }} className="space-y-4">
        {/* Quick 1-Click Plot Switcher (Directly on 3D Digital Twin) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-emerald-600" />
              <span>{lang === "th" ? "เลือกส่องแปลง 3D:" : "3D Plot Preset:"}</span>
            </span>
            <button
              onClick={() => {
                setSelectedCrop("mango_namdokmai");
                setPendingCrop("mango_namdokmai");
                setPlotAreaRai(70);
                setTimelineYear(10);
                setUploadedImageName("แปลง A — มะม่วงน้ำดอกไม้สีทอง (70 ไร่ / 1,750 ต้น)");
                setActiveMobileStep("3d_viewer");
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                plotAreaRai >= 70 && selectedCrop === "mango_namdokmai"
                  ? "bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{lang === "th" ? "แปลง A: น้ำดอกไม้ (1,750 ต้น / 70 ไร่)" : "Plot A: 1,750 Trees (70 Rai)"}</span>
            </button>

            <button
              onClick={() => {
                setSelectedCrop("mango_mahachanok");
                setPendingCrop("mango_mahachanok");
                setPlotAreaRai(25);
                setTimelineYear(5);
                setUploadedImageName("แปลง B — มะม่วงมหาชนกส่งออก (25 ไร่ / 625 ต้น)");
                setActiveMobileStep("3d_viewer");
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                plotAreaRai === 25 && selectedCrop === "mango_mahachanok"
                  ? "bg-teal-600 text-white shadow-xs ring-2 ring-teal-400"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              <span>{lang === "th" ? "แปลง B: มหาชนก (625 ต้น / 25 ไร่)" : "Plot B: 625 Trees (25 Rai)"}</span>
            </button>

            <button
              onClick={() => {
                setSelectedCrop("mango_rad");
                setPendingCrop("mango_rad");
                setPlotAreaRai(10);
                setTimelineYear(3);
                setUploadedImageName("แปลง C — มะม่วงเขียวสามรส (10 ไร่ / 220 ต้น)");
                setActiveMobileStep("3d_viewer");
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                plotAreaRai === 10
                  ? "bg-amber-600 text-white shadow-xs ring-2 ring-amber-400"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>{lang === "th" ? "แปลง C: เขียวสามรส (220 ต้น / 10 ไร่)" : "Plot C: 220 Trees (10 Rai)"}</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500">
            {lang === "th" ? "กำลังแสดงผล:" : "Viewing:"} <strong className="text-slate-800">{uploadedImageName}</strong>
          </div>
        </div>

{/* MAIN 3D MODEL CANVAS CONTAINER (Optimized for Mobile Viewers) */}
        <div className={`relative w-full ${
          isFullscreen3D
            ? 'fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in fade-in duration-200'
            : 'space-y-3'
        }`}>
          {/* Fullscreen Mobile Viewport Header Bar */}
          {isFullscreen3D && (
            <div className="bg-slate-900/95 backdrop-blur-md px-4 py-3 text-white flex items-center justify-between border-b border-slate-800 shrink-0 z-40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-extrabold text-sm sm:text-base tracking-tight">
                  {lang === 'th' ? ' Plotty 3D Fullscreen View' : ' Plotty 3D Viewport'}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">
                  {crop.nameThai}
                </span>
              </div>
              <button
                onClick={() => setIsFullscreen3D(false)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs min-h-[40px]"
              >
                <Minimize2 className="w-4 h-4 text-emerald-100" />
                <span>{lang === 'th' ? 'ออกจากโหมดเต็มจอ' : 'Exit Fullscreen'}</span>
              </button>
            </div>
          )}

          {/* WebGL Canvas Element Box */}
          <div
            id="tour-step-2"
            style={{ minHeight: '380px', height: isFullscreen3D ? '100%' : '560px' }}
            className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 shadow-xl transition-all ${
              isFullscreen3D ? 'flex-1 h-full rounded-none border-none' : 'h-[380px] sm:h-[560px] md:h-[620px]'
            }`}
          >
            <div
              ref={mountRef}
              style={{ width: '100%', height: '100%', minHeight: '380px', position: 'relative' }}
              className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
            />

            {/* Mobile / Desktop Top Left Spec Badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 transition-all">
              {/* Desktop Always Visible / Mobile Collapsible Toggle */}
              <div className="hidden sm:block bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 text-slate-800 shadow-md max-w-xs text-xs space-y-1.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      riskScenario === 'flood'
                        ? hasFloodDefense ? 'bg-sky-500' : 'bg-rose-500 animate-ping'
                        : riskScenario === 'drought'
                        ? hasDroughtDefense ? 'bg-amber-500' : 'bg-amber-500 animate-ping'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-xs font-bold tracking-tight text-slate-900">
                    {lang === 'th' ? crop.nameThai : crop.nameEnglish} (โมเดล 3D)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                  <div>{sqmToString(totalSqm, lang)}</div>
                  <div className="truncate">{lang === 'th' ? 'ภาพฐาน:' : 'Base 2D:'} {uploadedImageName}</div>
                  <div>{lang === 'th' ? 'จำนวนต้น:' : 'Trees:'} {totalTrees.toLocaleString()} {lang === 'th' ? 'ต้น' : 'trees'}</div>
                  <div className="pt-1.5 mt-1 border-t border-slate-100 text-amber-900 bg-amber-50 px-2 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>คลิกที่ "ต้นไม้" เพื่อดูรายละเอียด</span>
                  </div>
                </div>
              </div>

              {/* Mobile Spec Pill Toggle Button */}
              <button
                onClick={() => setShowMobileSpecBadge(!showMobileSpecBadge)}
                className="sm:hidden flex items-center gap-1.5 px-3 py-2 bg-white/95 backdrop-blur-md text-slate-900 border border-slate-200/90 rounded-xl text-xs font-bold shadow-md cursor-pointer min-h-[40px]"
              >
                <Box className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'th' ? 'ข้อมูลแปลง 3D' : 'Plot Specs'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMobileSpecBadge ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Spec Expanded Drawer */}
              {showMobileSpecBadge && (
                <div className="sm:hidden mt-2 bg-white/98 backdrop-blur-md border border-slate-200 rounded-2xl p-3 text-slate-900 shadow-xl max-w-[260px] text-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="font-extrabold text-xs text-slate-900">{crop.nameThai}</span>
                    <button
                      onClick={() => setShowMobileSpecBadge(false)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-600 font-mono space-y-1">
                    <div>• {sqmToString(totalSqm, lang)}</div>
                    <div>• {lang === 'th' ? 'ต้นไม้รวม:' : 'Trees:'} {totalTrees.toLocaleString()} ต้น</div>
                    <div>• {lang === 'th' ? 'ปีจำลอง:' : 'Year:'} ปีที่ {timelineYear}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Top Right Quick Controls Strip (Responsive & Non-Overlapping) */}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5">
              {/* Fullscreen Expand Button (Crucial for Mobile Phones!) */}
              <button
                onClick={() => setIsFullscreen3D(!isFullscreen3D)}
                className="px-2.5 py-2 sm:px-3 sm:py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                title={isFullscreen3D ? 'Exit Fullscreen' : 'Open Fullscreen View'}
              >
                {isFullscreen3D ? <Minimize2 className="w-4 h-4 text-emerald-100" /> : <Maximize2 className="w-4 h-4 text-emerald-100" />}
                <span className="hidden xs:inline">{isFullscreen3D ? 'ย่อหน้าจอ' : 'จอเต็ม 3D'}</span>
              </button>

              {/* Layer & Tool Toggle Group */}
              <div className="hidden sm:flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 p-1 rounded-xl text-slate-700 shadow-md text-xs">
                <button
                  onClick={() => setSatelliteLayer('normal')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                    satelliteLayer === 'normal' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  2D/3D
                </button>
                <button
                  onClick={() => setSatelliteLayer('ndvi')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                    satelliteLayer === 'ndvi' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  NDVI
                </button>
                <button
                  onClick={() => setSatelliteLayer('ndwi')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer ${
                    satelliteLayer === 'ndwi' ? 'bg-sky-600 text-white font-bold' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  NDWI
                </button>
              </div>

              {/* Mobile Quick Tools Drawer Toggle */}
              <button
                onClick={() => setShowMobileQuickTools(!showMobileQuickTools)}
                className="sm:hidden flex items-center gap-1 px-2.5 py-2 bg-white/95 text-slate-900 border border-slate-200/90 rounded-xl text-xs font-bold shadow-md cursor-pointer min-h-[40px]"
              >
                <SlidersHorizontal className="w-4 h-4 text-slate-700" />
                <span>{lang === 'th' ? 'เลเยอร์' : 'Layers'}</span>
              </button>
            </div>

            {/* Mobile Quick Tools Popup Menu */}
            {showMobileQuickTools && (
              <div className="sm:hidden absolute top-14 right-3 z-30 bg-white/98 backdrop-blur-md border border-slate-200 rounded-2xl p-3 text-slate-900 shadow-2xl space-y-2 max-w-[240px] text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100 font-bold">
                  <span>{lang === 'th' ? 'สลับเลเยอร์ & การแสดงผล' : 'Layers & Visibility'}</span>
                  <button onClick={() => setShowMobileQuickTools(false)} className="p-1 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500">{lang === 'th' ? 'แผนที่ดาวเทียม:' : 'Satellite Overlay:'}</div>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[10.5px]">
                    <button
                      onClick={() => setSatelliteLayer('normal')}
                      className={`py-1 rounded-lg font-bold ${satelliteLayer === 'normal' ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}
                    >
                      2D/3D
                    </button>
                    <button
                      onClick={() => setSatelliteLayer('ndvi')}
                      className={`py-1 rounded-lg font-bold ${satelliteLayer === 'ndvi' ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}
                    >
                      NDVI
                    </button>
                    <button
                      onClick={() => setSatelliteLayer('ndwi')}
                      className={`py-1 rounded-lg font-bold ${satelliteLayer === 'ndwi' ? 'bg-sky-600 text-white' : 'text-slate-700'}`}
                    >
                      NDWI
                    </button>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[11px] font-medium">{lang === 'th' ? 'ผลไม้ 3D:' : '3D Fruits:'}</span>
                    <button
                      onClick={() => setShowFruits(!showFruits)}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold ${showFruits ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {showFruits ? 'แสดงผล' : 'ซ่อน'}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium">{lang === 'th' ? 'เซนเซอร์ IoT:' : 'IoT Sensors:'}</span>
                    <button
                      onClick={() => setShow5GNodes(!show5GNodes)}
                      className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold ${show5GNodes ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'}`}
                    >
                      {show5GNodes ? 'เปิดใช้งาน' : 'ปิด'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Smart Agri IoT Telemetry Card */}
            {show5GNodes && (
              <div className="absolute top-[60px] left-3 right-3 sm:left-auto sm:right-4 sm:top-[76px] z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 text-slate-900 max-w-none sm:max-w-xs shadow-xl space-y-2 animate-fade-in">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-xs tracking-tight text-slate-900">
                      {lang === 'th' ? 'สถานีเซนเซอร์วัดค่าไร่นา IoT' : 'Smart Agri IoT Station'}
                    </span>
                  </div>
                  <button
                    onClick={() => setShow5GNodes(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                    aria-label="Close sensor card"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Node Switcher Tabs */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[10.5px] font-semibold text-center">
                  <button
                    onClick={() => setSelected5GNode('node-1')}
                    className={`py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] ${
                      selected5GNode === 'node-1' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    {lang === 'th' ? 'ดิน & NPK' : 'Soil'}
                  </button>
                  <button
                    onClick={() => setSelected5GNode('node-2')}
                    className={`py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] ${
                      selected5GNode === 'node-2' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    {lang === 'th' ? 'อากาศ' : 'Weather'}
                  </button>
                  <button
                    onClick={() => setSelected5GNode('node-3')}
                    className={`py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] ${
                      selected5GNode === 'node-3' ? 'bg-white text-emerald-800 shadow-2xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    {lang === 'th' ? 'ระบบน้ำ' : 'Water'}
                  </button>
                </div>

                {/* Node Live Readings */}
                <div className="text-[11px] sm:text-xs space-y-1 pt-0.5 font-mono">
                  {selected5GNode === 'node-1' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">ความชื้นดิน:</span>
                        <span className="text-emerald-700 font-bold">68.4% (ดี)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">ค่า pH:</span>
                        <span className="text-slate-800 font-bold">6.5 pH</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">N-P-K:</span>
                        <span className="text-amber-700 font-bold">85-42-120 ppm</span>
                      </div>
                    </>
                  )}

                  {selected5GNode === 'node-2' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">อุณหภูมิ:</span>
                        <span className="text-amber-700 font-bold">31.2 °C</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">ความชื้นสัมพัทธ์:</span>
                        <span className="text-sky-700 font-bold">74%</span>
                      </div>
                    </>
                  )}

                  {selected5GNode === 'node-3' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">ระดับน้ำในคู:</span>
                        <span className="text-sky-700 font-bold">28 ซม.</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">วาล์วน้ำหยด:</span>
                        <span className="text-emerald-700 font-bold">ทำงานอัตโนมัติ</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Floating Mobile On-Screen D-Pad & Camera Controls (Bottom Right) */}
            <div className="absolute bottom-16 right-3 sm:bottom-20 sm:right-4 z-20 flex flex-col items-center gap-1.5">
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 rounded-2xl bg-white/95 text-slate-800 border border-slate-200/90 shadow-lg flex items-center justify-center font-bold text-lg hover:bg-white active:scale-95 transition-all cursor-pointer"
                title="Zoom In"
                aria-label="Zoom in 3D scene"
              >
                <ZoomIn className="w-5 h-5 text-emerald-700" />
              </button>

              <button
                onClick={handleZoomOut}
                className="w-10 h-10 rounded-2xl bg-white/95 text-slate-800 border border-slate-200/90 shadow-lg flex items-center justify-center font-bold text-lg hover:bg-white active:scale-95 transition-all cursor-pointer"
                title="Zoom Out"
                aria-label="Zoom out 3D scene"
              >
                <ZoomOut className="w-5 h-5 text-emerald-700" />
              </button>

              <button
                onClick={resetOverviewCamera}
                className="w-10 h-10 rounded-2xl bg-white/95 text-slate-800 border border-slate-200/90 shadow-lg flex items-center justify-center hover:bg-white active:scale-95 transition-all cursor-pointer"
                title="Reset Camera View"
                aria-label="Reset camera view"
              >
                <RotateCcw className="w-4 h-4 text-sky-700" />
              </button>

              <button
                onClick={() => {
                  const next = !isAutoOrbiting;
                  setIsAutoOrbiting(next);
                  isAutoOrbitingRef.current = next;
                }}
                className={`w-10 h-10 rounded-2xl border shadow-lg flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
                  isAutoOrbiting
                    ? 'bg-amber-400 border-amber-300 text-slate-950'
                    : 'bg-white/95 border-slate-200/90 text-slate-800 hover:bg-white'
                }`}
                title="Auto 360° Orbit"
                aria-label="Auto 360 orbit"
              >
                <RotateCcw className={`w-4 h-4 ${isAutoOrbiting ? 'animate-spin text-slate-950' : 'text-amber-600'}`} />
              </button>
            </div>

            {/* Mobile Touch Gesture Guidance Toast (Fades quietly) */}
            <div className="absolute bottom-2 left-3 z-10 hidden xs:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md text-slate-200 text-[10px] px-2.5 py-1 rounded-xl border border-slate-700/60 font-mono">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>แตะลากด้วย 1 นิ้วเพื่อหมุน • 2 นิ้วเพื่อซูม</span>
            </div>
          </div>

          {/* Mobile Bottom Sheet Drawer for Tree Inspection Details */}
          {inspectedTree && (
            <div className="fixed sm:absolute inset-x-0 bottom-0 sm:bottom-20 sm:left-4 z-50 bg-white/98 backdrop-blur-xl border-t-2 sm:border border-amber-300 rounded-t-3xl sm:rounded-2xl p-4 text-slate-900 w-full sm:w-[320px] shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200">
              {/* Mobile Sheet Grab Handle */}
              <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto sm:hidden -mt-1 mb-1" />

              <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-emerald-600 flex items-center justify-center text-white shadow-xs">
                    <Trees className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-slate-900">{inspectedTree.id}</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        แถว {inspectedTree.row} ต้นที่ {inspectedTree.col}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      {lang === 'th' ? inspectedTree.varietyTh : inspectedTree.varietyEn}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setInspectedTree(null);
                    if (selectionRingRef.current) selectionRingRef.current.visible = false;
                  }}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close tree inspector"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tree Specs & Telemetry Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-amber-50/90 p-2.5 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-slate-500 block font-sans font-medium">
                    {lang === 'th' ? 'ผลผลิตบนต้นจริง' : 'Fruit Count'}
                  </span>
                  <span className="text-base font-extrabold text-amber-900">
                    {inspectedTree.fruitCount} {lang === 'th' ? 'ผล' : 'fruits'}
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-sans font-semibold">
                    ห่อถุงคาร์บอน {inspectedTree.baggedRatioPct}%
                  </span>
                </div>

                <div className="bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-slate-500 block font-sans font-medium">
                    {lang === 'th' ? 'มูลค่าประเมินหลักทรัพย์' : 'Asset Appraisal'}
                  </span>
                  <span className="text-base font-extrabold text-emerald-800">
                    ฿{inspectedTree.estimatedValueThb.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-sans">
                    อิงเกณฑ์ พ.ร.บ.หลักประกันฯ
                  </span>
                </div>
              </div>

              {/* Tree Bio-Health Readings */}
              <div className="space-y-1.5 text-xs font-mono bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1 font-sans">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                    {lang === 'th' ? 'คะแนนสุขภาพต้น:' : 'Health Score:'}
                  </span>
                  <span className="font-bold text-emerald-700">{inspectedTree.healthScore}% (สมบูรณ์มาก)</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1 font-sans">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    {lang === 'th' ? 'ดัชนีคลอโรฟิลล์ (NDVI):' : 'Chlorophyll (NDVI):'}
                  </span>
                  <span className="font-bold text-slate-800">{inspectedTree.chlorophyllIndex} (ใบเขียวเข้ม)</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1 font-sans">
                    <Droplets className="w-3.5 h-3.5 text-sky-500" />
                    {lang === 'th' ? 'ความชื้นโคนต้น:' : 'Root Moisture:'}
                  </span>
                  <span className="font-bold text-sky-700">{inspectedTree.soilMoisturePct}%</span>
                </div>
              </div>

              {/* View Perspectives & Touch Angle Mode Buttons */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs text-slate-600 font-sans">
                  <span className="font-bold">{lang === 'th' ? 'เลือกมุมมองซูมกล้อง:' : 'Camera Angle:'}</span>
                  <button
                    onClick={() => setXrayIsolation(!xrayIsolation)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer min-h-[36px] ${
                      xrayIsolation ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <EyeOff className="w-3.5 h-3.5 text-amber-700" />
                    <span>{xrayIsolation ? 'X-Ray เปิดอยู่' : 'เปิด X-Ray'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => focusOnTree(inspectedTree, 'canopy')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border min-h-[44px] ${
                      cameraViewAngle === 'canopy'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Navigation className="w-4 h-4" />
                    <span>ทรงพุ่ม</span>
                  </button>

                  <button
                    onClick={() => focusOnTree(inspectedTree, 'fruits')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border min-h-[44px] ${
                      cameraViewAngle === 'fruits'
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Focus className="w-4 h-4" />
                    <span>ช่อผล</span>
                  </button>

                  <button
                    onClick={() => focusOnTree(inspectedTree, 'trunk')}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer border min-h-[44px] ${
                      cameraViewAngle === 'trunk'
                        ? 'bg-teal-700 text-white border-teal-600 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Waves className="w-4 h-4" />
                    <span>โคนต้น</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={resetOverviewCamera}
                    className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[40px]"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-500" />
                    <span>{lang === 'th' ? 'รีเซ็ตภาพรวม' : 'Reset View'}</span>
                  </button>

                  <button
                    onClick={() => setInspectedTree(null)}
                    className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center cursor-pointer min-h-[40px]"
                  >
                    <span>{lang === 'th' ? 'ปิด' : 'Close'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Collapsible Unified Growth Timeline Control Dock */}
          <div
            className={`transition-all duration-300 ease-in-out ${
              isFullscreen3D
                ? 'absolute bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl'
                : 'w-full'
            }`}
          >
            <div className="flex justify-center -mb-px">
              <button
                onClick={() => setIsDockCollapsed(!isDockCollapsed)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-white/95 text-slate-700 text-xs font-semibold border-t border-x border-slate-200 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer min-h-[36px]"
              >
                {isDockCollapsed ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'th' ? 'แสดงแผงควบคุมการเติบโต' : 'Show Controls'}</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    <span>{lang === 'th' ? 'ย่อแผงควบคุม' : 'Hide Controls'}</span>
                  </>
                )}
              </button>
            </div>

            <div className={`bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-3.5 sm:p-4 text-slate-900 shadow-xl space-y-3 ${
              isDockCollapsed ? 'hidden' : 'block'
            }`}>
              {/* Growth Timeline Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{lang === 'th' ? 'จำลองการเติบโต:' : 'Timeline Growth:'}</span>
                    <span className="text-emerald-700 font-bold font-mono text-sm">
                      {timelineYear === 0
                        ? lang === 'th' ? 'ปีที่ 0 (เริ่มลงกล้า)' : 'Year 0 (Sapling)'
                        : lang === 'th'
                        ? `ปีที่ ${timelineYear} (${timelineYear >= crop.yearsToFirstHarvest ? 'ระยะให้ผลผลิตเต็มที่' : 'ระยะสะสมอาหาร'})`
                        : `Year ${timelineYear}`}
                    </span>
                  </span>

                  <span className="text-[11px] text-slate-500 hidden xs:inline">
                    {lang === 'th' ? 'เลือกปี 3, 5 หรือ 10' : 'Select 3, 5, or 10 years'}
                  </span>
                </div>

                {/* Segmented Timeline Buttons */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-5 gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                    {[0, 1, 3, 5, 10].map((yr) => (
                      <button
                        key={yr}
                        onClick={() => {
                          setTimelineYear(yr);
                          setIsPlaying(false);
                        }}
                        className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer min-h-[40px] ${
                          timelineYear === yr
                            ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                            : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                        }`}
                      >
                        {yr === 0 ? (lang === 'th' ? 'เริ่ม' : 'Yr 0') : `${yr} ${lang === 'th' ? 'ปี' : 'Yrs'}`}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[40px] ${
                      isPlaying
                        ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse'
                        : 'bg-white border-slate-200 text-emerald-700 hover:bg-slate-50'
                    }`}
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">{lang === 'th' ? 'หยุด' : 'Pause'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span className="hidden xs:inline">{lang === 'th' ? 'เล่นอัตโนมัติ' : 'Auto-Play'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Farm Telemetry Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {lang === 'th' ? 'ทรงพุ่มเฉลี่ย' : 'Canopy Diameter'}
                  </span>
                  <span className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                    {canopyDiameterMeters} {lang === 'th' ? 'ม.' : 'm'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {lang === 'th' ? 'ผลผลิตคาดการณ์' : 'Estimated Harvest'}
                  </span>
                  <span className="text-sm font-bold text-amber-700 font-mono tabular-nums">
                    {projectedHarvestTons} {lang === 'th' ? 'ตัน/ปี' : 'tons/yr'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {lang === 'th' ? 'การใช้น้ำต่อวัน' : 'Water Need'}
                  </span>
                  <span className="text-sm font-bold text-sky-700 font-mono tabular-nums">
                    {crop.waterRequirement === 'high' ? '120-150 L' : '40-60 L'}
                  </span>
                </div>

                <div className="bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {lang === 'th' ? 'ระยะการให้ผล' : 'Bearing Stage'}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">
                    {timelineYear < crop.yearsToFirstHarvest
                      ? lang === 'th' ? 'สะสมอาหาร' : 'Pre-bearing'
                      : lang === 'th' ? 'เก็บเกี่ยวเต็มที่' : 'Full Bearing'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Quick Step Navigation Bar (Guarantees 3D Canvas is front & center on mobile phones) */}
        <div className="md:hidden bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs grid grid-cols-4 gap-1 text-center font-bold text-xs sticky top-14 z-20">
          <button
            onClick={() => setActiveMobileStep('3d_viewer')}
            aria-label="View 3D Digital Twin"
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer min-h-[44px] ${
              activeMobileStep === '3d_viewer'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Box className="w-4 h-4" />
            <span className="text-[10px] leading-none">ดูสวน 3D</span>
          </button>

          <button
            onClick={() => setActiveMobileStep('upload_2d')}
            aria-label="1. รูปแปลง 2D"
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer min-h-[44px] ${
              activeMobileStep === 'upload_2d'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span className="text-[10px] leading-none">1. รูป 2D</span>
          </button>

          <button
            onClick={() => setActiveMobileStep('select_crop')}
            aria-label="2. เลือกพืช"
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer min-h-[44px] ${
              activeMobileStep === 'select_crop'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span className="text-[10px] leading-none">2. เลือกพืช</span>
          </button>

          <button
            onClick={() => setActiveMobileStep('disaster')}
            aria-label="3. สภาวะวิกฤต"
            className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center gap-1 cursor-pointer min-h-[44px] ${
              activeMobileStep === 'disaster'
                ? 'bg-emerald-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] leading-none">3. วิกฤต 3D</span>
          </button>
        </div>

        {/* STEP 1: 2D Upload Card */}
        <div className={`bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 ${
          activeMobileStep === 'upload_2d' ? 'block' : 'hidden md:block'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {lang === 'th' ? 'ระบบแปลงภาพ 2D สู่โมเดล 3D' : '2D Land Photo to 3D Model Engine'}
                </span>
                <span>·</span>
                <span>{lang === 'th' ? 'จำลองการเติบโต 3, 5, 10 ปี' : '3, 5, 10-Year Growth Simulation'}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {lang === 'th' ? 'แปลงรูปถ่ายแปลงที่ดิน (2D) เป็นแบบจำลองสวน 3 มิติ' : 'Convert 2D Land Photos into Interactive 3D Farm'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {lang === 'th'
                  ? 'อัปโหลดภาพถ่ายทางอากาศ ภาพถ่ายจากโดรน โฉนดที่ดิน หรือผังแปลง 2 มิติ เพื่อสร้างพื้นผิวภูมิประเทศและจำลองทรงพุ่มต้นไม้จริง'
                  : 'Upload drone shots, land deeds, or satellite maps to map real terrain textures and projected tree canopies.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {uploaded2DImage && (
                <button
                  onClick={() => setShow2DInspector(!show2DInspector)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer min-h-[44px]"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-700" />
                  <span>{lang === 'th' ? (show2DInspector ? 'ซ่อนภาพ 2D' : 'ดูภาพ 2D เทียบ 3D') : 'Toggle 2D/3D'}</span>
                </button>
              )}

              <button
                onClick={handleShare3DFarm}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer min-h-[44px]"
              >
                {copied3DLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>{lang === 'th' ? 'คัดลอกลิงก์ 3D แล้ว' : 'Copied 3D Link'}</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-emerald-200" />
                    <span>{lang === 'th' ? 'แชร์สวน 3D' : 'Share 3D Farm'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveMobileStep('3d_viewer')}
                className="md:hidden flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer min-h-[44px]"
              >
                <Box className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'th' ? 'ดูโมเดล 3D' : 'View 3D'}</span>
              </button>
            </div>
          </div>

          {/* Copy Toast Banner */}
          {copied3DLink && (
            <div className="p-3 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-md animate-fade-in">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-200 shrink-0" />
                <span>
                  {lang === 'th'
                    ? 'คัดลอกลิงก์แชร์สวน 3D เรียบร้อยแล้ว! สามารถนำไปส่งต่อให้ผู้อื่นเปิดดูได้ทันที'
                    : '3D Farm View link copied to clipboard! Anyone can open it directly.'}
                </span>
              </div>
              <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded font-mono">Public Link</span>
            </div>
          )}

          {/* Prominent 2D Upload Card / Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Main Upload Button / Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="md:col-span-1 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group min-h-[120px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCustomImageUpload}
                className="hidden"
              />
              <div className="w-11 h-11 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-xs transition-colors">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 block">
                  {lang === 'th' ? 'อัปโหลดรูปแปลง 2D ของท่าน' : 'Upload Your 2D Land Image'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">
                  {lang === 'th' ? 'รองรับภาพโดรน, ดาวเทียม, หรือโฉนด' : 'Supports drone, satellite, or aerial photos'}
                </span>
              </div>
              {activePresetId === 'custom' && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                  {lang === 'th' ? 'ใช้งานภาพของคุณอยู่' : 'Active Custom Image'}
                </span>
              )}
            </div>

            {/* 3 Realistic Thai 2D Land Presets */}
            <div className="md:col-span-2 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {lang === 'th' ? 'หรือทดลองคลิกเลือกภาพถ่ายแปลงตัวอย่างของไทย (1-Click Presets):' : 'Or Try Realistic Thai 2D Presets:'}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {LAND_MAP_PRESETS.map((preset) => {
                  const isSelected = activePresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        handleSelectPreset(preset);
                        setActiveMobileStep('3d_viewer');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 min-h-[52px] ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-500'
                          : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg shrink-0 mt-0.5 flex items-center justify-center text-white text-xs font-bold shadow-xs"
                        style={{ backgroundColor: preset.previewColor }}
                      >
                        2D
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 line-clamp-1 block">
                          {lang === 'th' ? preset.titleThai : preset.titleEnglish}
                        </span>
                        <span className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 block">
                          {preset.descriptionThai}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold text-emerald-700 block mt-1">
                            ● {lang === 'th' ? 'ฉายลงโมเดล 3D อยู่' : 'Projected on 3D'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: Choose What to Plant Card */}
        <div className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 ${
          activeMobileStep === 'select_crop' ? 'block' : 'hidden md:block'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">ขั้นตอนที่ 2</span>
                <span>{lang === 'th' ? 'เลือกพืชที่ต้องการปลูกบนแปลงนี้' : 'Select Crop to Plant & Simulate'}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'th' ? 'ท่านต้องการปลูกพืชเศรษฐกิจชนิดใด?' : 'Which Crop Would You Like to Plant?'}
              </h3>
            </div>

            <button
              onClick={() => {
                setSelectedCrop(pendingCrop);
                setHasSimulated(true);
                setActiveMobileStep('3d_viewer');
              }}
              className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{lang === 'th' ? 'เริ่มจำลองแปลงปลูก & ดูโมเดล 3D' : 'Simulate & Predict 3D Farm'}</span>
            </button>
          </div>

          {/* 6 Core Thai Economic Crops Quick-Selector */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {Object.values(CROPS).map((c) => {
              const isSelected = pendingCrop === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setPendingCrop(c.id);
                    setSelectedCrop(c.id);
                    setHasSimulated(true);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500 shadow-xs'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[10px] font-bold text-slate-500 font-mono">
                        ฿{c.currentPrice}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 line-clamp-1 block">
                      {lang === 'th' ? c.nameThai.split('(')[0] : c.nameEnglish.split('(')[0]}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    {c.id === 'rice' ? 'ผลผลิตต่อรอบ 4 เดือน' : `ให้ผลผลิตปีที่ ${c.yearsToFirstHarvest}`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 3: Crisis Scenarios Card */}
        <div className={`bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 ${
          activeMobileStep === 'disaster' ? 'block' : 'hidden md:block'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-0.5">
                <span className="font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md">ขั้นตอนที่ 3</span>
                <span>{lang === 'th' ? 'แบบจำลองสภาวะวิกฤต & มาตรการป้องกัน 3D' : '3D Climate Disaster Simulation & Defense'}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {lang === 'th' ? 'ทำนายความเสี่ยงสภาพอากาศ & ออกแบบวิธีป้องกันในโมเดล 3D' : 'Predict Weather Risks & Build 3D Defenses'}
              </h3>
            </div>

            {/* Scenario Selector Pills */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
              <button
                onClick={() => setRiskScenario('normal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                  riskScenario === 'normal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'th' ? 'ปกติ' : 'Normal'}
              </button>
              <button
                onClick={() => setRiskScenario('flood')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                  riskScenario === 'flood'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'th' ? 'เสี่ยงน้ำท่วม' : 'Flood'}
              </button>
              <button
                onClick={() => setRiskScenario('drought')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[36px] ${
                  riskScenario === 'drought'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'th' ? 'เสี่ยงภัยแล้ง' : 'Drought'}
              </button>
            </div>
          </div>

          {/* Dynamic Scenario Explanation & 3D Interactive Defense Action */}
          {riskScenario === 'normal' && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {lang === 'th'
                    ? 'สภาพอากาศปกติ ดินมีความชื้นเหมาะสม ทรงพุ่มเขียวชอุ่ม ให้ผลผลิตได้เต็ม 100%'
                    : 'Normal climate conditions. Soil moisture is optimal and plants are thriving at 100% yield potential.'}
                </span>
              </div>
              <span className="font-bold text-emerald-700 shrink-0 font-mono">ผลผลิต 100%</span>
            </div>
          )}

          {riskScenario === 'flood' && (
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-blue-900 block text-sm">
                    {hasFloodDefense
                      ? lang === 'th' ? 'ระบบคันดินกั้นน้ำและคูระบายน้ำปกป้องแปลงสำเร็จ' : 'Earthen Dyke & Moat Defenses Active'
                      : lang === 'th' ? 'เกิดภาวะน้ำท่วมขังสูง 40 ซม. เสี่ยงสูญเสียผลผลิต 75%' : '40cm Flood Inundation! 75% Yield Loss Risk'}
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed max-w-xl">
                    {hasFloodDefense
                      ? lang === 'th'
                        ? 'โมเดล 3D ได้ยกคันดินกั้นน้ำสูง 1.3 เมตรรอบแปลง 4 ด้าน พร้อมเปิดคูระบายน้ำ น้ำท่วมถูกสกัดกั้นอยู่นอกแปลง ต้นไม้รอดตายปลอดภัย 95%'
                        : '3D raised berms around perimeter stop flooding. Water channeled into drainage ditch.'
                      : lang === 'th'
                        ? 'ระดับน้ำท่วมท่วมคลุมโคนต้นไม้ รากขาดออกซิเจน เสี่ยงโรครากเน่าโคนเน่า (ไฟทอปธอรา) ใบเปลี่ยนเป็นสีเหลือง ยืนต้นตายใน 14 วัน'
                        : 'Standing water suffocates root collars. Leaves yellow and die within 14 days without drainage.'}
                  </p>
                </div>

                <button
                  onClick={() => setHasFloodDefense(!hasFloodDefense)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0 min-h-[44px] ${
                    hasFloodDefense
                      ? 'bg-blue-700 text-white ring-2 ring-blue-400'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-blue-200" />
                  <span>
                    {hasFloodDefense
                      ? lang === 'th' ? 'ยกคันดินกั้นน้ำแล้ว (กดเพื่อปลด)' : 'Dykes Built (Click to remove)'
                      : lang === 'th' ? 'สร้างคันดินกั้นน้ำ & ขุดคูน้ำ 3D' : 'Build 3D Flood Dykes & Moat'}
                  </span>
                </button>
              </div>
            </div>
          )}

          {riskScenario === 'drought' && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-1">
                  <span className="font-bold text-amber-900 block text-sm">
                    {hasDroughtDefense
                      ? lang === 'th' ? 'สระกักเก็บน้ำโคกหนองนา & ระบบน้ำหยดหล่อเลี้ยงแปลงสำเร็จ' : 'Retention Pond & Drip Irrigation Grid Active'
                      : lang === 'th' ? 'ฝนทิ้งช่วง 45 วัน ดินแตกระแหง ดอกและผลอ่อนร่วงหล่น' : '45-Day Severe Drought! 65% Yield Loss Risk'}
                  </span>
                  <p className="text-slate-600 text-[11px] leading-relaxed max-w-xl">
                    {hasDroughtDefense
                      ? lang === 'th'
                        ? 'โมเดล 3D มีสระกักเก็บน้ำลึกโคกหนองนา และเดินท่อน้ำหยด HDPE สีดำพาดผ่านทุกแถว ดินชุ่มชื้น ต้นไม้กลับมาเขียวสดใส ผลผลิตสมบูรณ์ 95%'
                        : '3D retention pond and micro-drip feeder tubes supply water along all planting rows.'
                      : lang === 'th'
                        ? 'ดินแตกระแหง สระน้ำแห้งเหือด ทรงพุ่มเหี่ยวเฉา ดอกและผลทุเรียน/ผลไม้ร่วงหล่น ผลผลิตลดลงกว่า 65%'
                        : 'Severe water deficit causes flower & fruit drop. Parched earth texture.'}
                  </p>
                </div>

                <button
                  onClick={() => setHasDroughtDefense(!hasDroughtDefense)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0 min-h-[44px] ${
                    hasDroughtDefense
                      ? 'bg-amber-700 text-white ring-2 ring-amber-400'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <Droplets className="w-4 h-4 text-amber-200" />
                  <span>
                    {hasDroughtDefense
                      ? lang === 'th' ? 'ขุดสระ & เดินท่อน้ำหยดแล้ว' : 'Pond & Drip Built'
                      : lang === 'th' ? 'ขุดสระโคกหนองนา & วางระบบน้ำหยด 3D' : 'Build 3D Pond & Drip Grid'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side-by-Side 2D Inspector (If toggled) */}
        {show2DInspector && uploaded2DImage && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-800">
                  {lang === 'th' ? 'ภาพ 2D ต้นฉบับที่นำมาแปลง:' : 'Original 2D Land Photo:'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">({uploadedImageName})</span>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 bg-slate-900 flex items-center justify-center">
                <img
                  src={uploaded2DImage}
                  alt="2D Land Preview"
                  className="max-h-56 object-contain"
                />
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <strong className="text-emerald-900 font-bold block text-sm">
                {lang === 'th' ? 'ระบบแปลงและฉายภาพลงบนโมเดล 3D สำเร็จ' : '2D Projected onto 3D Surface'}
              </strong>
              <p>
                {lang === 'th'
                  ? 'ระบบได้นำภาพถ่ายแปลงที่ดิน 2D ของท่านมาฉายลงบนพื้นผิวภูมิประเทศ 3 มิติ และคำนวณตำแหน่งร่องสวน สระน้ำ และแนวปลูกต้นไม้โดยอัตโนมัติ'
                  : 'The 2D land image has been texture-mapped onto the 3D terrain grid with spatial planting lines calculated automatically.'}
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono space-y-1">
                <div>• {lang === 'th' ? 'ขนาดแปลงที่ตรวจพบ:' : 'Detected Area:'} {plotAreaRai} {lang === 'th' ? 'ไร่' : 'Rai'}</div>
                <div>• {lang === 'th' ? 'พืชหลักที่วางแนวแปลง:' : 'Assigned Crop:'} {crop.nameThai}</div>
                <div>• {lang === 'th' ? 'สถานะโมเดล:' : 'Model Status:'} {isConverting ? 'กำลังคำนวณ...' : 'พร้อมจำลองการเติบโต'}</div>
              </div>
            </div>
          </div>
        )}

        
      </div>
    </div>
  );
};
