import { UUID } from 'node:crypto';

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  purchaseId: UUID;
}

export interface CreatePaymentIntentOutput {
  checkoutUrl: URL;
}

export interface IPaymentGateway {
  createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<CreatePaymentIntentOutput>;
}

export const PaymentGateway = Symbol.for('course:PaymentGateway');
