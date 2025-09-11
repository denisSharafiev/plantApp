export type PlantStage = 'прорастание' | 'рассада' | 'вегетация' | 'цветение' | 'урожай готов!';
export type WateringSchedule = 'daily' | '2days' | '3days' | '4days' | '5days' | '6days' | '7days';

export interface Plant {
  id: string;
  name: string;
  species: string;
  seedBank?: string;
  price?: number;
  wateringSchedule: WateringSchedule;
  expectedDays: number;
  stage: PlantStage;
  plantingDate: string;
  germinationDate?: string;
  transplantDate?: string;
  vegetationDate?: string;
  floweringDate?: string;
  harvestDate?: string;
  notes?: string;
  photos: string[];
  avatarPhoto?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  ratings?: PlantRatings;
}

export interface PlantFormData {
  name: string;
  species: string;
  expectedDays: string;
  stage: PlantStage;
  plantingDate: string;
  notes?: string;
  photos: string[];
}

export interface PlantRatings {
  germinationSpeed: number; // скорость пророста
  maintenance: number;      // прихотливость
  aroma: number;           // аромат
  flowerCount: number;     // количество соцветий
  flowerVolume: number;    // объём соцветий
  vegSpeed: number;        // скорость веги
  bloomSpeed: number;      // скорость цветения
  totalYield: number;      // общий урожай
  overallRating: number;   // общий рейтинг (вычисляется)
}