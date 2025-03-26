// Configurazione del server NestJS per CleanAI
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurazione CORS
  app.enableCors({
    origin: ['http://localhost:3001', 'https://cleanai.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Configurazione validazione globale
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Configurazione Swagger per la documentazione API
  const config = new DocumentBuilder()
    .setTitle('CleanAI API')
    .setDescription('API per il sistema di pulizia proattiva e intelligente')
    .setVersion('1.0')
    .addTag('cleanai')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // Avvio del server sulla porta 3000
  await app.listen(3000);
  console.log(`Server NestJS avviato sulla porta 3000`);
}

bootstrap();
