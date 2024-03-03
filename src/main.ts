import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalErrorFilter } from './common/services/globalError.filter';

// process.on('uncaughtException', (exception) => {
//   console.error('Unhandled Exception', exception);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   console.error('Unhandled Rejection', promise, 'reason:', reason);
// });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalErrorFilter());
  const config = new DocumentBuilder()
    .setTitle('UniSwap Position manager App')
    .setDescription('The app which makes you happy')
    .setVersion('1.0')
    .addTag('@PositionManager')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
