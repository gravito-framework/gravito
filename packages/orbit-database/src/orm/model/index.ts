/**
 * Model Module Index
 */

export { Model, type ModelAttributes, type ModelConstructor, type ModelStatic } from './Model'
export { DirtyTracker } from './DirtyTracker'
export {
    ColumnNotFoundError,
    TypeMismatchError,
    NullableConstraintError,
    ModelNotFoundError
} from './errors'
export {
    HasOne,
    HasMany,
    BelongsTo,
    BelongsToMany,
    eagerLoad,
    eagerLoadMany,
    getRelationships,
    type RelationType,
    type RelationshipOptions,
    type RelationshipMeta,
} from './relationships'
