import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { UsdcController } from './usdc.controller';
import { UsdcService } from './usdc.service';

/**
 * Exposes the USDC transfer query API.
 * Depends on BlockchainModule for the blockchain provider.
 */
@Module({
  imports: [BlockchainModule],
  controllers: [UsdcController],
  providers: [UsdcService],
})
export class UsdcModule {}
