import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes( new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),);

  app.use(json({ limit: '5mb' })); 
  app.use(urlencoded({ extended: true, limit: '5mb' })); 
  
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();