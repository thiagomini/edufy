import {
  CreatePaymentIntentInput,
  createPaymentIntentOutput,
  IPaymentGateway,
} from './payment.gateway';

export class ExamplePaymentGateway implements IPaymentGateway {
  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<createPaymentIntentOutput> {
    return {
      checkoutUrl: new URL(`https://checkout.example.com/${input.purchaseId}`),
    };
  }
}
