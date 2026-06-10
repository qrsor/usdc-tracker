import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { BLOCKCHAIN_PROVIDER_TOKEN } from '../blockchain/constants';
import { UsdcTransferRaw } from '../blockchain/usdc-transfer-raw.model';
import { UsdcService } from './usdc.service';

const mockRawTransfer: UsdcTransferRaw = {
  from: '0xabc',
  to: '0xdef',
  value: '1234567890',
  blockNumber: 12345,
  transactionHash: '0xtxn',
  logIndex: 0,
};

const mockProvider = {
  getUsdcTransfers: jest
    .fn<Promise<UsdcTransferRaw[]>, [number]>()
    .mockResolvedValue([mockRawTransfer]),
  getLatestBlockNumber: jest
    .fn<Promise<number>, []>()
    .mockResolvedValue(12345 + 100),
};

let cacheStore = new Map<string, { value: unknown; ttl: number }>();

const mockCacheManager = {
  get: jest.fn((key: string) => {
    const entry = cacheStore.get(key);
    return Promise.resolve(entry ? entry.value : undefined);
  }),
  set: jest.fn((key: string, value: unknown, ttl: number) => {
    cacheStore.set(key, { value, ttl });
    return Promise.resolve();
  }),
  del: jest.fn(),
  reset: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string, defaultValue?: unknown) => defaultValue),
};

describe('UsdcService', () => {
  let service: UsdcService;

  beforeEach(async () => {
    cacheStore = new Map();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsdcService,
        { provide: BLOCKCHAIN_PROVIDER_TOKEN, useValue: mockProvider },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsdcService>(UsdcService);
  });

  describe('formatting', () => {
    it('returns raw transfers when format is "raw"', async () => {
      const result = await service.getTransfers(12345, 'raw');
      expect(result).toEqual([mockRawTransfer]);
    });

    it('defaults to raw transfers when format is undefined', async () => {
      const result = await service.getTransfers(12345);
      expect(result).toEqual([mockRawTransfer]);
    });

    it('converts value to human format with 6 decimals', async () => {
      const result = await service.getTransfers(12345, 'human');

      expect(result).toHaveLength(1);
      const human = result[0] as Record<string, unknown>;
      expect(human.value).toBe('1234.567890');
      expect(human.from).toBe('0xabc');
      expect(human.to).toBe('0xdef');
    });

    it('pads fractional part to 6 digits', async () => {
      const smallTransfer: UsdcTransferRaw = {
        ...mockRawTransfer,
        value: '5',
      };

      mockProvider.getUsdcTransfers.mockResolvedValueOnce([smallTransfer]);

      const result = await service.getTransfers(12345, 'human');

      expect(result).toHaveLength(1);
      expect((result[0] as Record<string, unknown>).value).toBe('0.000005');
    });

    it('passes blockNumber to the provider', async () => {
      await service.getTransfers(999, 'raw');

      expect(mockProvider.getUsdcTransfers).toHaveBeenCalledWith(999);
    });
  });

  describe('caching', () => {
    it('calls provider on cache miss (first call)', async () => {
      mockProvider.getUsdcTransfers.mockClear();

      await service.getTransfers(100, 'raw');

      expect(mockProvider.getUsdcTransfers).toHaveBeenCalledTimes(1);
    });

    it('returns cached data on second call without calling provider', async () => {
      mockProvider.getUsdcTransfers.mockClear();

      await service.getTransfers(100, 'raw');
      await service.getTransfers(100, 'raw');

      expect(mockProvider.getUsdcTransfers).toHaveBeenCalledTimes(1);
    });

    it('uses separate cache keys for different blocks', async () => {
      await service.getTransfers(100, 'raw');
      await service.getTransfers(200, 'raw');

      expect(mockProvider.getUsdcTransfers).toHaveBeenCalledTimes(2);
    });

    it('uses separate cache keys for different formats', async () => {
      await service.getTransfers(100, 'raw');
      await service.getTransfers(100, 'human');

      expect(mockProvider.getUsdcTransfers).toHaveBeenCalledTimes(2);
    });

    it('stores finalized block with permanent TTL', async () => {
      mockProvider.getLatestBlockNumber.mockResolvedValueOnce(200);
      mockProvider.getUsdcTransfers.mockClear();
      cacheStore.clear();

      await service.getTransfers(100, 'raw');

      const key = 'usdc:transfers:100:raw';
      const entry = cacheStore.get(key);
      expect(entry).toBeDefined();
      // 365 days in ms = 31536000000
      expect(entry!.ttl).toBe(31536000000);
    });

    it('stores recent block with default TTL', async () => {
      mockProvider.getLatestBlockNumber.mockResolvedValueOnce(105);
      mockProvider.getUsdcTransfers.mockClear();
      cacheStore.clear();

      await service.getTransfers(100, 'raw');

      const key = 'usdc:transfers:100:raw';
      const entry = cacheStore.get(key);
      expect(entry).toBeDefined();
      expect(entry!.ttl).toBe(600000);
    });
  });
});
