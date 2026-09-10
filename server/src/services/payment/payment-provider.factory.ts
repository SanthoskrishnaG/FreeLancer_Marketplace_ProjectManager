import { PaymentProvider } from './payment-provider.interface.js';
import { MockPaymentProvider } from './mock-payment.provider.js';

export class PaymentProviderFactory {
  private static providers: Map<string, PaymentProvider> = new Map();

  static {
    // Register the default mock provider
    const mock = new MockPaymentProvider();
    PaymentProviderFactory.registerProvider(mock);
  }

  public static registerProvider(provider: PaymentProvider): void {
    this.providers.set(provider.name.toUpperCase(), provider);
  }

  public static getProvider(name?: string): PaymentProvider {
    const key = (name || process.env.PAYMENT_PROVIDER || 'MOCK').toUpperCase();
    const provider = this.providers.get(key);

    if (!provider) {
      // Fallback gracefully to default Mock provider if requested provider is not active
      return this.providers.get('MOCK')!;
    }

    return provider;
  }
}
