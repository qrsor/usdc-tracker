import { Module } from '@nestjs/common';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { UsdcController } from './usdc.controller';
import { UsdcService } from './usdc.service';

@Module({
  imports: [BlockchainModule],
  controllers: [UsdcController],
  providers: [UsdcService],
})
export class UsdcModule {}
