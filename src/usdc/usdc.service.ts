import { Inject, Injectable, Logger } from '@nestjs/common';
import { BLOCKCHAIN_PROVIDER_TOKEN } from '../blockchain/constants';
import type { BlockchainProvider } from '../blockchain/blockchain-provider.interface';
import { UsdcTransferRaw } from '../blockchain/usdc-transfer-raw.model';

/** USDC uses 6 decimal places. */
const USDC_DECIMALS = 6n;
const DIVISOR = 10n ** USDC_DECIMALS;

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

/**
 * Bridges the blockchain provider and applies USDC decimal conversion.
 * Returns either raw (BigInt string) or human (decimal-dot) formatted transfers.
 */
@Injectable()
export class UsdcService {
  private readonly logger = new Logger(UsdcService.name);

  constructor(
    @Inject(BLOCKCHAIN_PROVIDER_TOKEN)
    private readonly provider: BlockchainProvider,
  ) {}

  async getTransfers(
    blockNumber: number,
    format?: 'raw' | 'human',
  ): Promise<UsdcTransferRaw[] | UsdcTransferHuman[]> {
    this.logger.debug(
      `Fetching transfers for block ${blockNumber}, format=${format ?? 'raw'}`,
    );

    const raw = await this.provider.getUsdcTransfers(blockNumber);

    if (format === 'human') {
      return raw.map((t) => this.toHuman(t));
    }

    return raw;
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
