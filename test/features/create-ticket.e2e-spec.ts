import { INestApplication } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { configServer } from '../../src/server-config';
import { DSL, createDSL } from '../dsl/dsl.factory';

describe('Submit Ticket (e2e)', () => {
  let app: INestApplication;
  let dsl: DSL;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configServer(app);
    await app.init();
    dsl = createDSL(app);
  });

  describe('success cases', () => {
    test.todo('successfully submits a ticket with valid data');
  });
  describe('error cases', () => {
    test('returns an error when request is not authenticated', async () => {
      return dsl.tickets
        .create({
          title: 'Test Ticket',
          description: 'This is a test ticket',
        })
        .expect(401)
        .expect({
          statusCode: 401,
          message: 'Authorization header is missing or malformed',
          error: 'Unauthorized',
        });
    });
    test.todo('returns an error when ticket data is invalid');
  });
});
