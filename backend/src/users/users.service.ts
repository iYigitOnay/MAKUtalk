import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, username, password, fullName } = createUserDto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      throw new ConflictException(
        'Bu e-posta veya kullanıcı adı zaten kullanımda.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 haneli kod

    // AKADEMİSYEN KONTROLÜ
    let role: any = 'USER';
    const isAcademicEmail = email.endsWith('@mehmetakif.edu.tr') && !email.includes('@ogr.mehmetakif.edu.tr');
    
    if (isAcademicEmail) {
      role = 'ACADEMIC';
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        fullName,
        verificationCode,
        isVerified: false,
        role: role,
      },
    });

    // Otomatik Akademisyen Rozeti
    if (isAcademicEmail) {
      try {
        let academicBadge = await this.prisma.badge.findUnique({ where: { name: 'Akademisyen' } });
        if (!academicBadge) {
          academicBadge = await this.prisma.badge.create({
            data: { name: 'Akademisyen', icon: 'academic', color: '#1E3A8A', description: 'MAKÜ Akademik Personel' }
          });
        }
        await this.prisma.userBadge.create({
          data: { userId: user.id, badgeId: academicBadge.id }
        });
      } catch (err) {
        console.error('Akademisyen rozeti atama hatası:', err);
      }
    }

    // Kayıt sonrası doğrulama kodunu gönder
    try {
      await this.mailService.sendVerificationCode(user.email, verificationCode);
    } catch (error) {
      console.error('Doğrulama kodu gönderim hatası:', error);
    }

    return user;
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    if (user.verificationCode !== code) {
      throw new ForbiddenException('Doğrulama kodu hatalı.');
    }

    return this.prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationCode: null, // Kod kullanıldıktan sonra temizle
      },
    });
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı.');
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.user.update({
      where: { email },
      data: { verificationCode: resetCode },
    });

    try {
      await this.mailService.sendPasswordResetCode(email, resetCode);
      return { message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi.' };
    } catch (error) {
      console.error('Şifre sıfırlama kodu gönderim hatası:', error);
      throw new Error('E-posta gönderilemedi.');
    }
  }

  async resetPassword(email: string, code: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    if (user.verificationCode !== code) {
      throw new ForbiddenException('Sıfırlama kodu hatalı.');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        verificationCode: null,
        isVerified: true, // Şifre sıfırlayabiliyorsa hesabı doğrulanmış sayılabilir veya doğrulanmış olmalıdır
      },
    });
  }

  // Auth için - şifreyi döner
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  // Kendi profili için - şifreyi döndürmez
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    const { password, ...result } = user;
    return result;
  }

  // Profil güncelleme
  async updateProfile(
    userId: number,
    currentUserId: number,
    updateData: UpdateUserDto,
  ) {
    // Sadece kendi profilini güncelleyebilir
    if (userId !== currentUserId) {
      throw new ForbiddenException('Bu profili düzenleme yetkiniz yok.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        department: true,
        class: true,
        isPrivate: true,
        isBanned: true,
        role: true,
        createdAt: true,
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return updatedUser;
  }

  // Public profil - istatistiklerle
  async findByIdWithStats(userId: number, currentUserId?: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        department: true,
        class: true,
        isPrivate: true,
        isBanned: true,
        role: true,
        createdAt: true,
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return {
      ...user,
      isFollowing,
    };
  }

  // Kullanıcıya ait postlar
  async getUserPosts(userId: number, currentUserId?: number) {
    // Gizlilik kontrolü
    if (userId !== currentUserId) {
      const targetUser = await this.prisma.user.findUnique({ where: { id: userId } });
      if (targetUser?.isPrivate) {
        const isFollowing = await this.prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: currentUserId || 0, followingId: userId } }
        });
        if (!isFollowing) return []; // Gizli hesabı takip etmiyorsa postlarını boş dön
      }
    }

    const posts = await this.prisma.post.findMany({
      where: {
        authorId: userId,
        published: true,
        repostId: null, // Sadece orijinal postlar
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
            isPrivate: true,
            badges: { include: { badge: true } }
          },
        },
        category: true,
        repostOf: {
          include: {
            author: { select: { id: true, username: true, fullName: true, avatarUrl: true, isPrivate: true, badges: { include: { badge: true } } } },
            category: true,
            _count: { select: { likes: true, comments: true, reposts: true } }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            reposts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (currentUserId && posts.length > 0) {
      const postIds = posts.map((p) => p.id);
      const userLikes = await this.prisma.like.findMany({
        where: {
          userId: currentUserId,
          postId: { in: postIds },
        },
        select: { postId: true },
      });
      const likedPostIds = new Set(userLikes.map((like) => like.postId));

      return posts.map((post) => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
      }));
    }

    return posts;
  }

  async findByUsername(username: string, currentUserId?: number) {
    // Geçersiz giriş kontrolü
    if (!username || username === 'undefined' || username === 'null') {
      throw new NotFoundException('Geçersiz kullanıcı adı.');
    }

    // Geçersiz sayı kontrolü
    const safeCurrentUserId = (typeof currentUserId === 'number' && !isNaN(currentUserId) && currentUserId > 0) ? currentUserId : undefined;

    // findUnique yerine findFirst + insensitive kullanarak harf duyarlılığını ortadan kaldırıyoruz
    const user = await this.prisma.user.findFirst({
      where: { 
        username: {
          equals: username,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        department: true,
        class: true,
        isPrivate: true,
        isBanned: true,
        role: true,
        createdAt: true,
        badges: {
          include: {
            badge: true
          }
        },
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    let isFollowing = false;
    let isBlocked = false;
    let isFollowRequestSent = false;

    // Sadece geçerli bir currentUserId varsa bu kontrolleri yap
    if (safeCurrentUserId && safeCurrentUserId !== user.id) {
      const [follow, block, followRequest] = await Promise.all([
        this.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: safeCurrentUserId,
              followingId: user.id,
            },
          },
        }),
        this.prisma.block.findUnique({
          where: {
            blockerId_blockedId: {
              blockerId: safeCurrentUserId,
              blockedId: user.id,
            },
          },
        }),
        this.prisma.followRequest.findUnique({
          where: {
            senderId_receiverId: {
              senderId: safeCurrentUserId,
              receiverId: user.id,
            }
          }
        })
      ]);
      isFollowing = !!follow;
      isBlocked = !!block;
      isFollowRequestSent = !!followRequest;
    }

    return {
      ...user,
      isFollowing,
      isBlocked,
      isFollowRequestSent,
    };
  }

  // Engelleme İşlemi
  async toggleBlock(blockerId: number, blockedId: number) {
    if (blockerId === blockedId) {
      throw new ForbiddenException('Kendinizi engelleyemezsiniz.');
    }

    const existingBlock = await this.prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId, blockedId } },
    });

    if (existingBlock) {
      await this.prisma.block.delete({ where: { id: existingBlock.id } });
      return { blocked: false, message: 'Engel kaldırıldı.' };
    }

    // Engelleme gerçekleştiğinde takipleşmeyi ve istekleri bitir
    await Promise.all([
      this.prisma.block.create({ data: { blockerId, blockedId } }),
      this.prisma.follow.deleteMany({
        where: {
          OR: [
            { followerId: blockerId, followingId: blockedId },
            { followerId: blockedId, followingId: blockerId },
          ],
        },
      }),
      this.prisma.followRequest.deleteMany({
        where: {
          OR: [
            { senderId: blockerId, receiverId: blockedId },
            { senderId: blockedId, receiverId: blockerId },
          ],
        },
      }),
    ]);

    return { blocked: true, message: 'Kullanıcı engellendi.' };
  }

  // Engellenen kullanıcıları listele
  async getBlockedUsers(userId: number) {
    return this.prisma.block.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async reportUser(reporterUsername: string, reportedUsername: string, reason: string, subReason: string) {
    const [reporter, reportedUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { username: reporterUsername } }),
      this.prisma.user.findFirst({ where: { username: { equals: reportedUsername, mode: 'insensitive' } } }),
    ]);

    if (!reporter || !reportedUser) {
      throw new NotFoundException('Kullanıcı bulunamadı.');
    }

    return (this.prisma as any).report.create({
      data: {
        reporterId: reporter.id,
        reportedUserId: reportedUser.id,
        reason,
        subReason,
        status: 'PENDING',
      },
    });
  }

  // Admin: Kullanıcıyı banla/ban kaldır
  async toggleBan(userId: number, currentUserId: number) {
    const admin = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!admin || admin.role !== 'ADMIN') throw new ForbiddenException('Bu işlem için yetkiniz yok.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    if (user.role === 'ADMIN') throw new ForbiddenException('Diğer adminleri banlayamazsınız.');

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: !user.isBanned },
    });

    return { 
      banned: updatedUser.isBanned, 
      message: updatedUser.isBanned ? 'Kullanıcı yasaklandı.' : 'Kullanıcı yasağı kaldırıldı.' 
    };
  }

  async toggleUserBadge(userId: number, badgeId: number, currentUserId: number) {
    const admin = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!admin || admin.role !== 'ADMIN') throw new ForbiddenException('Yetkiniz yok.');

    const existing = await this.prisma.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } }
    });

    if (existing) {
      await this.prisma.userBadge.delete({ where: { id: existing.id } });
      return { assigned: false, message: 'Rozet kaldırıldı.' };
    }

    await this.prisma.userBadge.create({ data: { userId, badgeId } });
    return { assigned: true, message: 'Rozet atandı.' };
  }

  // Admin: Kullanıcıyı tamamen sil
  async deleteUser(userId: number, currentUserId: number) {
    const admin = await this.prisma.user.findUnique({ where: { id: currentUserId } });
    if (!admin || admin.role !== 'ADMIN') throw new ForbiddenException('Bu işlem için yetkiniz yok.');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Kullanıcı bulunamadı.');
    if (user.role === 'ADMIN') throw new ForbiddenException('Admin hesapları silinemez.');

    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true, message: 'Kullanıcı hesabı tamamen silindi.' };
  }

  // Geri Bildirim Oluştur
  async createFeedback(userId: number | null, type: string, message: string) {
    return (this.prisma as any).feedback.create({
      data: {
        type,
        message,
        userId,
      },
    });
  }

  // Tüm mevcut rozetleri getir
  async getAllBadges() {
    return this.prisma.badge.findMany({ orderBy: { name: 'asc' } });
  }

  async searchMentions(query: string) {
    return (this.prisma as any).user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
        isBanned: false,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatarUrl: true,
        email: true, // KRİTİK: Email eklendi!
      },
      take: 5,
    });
  }
}
