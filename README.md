# USDC Tracker

NestJS 11 API that tracks USDC (FiatUSD) transfers on Ethereum.
Exposes a single endpoint to query all `Transfer` events at a given block.

## Quick start

```bash
npm install
cp .env.example .env   # edit RPC_URL with a real Ethereum node URL
npm run start:dev       # http://localhost:3000
```

## Environment variables

| Variable                   | Default       | Description                                      |
|----------------------------|---------------|--------------------------------------------------|
| `PORT`                     | `3000`        | HTTP server port                                 |
| `RPC_URL`                  | _(none)_      | Ethereum JSON-RPC endpoint (required)             |
| `BLOCKCHAIN_PROVIDER_TYPE` | `ethers`      | Provider library: `ethers` or `viem`              |
| `CACHE_STORE_TYPE`         | `IN_MEMORY`   | Cache backend: `IN_MEMORY` or `REDIS`             |
| `REDIS_URL`                | _(none)_      | Redis connection string (required if REDIS store) |
| `CACHE_DEFAULT_TTL_MS`     | `600000`      | Default cache TTL in milliseconds                 |
| `NODE_ENV`                 | `development` | Controls pino-pretty output (pretty in dev)       |
| `LOG_LEVEL`                | `info`        | Pino log level: `debug`, `info`, `warn`, `error`  |

## API

### `GET /usdc/transfers/:blockNumber`

Returns all USDC `Transfer` events at the given block number.

**Path parameters**

| Name          | Type   | Description                      |
|---------------|--------|----------------------------------|
| `blockNumber` | `int`  | Ethereum block number (decimal)  |

**Query parameters**

| Name     | Type     | Default | Description                                               |
|----------|----------|---------|-----------------------------------------------------------|
| `format` | `string` | `raw`   | Response format: `raw` (6-decimal string) or `human` (dot-formatted) |

**200 response (`format=raw`)**

```json
[
  {
    "from": "0xabcd...",
    "to": "0xef01...",
    "value": "1000000",
    "blockNumber": 20000000,
    "transactionHash": "0x...",
    "logIndex": 3
  }
]
```

**200 response (`format=human`)**

```json
[
  {
    "from": "0xabcd...",
    "to": "0xef01...",
    "value": "1.000000",
    "blockNumber": 20000000,
    "transactionHash": "0x...",
    "logIndex": 3
  }
]
```

**Error responses**

| Status | Body                           | Trigger              |
|--------|--------------------------------|----------------------|
| 400    | `{ "message": [...], ... }`     | Invalid block number or format query param |

## Scripts

| Command               | Description                    |
|-----------------------|--------------------------------|
| `npm run start:dev`   | Dev server with file watching  |
| `npm run build`       | Compile to `dist/`             |
| `npm run start:prod`  | Run compiled production build  |
| `npm test`            | Unit + integration tests       |
| `npm run test:e2e`    | End-to-end tests               |
| `npm run test:cov`    | Unit tests with coverage       |
| `npm run lint`        | Lint + auto-fix                |
| `npm run format`      | Prettier format                |

## Architecture

```
AppModule
├── ConfigModule          — .env loading (global)
├── LoggerModule          — pino structured logging (global)
├── UsdcModule
│   ├── UsdcController    — GET /usdc/transfers/:blockNumber
│   └── UsdcService       — business logic, decimal conversion
└── BlockchainModule
    ├── EthersProvider    — ethers v6 JsonRpcProvider
    ├── ViemProvider      — viem public client
    └── BlockchainFactory — selects provider via env
```

The active blockchain provider library is selected at runtime via `BLOCKCHAIN_PROVIDER_TYPE` and injected through the `BLOCKCHAIN_PROVIDER_TOKEN` DI token.

## Implementation plan

See [`IMPL_PLAN.md`](./IMPL_PLAN.md) for the full implementation checklist.
