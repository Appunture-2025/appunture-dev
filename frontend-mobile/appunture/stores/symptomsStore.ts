import { create } from "zustand";
import { Symptom, SymptomWithPoints } from "../types/api";
import { apiService } from "../services/api";

interface SymptomsState {
  symptoms: Symptom[];
  categories: string[];
  tags: string[];
  popularSymptoms: Symptom[];
  currentSymptom: SymptomWithPoints | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchSymptoms: (category?: string) => Promise<void>;
  fetchSymptomById: (id: string) => Promise<void>;
  searchSymptoms: (query: string) => Promise<Symptom[]>;
  fetchCategories: () => Promise<void>;
  fetchPopularSymptoms: (limit?: number) => Promise<void>;
  fetchSymptomsByCategory: (category: string) => Promise<void>;
  fetchSymptomsByTag: (tag: string) => Promise<void>;
  incrementUse: (symptomId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useSymptomsStore = create<SymptomsState>((set, get) => ({
  // Initial state
  symptoms: [],
  categories: [],
  tags: [],
  popularSymptoms: [],
  currentSymptom: null,
  isLoading: false,
  error: null,

  // Actions
  fetchSymptoms: async (category?: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getSymptoms({ category });
      set({
        symptoms: response.symptoms,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch symptoms",
        isLoading: false,
      });
    }
  },

  fetchSymptomById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getSymptom(id);
      set({
        currentSymptom: response.symptom,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch symptom",
        isLoading: false,
      });
    }
  },

  searchSymptoms: async (query: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.searchSymptoms(query);
      set({
        symptoms: response.symptoms,
        isLoading: false,
      });
      return response.symptoms;
    } catch (error: any) {
      set({
        error: error.message || "Failed to search symptoms",
        isLoading: false,
      });
      return [];
    }
  },

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getSymptomCategories();
      const categories = response.categories.map((c) => c.category);
      set({
        categories,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch categories",
        isLoading: false,
      });
    }
  },

  fetchPopularSymptoms: async (limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getPopularSymptoms(limit);
      set({
        popularSymptoms: response.symptoms,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch popular symptoms",
        isLoading: false,
      });
    }
  },

  fetchSymptomsByCategory: async (category: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getSymptomsByCategory(category);
      set({
        symptoms: response.symptoms,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch symptoms by category",
        isLoading: false,
      });
    }
  },

  fetchSymptomsByTag: async (tag: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiService.getSymptomsByTag(tag);
      set({
        symptoms: response.symptoms,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch symptoms by tag",
        isLoading: false,
      });
    }
  },

  incrementUse: async (symptomId: string) => {
    try {
      await apiService.incrementSymptomUse(symptomId);
    } catch (error: any) {
      console.error("Failed to increment symptom use:", error);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  reset: () => {
    set({
      symptoms: [],
      categories: [],
      tags: [],
      popularSymptoms: [],
      currentSymptom: null,
      isLoading: false,
      error: null,
    });
  },
}));
