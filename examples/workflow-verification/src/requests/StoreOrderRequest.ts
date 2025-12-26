import { FormRequest, z } from '@gravito/impulse'

export class StoreOrderRequest extends FormRequest {
  schema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    email: z.string().email(),
    paymentToken: z.string().min(1),
  })

  // Optional: custom validation logic
  async authorize(): Promise<boolean> {
    return true
  }
}
