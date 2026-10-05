import React from 'react';
import { FlooringId, UnitTypology } from '../types';
import { Info, Maximize2 } from 'lucide-react';

interface Props {
  areaM2: number;
  flooringId: FlooringId;
  unitTypology?: UnitTypology;
  unitDescription?: string;
}

export const IllustrativeRoomLayout: React.FC<Props> = ({
  areaM2,
  flooringId,
  unitTypology,
  unitDescription,
}) => {
  // Approximate length & width assuming standard rectangular living zone (e.g. 1.25 : 1 ratio)
  const widthM = Math.sqrt(areaM2 * 1.2).toFixed(1);
  const lengthM = (areaM2 / Number(widthM)).toFixed(1);

  const isLoftOrBiLevel = unitTypology === 'loft' || unitTypology === 'two_storey';

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {unitTypology === 'loft'
              ? 'Loft Layout Plan'
              : unitTypology === 'two_storey'
              ? 'Two-Storey Plan'
              : 'Room Layout Plan'}
          </span>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-medium text-slate-700">
            ~{widthM}m × {lengthM}m ({areaM2} m²)
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
          {flooringId === 'vinyl' ? 'Vinyl Planks' : 'Square Tiles'}
        </span>
      </div>

      {/* SVG Architectural Floorplan */}
      <div className="relative w-full aspect-[16/9] bg-[#FAFAF8] rounded-xl border border-dashed border-slate-300 overflow-hidden flex items-center justify-center p-2">
        <svg
          viewBox="0 0 540 280"
          className="w-full h-full max-h-[220px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Vinyl plank pattern */}
            <pattern id="vinylPlanks" width="60" height="15" patternUnits="userSpaceOnUse">
              <rect width="60" height="15" fill="#F4EFEA" stroke="#E3DACF" strokeWidth="0.7" />
              <line x1="30" y1="0" x2="30" y2="15" stroke="#E3DACF" strokeWidth="0.7" />
            </pattern>
            {/* Tile grid pattern */}
            <pattern id="tileGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Unit Boundary Wall (thick architectural line) */}
          <rect
            x="40"
            y="25"
            width="460"
            height="230"
            rx="4"
            fill="none"
            stroke="#1E293B"
            strokeWidth="5"
          />

          {/* Living Room Area Flooring Hatch (Active Reno Zone) */}
          <rect
            x="45"
            y="30"
            width="340"
            height="220"
            fill={flooringId === 'vinyl' ? 'url(#vinylPlanks)' : 'url(#tileGrid)'}
            opacity="0.85"
          />

          {/* Reno Scope Boundary Marker */}
          <line
            x1="385"
            y1="30"
            x2="385"
            y2="250"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          <text
            x="395"
            y="140"
            fill="#94A3B8"
            fontSize="10"
            fontWeight="500"
            className="select-none"
          >
            {isLoftOrBiLevel ? 'Stairs / Kitchen Zone' : 'Dining / Kitchen Zone'}
          </text>

          {/* If Loft or Two-Storey, draw subtle stairs symbol */}
          {isLoftOrBiLevel && (
            <g transform="translate(395, 160)">
              <rect x="0" y="0" width="85" height="45" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
              <line x1="17" y1="0" x2="17" y2="45" stroke="#94A3B8" strokeWidth="1" />
              <line x1="34" y1="0" x2="34" y2="45" stroke="#94A3B8" strokeWidth="1" />
              <line x1="51" y1="0" x2="51" y2="45" stroke="#94A3B8" strokeWidth="1" />
              <line x1="68" y1="0" x2="68" y2="45" stroke="#94A3B8" strokeWidth="1" />
              <text x="42" y="27" fill="#475569" fontSize="8" fontWeight="600" textAnchor="middle">
                UP (Mezzanine/2F)
              </text>
            </g>
          )}

          {/* Balcony / Window Sliding Door (Top left) */}
          <rect x="90" y="21" width="160" height="8" fill="#FFFFFF" stroke="#38BDF8" strokeWidth="2" />
          <line x1="90" y1="25" x2="250" y2="25" stroke="#0284C7" strokeWidth="2" />
          <text x="135" y="16" fill="#0284C7" fontSize="9" fontWeight="600" textAnchor="middle">
            {unitTypology === 'loft' ? 'Double-Height Window / Balcony' : 'Balcony / Natural Light'}
          </text>

          {/* Entryway Door Arc (Bottom Right) */}
          <path
            d="M 470 255 A 40 40 0 0 0 430 215"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <line x1="470" y1="255" x2="470" y2="215" stroke="#475569" strokeWidth="2.5" />
          <text x="445" y="248" fill="#64748B" fontSize="9">Condo Entry</text>

          {/* Furniture: 3-Seater Living Room Sofa */}
          <g transform="translate(100, 150)">
            {/* Sofa Base */}
            <rect x="0" y="0" width="140" height="55" rx="6" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
            {/* Backrest */}
            <rect x="0" y="38" width="140" height="17" rx="4" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
            {/* Armrests */}
            <rect x="0" y="0" width="14" height="45" rx="3" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
            <rect x="126" y="0" width="14" height="45" rx="3" fill="#CBD5E1" stroke="#64748B" strokeWidth="1" />
            {/* Cushions */}
            <line x1="51" y1="0" x2="51" y2="38" stroke="#94A3B8" strokeWidth="1" />
            <line x1="89" y1="0" x2="89" y2="38" stroke="#94A3B8" strokeWidth="1" />
            <text x="70" y="26" fill="#475569" fontSize="10" fontWeight="600" textAnchor="middle">
              Condo Sofa
            </text>
          </g>

          {/* Travertine / Wood Coffee Table */}
          <rect
            x="135"
            y="95"
            width="70"
            height="32"
            rx="4"
            fill="#FEF3C7"
            stroke="#D97706"
            strokeWidth="1.2"
          />
          <text x="170" y="115" fill="#92400E" fontSize="9" fontWeight="500" textAnchor="middle">
            Table
          </text>

          {/* TV Console Wall Unit */}
          <rect
            x="110"
            y="35"
            width="120"
            height="16"
            rx="2"
            fill="#334155"
            stroke="#0F172A"
            strokeWidth="1.5"
          />
          <text x="170" y="47" fill="#F8FAFC" fontSize="9" fontWeight="600" textAnchor="middle">
            Wall TV Console
          </text>

          {/* Plant Icon */}
          <circle cx="68" cy="55" r="14" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.2" />
          <circle cx="68" cy="55" r="5" fill="#16A34A" />
          <text x="68" y="80" fill="#15803D" fontSize="8" textAnchor="middle">Plant</text>

          {/* Living Room Area Center Tag */}
          <g transform="translate(230, 95)">
            <rect
              x="0"
              y="0"
              width="135"
              height="34"
              rx="6"
              fill="#FFFFFF"
              stroke="#0284C7"
              strokeWidth="1.5"
              filter="drop-shadow(0px 2px 4px rgba(0,0,0,0.05))"
            />
            <text x="67" y="16" fill="#0369A1" fontSize="10" fontWeight="700" textAnchor="middle">
              LIVING ROOM ZONE
            </text>
            <text x="67" y="28" fill="#0F172A" fontSize="9" fontWeight="500" textAnchor="middle">
              {areaM2} m² Reno Area
            </text>
          </g>

          {/* Dimension arrows */}
          <line x1="50" y1="258" x2="380" y2="258" stroke="#64748B" strokeWidth="1" markerEnd="url(#arrow)" />
          <text x="215" y="272" fill="#64748B" fontSize="10" fontWeight="600" textAnchor="middle">
            approx. {widthM} m
          </text>
        </svg>

        {/* Small floating hint */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-500 border border-slate-200">
          <Maximize2 className="w-3 h-3" />
          <span>Scale ~ 1:50</span>
        </div>
      </div>

      {/* Mandatory Label */}
      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span className="font-medium text-slate-700">Approximate; measurements unverified.</span>
        </div>
        <span className="text-[11px] text-slate-400">
          {unitTypology === 'loft' ? 'Loft lower level' : 'Living room only'}
        </span>
      </div>
    </div>
  );
};
