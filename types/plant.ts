export type PlantStage = 'прорастание' | 'рассада' | 'вегетация' | 'цветение' | 'урожай готов!';

export interface Plant {
  id: string;
  name: string;
  species: string;
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