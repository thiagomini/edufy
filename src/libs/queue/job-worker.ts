import { Injectable } from '@nestjs/common';
import type PgBoss from 'pg-boss';

@Injectable()
export abstract class JobWorker {
  abstract process(job: PgBoss.Job<unknown>): Promise<any>;
}
