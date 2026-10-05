import React, { useState } from 'react';
import { DesiredSpecsState, FlooringId, SpecFeatureId, DesignConceptId } from '../types';
import {
  Sun,
  Maximize2,
  TreePine,
  Sparkles,
  Layers,
  Box,
  Lightbulb,
  Check,
  Info,
} from 'lucide-react';

interface Props {
  desiredSpecs: DesiredSpecsState;
  flooringId: FlooringId;
  conceptId?: DesignConceptId;
  roomAreaM2?: number;
  interactive?: boolean;
}

export const SPEC_FEATURE_INFO: Record<
  SpecFeatureId,
  { label: string; tag: string; icon: any; mockupNote: string; condoTip: string }
> = {
  natural_light: {
    label: 'Abundant Natural Light',
    tag: 'Natural Light',
    icon: Sun,
    mockupNote: 'Floor-to-ceiling window exposure with sheer linen diffusion to illuminate your condo.',
    condoTip: 'Use ceiling-to-floor sheer wave-fold drapes. They bounce tropical sunlight deeper into the room without greenhouse heat.',
  },
  space_saving: {
    label: 'Space-Saving Multifunctional',
    tag: 'Space-Saving',
    icon: Maximize2,
    mockupNote: 'Modular seating with 120L concealed storage and dual-purpose nested tables.',
    condoTip: 'Pick a sofa with pull-out under-seat storage drawers and nesting nesting tables to keep floor space clear.',
  },
  warm_wood: {
    label: 'Warm Oak & Japandi Tones',
    tag: 'Warm Wood',
    icon: TreePine,
    mockupNote: 'Vertical fluted oak wall slatting and warm timber accents.',
    condoTip: 'Match your vinyl or baseboards with warm oak laminate to create visual continuity across the living room.',
  },
  concealed_storage: {
    label: 'Concealed Wall Storage',
    tag: 'Flush Storage',
    icon: Box,
    mockupNote: 'Seamless push-to-open full-height cabinetry with zero visual clutter.',
    condoTip: 'Floor-to-ceiling cabinetry painted the exact wall color tricks the eye into seeing an uninterrupted expansive wall.',
  },
  tropical_plants: {
    label: 'Tropical Greenery',
    tag: 'Plants & Biophilia',
    icon: TreePine,
    mockupNote: 'Potted fiddle-leaf fig / monstera placed in the natural sunlit corner.',
    condoTip: 'Condo balcony corners are prime spots for hardy indoor tropicals like snake plants or zamioculcas.',
  },
  ambient_lighting: {
    label: 'Cozy Ambient Cove Lighting',
    tag: 'Cove Lighting',
    icon: Lightbulb,
    mockupNote: 'Warm 3000K indirect LED ceiling cove and soft reading illumination.',
    condoTip: 'Avoid harsh overhead downlights at night; layered cove warm light creates high-end hotel ambiance.',
  },
  low_profile: {
    label: 'Low-Profile Slim Furniture',
    tag: 'Low-Profile',
    icon: Layers,
    mockupNote: 'Low-profile seating maximizing vertical ceiling clearance.',
    condoTip: 'Keeping sofa backrests below 80cm keeps window sightlines unobstructed in compact condo units.',
  },
  matte_stone: {
    label: 'Matte Stone & Travertine',
    tag: 'Stone Textures',
    icon: Sparkles,
    mockupNote: 'Honed travertine and microcement textural balance.',
    condoTip: 'Pairs seamlessly with large format ceramic/porcelain floor tiles for a sleek hotel-condo finish.',
  },
};

