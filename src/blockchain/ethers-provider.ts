import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JsonRpcProvider, Log } from 'ethers';
import { BlockchainProvider } from './blockchain-provider.interface';
import { UsdcTransferRaw } from './usdc-transfer-raw.model';
import {
  USDC_CONTRACT_ADDRESS,
  TRANSFER_EVENT_TOPIC,
} from './constants';

@Injectable()
export class EthersProvider implements BlockchainProvider {
  private readonly logger = new Logger(EthersProvider.name);
  private readonly provider: JsonRpcProvider;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.getOrThrow<string>('RPC_URL');
    this.provider = new JsonRpcProvider(rpcUrl);
  }

  async getUsdcTransfers(blockNumber: number): Promise<UsdcTransferRaw[]> {
    this.logger.debug(`Fetching USDC transfers at block ${blockNumber}`);

    const logs: Log[] = (await this.provider.send('eth_getLogs', [
      {
        address: USDC_CONTRACT_ADDRESS,
        topics: [TRANSFER_EVENT_TOPIC],
        fromBlock: `0x${blockNumber.toString(16)}`,
        toBlock: `0x${blockNumber.toString(16)}`,
      },
    ])) as Log[];

    return logs.map(
      (log): UsdcTransferRaw => ({
        from: `0x${log.topics[1].slice(26)}`,
        to: `0x${log.topics[2].slice(26)}`,
        value: BigInt(log.data).toString(),
        blockNumber,
        transactionHash: log.transactionHash,
        logIndex: log.index,
      }),
    );
  }
}
