import React, { useState } from 'react';
import {
  FormDataState,
  PhotoState,
  FlooringId,
  RenovationCategory,
  FenestrationOption,
  WallWorksOption,
  CeilingOption,
} from '../types';
import { SampleDesignViewer } from './SampleDesignViewer';
import { IllustrativeRoomLayout } from './IllustrativeRoomLayout';
import { SpaceMockupRenderer } from './SpaceMockupRenderer';
import { AiMockupGenerator } from './AiMockupGenerator';
import {
  calculateFlooringEstimate,
  formatPhp,
  formatPhpRange,
  FLOORING_RATES,
} from '../data/pricing';
import {
  HARDWARE_DEPOTS,
  getNearestDepot,
  calculateDepotSupplyCost,
  HardwareDepot,
} from '../data/depots';
import {
  calculateTradeEstimates,
  FENESTRATION_OPTIONS,
  WALL_WORKS_OPTIONS,
  CEILING_OPTIONS,
} from '../data/tradePricing';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Bookmark,
  Edit3,
  Layers,
  Sparkles,
  Info,
  Calendar,
  ShieldAlert,
  Eye,
  MapPin,
  Store,
  Truck,
  TrendingDown,
  Paintbrush,
  Lightbulb,
  Zap,
  Check,
  Grid,
  ChevronRight,
  Building2,
  Sofa,
  Utensils,
  Bed,
  Bath,
  Sun,
} from 'lucide-react';
import { RoomId } from '../types';
import { STRUCTURAL_SCOPES, ROOM_METADATA, getRoomCostEstimate } from '../data/rooms';

interface Props {
  formData: FormDataState;
  onUpdateForm: (updates: Partial<FormDataState>) => void;
  photos: PhotoState;
  onUpdatePhotos?: (updates: Partial<PhotoState>) => void;
  onBackToEditSpace: () => void;
  onSaveDetails: () => { success: boolean; error?: string };
}

