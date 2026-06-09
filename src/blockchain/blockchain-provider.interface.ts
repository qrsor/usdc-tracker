import { UsdcTransferRaw } from './usdc-transfer-raw.model';

export interface BlockchainProvider {
  getUsdcTransfers(blockNumber: number): Promise<UsdcTransferRaw[]>;
}
