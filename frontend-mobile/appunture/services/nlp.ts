import { LocalPoint, LocalSymptom } from "../types/database";

interface NlpResponse {
  response: string;
  intent?: string;
  entities?: any[];
}

class NlpService {
  async processChatQuery(
    query: string,
    symptoms: LocalSymptom[],
    points: LocalPoint[]
  ): Promise<NlpResponse> {
    const normalizedQuery = query
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Basic greetings
    if (normalizedQuery.match(/\b(oi|ola|bom dia|boa tarde|boa noite)\b/)) {
      return {
        response:
          "Olá! Como posso ajudar você com acupuntura hoje? Você pode perguntar sobre sintomas (ex: 'dor de cabeça') ou pontos específicos (ex: 'IG4').",
        intent: "greeting",
      };
    }

    // Search for symptoms
    const foundSymptoms = symptoms.filter((s) => {
      const normalizedName = s.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (normalizedQuery.includes(normalizedName)) return true;

      if (s.synonyms) {
        try {
          const synonymsList = JSON.parse(s.synonyms);
          if (Array.isArray(synonymsList)) {
            return synonymsList.some((syn: string) => {
              const normalizedSyn = syn
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
              return normalizedQuery.includes(normalizedSyn);
            });
          }
        } catch (e) {
          // If not JSON, treat as simple string
          const normalizedSynonyms = s.synonyms
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
          return normalizedSynonyms.includes(normalizedQuery);
        }
      }
      return false;
    });

    if (foundSymptoms.length > 0) {
      const symptom = foundSymptoms[0];
      return {
        response: `Para **${symptom.name}**, existem pontos que podem ajudar. Você pode buscar por este sintoma na aba "Sintomas" para ver a lista completa de pontos recomendados.`,
        intent: "symptom_search",
        entities: foundSymptoms,
      };
    }

    // Search for points
    const foundPoints = points.filter((p) => {
      const normalizedName = p.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const normalizedCode = p.code
        ? p.code
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
        : "";

      return (
        normalizedQuery.includes(normalizedName) ||
        (normalizedCode && normalizedQuery.includes(normalizedCode))
      );
    });

    if (foundPoints.length > 0) {
      const point = foundPoints[0];
      return {
        response: `O ponto **${point.name}** (${
          point.meridian
        }) é indicado para: ${
          point.indications || "várias condições"
        }. \n\n**Localização:** ${point.location}`,
        intent: "point_search",
        entities: foundPoints,
      };
    }

    // Default fallback
    return {
      response:
        "Desculpe, não encontrei informações específicas sobre isso no meu banco de dados local. Tente perguntar sobre um sintoma específico ou um ponto de acupuntura (ex: 'dor de cabeça' ou 'IG4').",
      intent: "unknown",
    };
  }
}

export const nlpService = new NlpService();
