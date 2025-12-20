/**
 * Relationship Types and Base Classes
 * @description Declarative relationship definitions for ORM
 */

import { DB } from '../../DB'
import type { Model, ModelAttributes, ModelConstructor } from './Model'

/**
 * Relationship Type
 */
export type RelationType = 'hasOne' | 'hasMany' | 'belongsTo' | 'belongsToMany'

/**
 * Relationship Options
 */
export interface RelationshipOptions {
  foreignKey?: string
  localKey?: string
  pivotTable?: string
  relatedKey?: string
  pivotColumns?: string[]
}

/**
 * Relationship Metadata
 */
export interface RelationshipMeta {
  type: RelationType
  related: () => ModelConstructor<Model> & typeof Model
  foreignKey: string
  localKey: string
  pivotTable?: string | undefined
  relatedKey?: string | undefined
  pivotColumns?: string[] | undefined
}

/**
 * Model Relationships Map
 */
const relationships = new WeakMap<typeof Model, Map<string, RelationshipMeta>>()

/**
 * Get relationships for a model
 */
export function getRelationships(model: typeof Model): Map<string, RelationshipMeta> {
  return relationships.get(model) ?? new Map()
}

/**
 * Define a relationship on a model
 */
export function defineRelationship(
  model: typeof Model,
  name: string,
  meta: RelationshipMeta
): void {
  let map = relationships.get(model)
  if (!map) {
    map = new Map()
    relationships.set(model, map)
  }
  map.set(name, meta)
}

// ============================================================================
// Relationship Decorators
// ============================================================================

/**
 * HasOne Relationship Decorator
 * @example
 * ```typescript
 * class User extends Model {
 *   @HasOne(() => Profile)
 *   profile!: Profile
 * }
 * ```
 */
export function HasOne(
  related: () => ModelConstructor<Model> & typeof Model,
  options: Omit<RelationshipOptions, 'pivotTable'> = {}
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const model = target.constructor as typeof Model

    defineRelationship(model, String(propertyKey), {
      type: 'hasOne',
      related,
      foreignKey: options.foreignKey ?? `${model.table.replace(/s$/, '')}_id`,
      localKey: options.localKey ?? model.primaryKey,
    })
  }
}

/**
 * HasMany Relationship Decorator
 * @example
 * ```typescript
 * class User extends Model {
 *   @HasMany(() => Post)
 *   posts!: Post[]
 * }
 * ```
 */
export function HasMany(
  related: () => ModelConstructor<Model> & typeof Model,
  options: Omit<RelationshipOptions, 'pivotTable'> = {}
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const model = target.constructor as typeof Model

    defineRelationship(model, String(propertyKey), {
      type: 'hasMany',
      related,
      foreignKey: options.foreignKey ?? `${model.table.replace(/s$/, '')}_id`,
      localKey: options.localKey ?? model.primaryKey,
    })
  }
}

/**
 * BelongsTo Relationship Decorator
 * @example
 * ```typescript
 * class Post extends Model {
 *   @BelongsTo(() => User)
 *   author!: User
 * }
 * ```
 */
export function BelongsTo(
  related: () => ModelConstructor<Model> & typeof Model,
  options: Omit<RelationshipOptions, 'pivotTable'> = {}
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const model = target.constructor as typeof Model
    const relatedModel = related()

    defineRelationship(model, String(propertyKey), {
      type: 'belongsTo',
      related,
      foreignKey: options.foreignKey ?? `${relatedModel.table.replace(/s$/, '')}_id`,
      localKey: options.localKey ?? relatedModel.primaryKey,
    })
  }
}

/**
 * BelongsToMany Relationship Decorator
 * @example
 * ```typescript
 * class User extends Model {
 *   @BelongsToMany(() => Role, { pivotTable: 'user_roles' })
 *   roles!: Role[]
 * }
 * ```
 */
export function BelongsToMany(
  related: () => ModelConstructor<Model> & typeof Model,
  options: RelationshipOptions = {}
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    const model = target.constructor as typeof Model
    const relatedModel = related()

    // Auto-generate pivot table name (alphabetical order)
    const tables = [model.table, relatedModel.table].sort()
    const pivotTable = options.pivotTable ?? `${tables[0]}_${tables[1]}`

    defineRelationship(model, String(propertyKey), {
      type: 'belongsToMany',
      related,
      foreignKey: options.foreignKey ?? `${model.table.replace(/s$/, '')}_id`,
      localKey: options.localKey ?? model.primaryKey,
      pivotTable,
      relatedKey: options.relatedKey ?? `${relatedModel.table.replace(/s$/, '')}_id`,
      pivotColumns: options.pivotColumns,
    })
  }
}

// ============================================================================
// Eager Loading
// ============================================================================

/**
 * Load related models for a collection of parent models
 * Uses batch queries to avoid N+1 problem
 */
