import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RedisService } from './common/services/redis.service';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './config/winston.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`config/.env.${process.env.NODE_ENV}`, '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST', { infer: true }),
        port: configService.get<number>('DATABASE_PORT', { infer: true }),
        username: configService.get<string>('DATABASE_USER', { infer: true }),
        password: configService.get<string>('DATABASE_PASSWORD', {
          infer: true,
        }),
        database: configService.get<string>('DATABASE_NAME', { infer: true }),
        schema: 'public',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    WinstonModule.forRoot(winstonConfig),
    AuthModule,
    UsersModule,
  ],
  controllers: [],
  providers: [RedisService],
  exports: [RedisService],
})
export class AppModule {}
