import { FlooringId, FlooringEstimate, BudgetStatus, AreaUnit } from '../types';

export interface FlooringRateDetails {
  id: FlooringId;
  name: string;
  lowMaterialRate: number; // ₱ / m²
  highMaterialRate: number; // ₱ / m²
  lowInstallRate: number; // ₱ / m²
  highInstallRate: number; // ₱ / m²
  description: string;
  badge: string;
}

export const FLOORING_RATES: Record<FlooringId, FlooringRateDetails> = {
  vinyl: {
    id: 'vinyl',
    name: 'Vinyl',
    lowMaterialRate: 800,
    highMaterialRate: 1200,
    lowInstallRate: 300,
    highInstallRate: 500,
    description: 'Luxury vinyl plank (LVP) / SPC click flooring. Water-resistant, quick installation.',
    badge: 'Cost-Effective & Resilient',
  },
  tile: {
    id: 'tile',
    name: 'Tile',
    lowMaterialRate: 1200,
    highMaterialRate: 1800,
    lowInstallRate: 300,
    highInstallRate: 500,
    description: 'Glazed porcelain / ceramic tiles. Durable, cool underfoot, requires mortar & grouting.',
    badge: 'Durable & High-End Look',
  },
};

export const SQFT_TO_M2_FACTOR = 0.09290304;
export const M2_TO_SQFT_FACTOR = 10.76391041671;

/**
 * Converts area between m² and sq ft.
 * Ensures 430.556 sq ft converts to approximately 40.00 m².
 */
export function convertArea(val: number, from: AreaUnit, to: AreaUnit): number {
  if (from === to) return val;
  if (from === 'sqft' && to === 'm2') {
    const converted = val * SQFT_TO_M2_FACTOR;
    return Number(converted.toFixed(2));
  } else {
    const converted = val * M2_TO_SQFT_FACTOR;
    return Number(converted.toFixed(2));
  }
}

/**
 * Format currency with standard Philippine Peso symbol
 */
export function formatPhp(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}

export function formatPhpRange(low: number, high: number): string {
  return `${formatPhp(low)}–${formatPhp(high)}`;
}

/**
 * Calculates flooring estimate based on room area in m² and flooring type.
 * Handles edge case where price data is missing.
 */
export function calculateFlooringEstimate(
  areaInM2: number,
  flooringId: FlooringId,
  targetBudgetValue: number
): FlooringEstimate {
  const rate = FLOORING_RATES[flooringId];

  // Edge case: missing price data
  if (!rate || isNaN(rate.lowMaterialRate) || isNaN(rate.highMaterialRate)) {
    return {
      materialLow: 0,
      materialHigh: 0,
      installLow: 0,
      installHigh: 0,
      totalLow: 0,
      totalHigh: 0,
      status: 'unavailable',
      statusText: 'Estimate unavailable due to missing price data.',
    };
  }

  const materialLow = Math.round(areaInM2 * rate.lowMaterialRate);
  const materialHigh = Math.round(areaInM2 * rate.highMaterialRate);
  const installLow = Math.round(areaInM2 * rate.lowInstallRate);
  const installHigh = Math.round(areaInM2 * rate.highInstallRate);

  const totalLow = materialLow + installLow;
  const totalHigh = materialHigh + installHigh;

  let status: BudgetStatus = 'within';
  let statusText = 'Within budget under demo assumptions.';

  // Edge cases:
  // Zero budget shows positive-cost flooring over budget.
  if (targetBudgetValue <= 0 && totalLow > 0) {
    status = 'over';
    statusText = 'Over budget under demo assumptions.';
  } else if (targetBudgetValue >= totalHigh) {
    status = 'within';
    statusText = 'Within budget under demo assumptions.';
  } else if (targetBudgetValue >= totalLow && targetBudgetValue < totalHigh) {
    status = 'partly_over';
    statusText = 'Partly over budget under demo assumptions.';
  } else {
    status = 'over';
    statusText = 'Over budget under demo assumptions.';
  }

  return {
    materialLow,
    materialHigh,
    installLow,
    installHigh,
    totalLow,
    totalHigh,
    status,
    statusText,
  };
}
