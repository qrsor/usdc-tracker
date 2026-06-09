import { IsOptional, IsIn } from 'class-validator';

/** Query parameters for the USDC transfers endpoint. */
export class GetTransfersQueryDto {
  /**
   * Response format.
   * - `raw`: values as decimal strings (6 decimals, no fractional dot)
   * - `human`: values formatted with a decimal separator (e.g. "1.000000")
   */
  @IsOptional()
  @IsIn(['raw', 'human'])
  format?: 'raw' | 'human';
}
