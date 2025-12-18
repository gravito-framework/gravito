/**
 * Resource Transformer - 明確的資料轉換機制
 *
 * 類似 Laravel 的 API Resources，明確知道資料在哪裡被轉換
 */
export abstract class ResourceTransformer<TModel = any, TResource = any> {
  /**
   * 轉換單個模型為資源
   */
  abstract transform(model: TModel): TResource

  /**
   * 轉換多個模型為資源陣列
   */
  transformMany(models: TModel[]): TResource[] {
    return models.map((model) => this.transform(model))
  }

  /**
   * 轉換模型集合為資源陣列
   */
  transformCollection(models: TModel[] | { toArray(): TModel[] }): TResource[] {
    const array = Array.isArray(models) ? models : models.toArray()
    return this.transformMany(array)
  }

  /**
   * 包含關聯資料（可選）
   */
  with?(relation: string): this {
    return this
  }

  /**
   * 排除欄位（可選）
   */
  except?(fields: string[]): this {
    return this
  }

  /**
   * 只包含指定欄位（可選）
   */
  only?(fields: string[]): this {
    return this
  }
}

/**
 * Resource Transformer 工廠函數
 */
export function createTransformer<TModel, TResource>(
  transformFn: (model: TModel) => TResource
): ResourceTransformer<TModel, TResource> {
  return new (class extends ResourceTransformer<TModel, TResource> {
    transform(model: TModel): TResource {
      return transformFn(model)
    }
  })()
}
