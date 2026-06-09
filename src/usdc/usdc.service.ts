import { Inject, Injectable } from '@nestjs/common';
import { BLOCKCHAIN_PROVIDER_TOKEN } from '../blockchain/constants';
import type { BlockchainProvider } from '../blockchain/blockchain-provider.interface';
import { UsdcTransferRaw } from '../blockchain/usdc-transfer-raw.model';

const USDC_DECIMALS = 6n;
const DIVISOR = 10n ** USDC_DECIMALS;

export interface UsdcTransferHuman {
  from: string;
  to: string;
  value: string;
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
}

@Injectable()
export class UsdcService {
  constructor(
    @Inject(BLOCKCHAIN_PROVIDER_TOKEN)
    private readonly provider: BlockchainProvider,
  ) {}

  async getTransfers(
    blockNumber: number,
    format?: 'raw' | 'human',
  ): Promise<UsdcTransferRaw[] | UsdcTransferHuman[]> {
    const raw = await this.provider.getUsdcTransfers(blockNumber);

    if (format === 'human') {
      return raw.map((t) => this.toHuman(t));
    }

    return raw;
  }

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
