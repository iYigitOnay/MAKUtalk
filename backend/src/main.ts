import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Güvenlik başlıklarını ekle
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Görsellerin frontend'den görünebilmesi için
  }));

  // Statik dosyaları dışarı aç (Dosyaların görünmesini sağlar)
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  app.enableCors({
    origin: true, // Tüm origin'lere izin ver
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('🚀 MAKUtalk Backend is running on http://localhost:3000/api');
}
bootstrap();
