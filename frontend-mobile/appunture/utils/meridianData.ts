// Meridian information with colors, descriptions, and metadata
export interface MeridianInfo {
  id: string;
  name: string;
  abbreviation: string;
  chineseName: string;
  element: string;
  yinYang: "Yin" | "Yang";
  color: string;
  organ: string;
  path: string;
  functions: string[];
  hours: string;
}

export const MERIDIAN_DATA: Record<string, MeridianInfo> = {
  LU: {
    id: "LU",
    name: "Pulmão",
    abbreviation: "LU",
    chineseName: "手太陰肺經",
    element: "Metal",
    yinYang: "Yin",
    color: "#E8F5E9",
    organ: "Pulmão",
    path: "Do peito ao polegar, percorrendo a parte interna do braço",
    functions: [
      "Governa a respiração e a energia Qi",
      "Controla a pele e os pelos",
      "Regula os fluidos corporais",
    ],
    hours: "03:00 - 05:00",
  },
  LI: {
    id: "LI",
    name: "Intestino Grosso",
    abbreviation: "LI",
    chineseName: "手陽明大腸經",
    element: "Metal",
    yinYang: "Yang",
    color: "#FFF3E0",
    organ: "Intestino Grosso",
    path: "Do dedo indicador ao nariz, passando pelo braço e ombro",
    functions: [
      "Elimina resíduos e toxinas",
      "Controla a função intestinal",
      "Relacionado à imunidade",
    ],
    hours: "05:00 - 07:00",
  },
  ST: {
    id: "ST",
    name: "Estômago",
    abbreviation: "ST",
    chineseName: "足陽明胃經",
    element: "Earth",
    yinYang: "Yang",
    color: "#FFF9C4",
    organ: "Estômago",
    path: "Da face ao segundo dedo do pé, descendo pela frente do corpo",
    functions: [
      "Governa a digestão",
      "Transforma alimentos em energia",
      "Nutre o corpo inteiro",
    ],
    hours: "07:00 - 09:00",
  },
  SP: {
    id: "SP",
    name: "Baço-Pâncreas",
    abbreviation: "SP",
    chineseName: "足太陰脾經",
    element: "Earth",
    yinYang: "Yin",
    color: "#FFFDE7",
    organ: "Baço-Pâncreas",
    path: "Do dedão do pé ao peito, subindo pela parte interna da perna",
    functions: [
      "Transforma e transporta nutrientes",
      "Governa os músculos e membros",
      "Mantém o sangue nos vasos",
    ],
    hours: "09:00 - 11:00",
  },
  HT: {
    id: "HT",
    name: "Coração",
    abbreviation: "HT",
    chineseName: "手少陰心經",
    element: "Fire",
    yinYang: "Yin",
    color: "#FFEBEE",
    organ: "Coração",
    path: "Do coração ao dedo mínimo, descendo pela parte interna do braço",
    functions: [
      "Governa o sangue e os vasos",
      "Abriga a mente (Shen)",
      "Controla a consciência e emoções",
    ],
    hours: "11:00 - 13:00",
  },
  SI: {
    id: "SI",
    name: "Intestino Delgado",
    abbreviation: "SI",
    chineseName: "手太陽小腸經",
    element: "Fire",
    yinYang: "Yang",
    color: "#FCE4EC",
    organ: "Intestino Delgado",
    path: "Do dedo mínimo à orelha, subindo pela parte externa do braço",
    functions: [
      "Separa o puro do impuro",
      "Absorve nutrientes",
      "Auxilia na digestão",
    ],
    hours: "13:00 - 15:00",
  },
  BL: {
    id: "BL",
    name: "Bexiga",
    abbreviation: "BL",
    chineseName: "足太陽膀胱經",
    element: "Water",
    yinYang: "Yang",
    color: "#E3F2FD",
    organ: "Bexiga",
    path: "Da cabeça ao dedinho do pé, descendo pelas costas e perna posterior",
    functions: [
      "Armazena e elimina urina",
      "Transforma líquidos",
      "Meridiano mais longo com 67 pontos",
    ],
    hours: "15:00 - 17:00",
  },
  KI: {
    id: "KI",
    name: "Rim",
    abbreviation: "KI",
    chineseName: "足少陰腎經",
    element: "Water",
    yinYang: "Yin",
    color: "#E1F5FE",
    organ: "Rim",
    path: "Do pé ao peito, subindo pela parte interna da perna",
    functions: [
      "Armazena a essência (Jing)",
      "Governa o crescimento e desenvolvimento",
      "Controla água e ossos",
    ],
    hours: "17:00 - 19:00",
  },
  PC: {
    id: "PC",
    name: "Pericárdio",
    abbreviation: "PC",
    chineseName: "手厥陰心包經",
    element: "Fire",
    yinYang: "Yin",
    color: "#F3E5F5",
    organ: "Pericárdio",
    path: "Do peito ao dedo médio, descendo pela parte interna do braço",
    functions: [
      "Protege o coração",
      "Regula a circulação",
      "Influencia as emoções",
    ],
    hours: "19:00 - 21:00",
  },
  TE: {
    id: "TE",
    name: "Triplo Aquecedor",
    abbreviation: "TE",
    chineseName: "手少陽三焦經",
    element: "Fire",
    yinYang: "Yang",
    color: "#EDE7F6",
    organ: "Triplo Aquecedor",
    path: "Do dedo anelar à têmpora, subindo pela parte externa do braço",
    functions: [
      "Regula temperatura corporal",
      "Coordena o metabolismo",
      "Circula energia entre órgãos",
    ],
    hours: "21:00 - 23:00",
  },
  GB: {
    id: "GB",
    name: "Vesícula Biliar",
    abbreviation: "GB",
    chineseName: "足少陽膽經",
    element: "Wood",
    yinYang: "Yang",
    color: "#E8F5E9",
    organ: "Vesícula Biliar",
    path: "Da têmpora ao quarto dedo do pé, descendo pelo lado do corpo",
    functions: [
      "Armazena e secreta bile",
      "Controla decisões e julgamentos",
      "Relacionado à coragem",
    ],
    hours: "23:00 - 01:00",
  },
  LR: {
    id: "LR",
    name: "Fígado",
    abbreviation: "LR",
    chineseName: "足厥陰肝經",
    element: "Wood",
    yinYang: "Yin",
    color: "#F1F8E9",
    organ: "Fígado",
    path: "Do dedão do pé ao peito, subindo pela parte interna da perna",
    functions: [
      "Armazena sangue",
      "Assegura o fluxo suave de Qi",
      "Controla tendões e ligamentos",
    ],
    hours: "01:00 - 03:00",
  },
  GV: {
    id: "GV",
    name: "Vaso Governador",
    abbreviation: "GV",
    chineseName: "督脈",
    element: "Yang",
    yinYang: "Yang",
    color: "#FFF8E1",
    organ: "Coluna e Sistema Nervoso",
    path: "Do cóccix ao lábio superior, percorrendo a linha média posterior",
    functions: [
      "Governa todos os meridianos Yang",
      "Fortalece a coluna",
      "Regula o sistema nervoso",
    ],
    hours: "Todas",
  },
  CV: {
    id: "CV",
    name: "Vaso Concepção",
    abbreviation: "CV",
    chineseName: "任脈",
    element: "Yin",
    yinYang: "Yin",
    color: "#FCE4EC",
    organ: "Abdômen e Órgãos Yin",
    path: "Do períneo à boca, percorrendo a linha média anterior",
    functions: [
      "Governa todos os meridianos Yin",
      "Regula sangue e Yin",
      "Relacionado à reprodução",
    ],
    hours: "Todas",
  },
};

// Helper function to get meridian info by name or abbreviation
export function getMeridianInfo(
  nameOrAbbr: string
): MeridianInfo | undefined {
  // Try exact match first
  if (MERIDIAN_DATA[nameOrAbbr]) {
    return MERIDIAN_DATA[nameOrAbbr];
  }

  // Try to find by full name (case insensitive)
  const normalized = nameOrAbbr.toLowerCase().trim();
  return Object.values(MERIDIAN_DATA).find(
    (m) =>
      m.name.toLowerCase() === normalized ||
      m.abbreviation.toLowerCase() === normalized
  );
}

// Helper to get color by meridian
export function getMeridianColor(nameOrAbbr: string): string {
  const info = getMeridianInfo(nameOrAbbr);
  return info?.color || "#E0E0E0";
}

// Helper to get all meridian IDs
export function getAllMeridianIds(): string[] {
  return Object.keys(MERIDIAN_DATA);
}
