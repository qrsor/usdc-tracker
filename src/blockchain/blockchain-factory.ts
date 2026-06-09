import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EthersProvider } from './ethers-provider';
import { ViemProvider } from './viem-provider';
import { BlockchainProvider } from './blockchain-provider.interface';

@Injectable()
export class BlockchainFactory {
  private readonly logger = new Logger(BlockchainFactory.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly ethersProvider: EthersProvider,
    private readonly viemProvider: ViemProvider,
  ) {}

  createProvider(): BlockchainProvider {
    const type =
      this.configService.get<string>('BLOCKCHAIN_PROVIDER_TYPE') ?? 'ethers';

    switch (type) {
      case 'ethers':
        this.logger.log('Using EthersProvider');
        return this.ethersProvider;
      case 'viem':
        this.logger.log('Using ViemProvider');
        return this.viemProvider;
      default:
        throw new Error(
          `Unknown BLOCKCHAIN_PROVIDER_TYPE: ${type}. Use "ethers" or "viem".`,
        );
    }
  }
}
