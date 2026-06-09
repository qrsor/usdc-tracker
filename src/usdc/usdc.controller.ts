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

  @Get('transfers/:blockNumber')
  async getTransfers(
    @Param('blockNumber', ParseIntPipe) blockNumber: number,
    @Query(ValidationPipe) query: GetTransfersQueryDto,
  ) {
    return this.usdcService.getTransfers(blockNumber, query.format);
  }
}
