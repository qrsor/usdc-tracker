import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { BLOCKCHAIN_PROVIDER_TOKEN } from '../src/blockchain/constants';
import { UsdcTransferRaw } from '../src/blockchain/usdc-transfer-raw.model';

const mockTransfers: UsdcTransferRaw[] = [
  {
    from: '0xaaa',
    to: '0xbbb',
    value: '1000000',
    blockNumber: 12345,
    transactionHash: '0xhash',
    logIndex: 0,
  },
];

const mockProvider = {
  getUsdcTransfers: jest
    .fn<Promise<UsdcTransferRaw[]>, [number]>()
    .mockResolvedValue(mockTransfers),
};

describe('UsdcController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BLOCKCHAIN_PROVIDER_TOKEN)
      .useValue(mockProvider)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /usdc/transfers/:blockNumber returns 200 with transfers', () => {
    return request(app.getHttpServer())
      .get('/usdc/transfers/12345')
      .expect(200)
      .expect(mockTransfers);
  });

  it('GET /usdc/transfers/:blockNumber?format=raw returns raw format', () => {
    return request(app.getHttpServer())
      .get('/usdc/transfers/12345?format=raw')
      .expect(200)
      .expect(mockTransfers);
  });

  it('GET /usdc/transfers/:blockNumber?format=human returns human format', () => {
    return request(app.getHttpServer())
      .get('/usdc/transfers/12345?format=human')
      .expect(200)
      .expect([
        {
          from: '0xaaa',
          to: '0xbbb',
          value: '1.000000',
          blockNumber: 12345,
          transactionHash: '0xhash',
          logIndex: 0,
        },
      ]);
  });

  it('GET /usdc/transfers/:blockNumber returns 400 for invalid blockNumber', () => {
    return request(app.getHttpServer()).get('/usdc/transfers/abc').expect(400);
  });

  it('GET /usdc/transfers/:blockNumber returns 400 for invalid format', () => {
    return request(app.getHttpServer())
      .get('/usdc/transfers/12345?format=invalid')
      .expect(400);
  });

  it('passes blockNumber to the provider', async () => {
    mockProvider.getUsdcTransfers.mockClear();

    await request(app.getHttpServer()).get('/usdc/transfers/999').expect(200);

    expect(mockProvider.getUsdcTransfers).toHaveBeenCalledWith(999);
  });
});
