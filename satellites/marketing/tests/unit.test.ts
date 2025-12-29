import { beforeEach, describe, expect, it } from 'bun:test'
import { DB, Schema } from '@gravito/atlas'
import { PlanetCore } from 'gravito-core'
import type { PromotionEngine } from '../src/Application/Services/PromotionEngine'
import { MarketingServiceProvider } from '../src/index'

describe('Marketing Satellite Integration', () => {
  let core: PlanetCore
  let engine: PromotionEngine

  beforeEach(async () => {
    // 1. 初始化環境
    core = await PlanetCore.boot({
      config: {
        'database.default': 'sqlite',
        'database.connections.sqlite': { driver: 'sqlite', database: ':memory:' },
      },
    })

    // 強制 Atlas 連線
    DB.addConnection('default', { driver: 'sqlite', database: ':memory:' })

    // 2. 建立資料表 (防禦式)
    await Schema.dropIfExists('promotions')
    await Schema.create('promotions', (table) => {
      table.string('id').primary()
      table.string('name')
      table.string('type')
      table.text('configuration')
      table.integer('priority').default(0)
      table.boolean('is_active').default(true)
    })

    await core.use(new MarketingServiceProvider())
    await core.bootstrap()

    engine = core.container.make('marketing.promotion-engine')
  })

  it('應該能正確計算滿額折抵', async () => {
    // 1. 注入規則
    await DB.table('promotions').insert({
      id: 'p1',
      name: 'Discount 200',
      type: 'cart_threshold',
      configuration: JSON.stringify({ min_amount: 2000, discount: 200 }),
      is_active: true,
    })

    // 2. 模擬訂單
    const order = { id: 'o1', subtotalAmount: 2500 }

    // 3. 執行引擎
    const adjustments = await engine.applyPromotions(order)

    expect(adjustments).toHaveLength(1)
    expect(adjustments[0].amount).toBe(-200)
    expect(adjustments[0].label).toContain('Spend 2000')
  })

  it('當不滿足金額時不應給予折扣', async () => {
    await DB.table('promotions').insert({
      id: 'p2',
      name: 'Discount 200',
      type: 'cart_threshold',
      configuration: JSON.stringify({ min_amount: 2000, discount: 200 }),
      is_active: true,
    })

    const order = { id: 'o2', subtotalAmount: 1500 }
    const adjustments = await engine.applyPromotions(order)

    expect(adjustments).toHaveLength(0)
  })
})
