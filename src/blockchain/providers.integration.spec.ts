import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import nock from 'nock';
import { EthersProvider } from './ethers-provider';
import { ViemProvider } from './viem-provider';

const RPC_URL = 'https://ethereum-rpc.example.com';
const BLOCK = 20000000;

const MOCK_LOG_RESULT = [
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    topics: [
      '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      '0x000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      '0x000000000000000000000000bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    ],
    data: '0x00000000000000000000000000000000000000000000000000000002540be400',
    blockNumber: '0x1312d00',
    transactionHash:
      '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    transactionIndex: '0x1',
    blockHash:
      '0xdddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd',
    logIndex: '0x3',
    removed: false,
  },
];

const mockConfig = {
  get: jest.fn().mockReturnValue(RPC_URL),
  getOrThrow: jest.fn().mockReturnValue(RPC_URL),
};

describe('EthersProvider integration', () => {
  let provider: EthersProvider;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EthersProvider,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    provider = module.get<EthersProvider>(EthersProvider);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('parses eth_getLogs response into UsdcTransferRaw', async () => {
    const scope = nock(RPC_URL)
      .post('/', () => true)
      .reply(200, (uri: string, body: nock.Body) => {
        const reqs = body as Array<{ id: number; method: string }>;
        return reqs.map((r) => {
          if (r.method === 'eth_getLogs') {
            return { jsonrpc: '2.0', id: r.id, result: MOCK_LOG_RESULT };
          }
          return { jsonrpc: '2.0', id: r.id, result: '0x1' };
        });
      });

    const transfers = await provider.getUsdcTransfers(BLOCK);

    expect(transfers).toHaveLength(1);
    expect(transfers[0]).toEqual({
      from: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      to: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      value: '10000000000',
      blockNumber: BLOCK,
      transactionHash:
        '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
      logIndex: 3,
    });

    expect(scope.isDone()).toBe(true);
  });
});

describe('ViemProvider integration', () => {
  let provider: ViemProvider;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ViemProvider,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    provider = module.get<ViemProvider>(ViemProvider);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('parses getLogs response into UsdcTransferRaw', async () => {
    const scope = nock(RPC_URL)
      .post('/', () => true)
      .reply(200, () => ({
        jsonrpc: '2.0',
        id: 1,
        result: MOCK_LOG_RESULT,
      }));

    const transfers = await provider.getUsdcTransfers(BLOCK);

    expect(transfers).toHaveLength(1);
    expect(transfers[0].from.toLowerCase()).toBe(
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    );
    expect(transfers[0].to.toLowerCase()).toBe(
      '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    );
    expect(transfers[0].value).toBe('10000000000');
    expect(transfers[0].blockNumber).toBe(BLOCK);
    expect(transfers[0].logIndex).toBe(3);
    expect(transfers[0].transactionHash).toBe(
      '0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
    );

    expect(scope.isDone()).toBe(true);
  });
});
