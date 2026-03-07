import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[];
    
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse();
      
      // RATE LIMIT (THROTTLER) ÖZELLEŞTİRMESİ
      if (status === HttpStatus.TOO_MANY_REQUESTS) {
        const url = request.url;
        if (url.includes('/api/posts')) {
          message = 'Çok hızlı paylaşıyorsun! Dakikada en fazla 2 gönderi paylaşabilirsin. Biraz dinlen. 🛑';
        } else if (url.includes('/api/comments')) {
          message = 'Yorum hızın çok yüksek! Lütfen diğer fikirleri de oku, sonra tekrar yazarsın. 🛑';
        } else if (url.includes('/api/auth/login')) {
          message = 'Üst üste hatalı giriş denemesi yaptın. Güvenliğin için 1 dakika beklemen gerekiyor. 🛡️';
        } else if (url.includes('/api/auth/register')) {
          message = 'Çok fazla kayıt denemesi. Lütfen bir süre bekle. 🛑';
        } else if (url.includes('/api/chat')) {
          message = 'Mesaj gönderme hızın çok fazla. Biraz yavaşla. 📨';
        } else {
          message = 'Sistemi çok hızlı kullanıyorsun. Lütfen biraz yavaşla. 🚦';
        }
      } else {
        message =
          typeof exceptionResponse === 'object' && 'message' in exceptionResponse
            ? (exceptionResponse as any).message
            : exceptionResponse.toString();
      }
    } else {
      message = 'Sunucu tarafında beklenmedik bir hata oluştu.';
      console.error('Unexpected error:', exception);
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: Array.isArray(message) ? message : [message],
    };

    response.status(status).json(errorResponse);
  }
}
