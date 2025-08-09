import { UUID } from 'node:crypto';

export interface CreatePaymentIntentInput {
  amount: number;
  currency: string;
  purchaseId: UUID;
}

export interface createPaymentIntentOutput {
  checkoutUrl: URL;
}

export interface IPaymentGateway {
  createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<createPaymentIntentOutput>;
}

export const PaymentGateway = Symbol.for('course:PaymentGateway');
