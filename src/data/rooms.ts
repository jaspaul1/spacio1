import { RoomId, StructuralScope, RoomConfiguration, DesignConceptId } from '../types';
import condoTwoStoreyImg from '../assets/images/condo_two_storey_1791200126205.jpg';
import condoOpenLoftImg from '../assets/images/condo_open_loft_1791200142345.jpg';
import condoKitchenImg from '../assets/images/condo_kitchen_1791200158360.jpg';
import condoBedroomImg from '../assets/images/condo_bedroom_1791200173860.jpg';
import condoBathroomImg from '../assets/images/condo_bathroom_1791200191163.jpg';
import condoWarmLivingImg from '../assets/images/condo_render_warm_1791021866134.jpg';
import condoModernLivingImg from '../assets/images/condo_render_modern_1791021879216.jpg';

export interface ScopeOptionInfo {
  id: StructuralScope;
  title: string;
  tagline: string;
  badge: string;
  description: string;
  defaultRooms: RoomId[];
  renderFallback: string;
  structuralNotes: string;
}

export const STRUCTURAL_SCOPES: Record<StructuralScope, ScopeOptionInfo> = {
  entire_space: {
    id: 'entire_space',
    title: 'Entire Condo Space',
    tagline: 'Full transformation across all living & sleeping zones',
    badge: 'Complete Renovation',
    description: 'Comprehensive whole-unit architectural overhaul including flooring, lighting, wall finishes, and integrated custom carpentry throughout.',
    defaultRooms: ['living', 'kitchen', 'bedroom_1', 'bathroom'],
    renderFallback: condoWarmLivingImg,
    structuralNotes: 'Full unit renovation maintaining existing perimeter slabs while revitalizing interior spaces seamlessly.',
  },
  loft_to_two_storey: {
    id: 'loft_to_two_storey',
    title: 'Changing from Loft to Two-Storey',
    tagline: 'Enclosing open loft into full second floor with private bedrooms',
    badge: 'Structural Addition',
    description: 'Structural mezzanine expansion: Installing a full steel I-beam subfloor slab, acoustic soundproofing, enclosed second-floor bedrooms, and architectural staircase.',
    defaultRooms: ['living', 'kitchen', 'bedroom_1', 'bedroom_2', 'bathroom'],
    renderFallback: condoTwoStoreyImg,
    structuralNotes: 'Adds dedicated second-floor usable floor area (~15-25m²) with reinforced mezzanine decking and fire-rated drywall partitions.',
  },
  two_storey_to_loft: {
    id: 'two_storey_to_loft',
    title: 'Changing Two-Storey to Open Loft / Studio',
    tagline: 'Opening up second floor for dramatic double-height ceiling',
    badge: 'Architectural Deconstruction',
    description: 'Demolishing non-loadbearing upper partitions, creating a soaring double-height great room ceiling, panoramic window volume, and floating cantilevered mezzanine.',
    defaultRooms: ['living', 'kitchen', 'bedroom_2', 'bathroom'],
    renderFallback: condoOpenLoftImg,
    structuralNotes: 'Maximizes vertical airy volume, natural daylight bounce, and creates luxury New York / Tokyo style high-ceiling loft aesthetics.',
  },
  custom_rooms_only: {
    id: 'custom_rooms_only',
    title: 'Targeted Room-by-Room Renovation',
    tagline: 'Renovate specific designated rooms without structural changes',
    badge: 'Modular Renovation',
    description: 'Choose exactly which rooms to tackle (e.g. just kitchen and master bathroom) to fit budget and phased timelines.',
    defaultRooms: ['living', 'kitchen'],
    renderFallback: condoWarmLivingImg,
    structuralNotes: 'Fast-track modular renovation targeting high-impact rooms without altering unit structural typology.',
  },
};

export interface RoomMeta {
  id: RoomId;
  name: string;
  tagline: string;
  defaultAreaRatio: number; // percentage of total area if computed
  defaultMinArea: number;
  icon: string;
  suggestedMaterials: string[];
  keyFeatures: string[];
  sampleRender: string;
  designCritiqueTemplate: string;
}

