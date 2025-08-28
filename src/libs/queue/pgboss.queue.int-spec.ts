import * as assert from 'node:assert';

import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import type PgBoss from 'pg-boss';
import { QueueModule } from './queue.module';

import { PG_BOSS_INSTANCE } from './providers';
import { getQueueToken } from './queue.decorators';
import type { Queue } from './queue.interface';
import { DatabaseModule } from '../database/database.module';
import databaseConfig, {
  DatabaseConfig,
} from '../configuration/database.config';
import { ConfigurationModule } from '../configuration/configuration.module';

describe('PgBossQueue', () => {
  let testingModule: TestingModule;
  let pgBoss: PgBoss;
  let audioQueue: Queue;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [
        ConfigurationModule,
        DatabaseModule,
        QueueModule.forRootAsync({
          imports: [ConfigModule.forFeature(databaseConfig)],
          inject: [databaseConfig.KEY],
          useFactory: (config: DatabaseConfig) => {
            return {
              connectionString: config.url,
            };
          },
        }),
        QueueModule.registerQueue('audio'),
        QueueModule.registerQueue('compression'),
      ],
    }).compile();

    await testingModule.init();
    pgBoss = testingModule.get(PG_BOSS_INSTANCE);
    audioQueue = testingModule.get<Queue>(getQueueToken('audio'));
  });

  beforeEach(async () => {
    await pgBoss.purgeQueue('audio');
  });

  afterAll(async () => {
    await pgBoss.clearStorage();
    await pgBoss.deleteQueue('audio');
    await testingModule.close();
  });

  test('adds a job to the queue', async () => {
    const jobData = { file: 'test.mp3', userId: '12345' };

    const jobId = await audioQueue.addJob(jobData);

    assert(jobId, 'Job ID should not be null');
    const jobFromQueue = await audioQueue.getJobById(jobId);
    assert(jobFromQueue, 'Job should be retrievable from the queue');
    expect(jobFromQueue.data).toEqual(jobData);
    expect(jobFromQueue.name).toBe('audio');
  });

  test('removes a job from the queue', async () => {
    const jobData = { file: 'test.mp3', userId: '12345' };
    const jobId = (await audioQueue.addJob(jobData)) as string;

    await audioQueue.removeJob(jobId);

    const jobFromQueue = await audioQueue.getJobById(jobId);
    expect(jobFromQueue).toBeNull();
  });

  test('cancels a job from the queue', async () => {
    const jobData = { file: 'test.mp3', userId: '12345' };
    const jobId = (await audioQueue.addJob(jobData)) as string;

    await audioQueue.cancelJob(jobId);

    const jobFromQueue = await audioQueue.getJobById(jobId);
    assert(jobFromQueue, 'Job should still exist in the queue');
    expect(jobFromQueue.state).toBe('cancelled');
  });

  test('returns the number of pending jobs in the queue', async () => {
    const jobData = { file: 'test.mp3', userId: '12345', meta: 'pending' };
    await audioQueue.addJob(jobData);
    const jobToCancelId = (await audioQueue.addJob(jobData)) as string;
    await audioQueue.cancelJob(jobToCancelId);

    const pendingJobsCount = await audioQueue.getPendingJobsCount();

    expect(pendingJobsCount).toBe(1);
  });

  test('resumes a cancelled job from the queue', async () => {
    const jobData = { file: 'test.mp3', userId: '12345', meta: 'cancelled' };
    const jobId = (await audioQueue.addJob(jobData)) as string;
    await audioQueue.cancelJob(jobId);

    await audioQueue.resumeJob(jobId);

    const resumedJob = await audioQueue.getJobById(jobId);
    expect(resumedJob?.state).toBe('created');
  });

  test('purges all jobs from the queue', async () => {
    const jobData = { file: 'test.mp3', userId: '12345' };
    await audioQueue.addJob(jobData);
    await audioQueue.addJob(jobData);

    await audioQueue.purge();

    const pendingJobsCount = await audioQueue.getPendingJobsCount();
    expect(pendingJobsCount).toBe(0);
  });

  test('schedules a job using cron expression', async () => {
    const cronExpression = '* * * * *'; // Every minute
    const jobData = { file: 'test.mp3', userId: '12345' };

    await audioQueue.scheduleJob(cronExpression, jobData);

    const scheduledJobs = await pgBoss.getSchedules();
    expect(scheduledJobs).toEqual([
      expect.objectContaining({
        name: 'audio',
        cron: cronExpression,
        data: jobData,
      }),
    ]);
  });

  test('removes a queue job schedule', async () => {
    const cronExpression = '* * * * *'; // Every minute
    const jobData = { file: 'test.mp3', userId: '12345' };
    await audioQueue.scheduleJob(cronExpression, jobData);

    await audioQueue.unschedule();

    const scheduledJobs = await pgBoss.getSchedules();
    expect(scheduledJobs).toEqual([]);
  });

  test('subscribes to job processing events', async () => {
    const compressionQueue = testingModule.get<Queue>(
      getQueueToken('compression'),
    );
    await compressionQueue.subscribeTo('audio_processed');

    await audioQueue.publish('audio_processed', {
      file: 'test.mp3',
      userId: '12345',
    });

    const audioProcessedJobs = await pgBoss.fetch('compression');
    expect(audioProcessedJobs).toHaveLength(1);
    expect(audioProcessedJobs).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        data: { file: 'test.mp3', userId: '12345' },
        name: 'compression',
      }),
    ]);
  });
});
