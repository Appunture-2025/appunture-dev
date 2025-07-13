import Fuse from "fuse.js";
import { LocalSymptom, LocalPoint } from "../types/database";
import { normalizeText } from "../utils/helpers";

interface NLPResult {
  item: any;
  score: number;
  matches?: readonly any[];
}

interface ChatbotResponse {
  response: string;
  suggestions: string[];
  points?: LocalPoint[];
}

class NLPService {
  private symptomsFuse: Fuse<LocalSymptom> | null = null;
  private pointsFuse: Fuse<LocalPoint> | null = null;

  // Initialize Fuse.js instances
  initializeSymptomsFuse(symptoms: LocalSymptom[]): void {
    const options = {
      keys: [
        { name: "name", weight: 0.7 },
        { name: "synonyms", weight: 0.3 },
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    };

    this.symptomsFuse = new Fuse(symptoms, options);
  }

  initializePointsFuse(points: LocalPoint[]): void {
    const options = {
      keys: [
        { name: "name", weight: 0.4 },
        { name: "chinese_name", weight: 0.3 },
        { name: "meridian", weight: 0.2 },
        { name: "indications", weight: 0.1 },
      ],
      threshold: 0.5,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
    };

    this.pointsFuse = new Fuse(points, options);
  }

  // Search symptoms with fuzzy matching
  searchSymptoms(query: string): NLPResult[] {
    if (!this.symptomsFuse) return [];

    const normalizedQuery = normalizeText(query);
    const results = this.symptomsFuse.search(normalizedQuery);

    return results.map((result) => ({
      item: result.item,
      score: result.score || 0,
      matches: result.matches,
    }));
  }

  // Search points with fuzzy matching
  searchPoints(query: string): NLPResult[] {
    if (!this.pointsFuse) return [];

    const normalizedQuery = normalizeText(query);
    const results = this.pointsFuse.search(normalizedQuery);

    return results.map((result) => ({
      item: result.item,
      score: result.score || 0,
      matches: result.matches,
    }));
  }

  // Process natural language query for chatbot
  processChatQuery(
    query: string,
    symptoms: LocalSymptom[],
    points: LocalPoint[]
  ): ChatbotResponse {
    const normalizedQuery = normalizeText(query);

    // Initialize if not already done
    if (!this.symptomsFuse) this.initializeSymptomsFuse(symptoms);
    if (!this.pointsFuse) this.initializePointsFuse(points);

    // Check if query is a greeting
    if (this.isGreeting(normalizedQuery)) {
      return {
        response:
          "Olá! Eu sou o assistente do Appunture. Posso ajudá-lo a encontrar pontos de acupuntura baseados em sintomas ou condições. O que você gostaria de saber?",
        suggestions: [
          "Pontos para dor de cabeça",
          "Acupuntura para ansiedade",
          "Pontos do meridiano do estômago",
          "Tratamento para insônia",
        ],
      };
    }

    // Check if query is asking for help
    if (this.isHelpQuery(normalizedQuery)) {
      return {
        response:
          'Eu posso ajudá-lo a encontrar pontos de acupuntura de várias formas:\n\n• Descreva um sintoma (ex: "dor de cabeça")\n• Mencione uma condição (ex: "ansiedade")\n• Pergunte sobre um meridiano (ex: "pontos do fígado")\n• Procure por um ponto específico (ex: "LI4")',
        suggestions: [
          "Pontos para dor nas costas",
          "Meridiano do coração",
          "Pontos para digestão",
          "Acupuntura para estresse",
        ],
      };
    }

    // Search for symptoms in the query
    const symptomResults = this.searchSymptoms(normalizedQuery);
    const pointResults = this.searchPoints(normalizedQuery);

    // If we found symptoms, suggest points
    if (symptomResults.length > 0) {
      const topSymptom = symptomResults[0].item;
      const relatedPoints = this.getPointsForSymptom(topSymptom, points);

      return {
        response: `Encontrei informações sobre "${topSymptom.name}". Aqui estão alguns pontos de acupuntura que podem ajudar:`,
        suggestions: relatedPoints
          .slice(0, 3)
          .map((p) => `${p.name} (${p.meridian})`),
        points: relatedPoints.slice(0, 5),
      };
    }

    // If we found points directly
    if (pointResults.length > 0) {
      const topPoint = pointResults[0].item;

      return {
        response: `Encontrei informações sobre o ponto "${topPoint.name}" (${
          topPoint.chinese_name || topPoint.meridian
        }).\n\nLocalização: ${topPoint.location}\n\nIndicações: ${
          topPoint.indications || "Não especificadas"
        }`,
        suggestions: [
          "Pontos similares",
          "Outros pontos do meridiano",
          "Contraindicações",
          "Como localizar",
        ],
        points: [topPoint],
      };
    }

    // If no specific matches, provide general guidance
    return {
      response:
        "Não encontrei informações específicas sobre isso. Você poderia reformular sua pergunta? Por exemplo:",
      suggestions: [
        '"Pontos para dor de cabeça"',
        '"Meridiano do estômago"',
        '"Acupuntura para ansiedade"',
        '"Ponto LI4"',
      ],
    };
  }

  // Check if query is a greeting
  private isGreeting(query: string): boolean {
    const greetings = [
      "ola",
      "oi",
      "hello",
      "hi",
      "bom dia",
      "boa tarde",
      "boa noite",
      "como vai",
      "tudo bem",
      "e ai",
      "opa",
    ];

    return greetings.some((greeting) => query.includes(greeting));
  }

  // Check if query is asking for help
  private isHelpQuery(query: string): boolean {
    const helpKeywords = [
      "ajuda",
      "help",
      "como usar",
      "como funciona",
      "o que voce faz",
      "me ajude",
      "nao sei",
      "como",
      "explicar",
    ];

    return helpKeywords.some((keyword) => query.includes(keyword));
  }

  // Get points related to a symptom (simplified logic)
  private getPointsForSymptom(
    symptom: LocalSymptom,
    points: LocalPoint[]
  ): LocalPoint[] {
    const symptomName = normalizeText(symptom.name);

    return points.filter((point) => {
      const indications = normalizeText(point.indications || "");
      const functions = normalizeText(point.functions || "");

      return (
        indications.includes(symptomName) ||
        functions.includes(symptomName) ||
        this.isRelatedSymptom(symptomName, indications)
      );
    });
  }

  // Check if symptom is related to point indications
  private isRelatedSymptom(symptom: string, indications: string): boolean {
    const symptomMappings: { [key: string]: string[] } = {
      "dor de cabeca": ["cefaleia", "enxaqueca", "dor frontal", "dor temporal"],
      ansiedade: ["estresse", "nervosismo", "agitacao", "inquietacao"],
      insonia: ["sono", "dormir", "acordar", "descanso"],
      digestao: ["estomago", "intestino", "nausea", "vomito", "diarreia"],
      "dor nas costas": ["lombar", "dorsal", "coluna", "vertebral"],
      cansaco: ["fadiga", "energia", "vigor", "disposicao"],
    };

    for (const [key, related] of Object.entries(symptomMappings)) {
      if (symptom.includes(key)) {
        return related.some((term) => indications.includes(term));
      }
    }

    return false;
  }

  // Extract key medical terms from text
  extractMedicalTerms(text: string): string[] {
    const medicalTerms = [
      // Symptoms
      "dor",
      "cefaleia",
      "enxaqueca",
      "nausea",
      "vomito",
      "diarreia",
      "constipacao",
      "insonia",
      "ansiedade",
      "estresse",
      "depressao",
      "fadiga",
      "cansaco",
      "tontura",
      "vertigem",
      "zumbido",

      // Body parts
      "cabeca",
      "pescoco",
      "ombro",
      "braco",
      "mao",
      "dedo",
      "peito",
      "costas",
      "coluna",
      "lombar",
      "quadril",
      "perna",
      "joelho",
      "tornozelo",
      "pe",
      "estomago",
      "intestino",

      // Emotions
      "raiva",
      "medo",
      "preocupacao",
      "tristeza",
      "irritacao",
      "nervosismo",
      "agitacao",
      "inquietacao",
    ];

    const normalizedText = normalizeText(text);
    return medicalTerms.filter((term) => normalizedText.includes(term));
  }

  // Get search suggestions based on partial query
  getSearchSuggestions(
    query: string,
    symptoms: LocalSymptom[],
    points: LocalPoint[]
  ): string[] {
    if (query.length < 2) return [];

    const normalizedQuery = normalizeText(query);
    const suggestions: string[] = [];

    // Add symptom suggestions
    symptoms.forEach((symptom) => {
      if (normalizeText(symptom.name).includes(normalizedQuery)) {
        suggestions.push(symptom.name);
      }
    });

    // Add point suggestions
    points.forEach((point) => {
      if (
        normalizeText(point.name).includes(normalizedQuery) ||
        normalizeText(point.chinese_name || "").includes(normalizedQuery)
      ) {
        suggestions.push(point.name);
      }
    });

    // Add meridian suggestions
    const meridians = [...new Set(points.map((p) => p.meridian))];
    meridians.forEach((meridian) => {
      if (normalizeText(meridian).includes(normalizedQuery)) {
        suggestions.push(meridian);
      }
    });

    return suggestions.slice(0, 5);
  }
}

export const nlpService = new NLPService();
