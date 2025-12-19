import type { Point } from "../types/api";

/**
 * Filters points in-memory based on search query.
 * Performs case-insensitive matching on searchable fields.
 *
 * @param points - Array of points to filter
 * @param query - Search query string
 * @returns Filtered array of points matching the query
 *
 * Requirements: 1.1, 1.2, 1.4
 */
export function filterPoints(points: Point[], query: string): Point[] {
  const trimmedQuery = query.trim();

  // Return all points when query is empty or whitespace-only
  if (!trimmedQuery) {
    return points;
  }

  const searchTerm = trimmedQuery.toLowerCase();

  return points.filter((point) => {
    // Searchable fields: name, code, chinese_name, meridian, location, indications
    const searchableFields = [
      point.name,
      point.code,
      point.chinese_name,
      point.chineseName,
      point.meridian,
      point.location,
      point.indications,
      point.indication,
    ];

    return searchableFields.some(
      (field) => field && field.toLowerCase().includes(searchTerm)
    );
  });
}
