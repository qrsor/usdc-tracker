import { Module, Global, DynamicModule } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

/**
 * Dynamically configures the NestJS CacheModule based on env.
 *
 * - `CACHE_STORE_TYPE=REDIS` → uses @keyv/redis with REDIS_URL
 * - `CACHE_STORE_TYPE=IN_MEMORY` (default) → in-memory store
 */
@Global()
@Module({})
export class CacheConfigModule {
  static forRoot(): DynamicModule {
    return {
      module: CacheConfigModule,
      imports: [
        CacheModule.registerAsync({
          isGlobal: true,
          useFactory: async (configService: ConfigService) => {
            const storeType = configService.get<string>(
              'CACHE_STORE_TYPE',
              'IN_MEMORY',
            );
            const ttl = parseInt(
              configService.get<string>('CACHE_DEFAULT_TTL_MS', '600000'),
              10,
            );

            if (storeType === 'REDIS') {
              const KeyvRedis = (await import('@keyv/redis')).default;
              const keyvRedis = new KeyvRedis(
                configService.getOrThrow<string>('REDIS_URL'),
              );
              return { stores: [keyvRedis], ttl };
            }

            return { ttl, max: 100 };
          },
          inject: [ConfigService],
        }),
      ],
    };
  }
}
