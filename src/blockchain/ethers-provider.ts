import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonRpcProvider } from 'ethers';
import { BlockchainProvider } from './blockchain-provider.interface';
import { UsdcTransferRaw } from './usdc-transfer-raw.model';
import { USDC_CONTRACT_ADDRESS, TRANSFER_EVENT_TOPIC } from './constants';

/** Shape of a raw log entry returned by eth_getLogs. */
interface RawLog {
  topics: string[];
  data: string;
  transactionHash: string;
  logIndex: string;
}

/**
 * Ethereum provider implemented via ethers v6 JsonRpcProvider.
 * Uses eth_getLogs with the USDC contract address and Transfer topic filter.
 * Extracts from/to addresses from indexed event parameters (topics).
 */
@Injectable()
export class EthersProvider implements BlockchainProvider {
  private readonly logger = new Logger(EthersProvider.name);
  private readonly provider: JsonRpcProvider;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.getOrThrow<string>('RPC_URL');
    this.provider = new JsonRpcProvider(rpcUrl);
  }

  async getLatestBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber();
  }

  async getUsdcTransfers(blockNumber: number): Promise<UsdcTransferRaw[]> {
    this.logger.debug(`Fetching USDC transfers at block ${blockNumber}`);

    const logs: RawLog[] = (await this.provider.send('eth_getLogs', [
      {
        address: USDC_CONTRACT_ADDRESS,
        topics: [TRANSFER_EVENT_TOPIC],
        fromBlock: `0x${blockNumber.toString(16)}`,
        toBlock: `0x${blockNumber.toString(16)}`,
      },
    ])) as RawLog[];

    return logs.map(
      (log): UsdcTransferRaw => ({
        from: `0x${log.topics[1].slice(26)}`,
        to: `0x${log.topics[2].slice(26)}`,
        value: BigInt(log.data).toString(),
        blockNumber,
        transactionHash: log.transactionHash,
        logIndex: Number(log.logIndex),
      }),
    );
  }
}
