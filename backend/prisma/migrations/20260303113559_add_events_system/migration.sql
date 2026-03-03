/*
  Warnings:

  - You are about to drop the column `isPinned` on the `Post` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BadgeType" AS ENUM ('USER', 'CLUB');

-- CreateEnum
CREATE TYPE "ClubStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SpotCategory" AS ENUM ('AL_SAT', 'EV_ARKADASI', 'KAMPUS_RADARI', 'YOL_ARKADASI', 'ODUNC', 'YETENEK', 'STAJ_IS');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'CLOSED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'MENTION';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ACADEMIC';

-- AlterTable
ALTER TABLE "Badge" ADD COLUMN     "type" "BadgeType" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "isAccepted" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isRejected" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "themeColor" TEXT NOT NULL DEFAULT '#4f46e5';

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "isPinned";

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "reportedCommentId" INTEGER;

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "campus" TEXT DEFAULT 'İstiklal',
    "type" TEXT NOT NULL DEFAULT 'DİĞER',
    "imageUrl" TEXT,
    "creatorId" INTEGER NOT NULL,
    "clubId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventParticipant" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubBadge" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "badgeId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "emoji" TEXT,
    "color" TEXT NOT NULL DEFAULT '#e11d48',
    "logoUrl" TEXT,
    "memberCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ClubStatus" NOT NULL DEFAULT 'PENDING',
    "founderId" INTEGER,
    "advisorName" TEXT,
    "advisorEmail" TEXT,
    "academicApproval" BOOLEAN NOT NULL DEFAULT false,
    "adminApproval" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMember" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotListing" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "category" "SpotCategory" NOT NULL DEFAULT 'AL_SAT',
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "location" TEXT,
    "contactInfo" TEXT,
    "isNegotiable" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpotListing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Event_date_idx" ON "Event"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EventParticipant_eventId_userId_key" ON "EventParticipant"("eventId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ClubBadge_clubId_badgeId_key" ON "ClubBadge"("clubId", "badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "Club_name_key" ON "Club"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Club_slug_key" ON "Club"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ClubMember_clubId_userId_key" ON "ClubMember"("clubId", "userId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubBadge" ADD CONSTRAINT "ClubBadge_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubBadge" ADD CONSTRAINT "ClubBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedCommentId_fkey" FOREIGN KEY ("reportedCommentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_founderId_fkey" FOREIGN KEY ("founderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Club" ADD CONSTRAINT "Club_advisorEmail_fkey" FOREIGN KEY ("advisorEmail") REFERENCES "User"("email") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotListing" ADD CONSTRAINT "SpotListing_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
