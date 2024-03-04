import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Position } from './positions/models/position.model';
import { RedisService } from './common/services/redis.service';
import { Pools } from './common/models/poolsTable.model';
import { QueuesModule } from './queues/queues.module';
import { PositionsModule } from './positions/positions.module';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    // SequelizeModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   useFactory: async (configService: ConfigService) => ({
    //     dialect: 'postgres',
    //     host: configService.get<string>('POSTGRES_HOST'),
    //     port: configService.get<number>('POSTGRES_PORT'),
    //     username: configService.get<string>('POSTGRES_USER'),
    //     password: configService.get<string>('POSTGRES_PASSWORD'),
    //     database: configService.get<string>('POSTGRES_DB'),
    //     models: [Position, Pools],
    //     autoLoadModels: true,
    //   }),
    // }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRES_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      models: [Position, Pools],
      autoLoadModels: true,
    }),
    SequelizeModule.forFeature([Position, Pools]),
    QueuesModule,
    PositionsModule,
    GatewaysModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisService],
  exports: [RedisService],
})
export class AppModule {}
