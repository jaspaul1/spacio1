/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FormDataState, PhotoState } from './types';
import { createDefaultRoomConfigurations, getDefaultRoomsForScope } from './data/rooms';
import { ScreenSpaceForm } from './components/ScreenSpaceForm';
import { ScreenEstimate } from './components/ScreenEstimate';
import bareCondoImg from './assets/images/condo_space_bare_1791021854308.jpg';
import { Home, Layers, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'roombudget_ph_details_v1';

const initialScope = 'loft_to_two_storey';
const initialRoomConfigs = createDefaultRoomConfigurations(initialScope, 40);

const DEFAULT_FORM_DATA: FormDataState = {
  unitTypology: 'loft',
  structuralScope: initialScope,
  unitDescription: 'Loft Unit (Converting to Two-Storey)',
  location: 'Manila',
  totalUnitArea: '40',
  areaUnit: 'm2',
  livingRoomArea: '12',
  livingRoomUnit: 'm2',
  selectedConcept: 'warm_minimal',
  targetBudget: '20000',
  selectedFlooring: 'vinyl',
  desiredSpecs: {
    mode: 'describe',
    specsDescription: 'Convert open loft to structural two-storey with private second floor master bedroom, glass balustrade, and oak vinyl flooring.',
    selectedFeatures: ['natural_light', 'space_saving', 'warm_wood'],
  },
  enabledCategories: ['flooring'], // Flooring active by default to preserve Sheet 4 baseline checks
  fenestrationChoice: 'wave_curtains',
  wallWorksChoice: 'fluted_accent',
  ceilingChoice: 'cove_drop',
  fixturesChoice: {
    lighting: true,
    electrical: true,
    plumbing: false,
  },
  selectedRooms: getDefaultRoomsForScope(initialScope),
  activeRoomId: 'overall',
  roomConfigurations: initialRoomConfigs,
};

const DEFAULT_PHOTOS: PhotoState = {
  spacePhotoUrl: bareCondoImg,
  spacePhotoName: 'Sample Philippine Condo Living Room (Bare Unit).jpg',
  inspirationPhotoUrl: null,
  inspirationPhotoName: null,
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'space' | 'estimate'>('space');
  const [formData, setFormData] = useState<FormDataState>(DEFAULT_FORM_DATA);
  const [photos, setPhotos] = useState<PhotoState>(DEFAULT_PHOTOS);
  const [restoredFromStorage, setRestoredFromStorage] = useState(false);

  // Load saved details from localStorage on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setFormData((prev) => ({
            ...prev,
            ...parsed,
          }));
          setRestoredFromStorage(true);
        }
      }
    } catch (e) {
      console.warn('Storage read failed or disabled:', e);
    }
  }, []);

  const handleUpdateForm = (updates: Partial<FormDataState>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleUpdatePhotos = (updates: Partial<PhotoState>) => {
    setPhotos((prev) => ({ ...prev, ...updates }));
  };

  const handleSaveDetails = (): { success: boolean; error?: string } => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return { success: false, error: 'Browser local storage is not supported on this device.' };
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      return { success: true };
    } catch (e: any) {
      return {
        success: false,
        error: e?.message || 'Storage write failed. Browser storage might be restricted.',
      };
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset all values to default demo condo values?')) {
      setFormData(DEFAULT_FORM_DATA);
      setPhotos(DEFAULT_PHOTOS);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        // ignore
      }
      setRestoredFromStorage(false);
      setCurrentScreen('space');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1E293B] flex flex-col justify-between">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Clean Nav) — Zone 3 (Action) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentScreen('space');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 font-display flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            S
          </span>
          <span>Spacio</span>
        </a>

        {/* Zone 2: Step Indicator Navigation */}
        <nav className="flex items-center gap-1.5 sm:gap-3 text-xs font-medium text-slate-500">
          <button
            type="button"
            onClick={() => setCurrentScreen('space')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              currentScreen === 'space'
                ? 'text-slate-900 font-semibold bg-slate-100'
                : 'hover:text-slate-800'
            }`}
          >
            1. Your space
          </button>
          <span className="text-slate-300">/</span>
          <button
            type="button"
            onClick={() => setCurrentScreen('estimate')}
            className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              currentScreen === 'estimate'
                ? 'text-slate-900 font-semibold bg-slate-100'
                : 'hover:text-slate-800'
            }`}
          >
            2. Concept & estimate
          </button>
        </nav>

        {/* Zone 3: Quick Reset Action */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default demo values"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {currentScreen === 'space' ? (
          <ScreenSpaceForm
            formData={formData}
            onUpdateForm={handleUpdateForm}
            photos={photos}
            onUpdatePhotos={handleUpdatePhotos}
            onProceedToEstimate={() => setCurrentScreen('estimate')}
            restoredFromStorage={restoredFromStorage}
          />
        ) : (
          <ScreenEstimate
            formData={formData}
            onUpdateForm={handleUpdateForm}
            photos={photos}
            onUpdatePhotos={handleUpdatePhotos}
            onBackToEditSpace={() => setCurrentScreen('space')}
            onSaveDetails={handleSaveDetails}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 px-4 text-center text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-700">Spacio</p>
        <p>
          Condo living-room planning prototype for first-time owners in the Philippines.
        </p>
        <p className="text-[11px] text-slate-400">
          Demo pricing calculations are for evaluation purposes and do not represent verified contractor bids.
        </p>
      </footer>
    </div>
  );
}
