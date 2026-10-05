import React, { useState } from 'react';
import { DesignConceptId } from '../types';
import warmMinimalImg from '../assets/images/warm_minimal_condo_1791015968811.jpg';
import modernNeutralImg from '../assets/images/modern_neutral_condo_1791015985797.jpg';
import { Sparkles, Eye, Info } from 'lucide-react';

interface Props {
  selectedConcept: DesignConceptId;
  onSelectConcept?: (concept: DesignConceptId) => void;
  interactive?: boolean;
}

export const CONCEPTS: Record<DesignConceptId, {
  name: string;
  tagline: string;
  image: string;
  palette: string[];
  description: string;
}> = {
  warm_minimal: {
    name: 'Warm Minimal',
    tagline: 'Japandi & Warm Oak Condos',
    image: warmMinimalImg,
    palette: ['#EAE4D9', '#CBB89D', '#8C6F56', '#4A3B32'],
    description: 'Clean light oak vinyl, soft linen sectional, travertine textures, and warm diffused sunlight designed for standard condo layouts.',
  },
  modern_neutral: {
    name: 'Modern Neutral',
    tagline: 'Contemporary Slate & Stone',
    image: modernNeutralImg,
    palette: ['#F1F5F9', '#CBD5E1', '#64748B', '#1E293B'],
    description: 'Large-format matte grey porcelain tiles, fluted acoustic paneling, linear LED cove lighting, and tailored charcoal seating.',
  },
};

export const SampleDesignViewer: React.FC<Props> = ({
  selectedConcept,
  onSelectConcept,
  interactive = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const current = CONCEPTS[selectedConcept];

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all">
      {/* Concept Selector if interactive */}
      {interactive && onSelectConcept && (
        <div className="p-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-slate-700 tracking-tight">Select Sample Concept:</span>
          <div className="flex gap-1.5 p-1 bg-slate-200/60 rounded-lg">
            {(['warm_minimal', 'modern_neutral'] as DesignConceptId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setImageError(false);
                  onSelectConcept(id);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  selectedConcept === id
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {CONCEPTS[id].name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Image Frame */}
      <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
        {!imageError ? (
          <img
            src={current.image}
            alt={`${current.name} living room concept`}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6 text-center">
            <Sparkles className="w-8 h-8 text-amber-600 mb-2" />
            <p className="text-sm font-semibold text-slate-800">{current.name} Concept</p>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">{current.description}</p>
          </div>
        )}

        {/* Mandatory Label Badge Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="bg-slate-900/85 backdrop-blur-md text-white text-[11px] font-medium px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 border border-white/10">
            <Info className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Sample concept—not generated from your photo.</span>
          </span>
        </div>

        {/* Bottom subtle gradient scrim with concept name */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4 text-white flex items-end justify-between">
          <div>
            <p className="text-base font-semibold tracking-tight">{current.name}</p>
            <p className="text-xs text-slate-300 font-normal">{current.tagline}</p>
          </div>

          {/* Palette swatches */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/15">
            {current.palette.map((color, idx) => (
              <span
                key={idx}
                className="w-3.5 h-3.5 rounded-full border border-white/30 shadow-xs"
                style={{ backgroundColor: color }}
                title={`Color token ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Description caption */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
        <p className="line-clamp-1 text-slate-500">{current.description}</p>
        <span className="shrink-0 text-[11px] font-medium text-slate-400 ml-2">Condo Concept</span>
      </div>
    </div>
  );
};
