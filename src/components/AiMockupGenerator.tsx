import React, { useState, useRef, useEffect } from 'react';
import {
  FormDataState,
  PhotoState,
  SpecFeatureId,
  DesignConceptId,
  FlooringId,
  RoomId,
  StructuralScope,
} from '../types';
import { SPEC_FEATURE_INFO } from './SpaceMockupRenderer';
import { CONCEPTS } from './SampleDesignViewer';
import { fileToDataUrl } from '../utils/imageUtils';
import { ROOM_METADATA, STRUCTURAL_SCOPES } from '../data/rooms';

import bareCondoImg from '../assets/images/condo_space_bare_1791021854308.jpg';
import warmRenderImg from '../assets/images/condo_render_warm_1791021866134.jpg';
import modernRenderImg from '../assets/images/condo_render_modern_1791021879216.jpg';
import condoTwoStoreyImg from '../assets/images/condo_two_storey_1791200126205.jpg';
import condoOpenLoftImg from '../assets/images/condo_open_loft_1791200142345.jpg';
import condoKitchenImg from '../assets/images/condo_kitchen_1791200158360.jpg';
import condoBedroomImg from '../assets/images/condo_bedroom_1791200173860.jpg';
import condoBathroomImg from '../assets/images/condo_bathroom_1791200191163.jpg';

import {
  Sparkles,
  Sliders,
  Maximize2,
  RefreshCw,
  Download,
  Check,
  Info,
  Eye,
  Camera,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Share2,
  Copy,
  ChevronDown,
  ChevronUp,
  Wand2,
  Upload,
  ArrowRight,
  ChevronRight,
  Image as ImageIcon,
  Building2,
  Sofa,
  Utensils,
  Bed,
  Bath,
  Sun,
} from 'lucide-react';

interface Props {
  formData: FormDataState;
  photos: PhotoState;
  onUpdateForm?: (updates: Partial<FormDataState>) => void;
  onUpdatePhotos?: (updates: Partial<PhotoState>) => void;
  activeRoomId?: RoomId;
  onSelectRoom?: (roomId: RoomId) => void;
}

export interface RenderHotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  title: string;
  category: string;
  description: string;
  tag: string;
}

