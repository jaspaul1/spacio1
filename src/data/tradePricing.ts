import {
  RenovationCategory,
  FenestrationOption,
  WallWorksOption,
  CeilingOption,
  FixturesSelection,
  LocationOption,
} from '../types';
import { getNearestDepot } from './depots';

export interface TradeCostEstimate {
  category: RenovationCategory;
  title: string;
  selectedOptionLabel: string;
  description: string;
  materialLow: number;
  materialHigh: number;
  installLow: number;
  installHigh: number;
  totalLow: number;
  totalHigh: number;
  depotOptimizedMaterial: number;
  depotOptimizedTotal: number;
  depotSourcingNote: string;
}

export const FENESTRATION_OPTIONS: Record<
  FenestrationOption,
  { label: string; desc: string; materialLow: number; materialHigh: number; installLow: number; installHigh: number; depotMaterial: number }
> = {
  wave_curtains: {
    label: 'Wave-Fold Sheer & Blackout Drapes',
    desc: 'Ceiling-mounted double track with 100% sheer linen + blackout drapes for balcony/window span (~2.8m).',
    materialLow: 4500,
    materialHigh: 7000,
    installLow: 1200,
    installHigh: 2000,
    depotMaterial: 4500,
  },
  roller_blinds: {
    label: 'Dual Combi Sunscreen Blinds',
    desc: 'Korean-style dual zebra/roller sunscreen fabric with aluminum cassette and heavy-duty pull cords.',
    materialLow: 3500,
    materialHigh: 5500,
    installLow: 1000,
    installHigh: 1500,
    depotMaterial: 3500,
  },
  glass_partition: {
    label: '10mm Tempered Glass Sliding Wall',
    desc: 'Black powder-coated aluminum frame with 10mm tempered safety glass sliding door partition.',
    materialLow: 12000,
    materialHigh: 18000,
    installLow: 3000,
    installHigh: 5000,
    depotMaterial: 12000,
  },
};

export const WALL_WORKS_OPTIONS: Record<
  WallWorksOption,
  { label: string; desc: string; ratePerM2Low: number; ratePerM2High: number; installPerM2Low: number; installPerM2High: number; depotRate: number }
> = {
  skim_paint: {
    label: 'Skim Coat & Premium Low-VOC Paint',
    desc: 'Full skim coat patch smoothing + primer + 2 coats odorless paint (Boysen / Davies).',
    ratePerM2Low: 250,
    ratePerM2High: 380,
    installPerM2Low: 200,
    installPerM2High: 300,
    depotRate: 250,
  },
  fluted_accent: {
    label: 'Fluted Wood Slat Accent Wall + Paint',
    desc: 'Architectural WPC / Oak fluted slat cladding on focal TV wall + perimeter repaint.',
    ratePerM2Low: 550,
    ratePerM2High: 780,
    installPerM2Low: 250,
    installPerM2High: 400,
    depotRate: 550,
  },
  venetian_plaster: {
    label: 'Textured Microcement Accent + Paint',
    desc: 'Hand-troweled lime-based Venetian plaster accent wall with matte sealant.',
    ratePerM2Low: 650,
    ratePerM2High: 950,
    installPerM2Low: 350,
    installPerM2High: 500,
    depotRate: 650,
  },
};

export const CEILING_OPTIONS: Record<
  CeilingOption,
  { label: string; desc: string; ratePerM2Low: number; ratePerM2High: number; installPerM2Low: number; installPerM2High: number; depotRate: number }
