export type LocationOption = 
  | 'Manila'
  | 'Quezon City'
  | 'Makati'
  | 'BGC / Taguig'
  | 'Pasig'
  | 'Mandaluyong'
  | 'Cebu City'
  | 'Davao City';

export type AreaUnit = 'm2' | 'sqft';

export type DesignConceptId = 'warm_minimal' | 'modern_neutral';

export type FlooringId = 'vinyl' | 'tile';

export type UnitTypology = 
  | 'loft'
  | 'two_storey'
  | 'studio'
  | 'one_bedroom'
  | 'two_bedroom'
  | 'penthouse'
  | 'other';

export type InspirationMode = 'describe' | 'upload';

export type SpecFeatureId = 
  | 'natural_light'
  | 'space_saving'
  | 'warm_wood'
  | 'concealed_storage'
  | 'tropical_plants'
  | 'ambient_lighting'
  | 'low_profile'
  | 'matte_stone';

export interface DesiredSpecsState {
  mode: InspirationMode;
  specsDescription: string;
  selectedFeatures: SpecFeatureId[];
}

export type RenovationCategory = 
  | 'flooring' 
  | 'fenestrations' 
  | 'wall_works' 
  | 'ceiling' 
  | 'fixtures';

export type FenestrationOption = 'wave_curtains' | 'roller_blinds' | 'glass_partition';
export type WallWorksOption = 'skim_paint' | 'fluted_accent' | 'venetian_plaster';
export type CeilingOption = 'cove_drop' | 'flat_gypsum' | 'minimalist_exposed';

export interface FixturesSelection {
  lighting: boolean;
  electrical: boolean;
  plumbing: boolean;
}

export type StructuralScope = 
  | 'entire_space'
  | 'loft_to_two_storey'
  | 'two_storey_to_loft'
  | 'custom_rooms_only';

export type RoomId = 
  | 'overall'
  | 'living'
  | 'kitchen'
  | 'bedroom_1'
  | 'bedroom_2'
  | 'bathroom'
  | 'balcony';

export interface RoomConfiguration {
  id: RoomId;
  name: string;
  selected: boolean;
  areaM2: number;
  customNotes?: string;
  selectedFeatures?: string[];
  renderUrl?: string;
  critique?: string;
}

export interface FormDataState {
  unitTypology: UnitTypology;
  structuralScope: StructuralScope;
  unitDescription: string;
  location: LocationOption;
  totalUnitArea: string; // Keep as string for friendly typing, validated on change/submit
  areaUnit: AreaUnit;
  livingRoomArea: string; // Assumed example default '10'
  livingRoomUnit: AreaUnit;
  selectedConcept: DesignConceptId;
  targetBudget: string; // e.g. "20000"
  selectedFlooring: FlooringId;
  desiredSpecs: DesiredSpecsState;
  enabledCategories: RenovationCategory[];
  fenestrationChoice: FenestrationOption;
  wallWorksChoice: WallWorksOption;
  ceilingChoice: CeilingOption;
  fixturesChoice: FixturesSelection;
  selectedRooms: RoomId[];
  activeRoomId: RoomId;
  roomConfigurations: Record<RoomId, RoomConfiguration>;
}

export interface PhotoState {
  spacePhotoUrl: string | null;
  spacePhotoName: string | null;
  inspirationPhotoUrl: string | null;
  inspirationPhotoName: string | null;
}

export interface ValidationErrors {
  totalUnitArea?: string;
  livingRoomArea?: string;
  targetBudget?: string;
  imageUpload?: string;
  general?: string;
}

export type BudgetStatus = 'within' | 'partly_over' | 'over' | 'unavailable';

export interface FlooringEstimate {
  materialLow: number;
  materialHigh: number;
  installLow: number;
  installHigh: number;
  totalLow: number;
  totalHigh: number;
  status: BudgetStatus;
  statusText: string;
}
