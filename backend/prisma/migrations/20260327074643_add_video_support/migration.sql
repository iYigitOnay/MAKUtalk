-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "thumbnailUrl" TEXT;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "thumbnailUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT;