> = {
  cove_drop: {
    label: 'Gypsum Drop Ceiling with Indirect LED Cove',
    desc: 'Perimeter light trough cove with 9mm moisture-resistant gypsum boards and metal furrings.',
    ratePerM2Low: 650,
    ratePerM2High: 950,
    installPerM2Low: 400,
    installPerM2High: 600,
    depotRate: 650,
  },
  flat_gypsum: {
    label: 'Flat Gypsum Board Ceiling with Access Hatch',
    desc: 'Flush drywall ceiling concealing aircon pipes, fire sprinklers, and wiring.',
    ratePerM2Low: 450,
    ratePerM2High: 700,
    installPerM2Low: 300,
    installPerM2High: 450,
    depotRate: 450,
  },
  minimalist_exposed: {
    label: 'Minimalist Skimmed Concrete Slab & Trims',
    desc: 'Exposed concrete ceiling scraped, sealed, skimmed, and painted with surface track fittings.',
    ratePerM2Low: 200,
    ratePerM2High: 350,
    installPerM2Low: 180,
    installPerM2High: 280,
    depotRate: 200,
  },
};

export function calculateTradeEstimates(
  roomAreaM2: number,
  location: LocationOption,
  fenestrationChoice: FenestrationOption,
  wallWorksChoice: WallWorksOption,
  ceilingChoice: CeilingOption,
  fixturesChoice: FixturesSelection
): Record<RenovationCategory, TradeCostEstimate> {
  const nearestDepot = getNearestDepot(location);

  // 1. Fenestrations
  const fen = FENESTRATION_OPTIONS[fenestrationChoice];
  const fenestrationsEstimate: TradeCostEstimate = {
    category: 'fenestrations',
    title: 'Fenestrations (Windows & Balcony)',
    selectedOptionLabel: fen.label,
    description: fen.desc,
    materialLow: fen.materialLow,
    materialHigh: fen.materialHigh,
    installLow: fen.installLow,
    installHigh: fen.installHigh,
    totalLow: fen.materialLow + fen.installLow,
    totalHigh: fen.materialHigh + fen.installHigh,
    depotOptimizedMaterial: fen.depotMaterial,
    depotOptimizedTotal: fen.depotMaterial + fen.installLow,
    depotSourcingNote: `Curtain tracks & hardware sourced from ${nearestDepot.name} (${nearestDepot.distanceKm} km).`,
  };

  // 2. Wall Works (Calculated based on living room wall perimeter ~2.2x floor area)
  const wallAreaEstimate = Math.round(roomAreaM2 * 2.2);
  const wall = WALL_WORKS_OPTIONS[wallWorksChoice];
  const wallMaterialLow = Math.round(wallAreaEstimate * wall.ratePerM2Low);
  const wallMaterialHigh = Math.round(wallAreaEstimate * wall.ratePerM2High);
  const wallInstallLow = Math.round(wallAreaEstimate * wall.installPerM2Low);
  const wallInstallHigh = Math.round(wallAreaEstimate * wall.installPerM2High);
  const wallDepotMaterial = Math.round(wallAreaEstimate * wall.depotRate);

  const wallWorksEstimate: TradeCostEstimate = {
    category: 'wall_works',
    title: 'Wall Works & Accents',
    selectedOptionLabel: wall.label,
    description: `${wall.desc} (Covers approx ~${wallAreaEstimate} m² wall surface).`,
    materialLow: wallMaterialLow,
    materialHigh: wallMaterialHigh,
    installLow: wallInstallLow,
    installHigh: wallInstallHigh,
    totalLow: wallMaterialLow + wallInstallLow,
    totalHigh: wallMaterialHigh + wallInstallHigh,
    depotOptimizedMaterial: wallDepotMaterial,
    depotOptimizedTotal: wallDepotMaterial + wallInstallLow,
    depotSourcingNote: `Paints (Boysen) & WPC slat panels sourced direct from ${nearestDepot.name}.`,
  };

  // 3. Ceiling Works
  const ceil = CEILING_OPTIONS[ceilingChoice];
  const ceilMaterialLow = Math.round(roomAreaM2 * ceil.ratePerM2Low);
  const ceilMaterialHigh = Math.round(roomAreaM2 * ceil.ratePerM2High);
  const ceilInstallLow = Math.round(roomAreaM2 * ceil.installPerM2Low);
  const ceilInstallHigh = Math.round(roomAreaM2 * ceil.installPerM2High);
  const ceilDepotMaterial = Math.round(roomAreaM2 * ceil.depotRate);

  const ceilingEstimate: TradeCostEstimate = {
    category: 'ceiling',
    title: 'Ceiling Works',
    selectedOptionLabel: ceil.label,
    description: `${ceil.desc} (for ${roomAreaM2} m² ceiling).`,
    materialLow: ceilMaterialLow,
    materialHigh: ceilMaterialHigh,
    installLow: ceilInstallLow,
    installHigh: ceilInstallHigh,
    totalLow: ceilMaterialLow + ceilInstallLow,
    totalHigh: ceilMaterialHigh + ceilInstallHigh,
    depotOptimizedMaterial: ceilDepotMaterial,
    depotOptimizedTotal: ceilDepotMaterial + ceilInstallLow,
    depotSourcingNote: `Gypsum boards, furrings, and access frames stocked at ${nearestDepot.name}.`,
  };

  // 4. Fixtures (Electrical, Plumbing, Lighting)
  let fixMaterialLow = 0;
  let fixMaterialHigh = 0;
  let fixInstallLow = 0;
  let fixInstallHigh = 0;
  const fixtureItems: string[] = [];

  if (fixturesChoice.lighting) {
    fixMaterialLow += 3800;
    fixMaterialHigh += 6500;
    fixInstallLow += 2000;
    fixInstallHigh += 3500;
    fixtureItems.push('Recessed LED Downlights & 3000K Cove Strips');
  }

  if (fixturesChoice.electrical) {
    fixMaterialLow += 1800;
    fixMaterialHigh += 3200;
    fixInstallLow += 1500;
    fixInstallHigh += 2500;
    fixtureItems.push('4 Duplex Outlets, HDMI Conduit & Switches');
  }

  if (fixturesChoice.plumbing) {
    fixMaterialLow += 3500;
    fixMaterialHigh += 5800;
    fixInstallLow += 2000;
    fixInstallHigh += 3200;
    fixtureItems.push('Wet Bar / Sink Line Tap & Trap Fittings');
  }

  if (fixtureItems.length === 0) {
    // default lighting if none selected
    fixMaterialLow = 3800;
    fixMaterialHigh = 6500;
    fixInstallLow = 2000;
    fixInstallHigh = 3500;
    fixtureItems.push('Standard LED Downlights & Cove Lighting');
  }

  const fixturesEstimate: TradeCostEstimate = {
    category: 'fixtures',
    title: 'Fixtures (Electrical, Plumbing, Lighting)',
    selectedOptionLabel: fixtureItems.join(' · '),
    description: `Includes: ${fixtureItems.join(', ')} with certified condo-grade components.`,
    materialLow: fixMaterialLow,
    materialHigh: fixMaterialHigh,
    installLow: fixInstallLow,
    installHigh: fixInstallHigh,
    totalLow: fixMaterialLow + fixInstallLow,
    totalHigh: fixMaterialHigh + fixInstallHigh,
    depotOptimizedMaterial: fixMaterialLow,
    depotOptimizedTotal: fixMaterialLow + fixInstallLow,
    depotSourcingNote: `Philips/Omni LEDs, Panasonic switches & PPR pipes sourced from ${nearestDepot.name}.`,
  };

  return {
    flooring: {
      category: 'flooring',
      title: 'Flooring Works',
      selectedOptionLabel: 'Vinyl / Tile Flooring',
      description: 'Living room flooring materials and labor.',
      materialLow: 0,
      materialHigh: 0,
      installLow: 0,
      installHigh: 0,
      totalLow: 0,
      totalHigh: 0,
      depotOptimizedMaterial: 0,
      depotOptimizedTotal: 0,
      depotSourcingNote: '',
    },
    fenestrations: fenestrationsEstimate,
    wall_works: wallWorksEstimate,
    ceiling: ceilingEstimate,
    fixtures: fixturesEstimate,
  };
}
