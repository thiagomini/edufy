import { Database } from '@src/database/database.type';
import { TicketEntity } from './ticket.entity';
import { ITicketRepository } from './ticket.repository';
import { Inject } from '@nestjs/common';
import { DATABASE } from '@src/database/constants';
import { Selectable } from 'kysely';
import { Ticket } from '@src/database/generated/db';
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

    return new TicketEntity(
      row.title,
      row.description,
      row.createdBy,
      row.status as TicketStatusEnum,
      row.resolvedBy,
      row.id,
    );
  }
}
