import { Database } from '@src/libs/database/database.type';
import { TicketEntity } from './ticket.entity';
import { ITicketRepository } from './ticket.repository';
import { Inject } from '@nestjs/common';
import { DATABASE } from '@src/libs/database/constants';
import { Selectable } from 'kysely';
import { Ticket } from '@src/libs/database/generated/db';
import { TicketStatusEnum } from './ticket.status';

export class KyselyTicketRepository implements ITicketRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async save(ticket: TicketEntity): Promise<void> {
    await this.db
      .insertInto('ticket')
      .values({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        createdBy: ticket.createdBy,
        resolvedBy: ticket.resolvedBy,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          resolvedBy: ticket.resolvedBy,
          updatedAt: new Date(),
        }),
      )
      .execute();
  }
  async findOneById(id: string): Promise<TicketEntity | null> {
    return this.db
      .selectFrom('ticket')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
      .then((row) => this.mapToEntity(row));
  }

  private mapToEntity(row: Selectable<Ticket>): TicketEntity | null {
    if (!row) return null;

    return TicketEntity.fromProps({
      id: row.id,
      title: row.title,
      description: row.description,
      createdBy: row.createdBy,
      status: row.status as TicketStatusEnum,
      resolvedBy: row.resolvedBy,
    });
  }
}
