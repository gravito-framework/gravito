import { UseCase } from '@gravito/enterprise'
import type { IPaymentGateway, PaymentIntent } from '../../Domain/Contracts/IPaymentGateway'
import { Transaction } from '../../Domain/Entities/Transaction'

export interface ProcessPaymentInput {
  orderId: string
  amount: number
  currency: string
  gateway: string
}

export class ProcessPayment extends UseCase<ProcessPaymentInput, PaymentIntent> {
  constructor(private gateway: IPaymentGateway) {
    super()
  }

  async execute(input: ProcessPaymentInput): Promise<PaymentIntent> {
    const transaction = Transaction.create(crypto.randomUUID(), {
      orderId: input.orderId,
      amount: input.amount,
      currency: input.currency,
      gateway: input.gateway,
    })

    const intent = await this.gateway.createIntent(transaction)

    // 將授權 ID 寫入交易實體
    transaction.authorize(intent.gatewayTransactionId)

    // 這裡通常會持久化 Transaction 到資料庫，暫略

    return intent
  }
}
