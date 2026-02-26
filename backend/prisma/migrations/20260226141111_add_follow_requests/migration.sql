-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "FollowRequest" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FollowRequest_receiverId_idx" ON "FollowRequest"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "FollowRequest_senderId_receiverId_key" ON "FollowRequest"("senderId", "receiverId");

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
