/**
 * Seed data for initial SQLite population
 * This data is bundled with the app for offline-first experience
 */

import seedData from './seed-data.json';

export interface SeedPoint {
  id: string;
  code: string;
  name: string;
  chinese_name: string;
  meridian: string;
  location: string;
  functions: string;
  indications: string;
  contraindications: string;
  image_path: string | null;
  coordinates: string | null;
  body_map_coords: string | null;
  favorite_count: number;
}

export interface SeedSymptom {
  id: string;
  name: string;
  synonyms: string | null;
  category: string;
  use_count: number;
}

export interface SeedSymptomPoint {
  symptom_id: string;
  point_id: string;
  efficacy_score: number;
}

export interface SeedData {
  version: number;
  generatedAt: string;
  points: SeedPoint[];
  symptoms: SeedSymptom[];
  symptomPoints: SeedSymptomPoint[];
}

export const getSeedData = (): SeedData => {
  return seedData as SeedData;
};

export const SEED_DATA_VERSION = (seedData as SeedData).version;
