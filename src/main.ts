// eslint-disable-next-line @typescript-eslint/no-var-requires
require('events').EventEmitter.defaultMaxListeners = 50;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalErrorFilter } from './common/services/globalError.filter';
import { WinstonLoggerService } from './common/services/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false,
  });
  const winstonLoggerService = new WinstonLoggerService();
  app.useLogger(winstonLoggerService);
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
