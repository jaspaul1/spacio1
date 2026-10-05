import { LocationOption, FlooringId } from '../types';

export interface HardwareDepot {
  id: string;
  name: string;
  chain: 'Wilcon Depot' | 'CW Home Depot' | 'AllHome' | 'CitiHardware' | 'Local Hardware';
  address: string;
  distanceKm: number;
  city: LocationOption;
  vinylRatePerM2: number; // ₱ / m²
  tileRatePerM2: number;  // ₱ / m²
  haulageFee: number;     // ₱ delivery / haulage
  isNearest: boolean;
  stockStatus: string;
  savingReason: string;
}

export const HARDWARE_DEPOTS: Record<LocationOption, HardwareDepot[]> = {
  Manila: [
    {
      id: 'mnl_cw',
      name: 'CW Home Depot Manila Bay',
      chain: 'CW Home Depot',
      address: 'Macapagal Blvd., Pasay / Manila Border',
      distanceKm: 1.4,
      city: 'Manila',
      vinylRatePerM2: 800,
      tileRatePerM2: 1200,
      haulageFee: 350,
      isNearest: true,
      stockStatus: 'In Stock · Ready for Immediate Condo Dispatch',
      savingReason: 'Closest major depot to Manila condos. Lowest logistics distance minimizes haulage surcharges to base ₱800/m².',
    },
    {
      id: 'mnl_wilcon',
      name: 'Wilcon Depot Quirino / Paco',
      chain: 'Wilcon Depot',
      address: 'President Quirino Ave., Paco, Manila',
      distanceKm: 2.1,
      city: 'Manila',
      vinylRatePerM2: 850,
      tileRatePerM2: 1280,
      haulageFee: 500,
      isNearest: false,
      stockStatus: 'In Stock · 2-3 Day Lead Time',
      savingReason: 'Higher transport distance adds ~₱50/m² to materials.',
    },
    {
      id: 'mnl_handyman',
      name: 'Handyman Robinsons Place Manila',
      chain: 'Local Hardware',
      address: 'Pedro Gil cor. M. Adriatico, Ermita, Manila',
      distanceKm: 1.2,
      city: 'Manila',
      vinylRatePerM2: 980,
      tileRatePerM2: 1450,
      haulageFee: 400,
      isNearest: false,
      stockStatus: 'Retail Stock · Limited Bulk Discount',
      savingReason: 'Retail mall branch pricing with higher markup than bulk wholesale depot.',
    },
  ],
  Makati: [
    {
      id: 'mkt_wilcon',
      name: 'Wilcon Depot Chino Roces',
      chain: 'Wilcon Depot',
      address: 'Chino Roces Ave. (Pasong Tamo Ext.), Makati',
      distanceKm: 1.1,
      city: 'Makati',
      vinylRatePerM2: 800,
      tileRatePerM2: 1200,
      haulageFee: 300,
      isNearest: true,
      stockStatus: 'In Stock · Contractor Tier Direct',
      savingReason: 'Nearest home depot in Makati. Contractor direct tier locks in minimum ₱800/m² vinyl & ₱1,200/m² tile rates.',
    },
    {
      id: 'mkt_cw',
      name: 'CW Home Depot Pasong Tamo',
      chain: 'CW Home Depot',
      address: 'Don Chino Roces Ave., Makati',
      distanceKm: 1.8,
      city: 'Makati',
      vinylRatePerM2: 840,
      tileRatePerM2: 1260,
      haulageFee: 450,
      isNearest: false,
      stockStatus: 'In Stock · Standard Dispatch',
      savingReason: 'Slightly farther transit across Makati CBD traffic.',
    },
    {
      id: 'mkt_allhome',
      name: 'AllHome BGC/Makati Border',
      chain: 'AllHome',
      address: 'Kalayaan Ave. Corridor, Makati',
      distanceKm: 2.7,
      city: 'Makati',
      vinylRatePerM2: 890,
      tileRatePerM2: 1340,
      haulageFee: 550,
      isNearest: false,
      stockStatus: 'In Stock',
      savingReason: 'Additional cross-district delivery fee applied.',
    },
  ],
  'BGC / Taguig': [
    {
      id: 'bgc_cw',
      name: 'CW Home Depot BGC / Market! Market!',
      chain: 'CW Home Depot',
      address: '32nd St. cor. University Pkwy, Taguig',
      distanceKm: 1.2,
      city: 'BGC / Taguig',
      vinylRatePerM2: 800,
      tileRatePerM2: 1200,
      haulageFee: 300,
      isNearest: true,
      stockStatus: 'In Stock · Same-Day BGC Condo Drop',
      savingReason: 'Located directly on BGC perimeter; avoids city boundary delivery surcharges, giving minimum supply costs.',
    },
    {
      id: 'bgc_allhome',
      name: 'AllHome Taguig',
      chain: 'AllHome',
      address: 'Levi Mariano Ave., Taguig',
      distanceKm: 2.8,
      city: 'BGC / Taguig',
      vinylRatePerM2: 880,
      tileRatePerM2: 1320,
      haulageFee: 500,
      isNearest: false,
      stockStatus: 'In Stock · Next-Day Dispatch',
      savingReason: 'Located outside BGC core; requires C-5 transport.',
    },
  ],
  'Quezon City': [
    {
      id: 'qc_wilcon',
      name: 'Wilcon Depot Balintawak',
      chain: 'Wilcon Depot',
      address: 'EDSA cor. Balintawak, Quezon City',
      distanceKm: 1.3,
      city: 'Quezon City',
      vinylRatePerM2: 800,
      tileRatePerM2: 1200,
      haulageFee: 350,
      isNearest: true,
      stockStatus: 'In Stock · Central Distribution Hub',
      savingReason: 'QC central depot hub; direct warehouse supply unlocks minimum ₱800/m² base pricing.',
    },
    {
      id: 'qc_cw',
      name: 'CW Home Depot Commonwealth',
      chain: 'CW Home Depot',
      address: 'Commonwealth Ave., Quezon City',
      distanceKm: 3.5,
      city: 'Quezon City',
      vinylRatePerM2: 850,
      tileRatePerM2: 1290,
      haulageFee: 550,
      isNearest: false,
      stockStatus: 'In Stock',
      savingReason: 'Farther north location increases condo haulage fee.',
    },
  ],
  Pasig: [
    {
      id: 'psg_cw',
      name: 'CW Home Depot Ortigas',
      chain: 'CW Home Depot',
      address: 'Doña Julia Vargas Ave., Ortigas Center, Pasig',
      distanceKm: 1.2,
      city: 'Pasig',
      vinylRatePerM2: 800,
      tileRatePerM2: 1200,
      haulageFee: 300,
      isNearest: true,
      stockStatus: 'In Stock · Immediate Ortigas Condo Delivery',
      savingReason: 'Closest to Ortigas/Pasig condos; minimum material pricing with fast elevator staging.',
    },
    {
      id: 'psg_wilcon',
      name: 'Wilcon Depot C-5 Pasig',
      chain: 'Wilcon Depot',
      address: 'E. Rodriguez Jr. Ave., Pasig',
      distanceKm: 2.4,
      city: 'Pasig',
      vinylRatePerM2: 850,
      tileRatePerM2: 1270,
      haulageFee: 480,
      isNearest: false,
      stockStatus: 'In Stock',
      savingReason: 'C-5 transit distance adds minor delivery cost.',
    },
  ],
  Mandaluyong: [
    {
      id: 'mnd_wilcon',
      name: 'Wilcon Depot Pioneer',
      chain: 'Wilcon Depot',
      address: 'Pioneer St., Mandaluyong City',
      distanceKm: 0.9,
      city: 'Mandaluyong',
      vinylRatePerM2: 800,
      tileRatePerM2: 1200,
      haulageFee: 250,
      isNearest: true,
      stockStatus: 'In Stock · Local Pioneer Hub',
      savingReason: 'Under 1km to major Shaw/Pioneer condo towers. Lowest logistics overhead saves up to ₱2,000 overall.',
    },
    {
      id: 'mnd_cw',
      name: 'CW Home Depot EDSA Central',
      chain: 'CW Home Depot',
      address: 'EDSA cor. Shaw Blvd, Mandaluyong',
      distanceKm: 1.6,
      city: 'Mandaluyong',
      vinylRatePerM2: 840,
      tileRatePerM2: 1260,
      haulageFee: 400,
      isNearest: false,
      stockStatus: 'In Stock',
      savingReason: 'EDSA traffic staging increases transport handling.',
    },
  ],
  'Cebu City': [
    {
      id: 'ceb_citi',
      name: 'CitiHardware Mandaue / Cebu',
      chain: 'CitiHardware',
      address: 'A.C. Cortes Ave., Mandaue / Cebu Metro',
      distanceKm: 1.8,
      city: 'Cebu City',
      vinylRatePerM2: 800,
      tileRatePerM2: 1200,
      haulageFee: 400,
      isNearest: true,
      stockStatus: 'In Stock · Visayas Regional Direct',
      savingReason: 'Nearest regional home depot; locks in baseline ₱800/m² and avoids inter-island shipping costs.',
    },
    {
      id: 'ceb_wilcon',
      name: 'Wilcon Depot Talisay / Cebu South',
      chain: 'Wilcon Depot',
      address: 'South Road Properties (SRP), Cebu',
      distanceKm: 3.4,
      city: 'Cebu City',
      vinylRatePerM2: 860,
      tileRatePerM2: 1290,
      haulageFee: 600,
      isNearest: false,
      stockStatus: 'In Stock',
      savingReason: 'Farther transit across SRP increases delivery logistics.',
    },
  ],
  'Davao City': [
    {
      id: 'dvo_citi',
      name: 'CitiHardware Bajada',
      chain: 'CitiHardware',
      address: 'J.P. Laurel Ave., Bajada, Davao City',
      distanceKm: 1.2,
      city: 'Davao City',
      vinylRatePerM2: 800,
      tileRatePerM2: 1200,
      haulageFee: 350,
      isNearest: true,
      stockStatus: 'In Stock · Davao City Core Hub',
      savingReason: 'Located directly along the downtown condo corridor; achieves minimum supply rates without provincial markups.',
    },
    {
      id: 'dvo_wilcon',
      name: 'Wilcon Depot Matina',
      chain: 'Wilcon Depot',
      address: 'McArthur Highway, Matina, Davao City',
      distanceKm: 2.6,
      city: 'Davao City',
      vinylRatePerM2: 850,
      tileRatePerM2: 1280,
      haulageFee: 500,
      isNearest: false,
      stockStatus: 'In Stock',
      savingReason: 'Southbound highway distance slightly raises handling.',
    },
  ],
};

/**
 * Returns the nearest hardware depot for a given city.
 */
export function getNearestDepot(city: LocationOption): HardwareDepot {
  const list = HARDWARE_DEPOTS[city] || HARDWARE_DEPOTS.Manila;
  return list.find((d) => d.isNearest) || list[0];
}

/**
 * Calculates the vendor/supply cost at a specific depot.
 */
export function calculateDepotSupplyCost(
  areaInM2: number,
  flooringId: FlooringId,
  depot: HardwareDepot
) {
  const rate = flooringId === 'vinyl' ? depot.vinylRatePerM2 : depot.tileRatePerM2;
  const materialCost = Math.round(areaInM2 * rate);
  return {
    rate,
    materialCost,
    haulageFee: depot.haulageFee,
    totalWithHaulage: materialCost + depot.haulageFee,
  };
}
