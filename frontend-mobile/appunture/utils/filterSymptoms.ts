import type { Symptom } from "../types/api";

/**
 * Filters symptoms in-memory based on search query.
 * Performs case-insensitive matching on searchable fields.
 *
 * @param symptoms - Array of symptoms to filter
 * @param query - Search query string
 * @returns Filtered array of symptoms matching the query
 */
export function filterSymptoms(symptoms: Symptom[], query: string): Symptom[] {
  const trimmedQuery = query.trim();

  // Return all symptoms when query is empty or whitespace-only
  if (!trimmedQuery) {
    return symptoms;
  }

  const searchTerm = trimmedQuery.toLowerCase();

  return symptoms.filter((symptom) => {
    // Searchable fields: name, description, category, tags
    const searchableFields = [
      symptom.name,
      symptom.description,
      symptom.category,
      ...(symptom.tags || []),
    ];

    return searchableFields.some(
      (field) => field && field.toLowerCase().includes(searchTerm)
    );
  });
}
