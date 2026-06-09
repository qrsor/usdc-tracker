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