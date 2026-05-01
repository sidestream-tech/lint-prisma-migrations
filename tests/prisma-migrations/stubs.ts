export const VALID_NAMES: string[] = [
  '20240522144135_pharetra_posuere',
  '20240423161200_cursus_augue',
  '20241106165300_interdum_suscipit_augue',
]

export const INVALID_NAMES_FORMAT: string[] = [
  '202405221441_missing_time',
  '2024042316_',
  '241106165300_missing_full_year',
  '20241306165300_invalid_month',
  '20240134165300_invalid_day',
]

export const CORRECT_MIGRATION = `-- https://github.com/sidestream-tech/lint-prisma-migrations/pull/1
BEGIN;

-- CreateEnum
CREATE TYPE "Enum" AS ENUM ('One', 'Two');

-- CreateTable
CREATE TABLE "MyTable" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "TaskError_pkey" PRIMARY KEY ("id")
);

COMMIT;
`

export const INCORRECT_MIGRATION_PR_LINK = `BEGIN;

-- CreateEnum
CREATE TYPE "Enum" AS ENUM ('One', 'Two');

-- CreateTable
CREATE TABLE "MyTable" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "TaskError_pkey" PRIMARY KEY ("id")
);

COMMIT;
`

export const INCORRECT_MIGRATION_TRANSACTION_BLOCK = `-- https://github.com/sidestream-tech/lint-prisma-migrations/pull/1
-- CreateEnum
CREATE TYPE "Enum" AS ENUM ('One', 'Two');

-- CreateTable
CREATE TABLE "MyTable" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "TaskError_pkey" PRIMARY KEY ("id")
);
`
