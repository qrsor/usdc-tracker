import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BlockchainFactory } from './blockchain-factory';
import { EthersProvider } from './ethers-provider';
import { ViemProvider } from './viem-provider';

describe('BlockchainFactory', () => {
  let factory: BlockchainFactory;
  let mockConfig: { get: jest.Mock };

  const mockEthersProvider = { getUsdcTransfers: jest.fn() };
  const mockViemProvider = { getUsdcTransfers: jest.fn() };

  beforeEach(async () => {
    mockConfig = { get: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainFactory,
        { provide: ConfigService, useValue: mockConfig },
        { provide: EthersProvider, useValue: mockEthersProvider },
        { provide: ViemProvider, useValue: mockViemProvider },
      ],
    }).compile();

    factory = module.get<BlockchainFactory>(BlockchainFactory);
  });

  it('returns EthersProvider when type is "ethers"', () => {
    mockConfig.get.mockReturnValue('ethers');

    const provider = factory.createProvider();

    expect(provider).toBe(mockEthersProvider);
  });

  it('returns ViemProvider when type is "viem"', () => {
    mockConfig.get.mockReturnValue('viem');

    const provider = factory.createProvider();

    expect(provider).toBe(mockViemProvider);
  });

  it('defaults to EthersProvider when type is not set', () => {
    mockConfig.get.mockReturnValue(undefined);

    const provider = factory.createProvider();

    expect(provider).toBe(mockEthersProvider);
  });

  it('throws for unknown provider type', () => {
    mockConfig.get.mockReturnValue('solana');

    expect(() => factory.createProvider()).toThrow(
      'Unknown BLOCKCHAIN_PROVIDER_TYPE: solana',
    );
  });
});
