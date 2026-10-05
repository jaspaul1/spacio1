import React, { useRef, useState } from 'react';
import {
  FormDataState,
  PhotoState,
  ValidationErrors,
  LocationOption,
  AreaUnit,
  DesignConceptId,
  RoomId,
  StructuralScope,
} from '../types';
import { CONCEPTS, SampleDesignViewer } from './SampleDesignViewer';
import { SpaceMockupRenderer } from './SpaceMockupRenderer';
import { AiMockupGenerator } from './AiMockupGenerator';
import bareCondoImg from '../assets/images/condo_space_bare_1791021854308.jpg';
import { fileToDataUrl } from '../utils/imageUtils';
import { convertArea } from '../data/pricing';
import {
  STRUCTURAL_SCOPES,
  ROOM_METADATA,
  getDefaultRoomsForScope,
  createDefaultRoomConfigurations,
} from '../data/rooms';
import {
  Upload,
  Image as ImageIcon,
  X,
  AlertCircle,
  Building2,
  Maximize2,
  DollarSign,
  ArrowRight,
  Info,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';

interface Props {
  formData: FormDataState;
  onUpdateForm: (updates: Partial<FormDataState>) => void;
  photos: PhotoState;
  onUpdatePhotos: (updates: Partial<PhotoState>) => void;
  onProceedToEstimate: () => void;
  restoredFromStorage?: boolean;
}

const LOCATIONS: LocationOption[] = [
  'Manila',
  'Quezon City',
  'Makati',
  'BGC / Taguig',
  'Pasig',
  'Mandaluyong',
  'Cebu City',
  'Davao City',
];

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export const ScreenSpaceForm: React.FC<Props> = ({
  formData,
  onUpdateForm,
  photos,
  onUpdatePhotos,
  onProceedToEstimate,
  restoredFromStorage = false,
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formMockupView, setFormMockupView] = useState<'ai_render' | 'diagram'>('ai_render');
  const spaceFileInputRef = useRef<HTMLInputElement>(null);
  const inspirationFileInputRef = useRef<HTMLInputElement>(null);

  // File upload handler with robust validation
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'space' | 'inspiration'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        imageUpload: `Unsupported file type "${file.name}". Please upload a JPG, PNG, or WebP image.`,
      }));
      e.target.value = '';
      return;
    }

    // Clear error
    setErrors((prev) => {
      const next = { ...prev };
      delete next.imageUpload;
      return next;
    });

    try {
      const dataUrl = await fileToDataUrl(file);
      if (type === 'space') {
        onUpdatePhotos({
          spacePhotoUrl: dataUrl,
          spacePhotoName: file.name,
        });
      } else {
        onUpdatePhotos({
          inspirationPhotoUrl: dataUrl,
          inspirationPhotoName: file.name,
        });
      }
    } catch (err) {
      console.error('Photo conversion failed:', err);
      // Fallback to object URL
      const objectUrl = URL.createObjectURL(file);
      if (type === 'space') {
        onUpdatePhotos({
          spacePhotoUrl: objectUrl,
          spacePhotoName: file.name,
        });
      } else {
        onUpdatePhotos({
          inspirationPhotoUrl: objectUrl,
          inspirationPhotoName: file.name,
        });
      }
    }
  };

  const removePhoto = (type: 'space' | 'inspiration') => {
    if (type === 'space') {
      onUpdatePhotos({ spacePhotoUrl: null, spacePhotoName: null });
      if (spaceFileInputRef.current) spaceFileInputRef.current.value = '';
    } else {
      onUpdatePhotos({ inspirationPhotoUrl: null, inspirationPhotoName: null });
      if (inspirationFileInputRef.current) inspirationFileInputRef.current.value = '';
    }
  };

  // Unit conversion toggle for Total Unit Area
  const handleUnitToggle = (newUnit: AreaUnit) => {
    if (newUnit === formData.areaUnit) return;
    const currentVal = parseFloat(formData.totalUnitArea);
    if (!isNaN(currentVal) && currentVal > 0) {
      const converted = convertArea(currentVal, formData.areaUnit, newUnit);
      // Format cleanly: 430.556 sq ft converts to 40.00 m²
      const formatted = converted % 1 === 0 ? converted.toFixed(2) : converted.toFixed(2);
      onUpdateForm({
        areaUnit: newUnit,
        totalUnitArea: formatted,
      });
    } else {
      onUpdateForm({ areaUnit: newUnit });
    }
  };

  // Form submission and validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: ValidationErrors = {};

    // Validate Total Unit Area
    const totalAreaNum = parseFloat(formData.totalUnitArea);
    if (formData.totalUnitArea.trim() === '' || isNaN(totalAreaNum) || totalAreaNum <= 0) {
      newErrors.totalUnitArea = 'Enter a valid positive number for total unit area (e.g. 40).';
    }

    // Validate Living-room area
    const livingAreaNum = parseFloat(formData.livingRoomArea);
    if (formData.livingRoomArea.trim() === '' || isNaN(livingAreaNum) || livingAreaNum <= 0) {
      newErrors.livingRoomArea = 'Enter a valid positive number for living-room area (e.g. 10).';
    }

    // Validate living room vs total unit area
    // Ensure both are compared in standard m²
    if (!isNaN(totalAreaNum) && !isNaN(livingAreaNum) && totalAreaNum > 0 && livingAreaNum > 0) {
      const totalAreaInM2 = formData.areaUnit === 'sqft'
        ? totalAreaNum * 0.09290304
        : totalAreaNum;
      
      const livingAreaInM2 = formData.livingRoomUnit === 'sqft'
        ? livingAreaNum * 0.09290304
        : livingAreaNum;

      if (livingAreaInM2 > totalAreaInM2) {
        newErrors.livingRoomArea = 'Living-room area cannot exceed total unit area.';
      }
    }

    // Validate Target Budget
    const budgetNum = parseFloat(formData.targetBudget);
    if (formData.targetBudget.trim() === '' || isNaN(budgetNum) || budgetNum < 0) {
      newErrors.targetBudget = 'Enter a valid target budget amount in ₱ (e.g. 20000).';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onProceedToEstimate();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-8">
      {/* Restored from Storage Notice */}
      {restoredFromStorage && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
          <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-amber-950">Saved details restored</p>
            <p className="text-amber-800/90 mt-0.5">
              Your previous form entries and selections have been reloaded. Photos are session-only; re-upload them if needed.
            </p>
          </div>
        </div>
      )}

      {/* Screen 1 Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span>Screen 1 of 2</span>
          <span>·</span>
          <span>Your Space</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 font-display">
          RoomBudget PH
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-md mx-auto">
          Condo living-room preview & flooring budget tool for first-time owners in the Philippines.
        </p>
      </div>

      {/* Global Image Upload Error Banner if any */}
      {errors.imageUpload && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errors.imageUpload}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrors((prev) => ({ ...prev, imageUpload: undefined }))}
            className="text-rose-500 hover:text-rose-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Upload Condo Space Photo */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-600" />
              <span>Condo Space Photo</span>
            </label>
            <span className="text-[11px] text-slate-400">Optional · Session-only</span>
          </div>

          <input
            ref={spaceFileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileUpload(e, 'space')}
            className="hidden"
            id="space-photo-input"
          />

          {!photos.spacePhotoUrl ? (
            <div className="space-y-2">
              <label
                htmlFor="space-photo-input"
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-sm font-medium text-slate-700">Upload space photo</span>
                <span className="text-xs text-slate-500 mt-0.5">JPG, PNG, or WebP photo of your bare condo unit</span>
              </label>
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Don't have a photo yet?</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdatePhotos({
                      spacePhotoUrl: bareCondoImg,
                      spacePhotoName: 'Sample Philippine Condo Living Room (Bare Unit).jpg',
                    })
                  }
                  className="text-amber-700 hover:text-amber-900 font-semibold cursor-pointer underline underline-offset-2"
                >
                  Use Demo Bare Condo Photo
                </button>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <div className="aspect-video w-full max-h-[260px] flex items-center justify-center overflow-hidden">
                <img
                  src={photos.spacePhotoUrl}
                  alt="Uploaded condo space"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2.5 bg-white/95 backdrop-blur-xs flex items-center justify-between border-t border-slate-100">
                <div className="flex items-center gap-2 text-xs text-slate-600 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{photos.spacePhotoName || 'Condo Space Photo'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="space-photo-input"
                    className="text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer underline underline-offset-2"
                  >
                    Change
                  </label>
                  <button
                    type="button"
                    onClick={() => removePhoto('space')}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Which parts of your condo do you want to renovate? */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                <span>Which parts of your condo do you want to renovate?</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose your structural transformation based on your condo space photo.
              </p>
            </div>
            <span className="text-[11px] bg-amber-100 text-amber-900 font-semibold px-2 py-0.5 rounded-full border border-amber-300">
              Structural Scope
            </span>
          </div>

          {/* 4 Structural Scope Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.values(STRUCTURAL_SCOPES).map((scope) => {
              const isSelected = formData.structuralScope === scope.id;
              return (
                <button
                  key={scope.id}
                  type="button"
                  onClick={() => {
                    const totalAreaNum = parseFloat(formData.totalUnitArea) || 40;
                    const newRooms = getDefaultRoomsForScope(scope.id);
                    const newConfigs = createDefaultRoomConfigurations(scope.id, totalAreaNum);
                    onUpdateForm({
                      structuralScope: scope.id,
                      selectedRooms: newRooms,
                      roomConfigurations: newConfigs,
                      unitTypology:
                        scope.id === 'loft_to_two_storey'
                          ? 'loft'
                          : scope.id === 'two_storey_to_loft'
                          ? 'two_storey'
                          : formData.unitTypology,
                      unitDescription: scope.tagline,
                      desiredSpecs: {
                        ...formData.desiredSpecs,
                        specsDescription: `${scope.title}: ${scope.description}`,
                      },
                    });
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isSelected ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {scope.badge}
                      </span>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-slate-900 pt-1">{scope.title}</h3>
                    <p className="text-[11px] text-slate-600 leading-snug">{scope.tagline}</p>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    {scope.defaultRooms.length} core rooms proposed
                  </p>
                </button>
              );
            })}
          </div>

          {/* Tackle Space-by-Space / Room-by-Room selection */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>Tackle Space-by-Space / Room-by-Room:</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Select which specific rooms to tackle in this renovation scope.
                </p>
              </div>
              <span className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                {formData.selectedRooms.length} spaces selected
              </span>
            </div>

            {/* Room cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(['living', 'kitchen', 'bedroom_1', 'bedroom_2', 'bathroom', 'balcony'] as RoomId[]).map((rId) => {
                const rMeta = ROOM_METADATA[rId];
                const isSelected = formData.selectedRooms.includes(rId);
                const currentConfig = formData.roomConfigurations?.[rId];
                const currentArea = currentConfig?.areaM2 || rMeta.defaultMinArea;

                return (
                  <div
                    key={rId}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200/80 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            let nextRooms = [...formData.selectedRooms];
                            if (e.target.checked) {
                              if (!nextRooms.includes(rId)) nextRooms.push(rId);
                            } else {
                              nextRooms = nextRooms.filter((id) => id !== rId);
                            }
                            onUpdateForm({ selectedRooms: nextRooms });
                          }}
                          className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-900">{rMeta.name}</span>
                      </label>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                        {currentArea} m²
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-500 line-clamp-1 mb-2">
                      {rMeta.tagline}
                    </p>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 text-[11px] pt-1.5 border-t border-slate-100">
                        <span className="text-slate-500 text-[10px]">Area:</span>
                        <input
                          type="number"
                          min="1"
                          max="150"
                          value={currentArea}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || rMeta.defaultMinArea;
                            const prevConfigs = formData.roomConfigurations || {};
                            onUpdateForm({
                              roomConfigurations: {
                                ...prevConfigs,
                                [rId]: {
                                  ...(prevConfigs[rId] || {
                                    id: rId,
                                    name: rMeta.name,
                                    selected: true,
                                    areaM2: val,
                                  }),
                                  areaM2: val,
                                },
                              },
                            });
                          }}
                          className="w-14 px-1.5 py-0.5 text-[11px] border border-slate-200 rounded font-semibold text-slate-800 bg-white"
                        />
                        <span className="text-slate-400 text-[10px]">m²</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step 3: Location & Area Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">3</span>
              <span>Unit Dimensions & Location</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your unit structure, location, and total floor area.
            </p>
          </div>

          {/* Unit Description & Architectural Notes */}
          <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 space-y-1.5">
            <label htmlFor="unit-description-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
              Unit details & structural notes:
            </label>
            <input
              id="unit-description-input"
              type="text"
              value={formData.unitDescription}
              onChange={(e) => onUpdateForm({ unitDescription: e.target.value })}
              placeholder="e.g. High-ceiling loft converting to 2-level unit with private upper bedroom"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Location Dropdown */}
          <div>
            <label htmlFor="location-select" className="block text-xs font-medium text-slate-700 mb-1.5">
              Location
            </label>
            <select
              id="location-select"
              value={formData.location}
              onChange={(e) => onUpdateForm({ location: e.target.value as LocationOption })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all"
            >
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* Total Unit Area & Unit Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="total-unit-area" className="text-xs font-medium text-slate-700">
                  Total Unit Area
                </label>
                {/* Unit Selector Toggle (m² / sq ft) */}
                <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('m2')}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all ${
                      formData.areaUnit === 'm2'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    m²
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUnitToggle('sqft')}
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded-md transition-all ${
                      formData.areaUnit === 'sqft'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    sq ft
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  id="total-unit-area"
                  type="text"
                  inputMode="decimal"
                  value={formData.totalUnitArea}
                  onChange={(e) => onUpdateForm({ totalUnitArea: e.target.value })}
                  placeholder="e.g. 40"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.totalUnitArea
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-400'
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                  {formData.areaUnit}
                </span>
              </div>
              {errors.totalUnitArea && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.totalUnitArea}</span>
                </p>
              )}
            </div>

            {/* Living-Room Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="living-room-area" className="text-xs font-medium text-slate-700">
                  Living-Room Area
                </label>
                <span className="text-[11px] font-medium text-slate-400">m² only</span>
              </div>
              <div className="relative">
                <input
                  id="living-room-area"
                  type="text"
                  inputMode="decimal"
                  value={formData.livingRoomArea}
                  onChange={(e) => onUpdateForm({ livingRoomArea: e.target.value })}
                  placeholder="e.g. 10"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                    errors.livingRoomArea
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-400'
                  }`}
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium pointer-events-none">
                  m²
                </span>
              </div>
              {errors.livingRoomArea && (
                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.livingRoomArea}</span>
                </p>
              )}
            </div>
          </div>

          {/* Mandatory Explanatory Note */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-2 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <span className="font-medium">
              Assumed example—please edit. Total unit area is not room area.
            </span>
          </div>
        </div>

        {/* Step 3: Inspiration & Concept */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Inspiration & Concept</h2>
              <p className="text-xs text-slate-500">
                Describe desired space specifications to render a mockup, or upload an image peg.
              </p>
            </div>
            <span className="text-[11px] text-slate-400">Step 2 of 2</span>
          </div>

          {/* Mode Switcher: Describe Specifications vs Upload Reference Photo */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() =>
                onUpdateForm({
                  desiredSpecs: {
                    ...formData.desiredSpecs,
                    mode: 'describe',
                  },
                })
              }
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                formData.desiredSpecs.mode === 'describe'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Describe Specifications (Mockup Space)</span>
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateForm({
                  desiredSpecs: {
                    ...formData.desiredSpecs,
                    mode: 'upload',
                  },
                })
              }
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                formData.desiredSpecs.mode === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Upload Reference Image</span>
            </button>
          </div>

          {/* Mode 1: Describe Desired Specifications */}
          {formData.desiredSpecs.mode === 'describe' ? (
            <div className="space-y-4">
              {/* Feature Chips Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Desired Specifications to Mock Up:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'natural_light', label: 'Natural Light', desc: 'Maximized window daylight' },
                    { id: 'space_saving', label: 'Space-Saving', desc: 'Multifunctional storage sofa' },
                    { id: 'warm_wood', label: 'Warm Wood Tones', desc: 'Oak fluted wall accents' },
                    { id: 'concealed_storage', label: 'Concealed Storage', desc: 'Seamless flush cabinetry' },
                    { id: 'tropical_plants', label: 'Tropical Plants', desc: 'Indoor green biophilia' },
                    { id: 'ambient_lighting', label: 'Ambient Lighting', desc: 'Indirect LED cove glow' },
                    { id: 'low_profile', label: 'Low-Profile Slim', desc: 'Airy ceiling clearance' },
                    { id: 'matte_stone', label: 'Matte Stone', desc: 'Travertine / tile textures' },
                  ].map((item) => {
                    const isSelected = formData.desiredSpecs.selectedFeatures.includes(item.id as any);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          const current = formData.desiredSpecs.selectedFeatures;
                          const next = isSelected
                            ? current.filter((x) => x !== item.id)
                            : [...current, item.id as any];
                          onUpdateForm({
                            desiredSpecs: {
                              ...formData.desiredSpecs,
                              selectedFeatures: next,
                            },
                          });
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 text-amber-950 font-semibold shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{item.label}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500 line-clamp-1 mt-1 font-normal">
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Description Input */}
              <div>
                <label
                  htmlFor="specs-description-input"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Describe what you want for your space:
                </label>
                <textarea
                  id="specs-description-input"
                  rows={2}
                  value={formData.desiredSpecs.specsDescription}
                  onChange={(e) =>
                    onUpdateForm({
                      desiredSpecs: {
                        ...formData.desiredSpecs,
                        specsDescription: e.target.value,
                      },
                    })
                  }
                  placeholder="e.g. Abundant natural light with sheer curtains, space-saving sofa with under-seat storage, warm wood accents, and minimalist condo feel..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all placeholder:text-slate-400"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The app renders ideas below reflecting your specifications and selected flooring.
                </p>
              </div>

              {/* Rendered Space Mockup Canvas */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Space Mockup Rendered from Specifications:
                  </label>
                  <div className="flex items-center p-0.5 bg-slate-100 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setFormMockupView('ai_render')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        formMockupView === 'ai_render'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ✨ Realistic Render
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormMockupView('diagram')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        formMockupView === 'diagram'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      📐 Diagram
                    </button>
                  </div>
                </div>

                {formMockupView === 'ai_render' ? (
                  <AiMockupGenerator
                    formData={formData}
                    photos={photos}
                    onUpdateForm={onUpdateForm}
                    onUpdatePhotos={onUpdatePhotos}
                  />
                ) : (
                  <SpaceMockupRenderer
                    desiredSpecs={formData.desiredSpecs}
                    flooringId={formData.selectedFlooring}
                    conceptId={formData.selectedConcept}
                    roomAreaM2={parseFloat(formData.livingRoomArea) || 10}
                    interactive={true}
                  />
                )}
              </div>
            </div>
          ) : (
            /* Mode 2: Upload Inspiration Photo (Classic mode) */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Upload Reference Image Peg
                </label>
                <input
                  ref={inspirationFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'inspiration')}
                  className="hidden"
                  id="inspiration-photo-input"
                />

                {!photos.inspirationPhotoUrl ? (
                  <label
                    htmlFor="inspiration-photo-input"
                    className="flex items-center justify-between p-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-xl cursor-pointer bg-slate-50/60 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-500">
                        <ImageIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Upload inspiration</p>
                        <p className="text-[11px] text-slate-400">Pinterest, peg, or interior sample</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-900 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
                      Browse
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={photos.inspirationPhotoUrl}
                        alt="Inspiration thumbnail"
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div className="truncate">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {photos.inspirationPhotoName || 'Inspiration thumbnail'}
                        </p>
                        <p className="text-[11px] text-emerald-600 font-medium">Inspiration attached</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="inspiration-photo-input"
                        className="text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer underline underline-offset-2"
                      >
                        Change
                      </label>
                      <button
                        type="button"
                        onClick={() => removePhoto('inspiration')}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                        title="Remove inspiration"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sample Design Selector (Warm Minimal / Modern Neutral) */}
          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-700 mb-2">
              Sample Design Concept: <span className="font-semibold text-slate-900">{CONCEPTS[formData.selectedConcept].name}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['warm_minimal', 'modern_neutral'] as DesignConceptId[]).map((id) => {
                const concept = CONCEPTS[id];
                const isSelected = formData.selectedConcept === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onUpdateForm({ selectedConcept: id })}
                    className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-white text-slate-800'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {concept.name}
                      </p>
                      <p className={`text-[11px] line-clamp-1 mt-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                        {concept.tagline}
                      </p>
                    </div>
                    {isSelected && (
                      <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-amber-300">
                        Selected Concept
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* When in upload mode or toggle, preview sample photo concept */}
          {formData.desiredSpecs.mode === 'upload' && (
            <div className="pt-1">
              <SampleDesignViewer
                selectedConcept={formData.selectedConcept}
                onSelectConcept={(id) => onUpdateForm({ selectedConcept: id })}
                interactive={false}
              />
            </div>
          )}
        </div>

        {/* Step 4: Renovation Scope & Trade Packages */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Renovation Scope & Trade Packages</h2>
              <p className="text-xs text-slate-500">
                Select the trades to include in your estimate alongside Flooring.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {formData.enabledCategories.length} {formData.enabledCategories.length === 1 ? 'Trade' : 'Trades'} Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                id: 'flooring' as const,
                title: 'Flooring Works',
                desc: 'Vinyl plank or porcelain tile materials + installation.',
                badge: 'Primary Trade',
                required: true,
              },
              {
                id: 'fenestrations' as const,
                title: 'Fenestrations (Windows & Balcony)',
                desc: 'Wave-fold sheer/blackout drapes, roller blinds, or glass sliding wall.',
                badge: 'Windows & Glass',
                required: false,
              },
              {
                id: 'wall_works' as const,
                title: 'Wall Works & Accents',
                desc: 'Skim coating, premium paint, or fluted wood slat accent paneling.',
                badge: 'Walls & Finish',
                required: false,
              },
              {
                id: 'ceiling' as const,
                title: 'Ceiling Works',
                desc: 'Gypsum drop ceiling with indirect LED cove or flat drywall.',
                badge: 'Ceiling & Cove',
                required: false,
              },
              {
                id: 'fixtures' as const,
                title: 'Fixtures (Elec, Plumbing, Lighting)',
                desc: 'Recessed LED downlights, cove strips, duplex outlets & wet bar tap.',
                badge: 'MEP & Lighting',
                required: false,
              },
            ].map((trade) => {
              const isChecked = formData.enabledCategories.includes(trade.id);
              return (
                <button
                  key={trade.id}
                  type="button"
                  onClick={() => {
                    if (trade.required) return; // Keep flooring always available
                    const next = isChecked
                      ? formData.enabledCategories.filter((c) => c !== trade.id)
                      : [...formData.enabledCategories, trade.id];
                    onUpdateForm({ enabledCategories: next });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isChecked
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-xs font-bold ${isChecked ? 'text-white' : 'text-slate-900'}`}>
                        {trade.title}
                      </p>
                      <p className={`text-[11px] mt-0.5 ${isChecked ? 'text-slate-300' : 'text-slate-500'}`}>
                        {trade.desc}
                      </p>
                    </div>
                    <span
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${
                        isChecked
                          ? 'bg-amber-400 border-amber-400 text-slate-950'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && '✓'}
                    </span>
                  </div>
                  <span
                    className={`mt-2 text-[10px] font-semibold uppercase tracking-wider ${
                      isChecked ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    {trade.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 5: Target Budget */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="flooring-budget" className="text-sm font-semibold text-slate-900">
              Target Budget
            </label>
            <span className="text-[11px] text-slate-400">Philippine Peso (₱)</span>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500 pointer-events-none">
              ₱
            </span>
            <input
              id="flooring-budget"
              type="text"
              inputMode="numeric"
              value={formData.targetBudget}
              onChange={(e) => onUpdateForm({ targetBudget: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="20000"
              className={`w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                errors.targetBudget
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-slate-900/10 focus:border-slate-400'
              }`}
            />
          </div>
          {errors.targetBudget && (
            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.targetBudget}</span>
            </p>
          )}
          <p className="text-xs text-slate-500">
            Default benchmark: ₱20,000 (covers baseline flooring). Evaluates your selected scope on Screen 2.
          </p>
        </div>

        {/* Large PREVIEW & ESTIMATE Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-slate-900/10 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span>PREVIEW & ESTIMATE</span>
            <ArrowRight className="w-5 h-5 text-amber-300" />
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-2">
            Opens Screen 2 to review sample living-room concept and compare demo flooring options.
          </p>
        </div>
      </form>
    </div>
  );
};
