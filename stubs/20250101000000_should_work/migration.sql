-- https://github.com/sidestream-tech/lint-prisma-migrations/pull/1

-- CreateEnum
CREATE TYPE "Enum" AS ENUM ('One', 'Two');

-- CreateTable
CREATE TABLE "MyTable" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "TaskError_pkey" PRIMARY KEY ("id")
);

COMMIT;