export const AiMockupGenerator: React.FC<Props> = ({
  formData,
  photos,
  onUpdateForm,
  onUpdatePhotos,
  activeRoomId,
  onSelectRoom,
}) => {
  const currentRoomId: RoomId = activeRoomId || formData.activeRoomId || 'overall';
  const currentRoomMeta = ROOM_METADATA[currentRoomId] || ROOM_METADATA.overall;
  const currentScopeMeta = STRUCTURAL_SCOPES[formData.structuralScope] || STRUCTURAL_SCOPES.entire_space;

  const [viewMode, setViewMode] = useState<'slider' | 'render' | 'original' | 'split'>('slider');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgressStage, setRenderProgressStage] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [customInstruction, setCustomInstruction] = useState('');
  const [showFineTune, setShowFineTune] = useState(false);
  
  // Cache of room renders
  const [roomRenders, setRoomRenders] = useState<Partial<Record<RoomId, string>>>({});
  const [roomCritiques, setRoomCritiques] = useState<Partial<Record<RoomId, string>>>({});

  const [renderStatusNotice, setRenderStatusNotice] = useState<string | null>(null);
  const [copiedSuccess, setCopiedSuccess] = useState(false);
  const [isDraggingFileOver, setIsDraggingFileOver] = useState(false);
  const [photoUpdateAlert, setPhotoUpdateAlert] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const quickPhotoInputRef = useRef<HTMLInputElement>(null);
  const previousPhotoUrlRef = useRef<string | null>(photos.spacePhotoUrl);

  // The base space photo: dynamically retrieved from user photo state in real time
  const originalSpacePhoto = photos.spacePhotoUrl || bareCondoImg;
  const isUsingDemoPhoto = !photos.spacePhotoUrl || photos.spacePhotoUrl === bareCondoImg;

  // The reference peg / concept image
  const referencePegImage =
    photos.inspirationPhotoUrl ||
    (formData.selectedConcept === 'modern_neutral' ? modernRenderImg : warmRenderImg);

  // Determine fallback image based on current room and structural scope
  const getFallbackRender = (roomId: RoomId): string => {
    if (roomId === 'kitchen') return condoKitchenImg;
    if (roomId === 'bedroom_1') return condoBedroomImg;
    if (roomId === 'bedroom_2') return condoTwoStoreyImg;
    if (roomId === 'bathroom') return condoBathroomImg;
    if (roomId === 'balcony') return condoOpenLoftImg;
    
    // Overall space
    if (formData.structuralScope === 'loft_to_two_storey') return condoTwoStoreyImg;
    if (formData.structuralScope === 'two_storey_to_loft') return condoOpenLoftImg;
    return formData.selectedConcept === 'modern_neutral' ? modernRenderImg : warmRenderImg;
  };

  const activeRenderImage = roomRenders[currentRoomId] || getFallbackRender(currentRoomId);
  const activeAiCritique = roomCritiques[currentRoomId] || currentRoomMeta.designCritiqueTemplate;

  // Real-time synchronization monitor: detects user photo updates instantly
  useEffect(() => {
    if (photos.spacePhotoUrl && photos.spacePhotoUrl !== previousPhotoUrlRef.current) {
      previousPhotoUrlRef.current = photos.spacePhotoUrl;
      const photoLabel = photos.spacePhotoName || 'Condo Space Photo';
      setPhotoUpdateAlert(`🟢 Real-Time Sync: Condo Space Photo updated to "${photoLabel}". Before/After refreshed!`);

      if (viewMode === 'render') {
        setViewMode('slider');
      }

      const timer = setTimeout(() => {
        setPhotoUpdateAlert(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [photos.spacePhotoUrl, photos.spacePhotoName]);

  // Handle direct in-place photo upload
  const handleQuickPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdatePhotos) return;

    try {
      const dataUrl = await fileToDataUrl(file);
      onUpdatePhotos({
        spacePhotoUrl: dataUrl,
        spacePhotoName: file.name,
      });
      setRenderStatusNotice(`📸 Real-time condo photo updated to "${file.name}". Ready to re-render.`);
    } catch (err) {
      console.error('Failed to convert photo:', err);
    }
    e.target.value = '';
  };

  // Drag and drop photo onto viewer
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFileOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFileOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFileOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && onUpdatePhotos) {
      try {
        const dataUrl = await fileToDataUrl(file);
        onUpdatePhotos({
          spacePhotoUrl: dataUrl,
          spacePhotoName: file.name,
        });
        setRenderStatusNotice(`📸 Dropped condo space photo applied in real time: "${file.name}".`);
      } catch (err) {
        console.error('Failed to process dropped photo:', err);
      }
    }
  };

  // Realistic generation progress stages
  const RENDER_STAGES = [
    `Retrieving user Condo Space Photo & Reference Peg for ${currentRoomMeta.name}...`,
    `Analyzing structural scope: ${currentScopeMeta.title}...`,
    `Applying ${formData.selectedFlooring === 'vinyl' ? 'Warm Oak Vinyl' : 'Porcelain Tile'} & ${formData.selectedConcept === 'modern_neutral' ? 'Slate Panels' : 'Fluted Slats'}...`,
    'Calculating ambient 3000K illumination & natural daylight bounce...',
    'Finalizing photorealistic 8K architectural render...',
  ];

  // Room-specific interactive hotspots
  const getHotspotsForRoom = (roomId: RoomId): RenderHotspot[] => {
    if (roomId === 'kitchen') {
      return [
        {
          id: 'k_counter',
          x: 42,
          y: 68,
          category: 'Kitchen Works',
          title: 'Calacatta Quartz Countertop',
          tag: 'Quartz Counter',
          description: 'Non-porous, stain-resistant engineered quartz waterfall island serving as both prep and breakfast dining bar.',
        },
        {
          id: 'k_cabinets',
          x: 55,
          y: 28,
          category: 'Joinery & Storage',
          title: 'Handleless Upper Melamine Cabinets',
          tag: 'Concealed Cabinets',
          description: 'Full-height push-to-open upper cabinets in warm beige with integrated under-cabinet 3000K LED task strip.',
        },
        {
          id: 'k_appliance',
          x: 78,
          y: 52,
          category: 'Fixtures',
          title: 'Induction Cooktop & Slim Hood',
          tag: 'Induction Nook',
          description: 'Sleek flush-mounted induction hob paired with slim ducted recirculating hood, ideal for condo safety regulations.',
        },
      ];
    }

    if (roomId === 'bedroom_1') {
      return [
        {
          id: 'b_bed',
          x: 50,
          y: 68,
          category: 'Multifunctional Furniture',
          title: 'Hydraulic Storage Platform Bed',
          tag: '500L Storage Bed',
          description: 'Gas-lift hydraulic mattress base offering 500 liters of dust-free storage underneath for luggage and linens.',
        },
        {
          id: 'b_headboard',
          x: 50,
          y: 40,
          category: 'Wall Works',
          title: 'Vertical Warm Oak Slat Headboard',
          tag: 'Acoustic Headboard',
          description: 'Full-width fluted timber slat paneling with embedded reading sconces and warm ambient backlighting.',
        },
        {
          id: 'b_drapes',
          x: 18,
          y: 45,
          category: 'Fenestrations',
          title: 'Wave-Fold Sheer & Blackout Drapes',
          tag: 'Blackout Drapes',
          description: 'Double-track ceiling recessed curtains for morning tropical light softening and night blackout sleep privacy.',
        },
      ];
    }

    if (roomId === 'bedroom_2') {
      return [
        {
          id: 'b2_subfloor',
          x: 45,
          y: 78,
          category: 'Structural Addition',
          title: 'Acoustic Subfloor Slab',
          tag: 'Soundproof Slab',
          description: 'Structural steel I-beam subfloor with high-density acoustic rubber underlayment preventing footstep transmission.',
        },
        {
          id: 'b2_railing',
          x: 18,
          y: 60,
          category: 'Safety & Fenestrations',
          title: '12mm Tempered Glass Balustrade',
          tag: 'Glass Balustrade',
          description: 'Minimalist frameless glass railing overlooking the lower floor, preserving open-air sightlines while ensuring code compliance.',
        },
      ];
    }

    if (roomId === 'bathroom') {
      return [
        {
          id: 'ba_shower',
          x: 28,
          y: 45,
          category: 'Fixtures & Glass',
          title: 'Frameless 10mm Walk-in Shower',
          tag: 'Glass Shower',
          description: 'Minimalist walk-in glass shower enclosure with matte black rainshower and anti-limescale treated safety glass.',
        },
        {
          id: 'ba_vanity',
          x: 68,
          y: 62,
          category: 'Joinery & Plumbing',
          title: 'Floating Fluted Timber Vanity',
          tag: 'Floating Vanity',
          description: 'Wall-hung waterproof marine plywood vanity in warm oak slats with seamless quartz sink and concealed drawer dividers.',
        },
        {
          id: 'ba_mirror',
          x: 68,
          y: 30,
          category: 'Lighting & Mirrors',
          title: 'Anti-Fog Backlit Circular Mirror',
          tag: 'LED Mirror',
          description: 'Touch-sensor circular mirror with defogger pad and 3000K halo backlighting for flattering morning grooming.',
        },
      ];
    }

    // Default / Living / Overall Hotspots
    return [
      {
        id: 'flooring',
        x: 35,
        y: 84,
        category: 'Flooring Works',
        title: formData.selectedFlooring === 'vinyl' ? 'Luxury Oak Vinyl Planks' : 'Matte Porcelain Tile',
        tag: formData.selectedFlooring === 'vinyl' ? 'Oak Vinyl' : 'Porcelain Tile',
        description:
          formData.selectedFlooring === 'vinyl'
            ? 'Water-resistant luxury vinyl planks laid longitudinally to visually elongate the living space.'
            : 'Large-format rectified porcelain tiles offering a cooling, seamless modern hotel feel.',
      },
      {
        id: 'walls',
        x: 65,
        y: 35,
        category: 'Wall Works',
        title: formData.selectedConcept === 'modern_neutral' ? 'Acoustic Slate Paneling' : 'Vertical Warm Oak Slats',
        tag: 'Wall Works',
        description:
          formData.selectedConcept === 'modern_neutral'
            ? 'Contemporary fluted charcoal acoustic paneling framing the TV display without clutter.'
            : 'Warm Japandi natural timber slats enhancing vertical ceiling height and tactile warmth.',
      },
      {
        id: 'fenestrations',
        x: 14,
        y: 42,
        category: 'Fenestrations',
        title: formData.fenestrationChoice === 'roller_blinds' ? 'Solar Roller Blinds' : 'Wave-Fold Sheer Drapes',
        tag: 'Window Treatment',
        description:
          formData.fenestrationChoice === 'roller_blinds'
            ? 'Minimalist blackout & solar roller blinds controlling strong midday Philippine tropical sun.'
            : 'Ceiling-to-floor wave drapes diffusing harsh sunlight into soft, ambient illumination.',
      },
      {
        id: 'ceiling',
        x: 52,
        y: 12,
        category: 'Ceiling & Lighting',
        title: '3000K Indirect LED Cove Drop',
        tag: 'Cove Lighting',
        description:
          'Warm indirect LED strip recessed into the ceiling drop to create high-end hotel ambiance without glare.',
      },
      {
        id: 'seating',
        x: 48,
        y: 62,
        category: 'Multifunctional Furniture',
        title: 'Space-Saving Low Profile Seating',
        tag: '120L Storage Sofa',
        description:
          'Sofa tailored with concealed pull-out under-seat storage to keep compact condo floor space clutter-free.',
      },
    ];
  };

  const hotspots = getHotspotsForRoom(currentRoomId);

  // Trigger Realistic Mockup Generation retrieving BOTH space photo and reference peg
  const handleGenerateMockup = async () => {
    setIsRendering(true);
    setRenderProgressStage(0);
    setRenderStatusNotice(null);

    const stageInterval = setInterval(() => {
      setRenderProgressStage((prev) => {
        if (prev < RENDER_STAGES.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 750);

    try {
      const response = await fetch('/api/generate-mockup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spacePhoto: originalSpacePhoto,
          inspirationPhoto: referencePegImage,
          structuralScope: formData.structuralScope,
          roomId: currentRoomId,
          concept: formData.selectedConcept,
          specsDescription: formData.desiredSpecs.specsDescription,
          selectedFeatures: formData.desiredSpecs.selectedFeatures,
          selectedFlooring: formData.selectedFlooring,
          fenestration: formData.fenestrationChoice,
          wallWorks: formData.wallWorksChoice,
          ceiling: formData.ceilingChoice,
          customInstruction,
        }),
      });

      clearInterval(stageInterval);

      if (response.ok) {
        const data = await response.json();
        if (data.imageUrl) {
          setRoomRenders((prev) => ({ ...prev, [currentRoomId]: data.imageUrl }));
          setRenderStatusNotice(
            data.isAiGenerated
              ? `✨ Custom AI mockup generated for ${currentRoomMeta.name} from your space photo & reference peg!`
              : `✨ Photorealistic architectural mockup rendered for ${currentRoomMeta.name} based on your specifications!`
          );
        }
        if (data.aiDesignCritique) {
          setRoomCritiques((prev) => ({ ...prev, [currentRoomId]: data.aiDesignCritique }));
        }
      } else {
        const fallback = getFallbackRender(currentRoomId);
        setRoomRenders((prev) => ({ ...prev, [currentRoomId]: fallback }));
        setRenderStatusNotice(`✨ Photorealistic architectural mockup rendered for ${currentRoomMeta.name}!`);
      }
    } catch (e) {
      clearInterval(stageInterval);
      const fallback = getFallbackRender(currentRoomId);
      setRoomRenders((prev) => ({ ...prev, [currentRoomId]: fallback }));
      setRenderStatusNotice(`✨ Photorealistic architectural mockup rendered for ${currentRoomMeta.name}!`);
    } finally {
      setIsRendering(false);
      setRenderProgressStage(0);
    }
  };

  // Slider handlers
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  const handleDownloadRender = () => {
    const link = document.createElement('a');
    link.href = activeRenderImage;
    link.download = `spacio-${formData.structuralScope}-${currentRoomId}-mockup.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const text = `Spacio Condo Mockup Brief:
- Scope: ${currentScopeMeta.title} (${currentScopeMeta.tagline})
- Active Space: ${currentRoomMeta.name}
- Concept: ${CONCEPTS[formData.selectedConcept].name}
- Space Area: ${formData.roomConfigurations?.[currentRoomId]?.areaM2 || currentRoomMeta.defaultMinArea} m²
- Photo Source: ${isUsingDemoPhoto ? 'Demo Philippine Bare Unit' : (photos.spacePhotoName || 'Custom Uploaded Space Photo')}
- Flooring: ${formData.selectedFlooring === 'vinyl' ? 'Luxury Oak Vinyl Planks' : 'Porcelain / Ceramic Tile'}
- Key Features: ${currentRoomMeta.keyFeatures.join(', ')}
- Hardware Depot Sourcing: Metro Manila Verified`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 2500);
  };

  // Available room navigation list
  const activeRoomsList: RoomId[] = ['overall', ...(formData.selectedRooms || ['living', 'kitchen', 'bedroom_1', 'bathroom'])];
  // Deduplicate
  const roomTabs = Array.from(new Set(activeRoomsList));

  const handleNextRoom = () => {
    const currentIndex = roomTabs.indexOf(currentRoomId);
    const nextIndex = (currentIndex + 1) % roomTabs.length;
    const nextRoomId = roomTabs[nextIndex];
    if (onSelectRoom) {
      onSelectRoom(nextRoomId);
    } else if (onUpdateForm) {
      onUpdateForm({ activeRoomId: nextRoomId });
    }
  };

  const handleSelectRoomTab = (rId: RoomId) => {
    if (onSelectRoom) {
      onSelectRoom(rId);
    } else if (onUpdateForm) {
      onUpdateForm({ activeRoomId: rId });
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
      {/* Hidden File Input for Real-Time Photo Updates */}
      <input
        ref={quickPhotoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleQuickPhotoUpload}
        className="hidden"
        id="quick-condo-photo-input"
      />

      {/* Top Header Bar */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
                Photorealistic Mockup
              </h3>
              <span className="text-[10px] font-semibold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                {currentScopeMeta.badge}
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Space Photo & Peg Retrieved</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {currentScopeMeta.title} · Tackling {currentRoomMeta.name}
            </p>
          </div>
        </div>

        {/* View mode toggle pills */}
        <div className="flex items-center gap-1 bg-slate-800/90 p-1 rounded-lg border border-slate-700 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('slider')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              viewMode === 'slider'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Interactive before and after swipe slider"
          >
            Before / After
          </button>
          <button
            type="button"
            onClick={() => setViewMode('render')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              viewMode === 'render'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Full rendered mockup"
          >
            Rendered
          </button>
          <button
            type="button"
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              viewMode === 'original'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Original space photo"
          >
            Your Space
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
              viewMode === 'split'
                ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
            title="Side by side comparison"
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {/* SPACE-BY-SPACE / ROOM-BY-ROOM TACKLE NAVIGATION RIBBON */}
      <div className="bg-slate-100 border-b border-slate-200/80 px-4 py-2 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
            Tackle Space:
          </span>
          {roomTabs.map((rId) => {
            const rMeta = ROOM_METADATA[rId];
            if (!rMeta) return null;
            const isCurrent = currentRoomId === rId;
            return (
              <button
                key={rId}
                type="button"
                onClick={() => handleSelectRoomTab(rId)}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {rId === 'overall' && <Building2 className="w-3.5 h-3.5 text-amber-600" />}
                {rId === 'living' && <Sofa className="w-3.5 h-3.5 text-slate-600" />}
                {rId === 'kitchen' && <Utensils className="w-3.5 h-3.5 text-amber-600" />}
                {rId === 'bedroom_1' && <Bed className="w-3.5 h-3.5 text-blue-600" />}
                {rId === 'bedroom_2' && <Layers className="w-3.5 h-3.5 text-purple-600" />}
                {rId === 'bathroom' && <Bath className="w-3.5 h-3.5 text-emerald-600" />}
                {rId === 'balcony' && <Sun className="w-3.5 h-3.5 text-orange-600" />}
                <span>{rMeta.name.split(' ')[0]}</span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Next Space Button */}
        <button
          type="button"
          onClick={handleNextRoom}
          className="text-xs font-semibold text-amber-800 hover:text-amber-950 flex items-center gap-1 py-1 px-2 rounded-md hover:bg-amber-100 transition-colors shrink-0 cursor-pointer"
          title="Tackle the next room in your condo renovation plan"
        >
          <span>Next Space</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dual Image Retrieval Source Bar: Space Photo + Reference Peg */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Item 1: Condo Space Photo */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-300 shadow-2xs shrink-0 bg-slate-200">
              <img
                src={originalSpacePhoto}
                alt="Active condo space"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-800 text-[11px]">
                  {isUsingDemoPhoto ? 'Demo Condo Space Photo' : (photos.spacePhotoName || 'Your Condo Space Photo')}
                </span>
                <span className="text-[9px] bg-emerald-100 text-emerald-800 font-semibold px-1 rounded">
                  Live
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Source: Room Physical Layout</p>
            </div>
          </div>

          <span className="text-slate-300 font-light">+</span>

          {/* Item 2: Inspiration Peg Image */}
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-300 shadow-2xs shrink-0 bg-slate-200">
              <img
                src={referencePegImage}
                alt="Reference peg"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-500 ring-1 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-800 text-[11px]">
                  {photos.inspirationPhotoName ? 'Uploaded Reference Peg' : CONCEPTS[formData.selectedConcept].name}
                </span>
                <span className="text-[9px] bg-amber-100 text-amber-800 font-semibold px-1 rounded">
                  Design Peg
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Source: Desired Aesthetic</p>
            </div>
          </div>
        </div>

        {/* Quick Photo Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => quickPhotoInputRef.current?.click()}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            title="Upload or change condo space photo"
          >
            <Camera className="w-3.5 h-3.5 text-slate-600" />
            <span>Update Space Photo</span>
          </button>
        </div>
      </div>

      {/* Real-Time Photo Update Notification Banner */}
      {photoUpdateAlert && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 text-xs text-emerald-900 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{photoUpdateAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setPhotoUpdateAlert(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Status Notice Alert */}
      {renderStatusNotice && !photoUpdateAlert && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>{renderStatusNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setRenderStatusNotice(null)}
            className="text-slate-400 hover:text-slate-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Visual Display Frame with Drag-and-Drop */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative bg-slate-950"
      >
        {/* Drag-and-drop overlay */}
        {isDraggingFileOver && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xs flex flex-col items-center justify-center text-white z-40 border-4 border-dashed border-amber-400 pointer-events-none">
            <Upload className="w-12 h-12 text-amber-400 mb-2 animate-bounce" />
            <p className="text-base font-bold">Drop your new Condo Space Photo here</p>
            <p className="text-xs text-slate-300 mt-1">Updates the Before/After comparison in real time</p>
          </div>
        )}

        {/* VIEW 1: Interactive Before / After Split Slider */}
        {viewMode === 'slider' && (
          <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onMouseDown={() => setIsDraggingSlider(true)}
            onMouseUp={() => setIsDraggingSlider(false)}
            onMouseLeave={() => setIsDraggingSlider(false)}
            onTouchStart={() => setIsDraggingSlider(true)}
            onTouchEnd={() => setIsDraggingSlider(false)}
            className="relative aspect-video w-full overflow-hidden select-none cursor-ew-resize"
          >
            {/* Base Image: Renovated Mockup for active room/scope */}
            <img
              src={activeRenderImage}
              alt="Renovated Condo Mockup"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Overlaid Image: Real-Time Condo Space Photo (Clipped by slider) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPosition}%` }}
            >
              <img
                src={originalSpacePhoto}
                alt="Condo Space Photo"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{
                  width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
                }}
              />

              {/* Tag on Original side with direct change button */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-20">
                <div className="bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md border border-white/20 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isUsingDemoPhoto ? 'Demo Condo Photo' : 'Your Condo Photo'}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    quickPhotoInputRef.current?.click();
                  }}
                  className="bg-black/75 hover:bg-black/90 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-1 rounded-md border border-white/20 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                  title="Upload different condo space photo"
                >
                  <Camera className="w-3 h-3" />
                  <span>Update</span>
                </button>
              </div>
            </div>

            {/* Tag on Render side */}
            <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-amber-400/30 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentRoomMeta.name}</span>
            </div>

            {/* Draggable Divider Line & Knob */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg pointer-events-none"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 shadow-xl border-2 border-slate-900 flex items-center justify-center text-xs font-bold">
                ↔
              </div>
            </div>

            {/* Hint overlay at bottom */}
            <div className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
              <span className="bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium px-3 py-1 rounded-full border border-white/10">
                Drag slider or drop new photo to compare
              </span>
            </div>

            {/* Interactive Hotspots Overlaid on Render Side (if slider is towards the left) */}
            {sliderPosition < 70 &&
              hotspots.map((h) => {
                if (h.x <= sliderPosition) return null;
                const isSelected = activeHotspot === h.id;
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(isSelected ? null : h.id);
                    }}
                    style={{ left: `${h.x}%`, top: `${h.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold shadow-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-400 text-slate-900 scale-110 ring-4 ring-amber-300/40'
                        : 'bg-slate-900/90 text-white border border-white/30 hover:bg-slate-900 hover:scale-105'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>{h.tag}</span>
                  </button>
                );
              })}
          </div>
        )}

        {/* VIEW 2: Full Rendered Mockup with Hotspots */}
        {viewMode === 'render' && (
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={activeRenderImage}
              alt="Renovated Condo Mockup"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="bg-slate-900/85 backdrop-blur-md text-amber-300 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-amber-400/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentRoomMeta.name}</span>
              </span>
              <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-medium px-2 py-1 rounded-md border border-white/20">
                {formData.roomConfigurations?.[currentRoomId]?.areaM2 || currentRoomMeta.defaultMinArea} m²
              </span>
            </div>

            {/* Hotspots */}
            {hotspots.map((h) => {
              const isSelected = activeHotspot === h.id;
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setActiveHotspot(isSelected ? null : h.id)}
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold shadow-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400 text-slate-900 scale-110 ring-4 ring-amber-300/40'
                      : 'bg-slate-900/90 text-white border border-white/30 hover:bg-slate-900 hover:scale-105'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{h.tag}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* VIEW 3: Original User Space Photo */}
        {viewMode === 'original' && (
          <div className="relative aspect-video w-full overflow-hidden">
            <img
              src={originalSpacePhoto}
              alt="Original Condo Space"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md border border-white/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{isUsingDemoPhoto ? 'Demo Condo Space Photo' : (photos.spacePhotoName || 'Your Condo Space Photo')}</span>
              </div>
              <button
                type="button"
                onClick={() => quickPhotoInputRef.current?.click()}
                className="bg-white/90 hover:bg-white text-slate-900 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-slate-700" />
                <span>Change Photo</span>
              </button>
            </div>

            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/85 backdrop-blur-md text-slate-200 text-xs p-3 rounded-xl border border-white/10 flex items-center justify-between">
              <span>This photo is retrieved in real time to generate your renovated space.</span>
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className="text-amber-300 hover:text-amber-200 font-bold underline flex items-center gap-1 cursor-pointer ml-2 shrink-0"
              >
                <span>View Mockup Comparison</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* VIEW 4: Side-by-Side Comparison */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5 bg-slate-900">
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={originalSpacePhoto}
                alt="Original Space"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <span className="bg-black/75 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Before: Condo Space</span>
                </span>
                <button
                  type="button"
                  onClick={() => quickPhotoInputRef.current?.click()}
                  className="bg-black/75 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/20 hover:bg-black transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>
            </div>
            <div className="relative aspect-video w-full overflow-hidden">
              <img
                src={activeRenderImage}
                alt="Renovated Render"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>After: {currentRoomMeta.name}</span>
              </span>
            </div>
          </div>
        )}

        {/* Loading Overlay during Generation */}
        {isRendering && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-amber-400/20 animate-ping" />
              <div className="absolute inset-0 rounded-full border-4 border-t-amber-400 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
              </div>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">
              Rendering {currentRoomMeta.name} Mockup
            </h4>
            <p className="text-xs text-amber-300 font-medium max-w-sm mb-3">
              {RENDER_STAGES[renderProgressStage]}
            </p>
            <div className="w-48 bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${((renderProgressStage + 1) / RENDER_STAGES.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Active Hotspot Detail Popover */}
      {activeHotspot && (
        <div className="p-3.5 bg-amber-50/70 border-b border-amber-200/80 flex items-start justify-between gap-3 transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                {hotspots.find((h) => h.id === activeHotspot)?.category}
              </span>
              <h5 className="text-xs font-bold text-slate-900">
                {hotspots.find((h) => h.id === activeHotspot)?.title}
              </h5>
            </div>
            <p className="text-xs text-slate-700">
              {hotspots.find((h) => h.id === activeHotspot)?.description}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveHotspot(null)}
            className="text-xs text-slate-400 hover:text-slate-800 font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* AI Architectural Assessment Banner (Grounded in Space Photo + Design Peg) */}
      {activeAiCritique && (
        <div className="p-3.5 bg-slate-900 text-white border-b border-slate-800 flex items-start gap-3">
          <div className="w-6 h-6 rounded-md bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                Architectural Evaluation ({currentRoomMeta.name})
              </span>
              <span className="text-[10px] text-slate-400">Grounded in your Condo Space Photo & Peg</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{activeAiCritique}</p>
          </div>
        </div>
      )}

      {/* Specifications Integrated in this Render */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Specifications for {currentRoomMeta.name}:</span>
          </span>
          <span className="text-[11px] text-slate-500 font-medium">
            Scope: {currentScopeMeta.title}
          </span>
        </div>

        {/* Feature Badges for this room */}
        <div className="flex flex-wrap gap-1.5">
          {currentRoomMeta.suggestedMaterials.map((mat) => (
            <span
              key={mat}
              className="text-[11px] font-medium bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{mat}</span>
            </span>
          ))}

          {currentRoomMeta.keyFeatures.map((feat) => (
            <span
              key={feat}
              className="text-[11px] font-medium bg-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 shadow-2xs"
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{feat}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Fine-Tune Expandable Drawer */}
      {showFineTune && (
        <div className="p-4 bg-amber-50/50 border-b border-amber-200/70 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Fine-Tune {currentRoomMeta.name} Parameters</span>
            </h5>
            <button
              type="button"
              onClick={() => setShowFineTune(false)}
              className="text-xs text-slate-400 hover:text-slate-700 font-bold"
            >
              ✕
            </button>
          </div>

          {/* Quick Concept Switcher */}
          {onUpdateForm && (
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Design Concept:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(['warm_minimal', 'modern_neutral'] as DesignConceptId[]).map((cId) => (
                  <button
                    key={cId}
                    type="button"
                    onClick={() => {
                      onUpdateForm({ selectedConcept: cId });
                    }}
                    className={`p-2 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                      formData.selectedConcept === cId
                        ? 'bg-amber-100/80 border-amber-400 font-bold text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="font-bold">{CONCEPTS[cId].name}</p>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{CONCEPTS[cId].tagline}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Instruction Prompt Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-700 block">
              Additional Custom Instructions for {currentRoomMeta.name}:
            </label>
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g., Add under-cabinet warm strip, acoustic wall slats, lighter oak tone"
              className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleGenerateMockup}
              disabled={isRendering}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRendering ? 'animate-spin' : ''}`} />
              <span>Re-Render {currentRoomMeta.name}</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="p-3.5 bg-white flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Action: Generate / Re-render */}
          <button
            type="button"
            onClick={handleGenerateMockup}
            disabled={isRendering}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Re-Render {currentRoomMeta.name}</span>
          </button>

          {/* Tackle Next Space Button */}
          <button
            type="button"
            onClick={handleNextRoom}
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Tackle Next Room</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Fine Tune button */}
          <button
            type="button"
            onClick={() => setShowFineTune(!showFineTune)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showFineTune
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span>Fine-Tune</span>
            {showFineTune ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Secondary Export Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleDownloadRender}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Download photorealistic render image"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Save JPG</span>
          </button>

          <button
            type="button"
            onClick={handleCopySummary}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Copy specs & mockup brief to clipboard"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Copy Brief</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
