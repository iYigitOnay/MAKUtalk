import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationsService,
  NotificationType,
} from '../notifications/notifications.service';

@Injectable()
export class FollowService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // YARDIMCI: Takipleşme sonrası sohbet kilitlerini aç
  private async autoAcceptConversations(userA: number, userB: number) {
    await this.prisma.conversation.updateMany({
      where: {
        AND: [
          { participants: { some: { userId: userA } } },
          { participants: { some: { userId: userB } } },
          { OR: [{ isAccepted: false }, { isRejected: true }] }
        ]
      },
      data: { isAccepted: true, isRejected: false }
    });
  }

  async toggleFollow(followerId: number, followingId: number) {
    if (followerId === followingId) throw new BadRequestException('Kendinizi takip edemezsiniz.');

    const userToFollow = await this.prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true, isPrivate: true }
    });

    if (!userToFollow) throw new NotFoundException('Kullanıcı bulunamadı.');

    const blockExists = await this.prisma.block.findFirst({
      where: { OR: [{ blockerId: followerId, blockedId: followingId }, { blockerId: followingId, blockedId: followerId }] }
    });
    if (blockExists) throw new BadRequestException('Engellenmiş bir kullanıcıyla takipleşemezsiniz.');

    const existingFollow = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existingFollow) {
      await this.prisma.follow.delete({ where: { id: existingFollow.id } });
      return { following: false, status: 'NONE', message: 'Takipten çıkıldı.' };
    }

    const existingRequest = await (this.prisma as any).followRequest.findUnique({
      where: { senderId_receiverId: { senderId: followerId, receiverId: followingId } }
    });

    if (existingRequest) {
      await (this.prisma as any).followRequest.delete({ where: { id: existingRequest.id } });
      return { following: false, status: 'NONE', message: 'Takip isteği geri çekildi.' };
    }

    if (userToFollow.isPrivate === true) {
      await (this.prisma as any).followRequest.create({
        data: { senderId: followerId, receiverId: followingId, status: 'PENDING' }
      });
      return { following: false, status: 'PENDING', message: 'Takip isteği gönderildi.' };
    }

    // HESAP AÇIKSA: Takip et ve SOHBETİ AÇ
    await this.prisma.follow.create({ data: { followerId, followingId } });
    await this.autoAcceptConversations(followerId, followingId); // Sohbet kilidini aç

    await this.notificationsService.createNotification(NotificationType.FOLLOW, followingId, followerId);
    return { following: true, status: 'FOLLOWING', message: 'Takip edildi.' };
  }

  async acceptRequest(receiverId: number, requestId: number) {
    const request = await this.prisma.followRequest.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== receiverId) throw new NotFoundException('İstek bulunamadı.');

    await this.prisma.$transaction([
      this.prisma.follow.create({ data: { followerId: request.senderId, followingId: request.receiverId } }),
      this.prisma.followRequest.delete({ where: { id: requestId } })
    ]);

    // İSTEK KABUL EDİLDİ: SOHBETİ AÇ
    await this.autoAcceptConversations(request.senderId, request.receiverId);

    await this.notificationsService.createNotification(NotificationType.FOLLOW, request.receiverId, request.senderId);
    return { success: true, message: 'İstek kabul edildi.' };
  }

  async rejectRequest(receiverId: number, requestId: number) {
    const request = await this.prisma.followRequest.findUnique({ where: { id: requestId } });
    if (!request || request.receiverId !== receiverId) throw new NotFoundException('İstek bulunamadı.');
    await this.prisma.followRequest.delete({ where: { id: requestId } });
    return { success: true, message: 'İstek reddedildi.' };
  }

  async getPendingRequests(userId: number) {
    return this.prisma.followRequest.findMany({ where: { receiverId: userId, status: 'PENDING' }, include: { sender: { select: { id: true, username: true, fullName: true, avatarUrl: true, department: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async getFollowers(userId: number) {
    return this.prisma.follow.findMany({ where: { followingId: userId }, include: { follower: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } } } });
  }

  async getFollowing(userId: number) {
    return this.prisma.follow.findMany({ where: { followerId: userId }, include: { following: { select: { id: true, username: true, fullName: true, avatarUrl: true, bio: true } } } });
  }

  async isFollowing(followerId: number, followingId: number) {
    const [follow, request] = await Promise.all([
      this.prisma.follow.findUnique({ where: { followerId_followingId: { followerId, followingId } } }),
      this.prisma.followRequest.findUnique({ where: { senderId_receiverId: { senderId: followerId, receiverId: followingId } } })
    ]);
    let status = 'NONE';
    if (follow) status = 'FOLLOWING'; else if (request) status = 'PENDING';
    return { following: !!follow, status };
  }
}
