import { Kysely } from 'kysely';
import { DB } from './generated/db';

export type Database = Kysely<DB>;
