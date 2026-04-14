import { Ticket } from '@src/libs/database/generated/db';
import { KyselyRepository } from '@src/libs/database/kysely.repository';
import { Selectable } from 'kysely';
import { TicketEntity, TicketReply } from '../domain/ticket.entity';
import { ITicketRepository } from '../domain/ticket.repository';
import { TicketStatusEnum } from '../domain/ticket.status';

export class KyselyTicketRepository
  extends KyselyRepository
  implements ITicketRepository
{
  async findAllResolvedByUser(userId: string): Promise<TicketEntity[]> {
    return await this.database
      .selectFrom('ticket')
      .selectAll()
      .where('resolvedBy', '=', userId)
      .execute()
      .then((rows) => rows.map((row) => this.mapToEntity(row)).filter(Boolean));
  }

  async save(ticket: TicketEntity): Promise<void> {
    await this.database
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
    return this.database
      .selectFrom('ticket')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
      .then((row) => this.mapToEntity(row));
  }

  async findAllCreatedByUser(userId: string): Promise<TicketEntity[]> {
    return this.database
      .selectFrom('ticket')
      .selectAll()
      .where('createdBy', '=', userId)
      .execute()
      .then((rows) => rows.map((row) => this.mapToEntity(row)).filter(Boolean));
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
