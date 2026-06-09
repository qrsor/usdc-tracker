import { IsOptional, IsIn } from 'class-validator';

export class GetTransfersQueryDto {
  @IsOptional()
  @IsIn(['raw', 'human'])
  format?: 'raw' | 'human';
}
