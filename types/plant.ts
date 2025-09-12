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
  ratings?: PlantRatings; // Добавляем рейтинги
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
  germinationSpeed: number; // скорость пророста (1-5)
  maintenance: number;      // прихотливость (1-5, где 5 - очень прихотливое)
  aroma: number;           // аромат (1-5)
  flowerCount: number;     // количество соцветий (1-5)
  flowerVolume: number;    // объём соцветий (1-5)
  vegSpeed: number;        // скорость веги (1-5)
  bloomSpeed: number;      // скорость цветения (1-5)
  totalYield: number;      // общий урожай (1-5)
  overallRating: number;   // общий рейтинг (вычисляется, 1-5)
}