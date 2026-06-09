/** Raw USDC transfer event as decoded from the blockchain. */
export interface UsdcTransferRaw {
  /** Sender address (20 bytes, hex-encoded with 0x prefix). */
  from: string;
  /** Recipient address. */
  to: string;
  /** Transfer amount as a decimal string (6 decimal places, no fractional dot). */
  value: string;
  /** Block number where the transfer occurred. */
  blockNumber: number;
  /** Transaction hash containing the transfer. */
  transactionHash: string;
  /** Log index within the block. */
  logIndex: number;
}
