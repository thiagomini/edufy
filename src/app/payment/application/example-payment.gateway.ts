import {
  IPaymentGateway,
  CreatePaymentIntentInput,
  CreatePaymentIntentOutput,
} from './payment.gateway';

export class ExamplePaymentGateway implements IPaymentGateway {
  async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<CreatePaymentIntentOutput> {
    return {
      checkoutUrl: new URL(`https://checkout.example.com/${input.purchaseId}`),
    };
  }
}
