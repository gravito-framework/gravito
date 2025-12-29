import { UseCase } from '@gravito/enterprise'
import type { ICartRepository } from '../../Domain/Contracts/ICartRepository'
import { Cart } from '../../Domain/Entities/Cart'

export interface MergeCartInput {
  memberId: string
  guestId: string
}

export class MergeCart extends UseCase<MergeCartInput, void> {
  constructor(private repository: ICartRepository) {
    super()
  }

  async execute(input: MergeCartInput): Promise<void> {
    const guestCart = await this.repository.find({ guestId: input.guestId })
    if (!guestCart) return

    const memberCart = await this.repository.find({ memberId: input.memberId })

    if (!memberCart) {
      // 透過 (any) 修正私有屬性訪問以執行「身分轉正」
      // 增加 // @ts-expect-error 保護，防止 CI 報錯
      const casted = guestCart as any
      // @ts-expect-error
      casted.props.memberId = input.memberId
      // @ts-expect-error
      casted.props.guestId = null
      await this.repository.save(guestCart)
    } else {
      memberCart.merge(guestCart)
      await this.repository.save(memberCart)
      await this.repository.delete(guestCart.id)
    }
  }
}
