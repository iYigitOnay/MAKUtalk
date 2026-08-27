import { Injectable, UnauthorizedException, ForbiddenException, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    // 1. Eger hic user yoksa (Ziyaretciyse) ve route guard gerektirmiyorsa izin ver
    // Ancak controller'da @UseGuards(JwtAuthGuard) varsa her zaman user bekler.
    // Biz burada user varsa ban kontrolü yapacağız.
    
    if (user && user.isBanned) {
      throw new ForbiddenException('BANNED_USER');
    }

    if (err || !user) {
      // Eger bir hata varsa veya user yoksa, normal AuthGuard davranisini sergile
      throw err || new UnauthorizedException();
    }
    
    return user;
  }
}
