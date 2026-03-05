-- CreateEnum
CREATE TYPE "ClubMainType" AS ENUM ('DIGITAL', 'PROJECT', 'SOCIAL');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "mainType" "ClubMainType" NOT NULL DEFAULT 'DIGITAL',
ADD COLUMN     "maxMembers" INTEGER,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "requiredSkills" TEXT;
