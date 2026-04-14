-- CreateEnum
CREATE TYPE "CEFRLevel" AS ENUM ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "Frequency" INTEGER NOT NULL,
    "Postgres" TEXT NOT NULL,
    "Definition" TEXT NOT NULL,
    "CEFR" "CEFRLevel" NOT NULL,
    "FrequencySource" TEXT NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);