export const ROOM_METADATA: Record<RoomId, RoomMeta> = {
  overall: {
    id: 'overall',
    name: 'Overall Space & Structure',
    tagline: 'Primary structural transformation & holistic space layout',
    defaultAreaRatio: 1.0,
    defaultMinArea: 30,
    icon: 'Building2',
    suggestedMaterials: ['Oak Vinyl Planks', 'Fluted Timber Slats', '3000K Indirect Cove LED', 'Tempered Glass Railings'],
    keyFeatures: ['Holistic Spatial Flow', 'Double-Height Architectural Volume', 'Integrated Joinery', 'Global Lighting Grid'],
    sampleRender: condoWarmLivingImg,
    designCritiqueTemplate: 'The overall spatial transformation maximizes circulation between ground and upper tiers, harmonizing natural daylight from high-rise windows with tactile wood finishes.',
  },
  living: {
    id: 'living',
    name: 'Living & Dining Great Room',
    tagline: 'Main social zone, seating, entertainment & balcony view',
    defaultAreaRatio: 0.35,
    defaultMinArea: 12,
    icon: 'Sofa',
    suggestedMaterials: ['Luxury Oak Vinyl', 'Acoustic Charcoal Paneling', 'Wave-Fold Sheer Drapes', 'Under-Seat Storage Sofa'],
    keyFeatures: ['120L Under-Seat Storage Sofa', 'Acoustic Slat TV Backdrop', '3000K Cove Drop', 'Balcony Daylight Flow'],
    sampleRender: condoWarmLivingImg,
    designCritiqueTemplate: 'Keep sightlines open towards the sliding glass doors using low-profile linen furniture, and use longitudinal floor planks to optically widen the room.',
  },
  kitchen: {
    id: 'kitchen',
    name: 'Kitchen & Dining Bar Nook',
    tagline: 'Quartz counters, induction nook, custom joinery & breakfast bar',
    defaultAreaRatio: 0.20,
    defaultMinArea: 6,
    icon: 'Utensils',
    suggestedMaterials: ['Calacatta Quartz Counter', 'Handleless Melamine Cabinets', 'Fluted Island Timber', 'Subway Tile Splashback'],
    keyFeatures: ['Waterfall Quartz Island', 'Ducted Slim Range Hood', 'Warm Under-Cabinet Strip', 'Concealed Pull-Out Pantry'],
    sampleRender: condoKitchenImg,
    designCritiqueTemplate: 'A peninsula breakfast counter serves double-duty as dining and food prep in compact condo footprints. Durable quartz resists stains from Philippine spices and oils.',
  },
  bedroom_1: {
    id: 'bedroom_1',
    name: 'Bedroom 1 (Master Suite)',
    tagline: 'Platform bed with storage, fluted headboard & wardrobes',
    defaultAreaRatio: 0.25,
    defaultMinArea: 10,
    icon: 'Bed',
    suggestedMaterials: ['Gas-Lift Storage Platform Bed', 'Smoked Glass Wardrobe', 'Fluted Oak Slat Headboard', 'Blackout Drapes'],
    keyFeatures: ['Concealed Under-Bed Storage', 'Bedside Reading Sconces', 'Floor-to-Ceiling Wardrobes', 'Soft Acoustic Insulation'],
    sampleRender: condoBedroomImg,
    designCritiqueTemplate: 'A platform bed with hydraulic lift storage unlocks up to 500 liters of storage space for luggage and linens, eliminating bedroom clutter.',
  },
  bedroom_2: {
    id: 'bedroom_2',
    name: 'Bedroom 2 / Upper Mezzanine',
    tagline: 'Second bedroom or upper loft sleeping sanctuary',
    defaultAreaRatio: 0.20,
    defaultMinArea: 8,
    icon: 'Layers',
    suggestedMaterials: ['Soundproof Subfloor', 'Tempered Glass Balustrade', 'Built-in Compact Desk', 'Slim Sliding Pocket Doors'],
    keyFeatures: ['Overlook Balustrade', 'Acoustic Partition Wall', 'Modular Wardrobe Nook', 'Independent HVAC Ducting'],
    sampleRender: condoTwoStoreyImg,
    designCritiqueTemplate: 'When enclosing the upper mezzanine tier into Bedroom 2, ensure acoustic subflooring dampens footfall noise while maintaining ventilation airflow.',
  },
  bathroom: {
    id: 'bathroom',
    name: 'Bathroom & Powder Room',
    tagline: 'Frameless glass shower, floating vanity & matte stone tiles',
    defaultAreaRatio: 0.12,
    defaultMinArea: 4,
    icon: 'Bath',
    suggestedMaterials: ['60x60cm Non-Slip Porcelain', 'Fluted Floating Vanity', 'Circular Backlit LED Mirror', '10mm Frameless Glass'],
    keyFeatures: ['Matte Black Rainshower', 'Wall-Hung Water Closet', 'Recessed Shampoo Niche', 'Anti-Fog Backlit Mirror'],
    sampleRender: condoBathroomImg,
    designCritiqueTemplate: 'Large-format porcelain tiles reduce grout lines in compact Philippine condo bathrooms, creating a spa-like continuity that is effortless to clean.',
  },
  balcony: {
    id: 'balcony',
    name: 'Balcony & Utility Area',
    tagline: 'Composite decking, vertical greenery & laundry nook',
    defaultAreaRatio: 0.08,
    defaultMinArea: 3,
    icon: 'Sun',
    suggestedMaterials: ['Composite WPC Decking Tiles', 'UV-Resistant Vertical Garden', 'Louvered Washer Enclosure'],
    keyFeatures: ['Interlocking Deck Tiles', 'Vertical Herb Planters', 'Concealed Washing Machine Cabinet', 'Atmospheric Outdoor Lanterns'],
    sampleRender: condoOpenLoftImg,
    designCritiqueTemplate: 'Interlocking weatherproof composite wood tiles transform harsh concrete condo balconies into breezy morning coffee extensions.',
  },
};

