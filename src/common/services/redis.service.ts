import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', { infer: true }),
      port: this.configService.get<number>('REDIS_PORT', { infer: true }),
      password: this.configService.get<string>('REDIS_PASSWORD', {
        infer: true,
      }),
    });
  }

  onModuleDestroy() {
    void this.client.quit();
  }

  async addToBlacklist(token: string): Promise<void> {
    await this.client.set(token, 'blacklisted');
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.client.get(token);
    return result === 'blacklisted';
  }
}
