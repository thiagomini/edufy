import { randomUUID } from 'node:crypto';

export const PurchaseStatus = {
  Completed: 'completed',
  Pending: 'pending',
  Failed: 'failed',
} as const;

export type PurchaseStatusEnum =
  (typeof PurchaseStatus)[keyof typeof PurchaseStatus];

export interface PurchaseProps {
  id: string;
  userId: string;
  courseId: string;
  purchaseDate: Date;
  confirmedAt: Date;
  status: PurchaseStatusEnum;
  price: number;
  currency: string;
}

export interface CreatePurchaseInput {
  userId: string;
  courseId: string;
  price: number;
  currency: string;
}

export class PurchaseEntity {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly courseId: string,
    public readonly purchaseDate: Date,
    public status: PurchaseStatusEnum,
    public readonly price: number,
    public readonly currency: string,
    public confirmedAt: Date | null,
  ) {}

  public static create(input: CreatePurchaseInput): PurchaseEntity {
    return new PurchaseEntity(
      randomUUID(),
      input.userId,
      input.courseId,
      new Date(),
      PurchaseStatus.Pending,
      input.price,
      input.currency,
      null,
    );
  }

  public static fromProps(props: PurchaseProps): PurchaseEntity {
    return new PurchaseEntity(
      props.id,
      props.userId,
      props.courseId,
      props.purchaseDate,
      props.status,
      props.price,
      props.currency,
      props.confirmedAt,
    );
  }
}
