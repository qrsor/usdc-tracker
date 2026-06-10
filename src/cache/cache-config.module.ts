import { Module, Global, DynamicModule } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

/**
 * Dynamically configures the NestJS CacheModule based on env.
 *
 * - `CACHE_STORE_TYPE=REDIS` → uses cache-manager-redis-yet with REDIS_URL
 * - `CACHE_STORE_TYPE=IN_MEMORY` (default) → in-memory store with 100-entry cap
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
              const { redisStore } = await import('cache-manager-redis-yet');
              const store = await redisStore({
                url: configService.getOrThrow<string>('REDIS_URL'),
              });
              return { store, ttl };
            }

            return { ttl, max: 100 };
          },
          inject: [ConfigService],
        }),
      ],
    };
  }
}