export const ScreenEstimate: React.FC<Props> = ({
  formData,
  onUpdateForm,
  photos,
  onUpdatePhotos,
  onBackToEditSpace,
  onSaveDetails,
}) => {
  const [saveMessage, setSaveMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [activeConceptTab, setActiveConceptTab] = useState<'ai_render' | 'mockup' | 'photo'>('ai_render');

  // Active space being tackled room-by-room
  const [activeRoomTackleId, setActiveRoomTackleId] = useState<RoomId>(formData.activeRoomId || 'overall');
  const currentScopeMeta = STRUCTURAL_SCOPES[formData.structuralScope] || STRUCTURAL_SCOPES.entire_space;
  const currentRoomMeta = ROOM_METADATA[activeRoomTackleId] || ROOM_METADATA.overall;

  const tackledRoomsList: RoomId[] = ['overall', ...(formData.selectedRooms || ['living', 'kitchen', 'bedroom_1', 'bathroom'])];
  const uniqueTackledRooms = Array.from(new Set(tackledRoomsList));

  // Compute room-level estimates for all selected spaces
  const roomEstimates = uniqueTackledRooms.map((rId) => {
    const rMeta = ROOM_METADATA[rId];
    const area = formData.roomConfigurations?.[rId]?.areaM2 || rMeta.defaultMinArea;
    const cost = getRoomCostEstimate(rId, area, formData.selectedConcept);
    return {
      id: rId,
      name: rMeta.name,
      area,
      ...cost,
    };
  });

  const totalProjectLow = roomEstimates.reduce((acc, r) => acc + r.low, 0);
  const totalProjectHigh = roomEstimates.reduce((acc, r) => acc + r.high, 0);
  const totalProjectDepot = roomEstimates.reduce((acc, r) => acc + r.depotEstimate, 0);

  // Active trade tab: defaults to 'flooring', or 'all' if user selected multiple trades
  const [activeTradeTab, setActiveTradeTab] = useState<RenovationCategory | 'summary' | 'rooms'>('flooring');

  // Nearest hardware depot sourcing for the selected location
  const cityDepots = HARDWARE_DEPOTS[formData.location] || HARDWARE_DEPOTS.Manila;
  const nearestDepot = getNearestDepot(formData.location);
  const [selectedDepotId, setSelectedDepotId] = useState<string>(nearestDepot.id);
  const [showDepotList, setShowDepotList] = useState(false);

  const selectedDepot: HardwareDepot =
    cityDepots.find((d) => d.id === selectedDepotId) || nearestDepot;

  // Compute room area in m²
  const roomAreaM2 = parseFloat(formData.livingRoomArea) || 10;
  const targetBudgetValue = parseFloat(formData.targetBudget) || 0;

  // Calculate current flooring estimate
  const flooringEstimate = calculateFlooringEstimate(
    roomAreaM2,
    formData.selectedFlooring,
    targetBudgetValue
  );

  const depotSupply = calculateDepotSupplyCost(
    roomAreaM2,
    formData.selectedFlooring,
    selectedDepot
  );

  // Calculate estimates for Fenestrations, Wall works, Ceiling, and Fixtures
  const tradeEstimates = calculateTradeEstimates(
    roomAreaM2,
    formData.location,
    formData.fenestrationChoice,
    formData.wallWorksChoice,
    formData.ceilingChoice,
    formData.fixturesChoice
  );

  // Fill in the flooring estimate in tradeEstimates
  tradeEstimates.flooring = {
    category: 'flooring',
    title: 'Flooring Works',
    selectedOptionLabel: formData.selectedFlooring === 'vinyl' ? 'Luxury Vinyl Plank (LVP)' : 'Porcelain / Ceramic Tiles',
    description: `Flooring materials and installation for ${roomAreaM2} m² living area.`,
    materialLow: flooringEstimate.materialLow,
    materialHigh: flooringEstimate.materialHigh,
    installLow: flooringEstimate.installLow,
    installHigh: flooringEstimate.installHigh,
    totalLow: flooringEstimate.totalLow,
    totalHigh: flooringEstimate.totalHigh,
    depotOptimizedMaterial: depotSupply.materialCost,
    depotOptimizedTotal: depotSupply.materialCost + flooringEstimate.installLow,
    depotSourcingNote: `Flooring planks/tiles direct from ${selectedDepot.name} (${selectedDepot.distanceKm} km).`,
  };

  // Roll-up summary across all enabled categories
  const enabledTrades = formData.enabledCategories.map((c) => tradeEstimates[c]).filter(Boolean);
  const grandMaterialLow = enabledTrades.reduce((acc, t) => acc + t.materialLow, 0);
  const grandMaterialHigh = enabledTrades.reduce((acc, t) => acc + t.materialHigh, 0);
  const grandInstallLow = enabledTrades.reduce((acc, t) => acc + t.installLow, 0);
  const grandInstallHigh = enabledTrades.reduce((acc, t) => acc + t.installHigh, 0);
  const grandTotalLow = grandMaterialLow + grandInstallLow;
  const grandTotalHigh = grandMaterialHigh + grandInstallHigh;
  const grandDepotOptimizedTotal = enabledTrades.reduce((acc, t) => acc + t.depotOptimizedTotal, 0);

  // Scope status against target budget
  const isMultiTrade = formData.enabledCategories.length > 1;
  const activeTotalLow = isMultiTrade ? grandTotalLow : flooringEstimate.totalLow;
  const activeTotalHigh = isMultiTrade ? grandTotalHigh : flooringEstimate.totalHigh;

  let activeBudgetStatus: 'within' | 'partly_over' | 'over' = 'within';
  let activeBudgetStatusText = 'Within budget under demo assumptions.';

  if (targetBudgetValue <= 0 && activeTotalLow > 0) {
    activeBudgetStatus = 'over';
    activeBudgetStatusText = 'Over budget under demo assumptions.';
  } else if (targetBudgetValue >= activeTotalHigh) {
    activeBudgetStatus = 'within';
    activeBudgetStatusText = 'Within budget under demo assumptions.';
  } else if (targetBudgetValue >= activeTotalLow && targetBudgetValue < activeTotalHigh) {
    activeBudgetStatus = 'partly_over';
    activeBudgetStatusText = 'Partly over budget under demo assumptions.';
  } else {
    activeBudgetStatus = 'over';
    activeBudgetStatusText = 'Over budget under demo assumptions.';
  }

  const handleFlooringChange = (type: FlooringId) => {
    onUpdateForm({ selectedFlooring: type });
  };

  const toggleCategory = (cat: RenovationCategory) => {
    if (cat === 'flooring') return; // keep flooring always available
    const next = formData.enabledCategories.includes(cat)
      ? formData.enabledCategories.filter((c) => c !== cat)
      : [...formData.enabledCategories, cat];
    onUpdateForm({ enabledCategories: next });
  };

  const handleSaveClick = () => {
    const result = onSaveDetails();
    if (result.success) {
      setSaveMessage({
        text: 'Project details, selections, and trade specifications saved on this browser!',
        isError: false,
      });
    } else {
      setSaveMessage({
        text: result.error || 'Failed to save details: browser storage unavailable.',
        isError: true,
      });
    }

    setTimeout(() => {
      setSaveMessage(null);
    }, 4500);
  };

  const rateDetails = FLOORING_RATES[formData.selectedFlooring];

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToEditSpace}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200/80 px-3 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>Screen 2 of 2</span>
          <span>·</span>
          <span>Concept & Estimate</span>
        </div>
      </div>

      {/* Save Message Notification */}
      {saveMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
            saveMessage.isError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {saveMessage.isError ? (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveMessage(null)}
            className="text-slate-400 hover:text-slate-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Structural Scope & Room-by-Room Tackle Navigator */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              {currentScopeMeta.badge}
            </span>
            <h3 className="text-sm font-bold text-white">
              {currentScopeMeta.title}
            </h3>
          </div>
          <span className="text-xs text-amber-300 font-semibold bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
            Tackling {uniqueTackledRooms.length} Spaces
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {currentScopeMeta.description}
        </p>

        {/* Space by space tackle buttons */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Tackle Space by Space:</span>
            </span>
            <span className="text-[11px] text-slate-300">
              Active Space: <strong className="text-amber-300">{currentRoomMeta.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {uniqueTackledRooms.map((rId) => {
              const rMeta = ROOM_METADATA[rId];
              const isSelected = activeRoomTackleId === rId;
              const area = formData.roomConfigurations?.[rId]?.areaM2 || rMeta.defaultMinArea;
              return (
                <button
                  key={rId}
                  type="button"
                  onClick={() => setActiveRoomTackleId(rId)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <span>{rMeta.name}</span>
                  <span className={`text-[10px] px-1 rounded ${
                    isSelected ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {area} m²
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 1. Large Concept Preview & Described Space Mockup */}
      <div className="space-y-2">
        <div className="flex items-center p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveConceptTab('ai_render')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeConceptTab === 'ai_render'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Realistic Space Render</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveConceptTab('mockup')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeConceptTab === 'mockup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-slate-500" />
            <span>Architectural Diagram</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveConceptTab('photo')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeConceptTab === 'photo'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>Sample Concept Photo</span>
          </button>
        </div>

        {activeConceptTab === 'ai_render' && (
          <AiMockupGenerator
            formData={formData}
            photos={photos}
            onUpdateForm={onUpdateForm}
            onUpdatePhotos={onUpdatePhotos}
            activeRoomId={activeRoomTackleId}
            onSelectRoom={setActiveRoomTackleId}
          />
        )}

        {activeConceptTab === 'mockup' && (
          <div>
            <SpaceMockupRenderer
              desiredSpecs={formData.desiredSpecs}
              flooringId={formData.selectedFlooring}
              conceptId={formData.selectedConcept}
              roomAreaM2={roomAreaM2}
              interactive={true}
            />
            <p className="mt-1.5 text-xs text-slate-500 text-center">
              Architectural diagram rendered to visualize your specifications.
            </p>
          </div>
        )}

        {activeConceptTab === 'photo' && (
          <div>
            <SampleDesignViewer
              selectedConcept={formData.selectedConcept}
              interactive={false}
            />
            <p className="mt-1.5 text-xs text-slate-500 text-center">
              Sample concept photo—not generated from your photo.
            </p>
          </div>
        )}
      </div>

      {/* Reference: Uploaded Space & Inspiration (Session-Only Cross-Reference) */}
      {(photos.spacePhotoUrl || photos.inspirationPhotoUrl) && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Your Uploaded Photos</span>
            <span className="text-[11px] text-slate-400">Session references</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {photos.spacePhotoUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-500 block truncate">
                  Your Space Photo
                </span>
                <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-200">
                  <img
                    src={photos.spacePhotoUrl}
                    alt="Uploaded condo space"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            {photos.inspirationPhotoUrl && (
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-500 block truncate">
                  Inspiration Peg
                </span>
                <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-200">
                  <img
                    src={photos.inspirationPhotoUrl}
                    alt="Uploaded inspiration"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Small Illustrative Room Layout */}
      <div>
        <IllustrativeRoomLayout
          areaM2={roomAreaM2}
          flooringId={formData.selectedFlooring}
          unitTypology={formData.unitTypology}
          unitDescription={formData.unitDescription}
        />
        {/* Mandatory Label */}
        <p className="mt-1.5 text-xs text-slate-500 text-center">
          Approximate; measurements unverified.
        </p>
      </div>

      {/* 3. Location and Room Area Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Project Specification
            </span>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {formData.location} · {roomAreaM2} m²
            </h2>
            {/* Unit Typology Context */}
            {formData.unitDescription && (
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Unit:</span>
                <span className="text-slate-600">{formData.unitDescription}</span>
              </p>
            )}
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 block">Total Unit Area</span>
            <span className="text-sm font-semibold text-slate-700">
              {formData.totalUnitArea} {formData.areaUnit}
            </span>
          </div>
        </div>

        {/* Mandatory Demo Label */}
        <div className="flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50/80 border border-amber-200/70 p-2.5 rounded-xl">
          <Info className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="font-semibold">Demo prices—not market quotes.</span>
        </div>

        {/* Trade Scope Tabs Bar */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Renovation Trade Estimates
            </span>
            <span className="text-[11px] text-slate-500">
              {formData.enabledCategories.length} Active in Scope
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTradeTab('flooring')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTradeTab === 'flooring'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              🪵 Flooring ({formatPhpRange(flooringEstimate.totalLow, flooringEstimate.totalHigh)})
            </button>

            <button
              type="button"
              onClick={() => setActiveTradeTab('fenestrations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTradeTab === 'fenestrations'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              🪟 Fenestrations
              {formData.enabledCategories.includes('fenestrations') && ' ✓'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTradeTab('wall_works')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTradeTab === 'wall_works'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              🧱 Wall Works
              {formData.enabledCategories.includes('wall_works') && ' ✓'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTradeTab('ceiling')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTradeTab === 'ceiling'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              💡 Ceiling
              {formData.enabledCategories.includes('ceiling') && ' ✓'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTradeTab('fixtures')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTradeTab === 'fixtures'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ Fixtures
              {formData.enabledCategories.includes('fixtures') && ' ✓'}
            </button>

            {isMultiTrade && (
              <button
                type="button"
                onClick={() => setActiveTradeTab('summary')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTradeTab === 'summary'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                📊 All Trades Summary ({enabledTrades.length})
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTradeTab('rooms')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                activeTradeTab === 'rooms'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                  : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              🏠 Room-by-Room ({uniqueTackledRooms.length} Spaces)
            </button>
          </div>
        </div>

        {/* Tab 1: Flooring (Default & Baseline Check compliant) */}
        {activeTradeTab === 'flooring' && (
          <div className="space-y-4 pt-1">
            {/* 4. Flooring Selector: Vinyl / Tile */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Flooring Material Selector
                </label>
                <span className="text-[11px] text-slate-500">
                  Rates: ₱{rateDetails.lowMaterialRate}–₱{rateDetails.highMaterialRate}/m²
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleFlooringChange('vinyl')}
                  className={`py-3 px-4 rounded-lg font-medium text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    formData.selectedFlooring === 'vinyl'
                      ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Vinyl</span>
                  <span className="text-[10px] text-slate-400 font-normal">₱800–₱1,200/m²</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFlooringChange('tile')}
                  className={`py-3 px-4 rounded-lg font-medium text-xs sm:text-sm flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                    formData.selectedFlooring === 'tile'
                      ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Tile</span>
                  <span className="text-[10px] text-slate-400 font-normal">₱1,200–₱1,800/m²</span>
                </button>
              </div>
            </div>

            {/* 4b. Nearest Available Hardware / Home Depot Vendor Sourcing (Cost Minimizer) */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shadow-2xs">
                    <Store className="w-3 h-3" />
                  </div>
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Nearest Hardware / Home Depot Sourcing
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  <span>Cost Minimizer</span>
                </span>
              </div>

              {/* Nearest Depot Highlight Card */}
              <div className="bg-white rounded-lg p-3 border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-900">{selectedDepot.name}</span>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>{selectedDepot.distanceKm} km from {formData.location} Condo</span>
                    </span>
                    {selectedDepot.isNearest && (
                      <span className="text-[10px] font-semibold text-emerald-700">★ Nearest Depot</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{selectedDepot.address}</p>
                  <p className="text-[11px] text-emerald-700 font-medium">{selectedDepot.stockStatus}</p>
                </div>

                <div className="sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Minimized Supply Rate
                  </span>
                  <span className="text-base font-bold text-emerald-700 tabular-nums">
                    ₱{depotSupply.rate.toLocaleString('en-PH')}/m²
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    ₱{depotSupply.materialCost.toLocaleString('en-PH')} for {roomAreaM2} m²
                  </span>
                </div>
              </div>

              {/* Minimization explanation */}
              <div className="flex items-start gap-2 text-xs text-emerald-900">
                <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="font-semibold text-emerald-950">Why this minimizes cost: </strong>
                  {selectedDepot.savingReason}
                </p>
              </div>

              {/* Toggle to compare other stores */}
              {cityDepots.length > 1 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDepotList(!showDepotList)}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showDepotList ? 'Hide nearby hardware stores' : `Compare ${cityDepots.length} nearby hardware stores in ${formData.location}`}</span>
                  </button>

                  {showDepotList && (
                    <div className="mt-2.5 space-y-1.5 pt-2 border-t border-emerald-200/60">
                      {cityDepots.map((depot) => {
                        const isCurrent = depot.id === selectedDepot.id;
                        const depotRate = formData.selectedFlooring === 'vinyl' ? depot.vinylRatePerM2 : depot.tileRatePerM2;
                        return (
                          <button
                            key={depot.id}
                            type="button"
                            onClick={() => setSelectedDepotId(depot.id)}
                            className={`w-full p-2.5 rounded-lg text-left text-xs border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                              isCurrent
                                ? 'bg-emerald-100/70 border-emerald-400 text-emerald-950 font-semibold'
                                : 'bg-white border-slate-200 hover:bg-emerald-50 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold">{depot.name}</span>
                                <span className="text-[10px] text-slate-500">({depot.distanceKm} km)</span>
                                {depot.isNearest && (
                                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-semibold">
                                    Nearest
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-500 block truncate">{depot.address}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-bold text-slate-900 tabular-nums">₱{depotRate}/m²</span>
                              <span className="text-[10px] text-slate-400 block">+₱{depot.haulageFee} haul</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Line Item Breakdown: Materials & Installation */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                <div>
                  <span className="text-slate-600 font-medium">Materials</span>
                  <span className="text-xs text-emerald-700 block sm:inline sm:ml-2 font-medium">
                    (Minimized: ₱{depotSupply.materialCost.toLocaleString('en-PH')} at {selectedDepot.name})
                  </span>
                </div>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {flooringEstimate.status === 'unavailable'
                    ? 'Unavailable'
                    : formatPhpRange(flooringEstimate.materialLow, flooringEstimate.materialHigh)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100 text-sm">
                <div>
                  <span className="text-slate-600 font-medium">Installation</span>
                  <span className="text-xs text-slate-400 ml-1.5">(₱300–₱500/m²)</span>
                </div>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {flooringEstimate.status === 'unavailable'
                    ? 'Unavailable'
                    : formatPhpRange(flooringEstimate.installLow, flooringEstimate.installHigh)}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-2">
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Flooring Total</span>
                  <span className="text-xs text-slate-500">Materials + labor for {roomAreaM2} m²</span>
                  <span className="text-xs text-emerald-700 font-semibold block mt-0.5">
                    Nearest depot optimized: ₱{(depotSupply.materialCost + flooringEstimate.installLow).toLocaleString('en-PH')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums font-display">
                    {flooringEstimate.status === 'unavailable'
                      ? 'Unavailable'
                      : formatPhpRange(flooringEstimate.totalLow, flooringEstimate.totalHigh)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Fenestrations */}
        {activeTradeTab === 'fenestrations' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Fenestrations (Windows & Balcony Openings)
              </h3>
              <button
                type="button"
                onClick={() => toggleCategory('fenestrations')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  formData.enabledCategories.includes('fenestrations')
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {formData.enabledCategories.includes('fenestrations') ? '✓ In Fit-Out Scope' : '+ Add to Scope'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(FENESTRATION_OPTIONS) as FenestrationOption[]).map((key) => {
                const opt = FENESTRATION_OPTIONS[key];
                const isSelected = formData.fenestrationChoice === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onUpdateForm({ fenestrationChoice: key })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {opt.desc}
                    </p>
                    <p className={`text-xs font-semibold mt-2 tabular-nums ${isSelected ? 'text-amber-300' : 'text-slate-900'}`}>
                      {formatPhpRange(opt.materialLow + opt.installLow, opt.materialHigh + opt.installHigh)}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Sourcing & Line Items */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="font-semibold text-slate-800">Materials:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {formatPhpRange(tradeEstimates.fenestrations.materialLow, tradeEstimates.fenestrations.materialHigh)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="font-semibold text-slate-800">Installation:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {formatPhpRange(tradeEstimates.fenestrations.installLow, tradeEstimates.fenestrations.installHigh)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-900 text-sm">Fenestrations Subtotal:</span>
                <span className="font-bold text-base text-slate-900 tabular-nums">
                  {formatPhpRange(tradeEstimates.fenestrations.totalLow, tradeEstimates.fenestrations.totalHigh)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-md border border-emerald-200/60 mt-1">
                📍 {tradeEstimates.fenestrations.depotSourcingNote} Minimized vendor cost: <strong>{formatPhp(tradeEstimates.fenestrations.depotOptimizedTotal)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Wall Works */}
        {activeTradeTab === 'wall_works' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Wall Works (Finishes & Fluted Accents)
              </h3>
              <button
                type="button"
                onClick={() => toggleCategory('wall_works')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  formData.enabledCategories.includes('wall_works')
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {formData.enabledCategories.includes('wall_works') ? '✓ In Fit-Out Scope' : '+ Add to Scope'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(WALL_WORKS_OPTIONS) as WallWorksOption[]).map((key) => {
                const opt = WALL_WORKS_OPTIONS[key];
                const isSelected = formData.wallWorksChoice === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onUpdateForm({ wallWorksChoice: key })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="font-semibold text-slate-800">Materials:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {formatPhpRange(tradeEstimates.wall_works.materialLow, tradeEstimates.wall_works.materialHigh)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="font-semibold text-slate-800">Labor / Installation:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {formatPhpRange(tradeEstimates.wall_works.installLow, tradeEstimates.wall_works.installHigh)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-900 text-sm">Wall Works Subtotal:</span>
                <span className="font-bold text-base text-slate-900 tabular-nums">
                  {formatPhpRange(tradeEstimates.wall_works.totalLow, tradeEstimates.wall_works.totalHigh)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-md border border-emerald-200/60 mt-1">
                📍 {tradeEstimates.wall_works.depotSourcingNote} Minimized vendor cost: <strong>{formatPhp(tradeEstimates.wall_works.depotOptimizedTotal)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Ceiling Works */}
        {activeTradeTab === 'ceiling' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Ceiling Works (Drop Coves & Gypsum)
              </h3>
              <button
                type="button"
                onClick={() => toggleCategory('ceiling')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  formData.enabledCategories.includes('ceiling')
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {formData.enabledCategories.includes('ceiling') ? '✓ In Fit-Out Scope' : '+ Add to Scope'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {(Object.keys(CEILING_OPTIONS) as CeilingOption[]).map((key) => {
                const opt = CEILING_OPTIONS[key];
                const isSelected = formData.ceilingChoice === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onUpdateForm({ ceilingChoice: key })}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold">{opt.label}</p>
                    <p className={`text-[11px] mt-1 line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {opt.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="font-semibold text-slate-800">Materials:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {formatPhpRange(tradeEstimates.ceiling.materialLow, tradeEstimates.ceiling.materialHigh)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="font-semibold text-slate-800">Labor / Installation:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {formatPhpRange(tradeEstimates.ceiling.installLow, tradeEstimates.ceiling.installHigh)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-900 text-sm">Ceiling Subtotal:</span>
                <span className="font-bold text-base text-slate-900 tabular-nums">
                  {formatPhpRange(tradeEstimates.ceiling.totalLow, tradeEstimates.ceiling.totalHigh)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-md border border-emerald-200/60 mt-1">
                📍 {tradeEstimates.ceiling.depotSourcingNote} Minimized vendor cost: <strong>{formatPhp(tradeEstimates.ceiling.depotOptimizedTotal)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Tab 5: Fixtures (Electrical, Plumbing, Lighting) */}
        {activeTradeTab === 'fixtures' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Fixtures (Electrical, Plumbing, Lighting)
              </h3>
              <button
                type="button"
                onClick={() => toggleCategory('fixtures')}
                className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                  formData.enabledCategories.includes('fixtures')
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {formData.enabledCategories.includes('fixtures') ? '✓ In Fit-Out Scope' : '+ Add to Scope'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  onUpdateForm({
                    fixturesChoice: {
                      ...formData.fixturesChoice,
                      lighting: !formData.fixturesChoice.lighting,
                    },
                  })
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formData.fixturesChoice.lighting
                    ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">LED Lighting Package</span>
                  {formData.fixturesChoice.lighting && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Recessed downlights & 3000K indirect LED cove light strips.
                </p>
                <span className="text-[11px] font-bold text-amber-900 mt-2">₱5,800–₱10,000</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateForm({
                    fixturesChoice: {
                      ...formData.fixturesChoice,
                      electrical: !formData.fixturesChoice.electrical,
                    },
                  })
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formData.fixturesChoice.electrical
                    ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Electrical Relocation</span>
                  {formData.fixturesChoice.electrical && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  4 Duplex outlets, switches & in-wall TV conduit chasing.
                </p>
                <span className="text-[11px] font-bold text-amber-900 mt-2">₱3,300–₱5,700</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onUpdateForm({
                    fixturesChoice: {
                      ...formData.fixturesChoice,
                      plumbing: !formData.fixturesChoice.plumbing,
                    },
                  })
                }
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  formData.fixturesChoice.plumbing
                    ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-semibold'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">Plumbing Prep Tap</span>
                  {formData.fixturesChoice.plumbing && <Check className="w-3.5 h-3.5 text-amber-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Wet bar / mini sink tap valve & drainage connection.
                </p>
                <span className="text-[11px] font-bold text-amber-900 mt-2">₱5,500–₱9,000</span>
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="font-semibold text-slate-800">Materials:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {formatPhpRange(tradeEstimates.fixtures.materialLow, tradeEstimates.fixtures.materialHigh)}
                </span>
              </div>
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                <span className="font-semibold text-slate-800">Labor / Installation:</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {formatPhpRange(tradeEstimates.fixtures.installLow, tradeEstimates.fixtures.installHigh)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-slate-900 text-sm">Fixtures Subtotal:</span>
                <span className="font-bold text-base text-slate-900 tabular-nums">
                  {formatPhpRange(tradeEstimates.fixtures.totalLow, tradeEstimates.fixtures.totalHigh)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-md border border-emerald-200/60 mt-1">
                📍 {tradeEstimates.fixtures.depotSourcingNote} Minimized vendor cost: <strong>{formatPhp(tradeEstimates.fixtures.depotOptimizedTotal)}</strong>
              </p>
            </div>
          </div>
        )}

        {/* Tab 6: Complete Living Room Fit-Out Summary Table (When Multiple Trades Active) */}
        {activeTradeTab === 'summary' && isMultiTrade && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Full Living-Room Fit-Out Scope Roll-Up
              </h3>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {enabledTrades.length} Active Trades
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Trade</th>
                    <th className="py-2.5 px-3">Selected Option</th>
                    <th className="py-2.5 px-3 text-right">Materials</th>
                    <th className="py-2.5 px-3 text-right">Labor</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {enabledTrades.map((t) => (
                    <tr key={t.category} className="hover:bg-slate-50/70">
                      <td className="py-2.5 px-3 font-semibold text-slate-900">{t.title}</td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[150px]">{t.selectedOptionLabel}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{formatPhpRange(t.materialLow, t.materialHigh)}</td>
                      <td className="py-2.5 px-3 text-right tabular-nums">{formatPhpRange(t.installLow, t.installHigh)}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                        {formatPhpRange(t.totalLow, t.totalHigh)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/70 font-bold text-slate-900 border-t-2 border-emerald-200">
                    <td colSpan={2} className="py-3 px-3">
                      Combined Scope Grand Total ({enabledTrades.length} Trades)
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatPhpRange(grandMaterialLow, grandMaterialHigh)}</td>
                    <td className="py-3 px-3 text-right tabular-nums">{formatPhpRange(grandInstallLow, grandInstallHigh)}</td>
                    <td className="py-3 px-3 text-right font-extrabold text-sm text-emerald-900 tabular-nums">
                      {formatPhpRange(grandTotalLow, grandTotalHigh)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
              <div>
                <span className="font-bold">Nearest Depot Sourced Minimum: </span>
                <span className="tabular-nums font-bold text-emerald-800 text-sm">{formatPhp(grandDepotOptimizedTotal)}</span>
              </div>
              <span className="text-[11px] text-emerald-700">Via {selectedDepot.name}</span>
            </div>
          </div>
        )}

        {/* Tab 7: Space-by-Space / Room-by-Room Cost Breakdown */}
        {activeTradeTab === 'rooms' && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Space-by-Space / Room-by-Room Cost Breakdown
                </h3>
                <p className="text-[11px] text-slate-500">
                  Estimated materials & installation per room based on your structural scope.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-900 bg-amber-100 text-amber-950 px-2.5 py-1 rounded-lg">
                Total: {formatPhpRange(totalProjectLow, totalProjectHigh)}
              </span>
            </div>

            <div className="space-y-2">
              {roomEstimates.map((room) => {
                const isCurrent = activeRoomTackleId === room.id;
                return (
                  <div
                    key={room.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRoomTackleId(room.id);
                              setActiveConceptTab('ai_render');
                              window.scrollTo({ top: 320, behavior: 'smooth' });
                            }}
                            className="text-xs font-bold text-slate-900 hover:text-amber-800 underline flex items-center gap-1.5 cursor-pointer text-left"
                          >
                            <span>{room.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                                Active Space
                              </span>
                            )}
                          </button>
                          <span className="text-[11px] text-slate-500">({room.area} m²)</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {ROOM_METADATA[room.id]?.tagline}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 block">
                          {formatPhpRange(room.low, room.high)}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          Depot supply: ~{formatPhp(room.depotEstimate)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 7. Target Budget & Status Comparison */}
        <div className="mt-4 pt-4 border-t border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-slate-600 font-medium">Target budget</span>
              <span className="text-xs text-slate-400 ml-1.5">
                (Evaluated for {isMultiTrade ? `${enabledTrades.length} Selected Trades` : 'Flooring'})
              </span>
            </div>
            <span className="text-base font-bold text-slate-900 tabular-nums">
              {formatPhp(targetBudgetValue)}
            </span>
          </div>

          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-colors ${
              activeBudgetStatus === 'within'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : activeBudgetStatus === 'partly_over'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {activeBudgetStatus === 'within' && (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            {activeBudgetStatus === 'partly_over' && (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            {activeBudgetStatus === 'over' && (
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{activeBudgetStatusText}</span>
          </div>
        </div>
      </div>

      {/* 8. Action Buttons: SAVE DETAILS & EDIT SPACE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={handleSaveClick}
          className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
        >
          <Bookmark className="w-4 h-4 text-amber-300" />
          <span>SAVE DETAILS</span>
        </button>

        <button
          type="button"
          onClick={onBackToEditSpace}
          className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Edit3 className="w-4 h-4 text-slate-600" />
          <span>EDIT SPACE</span>
        </button>
      </div>

      {/* Outside Notes & Explicit Disclaimers (Strict adherence to Sheet 3 & 4) */}
      <div className="bg-slate-100/90 rounded-2xl border border-slate-200/90 p-4 text-xs text-slate-600 space-y-2">
        <p className="font-semibold text-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-600" />
          <span>Notes & Demo Assumptions</span>
        </p>
        <ul className="space-y-1.5 list-disc pl-4 text-slate-600">
          <li>Changing flooring recalculates the estimate.</li>
          <li>EDIT SPACE returns to Screen 1 with values preserved.</li>
          <li>SAVE DETAILS saves form values and selections on this browser.</li>
          <li>Photos are session-only; re-upload them after reopening.</li>
          <li>The total excludes other renovation work, furniture, delivery, and contingency.</li>
          <li>The sample image does not reflect every material selection.</li>
        </ul>
      </div>
    </div>
  );
};