/**
 * Returns default rooms recommended for each structural scope
 */
export function getDefaultRoomsForScope(scope: StructuralScope): RoomId[] {
  return STRUCTURAL_SCOPES[scope]?.defaultRooms || ['living', 'kitchen', 'bedroom_1', 'bathroom'];
}

/**
 * Creates default room configurations for state initialization
 */
export function createDefaultRoomConfigurations(
  scope: StructuralScope,
  totalAreaM2: number = 30
): Record<RoomId, RoomConfiguration> {
  const defaultRooms = getDefaultRoomsForScope(scope);
  const allRoomIds: RoomId[] = ['overall', 'living', 'kitchen', 'bedroom_1', 'bedroom_2', 'bathroom', 'balcony'];
  
  const configs: Partial<Record<RoomId, RoomConfiguration>> = {};

  allRoomIds.forEach((roomId) => {
    const meta = ROOM_METADATA[roomId];
    const isSelected = roomId === 'overall' || defaultRooms.includes(roomId);
    
    // Estimate area proportionally based on total unit area
    let estimatedArea = Math.round(totalAreaM2 * meta.defaultAreaRatio);
    if (estimatedArea < meta.defaultMinArea) {
      estimatedArea = meta.defaultMinArea;
    }
    if (roomId === 'overall') {
      estimatedArea = totalAreaM2;
    }

    configs[roomId] = {
      id: roomId,
      name: meta.name,
      selected: isSelected,
      areaM2: estimatedArea,
      selectedFeatures: [...meta.keyFeatures],
      renderUrl: meta.sampleRender,
      critique: meta.designCritiqueTemplate,
    };
  });

  return configs as Record<RoomId, RoomConfiguration>;
}

/**
 * Approximate renovation cost calculation per room based on Philippine hardware depot rates
 */
export function getRoomCostEstimate(
  roomId: RoomId,
  areaM2: number,
  concept: DesignConceptId
): { low: number; high: number; depotEstimate: number } {
  // Rates per sqm in PHP (Materials + Labor in Metro Manila)
  const rateMultiplier = concept === 'modern_neutral' ? 1.08 : 1.0;
  
  const baseRatesPerM2: Record<RoomId, { low: number; high: number; depot: number }> = {
    overall: { low: 22000, high: 38000, depot: 19500 },
    living: { low: 1800, high: 2900, depot: 1650 },
    kitchen: { low: 4500, high: 7800, depot: 4100 },
    bedroom_1: { low: 2200, high: 3600, depot: 1950 },
    bedroom_2: { low: 2400, high: 4000, depot: 2100 },
    bathroom: { low: 5200, high: 9500, depot: 4700 },
    balcony: { low: 1400, high: 2400, depot: 1200 },
  };

  const rate = baseRatesPerM2[roomId] || { low: 2000, high: 3500, depot: 1800 };
  
  if (roomId === 'overall') {
    // Overall structural transformation total range
    return {
      low: Math.round(areaM2 * 850 * rateMultiplier),
      high: Math.round(areaM2 * 1450 * rateMultiplier),
      depotEstimate: Math.round(areaM2 * 760 * rateMultiplier),
    };
  }

  return {
    low: Math.round(areaM2 * rate.low * rateMultiplier),
    high: Math.round(areaM2 * rate.high * rateMultiplier),
    depotEstimate: Math.round(areaM2 * rate.depot * rateMultiplier),
  };
}