export async function eagerLoad<T extends Model>(
  parents: T[],
  relationName: string,
  limit?: number
): Promise<void> {
  if (parents.length === 0) return

  const firstParent = parents[0]
  if (!firstParent) return

  const parentModel = firstParent.constructor as typeof Model
  const relationMeta = getRelationships(parentModel).get(relationName)

  if (!relationMeta) {
    throw new Error(`Relationship "${relationName}" not found on ${parentModel.name}`)
  }

  const Related = relationMeta.related()
  const { type, foreignKey, localKey } = relationMeta

  // Get parent keys
  const parentKeys = parents.map((p) => (p as unknown as Record<string, unknown>)[localKey])
  const validParentKeys = parentKeys.filter((k) => k !== undefined && k !== null)

  if (validParentKeys.length === 0) return

  // Build and execute the query based on relationship type
  switch (type) {
    case 'hasOne':
    case 'hasMany': {
      const connection = DB.connection(Related.connection)
      let query = connection
        .table<ModelAttributes>(Related.table)
        .whereIn(foreignKey, validParentKeys)

      if (limit && type === 'hasMany') {
        // Defensive loading: limit per parent (simplified - full LATERAL JOIN in P2)
        query = query.limit(limit * parents.length)
      }

      const related = await query.get()

      // Map results back to parents
      const relatedByFk = new Map<unknown, ModelAttributes[]>()
      for (const row of related) {
        const fk = row[foreignKey]
        if (!relatedByFk.has(fk)) {
          relatedByFk.set(fk, [])
        }
        relatedByFk.get(fk)!.push(row)
      }

      // Assign to parents
      for (const parent of parents) {
        const pk = (parent as unknown as Record<string, unknown>)[localKey]
        const items = relatedByFk.get(pk) ?? []

        if (type === 'hasOne') {
          const item = items[0] ? Related.hydrate(items[0]) : null
          ;(parent as unknown as Record<string, unknown>)[relationName] = item
        } else {
          const models = items.slice(0, limit).map((r) => Related.hydrate(r))
          ;(parent as unknown as Record<string, unknown>)[relationName] = models
        }
      }
      break
    }

    case 'belongsTo': {
      // Get foreign keys from parents
      const fks = parents
        .map((p) => (p as unknown as Record<string, unknown>)[foreignKey])
        .filter((k) => k !== undefined && k !== null)

      if (fks.length === 0) return

      const connection = DB.connection(Related.connection)
      const related = await connection
        .table<ModelAttributes>(Related.table)
        .whereIn(localKey, fks)
        .get()

      // Map results
      const relatedByPk = new Map<unknown, ModelAttributes>()
      for (const row of related) {
        relatedByPk.set(row[localKey], row)
      }

      // Assign to parents
      for (const parent of parents) {
        const fk = (parent as unknown as Record<string, unknown>)[foreignKey]
        const row = relatedByPk.get(fk)
        ;(parent as unknown as Record<string, unknown>)[relationName] = row
          ? Related.hydrate(row)
          : null
      }
      break
    }

    case 'belongsToMany': {
      const { pivotTable, relatedKey } = relationMeta
      if (!pivotTable || !relatedKey) return

      const connection = DB.connection(Related.connection)

      // Get pivot records
      const pivots = await connection
        .table<Record<string, unknown>>(pivotTable)
        .whereIn(foreignKey, validParentKeys)
        .get()

      // Get related model IDs
      const relatedIds = [...new Set(pivots.map((p) => p[relatedKey]))]
      if (relatedIds.length === 0) return

      // Get related models
      const relatedRows = await connection
        .table<ModelAttributes>(Related.table)
        .whereIn(localKey, relatedIds)
        .get()

      // Map related by primary key
      const relatedByPk = new Map<unknown, ModelAttributes>()
      for (const row of relatedRows) {
        relatedByPk.set(row[localKey], row)
      }

      // Map pivots by parent FK
      const pivotsByParent = new Map<unknown, unknown[]>()
      for (const pivot of pivots) {
        const pk = pivot[foreignKey]
        if (!pivotsByParent.has(pk)) {
          pivotsByParent.set(pk, [])
        }
        pivotsByParent.get(pk)!.push(pivot[relatedKey])
      }

      // Assign to parents
      for (const parent of parents) {
        const pk = (parent as unknown as Record<string, unknown>)[relationMeta.localKey]
        const relatedPks = pivotsByParent.get(pk) ?? []
        const models = relatedPks
          .slice(0, limit)
          .map((rpk) => relatedByPk.get(rpk))
          .filter((r): r is ModelAttributes => r !== undefined)
          .map((r) => Related.hydrate(r))
        ;(parent as unknown as Record<string, unknown>)[relationName] = models
      }
      break
    }
  }
}

/**
 * Load multiple relationships
 */
export async function eagerLoadMany<T extends Model>(
  parents: T[],
  relations: string[] | Record<string, number | undefined>
): Promise<void> {
  if (Array.isArray(relations)) {
    for (const rel of relations) {
      await eagerLoad(parents, rel)
    }
  } else {
    for (const [rel, limit] of Object.entries(relations)) {
      await eagerLoad(parents, rel, limit)
    }
  }
}
