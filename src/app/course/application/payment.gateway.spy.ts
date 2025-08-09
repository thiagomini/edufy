import { faker } from '@faker-js/faker';
import {
  CreatePaymentIntentInput,
  createPaymentIntentOutput,
  IPaymentGateway,
} from './payment.gateway';

export class PaymentGatewaySpy implements IPaymentGateway {
  private readonly createPaymentIntentInput: CreatePaymentIntentInput[] = [];
  private selectedPosition = 0;

  createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<createPaymentIntentOutput> {
    this.createPaymentIntentInput.push(input);
    const output: createPaymentIntentOutput = {
      checkoutUrl: new URL(faker.internet.url()),
    };
    return Promise.resolve(output);
  }

  shouldHaveCreatedNumberOfPayments(number: number) {
    expect(this.createPaymentIntentInput).toHaveLength(number);
    return this;
  }

  createdPaymentAtPosition(index: number) {
    this.selectedPosition = index;
    return this;
  }

  withAmount(amount: number) {
    const selectedPayment = this.createPaymentIntentInput.at(
      this.selectedPosition,
    );
    expect(selectedPayment.amount).toBe(amount);
    return this;
  }

  withCurrency(currency: string) {
    const selectedPayment = this.createPaymentIntentInput.at(
      this.selectedPosition,
    );
    expect(selectedPayment.currency).toBe(currency);
    return this;
  }

  withPurchaseId(purchaseId: string) {
    const selectedPayment = this.createPaymentIntentInput.at(
      this.selectedPosition,
    );
    expect(selectedPayment.purchaseId).toBe(purchaseId);
    return this;
  }

  public reset() {
    this.createPaymentIntentInput.length = 0;
    this.selectedPosition = 0;
  }
}
