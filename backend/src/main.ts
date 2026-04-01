import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import { json, urlencoded } from 'express';
import { MyLogger } from './common/logger/logger.service';
import { BigIntInterceptor } from './common/interceptors/bigint.interceptor';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const logger = app.get(MyLogger);
  app.useLogger(logger);

  // --- KATMAN 0: BIGINT SERİALİZER ---
  app.useGlobalInterceptors(new BigIntInterceptor());

  // --- KATMAN 1: IP VE ISTEK TAKIBI ---
  app.use(
    morgan(
      ':method :url :status :res[content-length] - :response-time ms | IP: :remote-addr | User: :user-agent',
      {
        stream: {
          write: (message) => logger.log(message.trim(), 'HTTP'),
        },
      },
    ),
  );

  // --- SWAGGER YAPILANDIRMASI ---
  const config = new DocumentBuilder()
    .setTitle('MAKUtalk API')
    .setDescription(
      'MAKUtalk Mobil ve Web istemcileri için merkezi API dökümantasyonu. Tüm endpointler ve veri yapıları burada tanımlanmıştır.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Lütfen JWT tokeninizi buraya girin',
        in: 'header',
      },
      'JWT-auth', // Bu isim daha sonra Controller'larda kullanılacak
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Sayfa yenilense de tokeni hatırlar, test yaparken çok rahat edersin
    },
    customSiteTitle: 'MAKUtalk API Documentation',
  });

  // --- KATMAN 5: API KALKANI VE GÜVENLIK ---


  // 1. JSON Limitleri (Dosya şişirme saldırılarına karşı)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // 2. Helmet Zırhı (En sıkı ayarlar)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'http://localhost:3000', 'https://*'],
          connectSrc: [
            "'self'",
            'http://localhost:3000',
            'ws://localhost:3000',
          ],
        },
      },
      xssFilter: true, // XSS Koruması
      noSniff: true, // MIME sniffing engeli
      hidePoweredBy: true, // "X-Powered-By: Express" başlığını gizle
    }),
  );

  // 3. Kesin CORS Politikası
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'https://makutalk.com',
      'https://www.makutalk.com',
      'https://makutalk.dev',
      'https://www.makutalk.dev',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 4. Strict Veri Denetimi (Validation)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Sadece DTO'da tanımlı alanları kabul et
      forbidNonWhitelisted: true, // Beklenmeyen alan gelirse isteği REDDET
      transform: true, // Gelen veriyi otomatik tipe çevir (string -> number vb.)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 5. Global Hata Filtresi
  app.useGlobalFilters(new HttpExceptionFilter());

  // Statik dosyaları dışarı aç
  const uploadsPath = join(process.cwd(), 'uploads');
  app.useStaticAssets(uploadsPath, {
    prefix: '/uploads',
  });

  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(
    `🚀 MAKUtalk Shield Active. Running on http://localhost:${port}/api`,
    'Bootstrap',
  );
}
bootstrap();
