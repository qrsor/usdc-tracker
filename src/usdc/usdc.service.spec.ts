import { Test, TestingModule } from '@nestjs/testing';
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
};

describe('UsdcService', () => {
  let service: UsdcService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsdcService,
        {
          provide: BLOCKCHAIN_PROVIDER_TOKEN,
          useValue: mockProvider,
        },
      ],
    }).compile();

    service = module.get<UsdcService>(UsdcService);
  });

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
