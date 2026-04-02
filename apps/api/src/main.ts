import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use(cookieParser());
  const frontendUrl = process.env.FRONTEND_URL;

  app.enableCors({
    origin: [
      frontendUrl,
      'https://eloquent-gentleness-production-53eb.up.railway.app',
      'http://localhost:3000'
    ].filter(Boolean) as string[],
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`API Application is running on: http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
});
