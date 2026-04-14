import { prisma } from "../config/prisma.js";

const MAX_WORDS = 10;
type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type WordRecord = {
  id: string;
  word: string;
  Frequency: number;
  pos: string;
  Definition: string;
  Example: string | null;
  CEFR: CEFRLevel;
  FrequencySource: string;
};

const CEFR_ORDER: CEFRLevel[] = [
  "A1",
  "A2",
  "B1",
  "B2",
  "C1",
  "C2",
];

function getInclusiveLevelRange(fromLevel: CEFRLevel, toLevel: CEFRLevel): CEFRLevel[] {
  const start = CEFR_ORDER.indexOf(fromLevel);
  const end = CEFR_ORDER.indexOf(toLevel);

  if (start === -1 || end === -1) {
    throw new Error("Invalid CEFR level.");
  }

  const [minIndex, maxIndex] = start <= end ? [start, end] : [end, start];
  return CEFR_ORDER.slice(minIndex, maxIndex + 1);
}

async function getRandomWordsByLevels(levels: CEFRLevel[]): Promise<WordRecord[]> {
  if (levels.length === 0) return [];

  const placeholders = levels.map((_, index) => `$${index + 1}`).join(", ");
  const query = `
    SELECT "id", "word", "Frequency", "pos", "Definition", "Example", "CEFR", "FrequencySource"
    FROM "Word"
    WHERE "CEFR" IN (${placeholders})
    ORDER BY RANDOM()
    LIMIT ${MAX_WORDS}
  `;

  return (await prisma.$queryRawUnsafe(query, ...levels)) as WordRecord[];
}

export const getWords = async (): Promise<WordRecord[]> => {
  return (await prisma.$queryRawUnsafe(`
    SELECT "id", "word", "Frequency", "pos", "Definition", "Example", "CEFR", "FrequencySource"
    FROM "Word"
    ORDER BY RANDOM()
    LIMIT ${MAX_WORDS}
  `)) as WordRecord[];
};

export const getWordsByLevel = async (level: CEFRLevel): Promise<WordRecord[]> => {
  return getRandomWordsByLevels([level]);
};

export const getWordsByLevelRange = async (
  fromLevel: CEFRLevel,
  toLevel: CEFRLevel
): Promise<WordRecord[]> => {
  const levels = getInclusiveLevelRange(fromLevel, toLevel);
  return getRandomWordsByLevels(levels);
};
