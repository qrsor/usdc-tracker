import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { BLOCKCHAIN_PROVIDER_TOKEN } from '../blockchain/constants';
import type { BlockchainProvider } from '../blockchain/blockchain-provider.interface';
import { UsdcTransferRaw } from '../blockchain/usdc-transfer-raw.model';

/** USDC uses 6 decimal places. */
const USDC_DECIMALS = 6n;
const DIVISOR = 10n ** USDC_DECIMALS;

/** Number of confirmations before a block is considered finalized on Ethereum. */
const FINALITY_CONFIRMATIONS = 12;

/** TTL for finalized blocks (1 year — effectively permanent). */
const FINALIZED_TTL_MS = 365 * 24 * 60 * 60 * 1000;

/** Human-readable USDC transfer with a dot-formatted value string. */
export interface UsdcTransferHuman {
  from: string;
  to: string;
  /** Value formatted as a decimal string (e.g. "1234.567890"). */
  value: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

/** Cache key prefix for USDC transfers. */
const CACHE_KEY_PREFIX = 'usdc:transfers';

/**
 * Bridges the blockchain provider, applies USDC decimal conversion,
 * and caches results with a block-finality-aware TTL.
 */
@Injectable()
export class UsdcService {
  private readonly logger = new Logger(UsdcService.name);

  constructor(
    @Inject(BLOCKCHAIN_PROVIDER_TOKEN)
    private readonly provider: BlockchainProvider,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async getTransfers(
    blockNumber: number,
    format?: 'raw' | 'human',
  ): Promise<UsdcTransferRaw[] | UsdcTransferHuman[]> {
    const key = `${CACHE_KEY_PREFIX}:${blockNumber}:${format ?? 'raw'}`;

    const cached = await this.cacheManager.get<
      UsdcTransferRaw[] | UsdcTransferHuman[]
    >(key);
    if (cached) {
      this.logger.debug(`Cache hit: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache miss: ${key}, querying provider`);
    const raw = await this.provider.getUsdcTransfers(blockNumber);
    const result: UsdcTransferRaw[] | UsdcTransferHuman[] =
      format === 'human' ? raw.map((t) => this.toHuman(t)) : raw;

    const ttl = await this.resolveTtl(blockNumber);
    await this.cacheManager.set(key, result, ttl);
    this.logger.debug(`Cached ${key} with TTL ${ttl}ms`);

    return result;
  }

  /**
   * Determine TTL based on block finality.
   * Finalized blocks (deep enough) get near-permanent TTL.
   * Recent blocks use the configured default TTL.
   */
  private async resolveTtl(blockNumber: number): Promise<number> {
    try {
      const latestBlock = await this.provider.getLatestBlockNumber();
      const confirmations = latestBlock - blockNumber;

      if (confirmations >= FINALITY_CONFIRMATIONS) {
        this.logger.debug(
          `Block ${blockNumber} finalized (${confirmations} conf), permanent TTL`,
        );
        return FINALIZED_TTL_MS;
      }

      this.logger.debug(
        `Block ${blockNumber} recent (${confirmations} conf), default TTL`,
      );
    } catch {
      this.logger.warn('Failed to fetch latest block; using default TTL');
    }

    return this.configService.get<number>('CACHE_DEFAULT_TTL_MS', 600000);
  }

  /** Convert a raw transfer value to a human-readable decimal string. */
  private toHuman(t: UsdcTransferRaw): UsdcTransferHuman {
    const rawValue = BigInt(t.value);
    const integerPart = rawValue / DIVISOR;
    const fractionalPart = rawValue % DIVISOR;

    return {
      ...t,
      value: `${integerPart}.${fractionalPart.toString().padStart(6, '0')}`,
    };
  }
}
