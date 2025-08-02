import { Inject } from '@nestjs/common';
import { DATABASE } from '@src/libs/database/constants';
import { Database } from '@src/libs/database/database.type';
import { Ticket } from '@src/libs/database/generated/db';
import { Selectable } from 'kysely';
import { TicketEntity, TicketReply } from '../domain/ticket.entity';
import { ITicketRepository } from '../domain/ticket.repository';
import { TicketStatusEnum } from '../domain/ticket.status';

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
        replies: JSON.stringify(ticket.replies ?? []),
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          resolvedBy: ticket.resolvedBy,
          replies: JSON.stringify(ticket.replies ?? []),
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

    const replies: TicketReply[] = row.replies as unknown as TicketReply[];
    return TicketEntity.fromProps({
      id: row.id,
      title: row.title,
      description: row.description,
      createdBy: row.createdBy,
      status: row.status as TicketStatusEnum,
      resolvedBy: row.resolvedBy,
      replies,
    });
  }
}
