-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "requesterId" BIGINT;

-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "deletedAt" TIMESTAMP(3);
