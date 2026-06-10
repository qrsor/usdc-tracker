import { UsdcTransferRaw } from './usdc-transfer-raw.model';

/** Abstraction over an Ethereum RPC provider capable of fetching USDC transfer logs. */
export interface BlockchainProvider {
  /** Fetch all USDC Transfer events at a given block number. */
  getUsdcTransfers(blockNumber: number): Promise<UsdcTransferRaw[]>;
  /** Fetch the latest block number from the chain. */
  getLatestBlockNumber(): Promise<number>;
}
