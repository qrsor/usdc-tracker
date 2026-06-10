# usdc-tracker

NestJS 11 API that tracks USDC transfers on Ethereum. Exposes
`GET /usdc/transfers/:blockNumber?format=raw|human`. Blockchain
provider abstraction (ethers/viem switchable via env). Implementation
roadmap at `IMPL_PLAN.md`.

## Commands

| Action | Command |
|--------|---------|
| dev server (watch) | `npm run start:dev` |
| build | `npm run build` (`nest build`, wipes dist) |
| lint + fix | `npm run lint` |
| format | `npm run format` |
| unit tests | `npm test` (Jest, inline config in package.json, rootDir: src, pattern `*.spec.ts`) |
| e2e tests | `npm run test:e2e` (config `test/jest-e2e.json`, pattern `*.e2e-spec.ts`) |
| coverage | `npm run test:cov` |

## Conventions

- **Prettier**: singleQuote, trailingComma: all. `npm run format` to apply.
- **ESLint** (flat config `eslint.config.mjs`): type-aware linting, `no-explicit-any` off, `no-floating-promises` warn, `no-unsafe-argument` warn.
- **Port**: `process.env.PORT ?? 3000`. No `.env` file in repo (gitignored).
- **Cache**: toggle `CACHE_STORE_TYPE` (`IN_MEMORY` / `REDIS`),
  `REDIS_URL`, `CACHE_DEFAULT_TTL_MS` (default 600000ms).
- **Package manager**: npm only (lockfile v3, no workspaces).
- **TypeScript**: `nodenext` module resolution, strictNullChecks, noImplicitAny, `emitDecoratorMetadata` + `experimentalDecorators` on.

## Architecture

- Standard NestJS: AppModule -> AppController -> AppService.
- `BlockchainModule` with DI token `BLOCKCHAIN_PROVIDER_TOKEN`. Factory
  selects `EthersProvider` or `ViemProvider` based on env.
- `UsdcController`: `GET /usdc/transfers/:blockNumber` with DTO
  validation (`class-validator`) for `?format=raw|human`.
- `UsdcService` bridges provider, applies USDC decimal conversion, and
  caches results via `CacheConfigModule` (feature-toggled in-memory/Redis).
- `CacheConfigModule` with async factory: `CACHE_STORE_TYPE=IN_MEMORY`
  (default, 100-entry LRU) or `REDIS` (via `cache-manager-redis-yet`).
- Cache key: `usdc:transfers:{blockNumber}:{format}`. Finality-aware TTL:
  blocks >= 12 confirmations get 1-year TTL; recent blocks use
  `CACHE_DEFAULT_TTL_MS` (default 600s).
- Single package (not a monorepo). Source root `src/`.
- No database, middleware, guards, interceptors, pipes, filters yet.
- No CI pipeline configured.

## Dependencies installed

Runtime: `@nestjs/config`, `class-validator`, `class-transformer`,
`ethers`, `viem`, `@nestjs/cache-manager`, `cache-manager`,
`cache-manager-redis-yet`, `redis`. All in `package.json`.

## Test quirks

- Unit test config lives in `package.json` `jest` key—do not look for `jest.config.ts`.
- E2E uses separate `test/jest-e2e.json`.
- Both use `ts-jest` transform.
- Integration test for providers uses `nock` for HTTP mocking.

## Generated code

- NestJS CLI (`@nestjs/schematics`) generates modules/controllers/services. Artifacts go under `src/`.

## Commits

- Follow Conventional Commits spec.
- Format: `<type>([scope]): <description>`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Description: imperative present tense, lowercase, no period.
- Breaking change: append `!` after type/scope or add `BREAKING CHANGE:` footer.
- Issue references in footer: `Fixes #123`, `Closes #456`.
- Full reference at `~/.agents/skills/conventional-commits/`.
