import type { IPaymentGateway, PaymentIntent } from '../../Domain/Contracts/IPaymentGateway'
import type { Transaction } from '../../Domain/Entities/Transaction'

export class StripeGateway implements IPaymentGateway {
  getName(): string {
    return 'stripe'
  }

  async createIntent(transaction: Transaction): Promise<PaymentIntent> {
    // 這裡未來會調用 Stripe SDK
    console.log(`[Stripe] Creating intent for Order ${transaction.orderId}: ${transaction.amount}`)

    return {
      gatewayTransactionId: `pi_mock_${crypto.randomUUID()}`,
      clientSecret: `pi_mock_secret_${crypto.randomUUID()}`,
      status: 'requires_payment_method',
    }
  }

  async capture(gatewayTransactionId: string): Promise<boolean> {
    console.log(`[Stripe] Capturing payment ${gatewayTransactionId}`)
    return true
  }

  async refund(gatewayTransactionId: string, amount?: number): Promise<boolean> {
    console.log(`[Stripe] Refunding payment ${gatewayTransactionId} (Amount: ${amount || 'full'})`)
    return true
  }
}
