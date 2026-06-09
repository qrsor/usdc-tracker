import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UsdcService } from './usdc.service';
import { GetTransfersQueryDto } from './dto/get-transfers-query.dto';

@Controller('usdc')
export class UsdcController {
  constructor(private readonly usdcService: UsdcService) {}

  /**
   * GET /usdc/transfers/:blockNumber
   *
   * Returns all USDC Transfer events at the given block number.
   * Optionally formats the value field as a human-readable decimal.
   *
   * @param blockNumber - Ethereum block number (decimal integer)
   * @param query       - Optional format query param: "raw" or "human"
   */
  @Get('transfers/:blockNumber')
  async getTransfers(
    @Param('blockNumber', ParseIntPipe) blockNumber: number,
    @Query(ValidationPipe) query: GetTransfersQueryDto,
  ) {
    return this.usdcService.getTransfers(blockNumber, query.format);
  }
}
