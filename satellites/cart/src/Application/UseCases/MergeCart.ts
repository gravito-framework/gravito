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
      // 透過方括號訪問私有屬性以執行「身分轉正」，繞過 TypeScript 的私有檢查
      const casted = guestCart as any
      // biome-ignore lint/complexity/useLiteralKeys: needed to bypass private property access in TS
      casted.props['memberId'] = input.memberId
      // biome-ignore lint/complexity/useLiteralKeys: needed to bypass private property access in TS
      casted.props['guestId'] = null
      await this.repository.save(guestCart)
    } else {
      memberCart.merge(guestCart)
      await this.repository.save(memberCart)
      await this.repository.delete(guestCart.id)
    }
  }
}
