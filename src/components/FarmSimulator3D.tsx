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
} from 'lucide-react';

interface FarmSimulator3DProps {
  lang: 'th' | 'en';
  initialPlot?: { cropId: string; areaRai: number; name: string } | null;
}

export const FarmSimulator3D: React.FC<FarmSimulator3DProps> = ({ lang, initialPlot }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab State: '3d' Digital Twin vs 'pin_mapping' Satellite Tap-to-Pin
  const [simulatorTab, setSimulatorTab] = useState<'3d' | 'pin_mapping'>('3d');

  // Simulation & Crop State
  const [selectedCrop, setSelectedCrop] = useState<string>(initialPlot?.cropId || 'mango_namdokmai');
  const [pendingCrop, setPendingCrop] = useState<string>(initialPlot?.cropId || 'mango_namdokmai');
  const [timelineYear, setTimelineYear] = useState<number>(5); // 0, 1, 3, 5, 10
  const [plotAreaRai, setPlotAreaRai] = useState<number>(initialPlot?.areaRai || 4);
  const [plotAreaNgan, setPlotAreaNgan] = useState<number>(0);
  const [isDockCollapsed, setIsDockCollapsed] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasSimulated, setHasSimulated] = useState<boolean>(true);
  const [showFruits, setShowFruits] = useState<boolean>(true); // Toggle to show/hide 3D fruits
  const [show5GNodes, setShow5GNodes] = useState<boolean>(true); // True 5G Smart IoT Overlay
  const [selected5GNode, setSelected5GNode] = useState<'node-1' | 'node-2' | 'node-3'>('node-1');
  const [satelliteLayer, setSatelliteLayer] = useState<'normal' | 'ndvi' | 'ndwi'>('normal'); // Satellite AI NDVI/NDWI Heatmaps

  // Crisis Scenarios & 3D Defense State (Flooding & Drought)
  const [riskScenario, setRiskScenario] = useState<'normal' | 'flood' | 'drought'>('normal');
  const [hasFloodDefense, setHasFloodDefense] = useState<boolean>(false);
  const [hasDroughtDefense, setHasDroughtDefense] = useState<boolean>(false);

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

  // Sync when initialPlot changes from Farm Dashboard
  useEffect(() => {
    if (initialPlot) {
      setSelectedCrop(initialPlot.cropId);
      setPendingCrop(initialPlot.cropId);
      setPlotAreaRai(initialPlot.areaRai);
      setUploadedImageName(`ภาพถ่ายแปลง: ${initialPlot.name}`);
      setHasSimulated(true);
    }
  }, [initialPlot]);

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
      // Default: Rayong Durian Orchard (ยกร่องลูกฟูก + สระน้ำ)
      ctx.fillStyle = '#395333';
      ctx.fillRect(0, 0, 1024, 1024);

      // Farm boundary
      ctx.strokeStyle = '#273822';
      ctx.lineWidth = 16;
      ctx.strokeRect(30, 30, 964, 964);

      // Irrigation retention pond (สระกักเก็บน้ำ)
      ctx.fillStyle = '#244b5c';
      ctx.beginPath();
      ctx.ellipse(820, 220, 120, 80, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5e7f67';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Raised bed mounds (ร่องลูกฟูกขนานกัน)
      ctx.strokeStyle = '#4b382a';
      ctx.lineWidth = 18;
      for (let x = 120; x < 900; x += 150) {
        ctx.beginPath();
        ctx.moveTo(x, 80);
        ctx.lineTo(x, 940);
        ctx.stroke();
      }

      // Farm dirt road
      ctx.fillStyle = '#9c7a53';
      ctx.fillRect(30, 520, 964, 48);
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
  // Procedural 3-12 Part Composite Crop Builders (THREE.Group)
  // With Realistic 3D Fruits (Durian, Palm, Rubber, Rice, Cassava)
  // -------------------------------------------------------------
  const createDurianFruit = (fruitScale: number, isDistressed = false): THREE.Group => {
    const fruitGroup = new THREE.Group();

    // 1. Durian Stalk (ขั้วผลทุเรียน)
    const stalkGeo = new THREE.CylinderGeometry(0.02 * fruitScale, 0.03 * fruitScale, 0.35 * fruitScale, 6);
    const stalkMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.9 });
    const stalk = new THREE.Mesh(stalkGeo, stalkMat);
    stalk.position.y = 0.17 * fruitScale;
    stalk.castShadow = true;
    fruitGroup.add(stalk);

    // 2. Durian Body (ผลทุเรียนทรงรี หนามเตียนสีเขียวอมทอง)
    const fruitColor = isDistressed ? 0x8a7238 : 0x889228;
    const bodyGeo = new THREE.IcosahedronGeometry(0.28 * fruitScale, 1);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: fruitColor,
      roughness: 0.85,
      flatShading: true, // Gives distinct durian spine-cluster appearance
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = -0.15 * fruitScale;
    body.scale.set(1.0, 1.35, 1.0); // Elongated oval durian fruit shape
    body.castShadow = true;
    fruitGroup.add(body);

    // 3. Durian Calyx Tip (ก้นผลทุเรียน)
    const tipGeo = new THREE.ConeGeometry(0.05 * fruitScale, 0.08 * fruitScale, 5);
    const tipMat = new THREE.MeshStandardMaterial({ color: 0x4a3c20 });
    const tip = new THREE.Mesh(tipGeo, tipMat);
    tip.position.y = -0.52 * fruitScale;
    tip.rotation.x = Math.PI;
    fruitGroup.add(tip);

    return fruitGroup;
  };

  const buildDurianTree = (scale: number, distressed = false): THREE.Group => {
    const tree = new THREE.Group();

    // Trunk (ลำต้นไม้ผล)
    const trunkGeo = new THREE.CylinderGeometry(0.25 * scale, 0.45 * scale, 2.8 * scale, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.4 * scale;
    trunk.castShadow = true;
    tree.add(trunk);

    // Horizontal Primary Scaffold Branches (กิ่งหลักที่ผลทุเรียนจะห้อยอยู่)
    const branchAngles = [0.2, 1.8, 3.4, 4.9];
    branchAngles.forEach((angle, idx) => {
      const branchHeight = (1.9 + (idx % 2) * 0.4) * scale;
      const branchGeo = new THREE.CylinderGeometry(0.08 * scale, 0.12 * scale, 1.6 * scale, 6);
      const branchMat = new THREE.MeshStandardMaterial({ color: 0x422f20, roughness: 0.9 });
      const branch = new THREE.Mesh(branchGeo, branchMat);
      branch.position.set(0, branchHeight, 0);
      branch.rotation.z = Math.PI / 2.3;
      branch.rotation.y = angle;
      branch.castShadow = true;
      tree.add(branch);

      // Attach Hanging Durian Fruits under the branches if Year >= 3 & showFruits
      if (showFruits && timelineYear >= 3) {
        const fruitsPerBranch = timelineYear >= 10 ? 3 : timelineYear >= 5 ? 2 : 1;
        for (let f = 1; f <= fruitsPerBranch; f++) {
          const distAlongBranch = (0.5 + f * 0.38) * scale;
          const durianFruit = createDurianFruit(
            timelineYear >= 5 ? 1.0 * scale : 0.65 * scale,
            distressed
          );
          // Position hanging straight down underneath this branch
          const fx = Math.cos(angle) * distAlongBranch;
          const fz = Math.sin(angle) * distAlongBranch;
          durianFruit.position.set(fx, branchHeight - 0.25 * scale, fz);
          tree.add(durianFruit);
        }
      }
    });

    // Primary Canopy Tier (Shifts color if distressed)
    const canopy1Color = distressed ? 0x85752f : 0x1e5631;
    const canopy1Geo = new THREE.DodecahedronGeometry(1.45 * scale, 1);
    const canopy1Mat = new THREE.MeshStandardMaterial({ color: canopy1Color, roughness: 0.8, flatShading: true });
    const canopy1 = new THREE.Mesh(canopy1Geo, canopy1Mat);
    canopy1.position.y = 2.7 * scale;
    canopy1.scale.set(1.25, 0.9, 1.25);
    canopy1.castShadow = true;
    tree.add(canopy1);

    // Secondary Canopy Tier
    const canopy2Color = distressed ? 0x9e8c33 : 0x27743d;
    const canopy2Geo = new THREE.DodecahedronGeometry(1.05 * scale, 1);
    const canopy2Mat = new THREE.MeshStandardMaterial({ color: canopy2Color, roughness: 0.75, flatShading: true });
    const canopy2 = new THREE.Mesh(canopy2Geo, canopy2Mat);
    canopy2.position.y = 3.6 * scale;
    canopy2.castShadow = true;
    tree.add(canopy2);

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

  // -------------------------------------------------------------
  // Three.js Scene Setup & Lifecycle
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mountRef.current) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdce7d5);
    scene.fog = new THREE.Fog(0xdce7d5, 25, 75);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.5,
      200
    );
    camera.position.set(16, 18, 22);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 6;
    controls.maxDistance = 55;
    controlsRef.current = controls;

    const sunLight = new THREE.DirectionalLight(0xfff7e6, 1.4);
    sunLight.position.set(20, 30, 15);
    sunLight.castShadow = !isSoftwareGl;
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
    // True 5G Smart Agriculture IoT Sensor Towers (Nodes 1, 2, 3)
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

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();

      // Animate 5G Pulsing Wave Rings
      pulsingRings.forEach((r) => {
        r.scale.x = (r.scale.x + 0.02) % 2.5;
        r.scale.y = r.scale.x;
        r.scale.z = r.scale.x;
        const mat = r.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 1 - r.scale.x / 2.5);
      });

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
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
    // Update True 5G IoT Nodes Visibility
    if (iotNodesGroupRef.current) {
      iotNodesGroupRef.current.visible = show5GNodes;
    }
  }, [riskScenario, hasFloodDefense, hasDroughtDefense, show5GNodes]);

  // Re-populate Plants whenever Crop, Timeline, or Distress state changes
  useEffect(() => {
    if (!plantGroupRef.current) return;

    while (plantGroupRef.current.children.length > 0) {
      const child = plantGroupRef.current.children[0];
      plantGroupRef.current.remove(child);
    }

    if (selectedCrop === 'rice') {
      const ricePaddy = buildRicePaddy(isPlantDistressed);
      plantGroupRef.current.add(ricePaddy);
      return;
    }

    const spacing =
      selectedCrop === 'durian' ? 4.5 :
      selectedCrop === 'oilpalm' ? 4.8 :
      selectedCrop === 'rubber' ? 3.6 :
      selectedCrop === 'mango' ? 3.4 : 1.8;

    const countX = selectedCrop === 'cassava' ? 7 : 4;
    const countZ = selectedCrop === 'cassava' ? 7 : 4;

    for (let ix = -Math.floor(countX / 2); ix <= Math.floor(countX / 2); ix++) {
      for (let iz = -Math.floor(countZ / 2); iz <= Math.floor(countZ / 2); iz++) {
        const posX = ix * spacing + (Math.random() - 0.5) * 0.2;
        const posZ = iz * spacing + (Math.random() - 0.5) * 0.2;

        let plantMesh: THREE.Group;
        if (selectedCrop === 'durian') plantMesh = buildDurianTree(growthScale, isPlantDistressed);
        else if (selectedCrop === 'rubber') plantMesh = buildRubberTree(growthScale, isPlantDistressed);
        else if (selectedCrop === 'oilpalm') plantMesh = buildOilPalmTree(growthScale, isPlantDistressed);
        else if (selectedCrop === 'cassava') plantMesh = buildCassavaBush(growthScale, isPlantDistressed);
        else plantMesh = buildDurianTree(growthScale, isPlantDistressed);

        plantMesh.position.set(posX, 0, posZ);
        plantGroupRef.current.add(plantMesh);
      }
    }
  }, [selectedCrop, timelineYear, growthScale, isPlantDistressed, showFruits]);

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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                simulatorTab === 'pin_mapping'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{lang === 'th' ? '2. ปักหมุดวัดแปลงดาวเทียม (วิธีที่ 2)' : '2. Tap-to-Pin Mapping'}</span>
            </button>
          </div>
        </div>

        <span className="text-slate-500 font-mono text-[11px]">
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
      {/* 2D Upload to 3D Conversion Control Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
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
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-emerald-700" />
                <span>{lang === 'th' ? (show2DInspector ? 'ซ่อนภาพ 2D' : 'ดูภาพ 2D เทียบ 3D') : 'Toggle 2D/3D'}</span>
              </button>
            )}

            <button
              onClick={handleShare3DFarm}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
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
            className="md:col-span-1 border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
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
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
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

      {/* STEP 2: Choose What to Plant & Run 3D Prediction */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
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
            }}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{lang === 'th' ? 'เริ่มจำลองแปลงปลูก & ทำนายผลผลิต 3D' : 'Simulate & Predict 3D Farm'}</span>
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
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
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

      {/* STEP 3: Crisis & Risk Scenarios in 3D (Flooding, Drought, and Defense Engineering) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
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
              onClick={() => {
                setRiskScenario('normal');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                riskScenario === 'normal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'th' ? 'ปกติ' : 'Normal'}
            </button>
            <button
              onClick={() => {
                setRiskScenario('flood');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                riskScenario === 'flood'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lang === 'th' ? 'เสี่ยงน้ำท่วม' : 'Flood'}
            </button>
            <button
              onClick={() => {
                setRiskScenario('drought');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

              {/* 3D Defense Toggle Button */}
              <button
                onClick={() => setHasFloodDefense(!hasFloodDefense)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0 ${
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

              {/* 3D Defense Toggle Button */}
              <button
                onClick={() => setHasDroughtDefense(!hasDroughtDefense)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer shrink-0 ${
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

      {/* 3D WebGL Canvas Container - Responsive height for mobile with tour ID */}
      <div id="tour-step-2" className="relative w-full h-[460px] sm:h-[620px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Top Left Floating Spec Badge (Clean Light Theme) */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl p-2.5 sm:p-3 text-slate-800 shadow-md max-w-[220px] sm:max-w-xs pointer-events-none text-xs">
          <div className="flex items-center gap-2 mb-1">
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
          <div className="text-[10px] sm:text-[11px] text-slate-500 font-mono space-y-0.5">
            <div>{sqmToString(totalSqm, lang)}</div>
            <div className="truncate">{lang === 'th' ? 'ภาพฐาน:' : 'Base 2D:'} {uploadedImageName}</div>
            <div>{lang === 'th' ? 'จำนวนต้น:' : 'Trees:'} {totalTrees.toLocaleString()} {lang === 'th' ? 'ต้น' : 'trees'}</div>
            
            {/* 3D Fruit Telemetry Badge */}
            <div className="pt-1 border-t border-slate-100 text-emerald-700 font-semibold text-[10px] sm:text-[11px] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="truncate">
                {selectedCrop === 'durian'
                  ? timelineYear >= 3
                    ? lang === 'th'
                      ? `ผลทุเรียน: ~${timelineYear >= 10 ? 80 : timelineYear >= 5 ? 45 : 15} ลูก/ต้น`
                      : `Durians: ~${timelineYear >= 10 ? 80 : timelineYear >= 5 ? 45 : 15} fruits/tree`
                    : lang === 'th' ? 'สะสมตาดอก' : 'Vegetative growth'
                  : selectedCrop === 'rubber'
                  ? lang === 'th' ? 'น้ำยาง: ~8.4 กก./ไร่' : 'Latex: ~8.4 kg/rai'
                  : selectedCrop === 'oilpalm'
                  ? lang === 'th' ? 'ทะลายสุก: 4 ทะลาย' : 'Fresh fruit bunches'
                  : selectedCrop === 'rice'
                  ? lang === 'th' ? 'รวงทอง: 750 กก./ไร่' : 'Golden panicles'
                  : lang === 'th' ? 'หัวมัน: 4.5 ตัน/ไร่' : 'Cassava tubers'}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Controls: Satellite Heatmaps, 3D Fruit & Smart Agri-IoT Toggles (Clean Light Theme) */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-wrap items-center justify-end gap-1.5 max-w-[280px] sm:max-w-xl">
          {/* Satellite Layer Switcher Pills */}
          <div className="flex items-center gap-0.5 sm:gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 p-0.5 sm:p-1 rounded-xl text-slate-700 shadow-md text-[11px] sm:text-xs">
            <button
              onClick={() => setSatelliteLayer('normal')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                satelliteLayer === 'normal'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              2D/3D
            </button>
            <button
              onClick={() => setSatelliteLayer('ndvi')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                satelliteLayer === 'ndvi'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              NDVI
            </button>
            <button
              onClick={() => setSatelliteLayer('ndwi')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg transition-colors font-medium cursor-pointer ${
                satelliteLayer === 'ndwi'
                  ? 'bg-sky-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              NDWI
            </button>
          </div>

          {/* Smart Agri IoT Overlay Toggle */}
          <button
            onClick={() => setShow5GNodes(!show5GNodes)}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
              show5GNodes
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-slate-50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${show5GNodes ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
            <span>
              {show5GNodes
                ? lang === 'th' ? 'เซนเซอร์ IoT' : 'IoT Sensors'
                : lang === 'th' ? 'ดูเซนเซอร์' : 'Show Sensors'}
            </span>
          </button>

          {/* 3D Fruit Visibility Toggle Button */}
          <button
            onClick={() => setShowFruits(!showFruits)}
            className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${
              showFruits
                ? 'bg-teal-700 text-white border-teal-600 shadow-xs'
                : 'bg-white/95 text-slate-700 border-slate-200/90 hover:bg-slate-50'
            }`}
          >
            <Eye className={`w-3.5 h-3.5 ${showFruits ? 'text-white' : 'text-slate-500'}`} />
            <span>
              {showFruits
                ? lang === 'th' ? 'ผล 3D' : 'Fruits'
                : lang === 'th' ? 'แสดงผล' : 'Show Fruits'}
            </span>
          </button>

          {/* Camera View Angle Shortcuts */}
          <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md border border-slate-200/90 p-0.5 sm:p-1 rounded-xl text-slate-700 shadow-md text-[11px] sm:text-xs">
            <button
              onClick={() => {
                if (cameraRef.current && controlsRef.current) {
                  cameraRef.current.position.set(0, 32, 0.1);
                  controlsRef.current.target.set(0, 0, 0);
                  controlsRef.current.update();
                }
              }}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors font-medium flex items-center gap-1 cursor-pointer text-slate-700"
            >
              <Compass className="w-3 h-3 text-emerald-600" />
              <span>{lang === 'th' ? '90°' : 'Drone'}</span>
            </button>
            <button
              onClick={() => {
                if (cameraRef.current && controlsRef.current) {
                  cameraRef.current.position.set(16, 18, 22);
                  controlsRef.current.target.set(0, 0, 0);
                  controlsRef.current.update();
                }
              }}
              className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors font-medium flex items-center gap-1 cursor-pointer text-slate-700"
            >
              <Maximize2 className="w-3 h-3 text-sky-600" />
              <span>{lang === 'th' ? '45°' : '45°'}</span>
            </button>
          </div>
        </div>

        {/* Smart Agri IoT Telemetry Card: Clean Light Theme Docked neatly below buttons */}
        {show5GNodes && (
          <div className="absolute top-[88px] left-3 right-3 sm:left-auto sm:right-4 sm:top-[76px] z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3 sm:p-3.5 text-slate-900 max-w-none sm:max-w-xs shadow-xl space-y-2 animate-fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-xs tracking-tight text-slate-900">
                  {lang === 'th' ? 'สถานีเซนเซอร์วัดค่าไร่นา IoT' : 'Smart Agri IoT Station'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                  Latency: 4ms
                </span>
                <button
                  onClick={() => setShow5GNodes(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close sensor card"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Node Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[10px] sm:text-[11px] font-semibold text-center">
              <button
                onClick={() => setSelected5GNode('node-1')}
                className={`py-1 rounded-lg transition-colors cursor-pointer ${
                  selected5GNode === 'node-1'
                    ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'th' ? 'ดิน & NPK' : 'Soil'}
              </button>
              <button
                onClick={() => setSelected5GNode('node-2')}
                className={`py-1 rounded-lg transition-colors cursor-pointer ${
                  selected5GNode === 'node-2'
                    ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'th' ? 'อากาศ' : 'Weather'}
              </button>
              <button
                onClick={() => setSelected5GNode('node-3')}
                className={`py-1 rounded-lg transition-colors cursor-pointer ${
                  selected5GNode === 'node-3'
                    ? 'bg-white text-emerald-800 shadow-2xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang === 'th' ? 'ระบบน้ำ' : 'Water'}
              </button>
            </div>

            {/* Node Live Readings */}
            <div className="text-[11px] sm:text-xs space-y-1.5 pt-0.5 font-mono">
              {selected5GNode === 'node-1' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ความชื้นในดิน:</span>
                    <span className="text-emerald-700 font-bold">68.4% (เหมาะสม)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ค่าความเป็นกรด-ด่าง (pH):</span>
                    <span className="text-slate-800 font-bold">6.5 pH (ดินดี)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ธาตุอาหาร N-P-K:</span>
                    <span className="text-amber-700 font-bold">85 - 42 - 120 ppm</span>
                  </div>
                </>
              )}

              {selected5GNode === 'node-2' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">อุณหภูมิอากาศ:</span>
                    <span className="text-amber-700 font-bold">31.2 °C</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ความชื้นสัมพัทธ์ (RH):</span>
                    <span className="text-sky-700 font-bold">74%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ความเข้มแสงแดด:</span>
                    <span className="text-amber-700 font-bold">820 W/m²</span>
                  </div>
                </>
              )}

              {selected5GNode === 'node-3' && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ระดับน้ำในคูสระ:</span>
                    <span className="text-sky-700 font-bold">28 ซม. (ปกติ)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">วาล์วน้ำหยดอัตโนมัติ:</span>
                    <span className="text-emerald-700 font-bold">ทำงานอยู่ (Auto)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">ประหยัดน้ำสะสม:</span>
                    <span className="text-teal-700 font-bold">35%</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-1.5 flex items-center justify-between">
              <span>โครงข่ายเซนเซอร์เกษตรดิจิทัล (Smart Agri)</span>
              <span className="text-emerald-700 font-semibold">● Online 100%</span>
            </div>
          </div>
        )}

        {/* Collapsible Unified Bottom Control Dock (Clean Light Theme) */}
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-4xl transition-all duration-300 ease-in-out ${
            isDockCollapsed ? 'translate-y-[calc(100%-36px)]' : 'translate-y-0'
          }`}
        >
          <div className="flex justify-center -mb-px">
            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-white/95 text-slate-700 text-xs font-semibold border-t border-x border-slate-200/90 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer"
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

          <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl p-4 text-slate-900 shadow-xl space-y-3">
            {/* Timeline Growth Scrubber (3, 5, 10 Years as requested!) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{lang === 'th' ? 'จำลองการเจริญเติบโตในอนาคต:' : 'Future Timeline Simulation:'}</span>
                  <span className="text-emerald-700 font-bold font-mono text-sm">
                    {timelineYear === 0
                      ? lang === 'th' ? 'ปีที่ 0 (เริ่มลงกล้า)' : 'Year 0 (Sapling)'
                      : lang === 'th'
                      ? `ปีที่ ${timelineYear} (${timelineYear >= crop.yearsToFirstHarvest ? 'ระยะให้ผลผลิตเต็มที่' : 'ระยะสะสมอาหาร'})`
                      : `Year ${timelineYear} (${timelineYear >= crop.yearsToFirstHarvest ? 'Full Bearing' : 'Vegetative'})`}
                  </span>
                </span>

                <span className="text-[11px] text-slate-500">
                  {lang === 'th' ? 'กดเลือก 3, 5 หรือ 10 ปีเพื่อดูขนาดต้นและผลผลิต' : 'Select 3, 5, or 10 years'}
                </span>
              </div>

              {/* Segmented Timeline Buttons with 3, 5, 10 Years Priority */}
              <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-5 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                  {[0, 1, 3, 5, 10].map((yr) => (
                    <button
                      key={yr}
                      onClick={() => {
                        setTimelineYear(yr);
                        setIsPlaying(false);
                      }}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        timelineYear === yr
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                    >
                      {yr === 0 ? (lang === 'th' ? 'เริ่มปลูก' : 'Yr 0') : `${yr} ${lang === 'th' ? 'ปี' : 'Yrs'}`}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isPlaying
                      ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse'
                      : 'bg-white border-slate-200 text-emerald-700 hover:bg-slate-50'
                  }`}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>{lang === 'th' ? 'หยุด' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{lang === 'th' ? 'เล่นจำลอง' : 'Auto-Play'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Farm Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-semibold">
                  {lang === 'th' ? 'ขนาดทรงพุ่มเฉลี่ย' : 'Canopy Diameter'}
                </span>
                <span className="text-sm font-bold text-emerald-700 font-mono tabular-nums">
                  {canopyDiameterMeters} {lang === 'th' ? 'เมตร' : 'm'}
                </span>
              </div>

              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-semibold">
                  {lang === 'th' ? 'ผลผลิตคาดการณ์รวม' : 'Estimated Harvest'}
                </span>
                <span className="text-sm font-bold text-amber-700 font-mono tabular-nums">
                  {projectedHarvestTons} {lang === 'th' ? 'ตัน/ปี' : 'tons/yr'}
                </span>
              </div>

              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-semibold">
                  {lang === 'th' ? 'การใช้น้ำต่อวัน' : 'Water Need'}
                </span>
                <span className="text-sm font-bold text-sky-700 font-mono tabular-nums">
                  {crop.waterRequirement === 'high' ? '120-150 L/ต้น' : '40-60 L/ต้น'}
                </span>
              </div>

              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80">
                <span className="text-[10px] text-slate-500 block font-semibold">
                  {lang === 'th' ? 'ระยะการให้ผลผลิต' : 'Bearing Stage'}
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {timelineYear < crop.yearsToFirstHarvest
                    ? lang === 'th' ? 'สะสมอาหาร' : 'Pre-bearing'
                    : lang === 'th' ? 'เก็บเกี่ยวสมบูรณ์' : 'Full Production'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};