export const SpaceMockupRenderer: React.FC<Props> = ({
  desiredSpecs,
  flooringId,
  conceptId = 'warm_minimal',
  roomAreaM2 = 10,
  interactive = true,
}) => {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);

  const hasFeature = (f: SpecFeatureId) => desiredSpecs.selectedFeatures.includes(f);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-400/20 text-amber-300 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">
              Interactive Space Mockup
            </h3>
            <p className="text-[11px] text-slate-300">
              Rendered to visualize your described living-room specifications
            </p>
          </div>
        </div>

        {/* Feature count chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] text-slate-300 font-medium">Rendered specs:</span>
          {desiredSpecs.selectedFeatures.slice(0, 3).map((f) => (
            <span
              key={f}
              className="text-[10px] font-medium bg-white/10 text-amber-200 px-2 py-0.5 rounded-full border border-white/10"
            >
              {SPEC_FEATURE_INFO[f]?.tag || f}
            </span>
          ))}
          {desiredSpecs.selectedFeatures.length > 3 && (
            <span className="text-[10px] text-slate-400">
              +{desiredSpecs.selectedFeatures.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* SVG Architectural 2.5D Room Perspective Mockup */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-[#EAE8E3] overflow-hidden select-none">
        <svg
          viewBox="0 0 800 480"
          className="w-full h-full object-cover"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Vinyl plank flooring texture */}
            <pattern id="mockupVinyl" width="120" height="24" patternUnits="userSpaceOnUse">
              <rect width="120" height="24" fill="#D7C9B8" />
              <rect width="118" height="22" x="1" y="1" fill="#E2D7C8" />
              <line x1="60" y1="1" x2="60" y2="23" stroke="#C2B29F" strokeWidth="0.8" />
              <line x1="0" y1="23" x2="120" y2="23" stroke="#B8A793" strokeWidth="1" />
            </pattern>

            {/* Tile flooring texture */}
            <pattern id="mockupTile" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect width="60" height="60" fill="#E2E8F0" />
              <rect width="58" height="58" x="1" y="1" fill="#F8FAFC" />
              <line x1="0" y1="59" x2="60" y2="59" stroke="#CBD5E1" strokeWidth="1.2" />
              <line x1="59" y1="0" x2="59" y2="60" stroke="#CBD5E1" strokeWidth="1.2" />
            </pattern>

            {/* Sunlight beam gradient */}
            <linearGradient id="sunbeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#FEF9C3" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FEF9C3" stopOpacity="0.0" />
            </linearGradient>

            {/* Cove ceiling lighting */}
            <linearGradient id="coveGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#FDE68A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Perspective Room Walls */}
          {/* Back wall */}
          <polygon points="120,60 680,60 680,330 120,330" fill="#F4F1EA" stroke="#DDD8CC" strokeWidth="1" />

          {/* Left wall */}
          <polygon points="0,0 120,60 120,330 0,480" fill="#EDE9DF" stroke="#D5CFBF" strokeWidth="1" />

          {/* Right wall */}
          <polygon points="800,0 680,60 680,330 800,480" fill="#E3DFD4" stroke="#D0CAC0" strokeWidth="1" />

          {/* Ceiling */}
          <polygon points="0,0 800,0 680,60 120,60" fill="#FAF9F6" />

          {/* Floor plane with selected flooring */}
          <polygon
            points="0,480 120,330 680,330 800,480"
            fill={flooringId === 'vinyl' ? 'url(#mockupVinyl)' : 'url(#mockupTile)'}
            stroke="#94A3B8"
            strokeWidth="0.8"
          />

          {/* Feature: Ambient Cove Lighting */}
          {hasFeature('ambient_lighting') && (
            <g>
              <rect x="120" y="55" width="560" height="24" fill="url(#coveGlow)" />
              <line x1="120" y1="60" x2="680" y2="60" stroke="#FBBF24" strokeWidth="2.5" />
            </g>
          )}

          {/* Feature: Concealed Wall Storage (Left wall or Back wall right) */}
          {hasFeature('concealed_storage') ? (
            <g transform="translate(490, 60)">
              <rect x="0" y="0" width="190" height="270" fill="#EBE7DE" stroke="#D3CCC0" strokeWidth="1" />
              {/* Cabinet division lines */}
              <line x1="63" y1="0" x2="63" y2="270" stroke="#DDD7CB" strokeWidth="1.2" />
              <line x1="126" y1="0" x2="126" y2="270" stroke="#DDD7CB" strokeWidth="1.2" />
              <line x1="0" y1="90" x2="190" y2="90" stroke="#DDD7CB" strokeWidth="1.2" />
              <line x1="0" y1="180" x2="190" y2="180" stroke="#DDD7CB" strokeWidth="1.2" />
              <text x="95" y="45" fill="#8C8275" fontSize="10" fontWeight="600" textAnchor="middle">
                Concealed Flush Cabinets
              </text>
            </g>
          ) : null}

          {/* Feature: Warm Wood Oak Slat Wall */}
          {hasFeature('warm_wood') && (
            <g transform="translate(140, 60)">
              {/* Vertical fluted slats */}
              {Array.from({ length: 18 }).map((_, i) => (
                <rect
                  key={i}
                  x={i * 12}
                  y="0"
                  width="7"
                  height="270"
                  fill="#CBB499"
                  stroke="#B89F82"
                  strokeWidth="0.5"
                />
              ))}
            </g>
          )}

          {/* Balcony / Floor to ceiling Window on Left Wall */}
          <g>
            {/* Window frame on left wall perspective */}
            <polygon points="15,80 105,115 105,370 15,430" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" opacity="0.85" />
            <polygon points="20,85 100,118 100,365 20,425" fill="#BAE6FD" opacity="0.6" />
            {/* Horizon skyline view through window */}
            <line x1="20" y1="280" x2="100" y2="260" stroke="#38BDF8" strokeWidth="1.5" />
            <rect x="40" y="220" width="15" height="40" fill="#7DD3FC" />
            <rect x="65" y="200" width="20" height="60" fill="#38BDF8" opacity="0.7" />

            {/* Feature: Abundant Natural Light Beams */}
            {hasFeature('natural_light') && (
              <polygon
                points="105,115 550,440 250,470 15,430"
                fill="url(#sunbeam)"
                className="pointer-events-none"
              />
            )}

            {/* Sheer linen curtains */}
            <path
              d="M 12 75 Q 35 150 20 435 L 5 440 L 5 70 Z"
              fill="#FFFFFF"
              opacity="0.8"
            />
          </g>

          {/* Center Living Room Furniture Setup */}
          {/* Minimalist modern or space-saving sofa */}
          <g transform="translate(250, 260)">
            {/* Sofa Shadow */}
            <ellipse cx="140" cy="95" rx="150" ry="25" fill="#000000" opacity="0.12" />

            {/* Low profile / Space-saving Sofa Base */}
            <rect
              x="0"
              y="20"
              width="270"
              height="65"
              rx={hasFeature('low_profile') ? '4' : '8'}
              fill="#D9D5CD"
              stroke="#8F887C"
              strokeWidth="2"
            />

            {/* Sofa Cushions */}
            <rect x="10" y="10" width="120" height="55" rx="6" fill="#EDE9E3" stroke="#8F887C" strokeWidth="1.5" />
            <rect x="140" y="10" width="120" height="55" rx="6" fill="#EDE9E3" stroke="#8F887C" strokeWidth="1.5" />

            {/* Sofa Backrest */}
            <rect
              x="0"
              y={hasFeature('low_profile') ? '-15' : '-35'}
              width="270"
              height={hasFeature('low_profile') ? '35' : '55'}
              rx="6"
              fill="#E3DFD7"
              stroke="#8F887C"
              strokeWidth="1.5"
            />

            {/* Space Saving Feature: Under-seat pull-out drawers indicator */}
            {hasFeature('space_saving') && (
              <g>
                <line x1="15" y1="70" x2="125" y2="70" stroke="#B45309" strokeWidth="2" strokeDasharray="3 2" />
                <line x1="145" y1="70" x2="255" y2="70" stroke="#B45309" strokeWidth="2" strokeDasharray="3 2" />
                <rect x="55" y="65" width="25" height="6" rx="2" fill="#D97706" />
                <rect x="185" y="65" width="25" height="6" rx="2" fill="#D97706" />
                <text x="135" y="90" fill="#92400E" fontSize="9" fontWeight="700" textAnchor="middle">
                  120L Under-Sofa Storage Drawer
                </text>
              </g>
            )}
          </g>

          {/* Coffee Table: Travertine Stone or Warm Wood */}
          <g transform="translate(320, 360)">
            <ellipse cx="65" cy="45" rx="75" ry="18" fill="#000000" opacity="0.1" />
            <rect
              x="0"
              y="0"
              width="130"
              height="35"
              rx="6"
              fill={hasFeature('matte_stone') ? '#E2E8F0' : hasFeature('warm_wood') ? '#D4B996' : '#FAF5EE'}
              stroke="#64748B"
              strokeWidth="1.5"
            />
            <text x="65" y="22" fill="#334155" fontSize="9" fontWeight="600" textAnchor="middle">
              {hasFeature('matte_stone')
                ? 'Honed Travertine Table'
                : hasFeature('space_saving')
                ? 'Nested Lift-Top Table'
                : 'Condo Coffee Table'}
            </text>
          </g>

          {/* Feature: Tropical Greenery / Houseplant */}
          {hasFeature('tropical_plants') && (
            <g transform="translate(130, 260)">
              {/* Ceramic Pot */}
              <polygon points="15,70 45,70 50,110 10,110" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
              {/* Plant leaves */}
              <circle cx="20" cy="50" r="18" fill="#16A34A" opacity="0.9" />
              <circle cx="40" cy="38" r="22" fill="#22C55E" opacity="0.9" />
              <circle cx="30" cy="20" r="20" fill="#15803D" opacity="0.95" />
              <circle cx="48" cy="48" r="16" fill="#16A34A" />
              <text x="30" y="125" fill="#166534" fontSize="8" fontWeight="600" textAnchor="middle">
                Fiddle Leaf Fig
              </text>
            </g>
          )}

          {/* TV Wall Console Floating on Back Wall */}
          <g transform="translate(290, 110)">
            <rect x="0" y="0" width="180" height="100" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="2" />
            <rect x="5" y="5" width="170" height="90" fill="#1E293B" />
            <text x="90" y="55" fill="#94A3B8" fontSize="10" fontWeight="600" textAnchor="middle">
              Condo Media Display
            </text>
            {/* Floating console shelf */}
            <rect x="-10" y="115" width="200" height="18" rx="3" fill="#475569" stroke="#1E293B" strokeWidth="1" />
          </g>

          {/* Dimension Tag */}
          <g transform="translate(620, 420)">
            <rect x="0" y="0" width="140" height="28" rx="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.2" />
            <text x="70" y="18" fill="#0F172A" fontSize="10" fontWeight="700" textAnchor="middle">
              {roomAreaM2} m² Space Mockup
            </text>
          </g>
        </svg>

        {/* Feature Hotspots Overlay */}
        <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xs border border-white/10 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>Tailored Mockup Rendered from Specifications</span>
            </span>

            <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[11px] font-bold px-2 py-0.8 rounded-md border border-slate-200 shadow-2xs">
              {flooringId === 'vinyl' ? 'Oak Vinyl Flooring' : 'Porcelain Tile Flooring'}
            </span>
          </div>

          {/* Active Hotspot Explainer if user tapped a feature */}
          {activeHotspot && SPEC_FEATURE_INFO[activeHotspot as SpecFeatureId] && (
            <div className="bg-white/95 backdrop-blur-md border border-amber-300 p-3 rounded-xl shadow-lg max-w-md pointer-events-auto transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900">
                  {SPEC_FEATURE_INFO[activeHotspot as SpecFeatureId].label}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveHotspot(null)}
                  className="text-xs text-slate-400 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-700">
                {SPEC_FEATURE_INFO[activeHotspot as SpecFeatureId].mockupNote}
              </p>
              <p className="text-[11px] text-amber-800 font-medium mt-1 bg-amber-50 p-1.5 rounded-md">
                💡 Tip: {SPEC_FEATURE_INFO[activeHotspot as SpecFeatureId].condoTip}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Feature Tags Bar */}
      {interactive && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600">
              Rendered Features (Tap to inspect how it's integrated):
            </span>
            <span className="text-[10px] text-slate-400">Condo-tailored layout</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {desiredSpecs.selectedFeatures.map((f) => {
              const info = SPEC_FEATURE_INFO[f];
              if (!info) return null;
              const Icon = info.icon;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveHotspot(activeHotspot === f ? null : f)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeHotspot === f
                      ? 'bg-amber-400 text-slate-900 font-bold shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-amber-600" />
                  <span>{info.tag}</span>
                </button>
              );
            })}
          </div>

          {/* User's custom text note if provided */}
          {desiredSpecs.specsDescription && (
            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Your brief: </span>
              <span className="italic text-slate-600">"{desiredSpecs.specsDescription}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
