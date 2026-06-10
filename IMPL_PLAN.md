Understood. Let's switch to English. Here is the comprehensive, step-by-step implementation plan (checklist) tailored for your setup, utilizing `npx`/`npm` and incorporating our testing strategy.

---

## Comprehensive Implementation Plan: USDC Tracker in NestJS

### Step 1: Initialization & Environment Configuration

* [x] **1.1.** Initialize the NestJS project using `npx` with strict TypeScript mode: `npx @nestjs/cli new usdc-tracker --strict`
* [x] **1.2.** Install production dependencies (`@nestjs/config`, `class-validator`, `class-transformer`, `ethers`, `viem`).
* [x] **1.3.** Create the `.env` template and configuration file (`RPC_URL`, `BLOCKCHAIN_PROVIDER_TYPE`, `PORT`).
* [x] **1.4.** Setup and initialize `ConfigModule` inside `AppModule`.

### Step 2: Blockchain Layer (Abstraction & Providers)

* [x] **2.1.** Define global constants (USDC Smart Contract address, `Transfer` event topic hash).
* [x] **2.2.** Create the `BlockchainProvider` interface and the unified `UsdcTransferRaw` output data model.
* [x] **2.3.** Implement `EthersProvider` (utilizing `ethers.JsonRpcProvider` and `eth_getLogs`).
* [x] **2.4.** Implement `ViemProvider` (utilizing `createPublicClient` and `getLogs`).
* [x] **2.5.** Create the `BlockchainFactory` to switch implementations dynamically based on the `.env` variable.
* [x] **2.6.** Encapsulate everything inside `BlockchainModule` and register the custom DI token (`BLOCKCHAIN_PROVIDER_TOKEN`).

### Step 3: Business Logic & API Controller

* [x] **3.1.** Create `GetTransfersQueryDto` with strict validation for the `format` query parameter (`raw` | `human`) using `class-validator`.
* [x] **3.2.** Create `UsdcService` to aggregate data from the selected provider and apply BigInt conversion logic to the target string format.
* [x] **3.3.** Create `UsdcController` with the `GET /usdc/transfers/:blockNumber` route and bind the global `ValidationPipe`.

### Step 4: Automated Testing Strategy (QA)

* [x] **4.1.** **Unit Tests:** Verify the formatting logic (`raw` vs `human`) in `UsdcService` using a mocked blockchain provider.
* [x] **4.2.** **Unit Tests:** Verify the factory behavior, ensuring it throws appropriate errors for invalid `.env` configurations.
* [x] **4.3.** **Integration Tests:** Validate hex-log parsing from JSON-RPC responses into our domain model for both `EthersProvider` and `ViemProvider` using HTTP mocking (e.g., `nock` or MSW).
* [x] **4.4.** **End-to-End (E2E) Tests:** Use `supertest` to verify HTTP responses, ensuring proper input validation (e.g., 400 Bad Request for invalid block numbers or formats).

### Step 5: Caching Layer (Feature-Toggled In-Memory / Redis)

* [x] **5.1.** Install `@nestjs/cache-manager`, `cache-manager`, `cache-manager-redis-yet`, `redis`.
* [x] **5.2.** Add `CACHE_STORE_TYPE`, `REDIS_URL`, `CACHE_DEFAULT_TTL_MS` to `.env`.
* [x] **5.3.** Create `CacheConfigModule` with async factory that switches store via env.
* [x] **5.4.** Add `getLatestBlockNumber()` to `BlockchainProvider` interface and both providers (needed for finality check).
* [x] **5.5.** Inject `CACHE_MANAGER` into `UsdcService`; implement cache-aside pattern with compound key `usdc:transfers:{blockNumber}:{format}`.
* [x] **5.6.** Implement block finality awareness: finalized blocks (latest - 12) get permanent TTL, recent blocks use `CACHE_DEFAULT_TTL_MS`.
* [x] **5.7.** **Unit Tests:** Cache hit/miss behavior with mocked cache manager.
* [x] **5.8.** **Integration Tests:** Verify finality-based TTL logic.
* [x] **5.9.** Verify lint, full test suite, build.