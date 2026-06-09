import { Module } from '@nestjs/common';
import { BLOCKCHAIN_PROVIDER_TOKEN } from './constants';
import { BlockchainFactory } from './blockchain-factory';
import { EthersProvider } from './ethers-provider';
import { ViemProvider } from './viem-provider';

/**
 * Provides the abstracted blockchain provider via the
 * BLOCKCHAIN_PROVIDER_TOKEN DI token. The factory selects ethers or
 * viem at runtime based on configuration.
 */
@Module({
  providers: [
    EthersProvider,
    ViemProvider,
    BlockchainFactory,
    {
      provide: BLOCKCHAIN_PROVIDER_TOKEN,
      useFactory: (factory: BlockchainFactory) => factory.createProvider(),
      inject: [BlockchainFactory],
    },
  ],
  exports: [BLOCKCHAIN_PROVIDER_TOKEN],
})
export class BlockchainModule {}
