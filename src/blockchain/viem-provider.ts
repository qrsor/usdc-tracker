import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicClient, http, Log, parseAbiItem } from 'viem';
import { mainnet } from 'viem/chains';
import { BlockchainProvider } from './blockchain-provider.interface';
import { UsdcTransferRaw } from './usdc-transfer-raw.model';
import { USDC_CONTRACT_ADDRESS } from './constants';

/**
 * Ethereum provider implemented via viem public client.
 * Uses getLogs with the parsed Transfer ABI event and USDC contract address.
 * viem decodes event args (from, to, value) automatically.
 */
@Injectable()
export class ViemProvider implements BlockchainProvider {
  private readonly logger = new Logger(ViemProvider.name);
  private readonly client: ReturnType<typeof createPublicClient>;

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.getOrThrow<string>('RPC_URL');
    this.client = createPublicClient({
      chain: mainnet,
      transport: http(rpcUrl),
    });
  }

  async getUsdcTransfers(blockNumber: number): Promise<UsdcTransferRaw[]> {
    this.logger.debug(`Fetching USDC transfers at block ${blockNumber}`);

    const logs = await this.client.getLogs({
      address: USDC_CONTRACT_ADDRESS as `0x${string}`,
      event: parseAbiItem(
        'event Transfer(address indexed from, address indexed to, uint256 value)',
      ),
      args: {},
      fromBlock: BigInt(blockNumber),
      toBlock: BigInt(blockNumber),
    });

    return (logs as Log[]).map(
      (log): UsdcTransferRaw => ({
        from: (log as unknown as { args: { from: string } }).args.from,
        to: (log as unknown as { args: { to: string } }).args.to,
        value: (
          log as unknown as { args: { value: bigint } }
        ).args.value.toString(),
        blockNumber: Number(log.blockNumber),
        transactionHash: log.transactionHash ?? '',
        logIndex: log.logIndex ?? 0,
      }),
    );
  }
}
