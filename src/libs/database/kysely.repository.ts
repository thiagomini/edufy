import { Inject, Injectable } from '@nestjs/common';
import { Database } from './database.type';
import { DATABASE } from './constants';

@Injectable()
export abstract class KyselyRepository {
  constructor(@Inject(DATABASE) protected readonly database: Database) {}
}
