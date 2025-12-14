export const MERIDIAN_ALIASES: Record<string, string[]> = {
  LU: ["LU"],
  LI: ["LI"],
  ST: ["ST", "ST2"],
  ST2: ["ST", "ST2"],
  SP: ["SP"],
  HT: ["HT", "HE"],
  SI: ["SI"],
  BL: ["BL"],
  KI: ["KI"],
  P: ["P", "PC"],
  TW: ["TW", "TE", "TA"],
  GB: ["GB"],
  LV: ["LV", "LR"],
  LR: ["LV", "LR"],
  GV: ["GV"],
  CV: ["CV"],
};

export const normalizeMeridianId = (id?: string | null): string => {
  if (!id) return "";
  return String(id).toUpperCase();
};

export const getAliasesFor = (meridianId: string): string[] => {
  const normalized = normalizeMeridianId(meridianId);
  return MERIDIAN_ALIASES[normalized] ?? [normalized];
};

export const pointMatchesMeridian = (
  point: any,
  selectedMeridianId: string
): boolean => {
  const aliases = getAliasesFor(selectedMeridianId).map((a) => a.toUpperCase());

  // Check meridian field exact match
  if (point?.meridian && typeof point.meridian === "string") {
    const m = normalizeMeridianId(point.meridian);
    if (aliases.includes(m)) return true;
  }

  // Check code prefix
  if (point?.code && typeof point.code === "string") {
    const code = String(point.code).toUpperCase();
    if (aliases.some((a) => code.startsWith(a))) return true;
  }

  return false;
};
