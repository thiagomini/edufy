import type PgBoss from 'pg-boss';

export interface Queue {
  /**
   * Adds a job to this queue.
   * @returns the ID of the job that was added to the queue.
   */
  addJob<T extends object = any>(
    data: T,
    options?: PgBoss.SendOptions,
  ): Promise<string | null>;

  name: string;

  /**
   * Removes a job from the queue by its ID.
   */
  removeJob(jobId: string): Promise<void>;

  /**
   * Cancels a job in the queue by its ID. A cancelled job will not be processed unless it's resumed with `resumeJob`.
   */
  cancelJob(jobId: string): Promise<void>;

  /**
   * Resumes a job in the queue by its ID. A resumed job will be processed again.
   */
  resumeJob(jobId: string): Promise<void>;

  getJobById(jobId: string): Promise<PgBoss.JobWithMetadata | null>;

  /**
   * Removes all jobs from the queue
   */
  purge(): Promise<void>;

  /**
   * Returns the number of jobs which state is 'created'
   */
  getPendingJobsCount(): Promise<number>;

  /**
   * Schedules a job to run based on a cron expression
   */
  scheduleJob<T extends object = any>(
    cronExpression: string,
    data?: T,
    options?: PgBoss.ScheduleOptions,
  ): Promise<void>;

  /**
   * Removes a job schedule for this queue
   */
  unschedule(): Promise<void>;

  /**
   * Subscribes to a specific event for this queue.
   * When another queue publishes an event with the same name,
   * this queue will create a job to eventually process it.
   */
  subscribeTo(eventName: string): Promise<void>;
  unsubscribeFrom(eventName: string): Promise<void>;

  /**
   * Publishes an event to all queues that are subscribed to it.
   * Queues that are subscribed to this event will create a job to eventually process it.
   */
  publish(eventName: string, data: object): Promise<void>;
}
