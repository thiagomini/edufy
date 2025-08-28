import { Injectable, Logger } from '@nestjs/common';
import PgBoss from 'pg-boss';

import { Queue } from './queue.interface';

@Injectable()
export class PgBossQueue implements Queue {
  private readonly logger = new Logger(PgBossQueue.name);
  constructor(
    private readonly boss: PgBoss,
    public readonly name: string,
  ) {}

  async addJob(
    data: object,
    options: PgBoss.SendOptions = {},
  ): Promise<string | null> {
    const id = await this.boss.send(this.name, data, options);
    this.logger.debug('Job added with ID:', id);
    return id;
  }

  async removeJob(jobId: string): Promise<void> {
    this.logger.debug(`Removing job with ID: ${jobId}`);
    await this.boss.deleteJob(this.name, jobId);
  }

  async cancelJob(jobId: string): Promise<void> {
    this.logger.debug(`Cancelling job with ID: ${jobId}`);
    await this.boss.cancel(this.name, jobId);
  }

  async getJobById(jobId: string): Promise<PgBoss.JobWithMetadata | null> {
    return await this.boss.getJobById(this.name, jobId);
  }

  async getPendingJobsCount(): Promise<number> {
    return this.boss.getQueueSize(this.name);
  }

  async resumeJob(jobId: string): Promise<void> {
    return this.boss.resume(this.name, jobId);
  }

  purge(): Promise<void> {
    return this.boss.purgeQueue(this.name);
  }

  async scheduleJob(
    cronExpression: string,
    data?: object,
    options?: PgBoss.ScheduleOptions,
  ): Promise<void> {
    this.logger.debug(`Scheduling job with cron expression: ${cronExpression}`);
    await this.boss.schedule(this.name, cronExpression, data, options);
  }

  unschedule(): Promise<void> {
    this.logger.debug(`Unscheduling all jobs for queue: ${this.name}`);
    return this.boss.unschedule(this.name);
  }

  async publish(eventName: string, data: object): Promise<void> {
    this.logger.debug(`Publishing event: ${eventName} with data:`, data);
    await this.boss.publish(eventName, data);
  }
  async subscribeTo(eventName: string): Promise<void> {
    this.logger.debug(`Subscribing to event: ${eventName}`);
    await this.boss.subscribe(eventName, this.name);
  }
  unsubscribeFrom(eventName: string): Promise<void> {
    this.logger.debug(`Unsubscribing from event: ${eventName}`);
    return this.boss.unsubscribe(this.name, eventName);
  }
}
