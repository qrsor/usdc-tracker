/** Ethereum mainnet address for the USDC (FiatUSD) token contract. */
export const USDC_CONTRACT_ADDRESS =
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

/**
 * Keccak-256 hash of the ERC-20 Transfer event signature:
 * `Transfer(address indexed from, address indexed to, uint256 value)`.
 */
export const TRANSFER_EVENT_TOPIC =
  '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

/** NestJS DI token used to inject the active blockchain provider. */
export const BLOCKCHAIN_PROVIDER_TOKEN = 'BLOCKCHAIN_PROVIDER_TOKEN';
